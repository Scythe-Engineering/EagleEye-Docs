# WebUI Backend

`EagleEyeInterface` (`src/webui/web_server.py`) is the Flask + Flask-SocketIO server that powers the WebUI. It runs on a daemon thread bound to `0.0.0.0:5001` and stays alive for the process lifetime.

## Composition

`EagleEyeInterface` is assembled from mixins in `src/webui/web_server_utils/`, each owning one group of route handlers:

`AssetManagerMixin`, `CameraCalibrationMixin`, `CameraConfigMixin`, `CameraStreamMixin`, `LineProfilingMixin`, `NetworkManagerMixin`, `ModelLibraryMixin`, `OperationConfigMixin`, `PipelineConfigMixin`, `PipelineSettingsMixin`, `SystemMonitorMixin`, `TerminalMixin`, `TestVideoMixin`, `VisualizationMixin`.

Every route is registered explicitly with `add_url_rule` in `_register_routes()`.

## Initialization

```python
self.web_interface = EagleEyeInterface(
    restart_callback=self.restart,
    pipeline_objects_callback=self.get_pipelines,
    logger=self.logger,
    network_table_instance=network_tables_inst,
    device_registry=self.device_registry,
    model_library=self.model_library,
)
```

- `restart_callback` — invoked by the restart endpoint; runs `sudo systemctl restart $SERVICE_NAME`.
- `pipeline_objects_callback` — returns live `Pipeline` objects for profiling, visualization, and status endpoints.
- `network_table_instance` — the NT4 client instance, used to report connection status.
- `device_registry` / `model_library` — back `/device-registry` and the `/model-library` endpoints. When a model library is supplied, an `Mx3CompilerService` is created alongside it.

`camera_config_registry` is not a constructor argument; `MainBackend` assigns it after the registry is built.

## Serving

Unless `dev_mode=True`, `_start_background_server()` starts a thread running `_serve_threaded_wsgi()`, which calls `werkzeug.serving.make_server(WEB_SERVER_HOST, WEB_SERVER_PORT, self.app, threaded=True)`. Werkzeug access logs are set to `WARNING` and a filter drops TLS handshake noise.

At startup the server also warms `DracoAssetCache`, which converts models under `src/webui/assets/` into Draco-compressed copies in `src/webui/generated_assets/draco/`.

## Background threads

Three daemon threads start at the end of `__init__`:

| Thread | Loop | Publishes |
|---|---|---|
| `_sse_heartbeat_loop` | Every `min(0.3, 0.1)` s | `heartbeat` (every 5 s), plus cached pipeline errors and profiling snapshots |
| `_log_monitor_loop` | Polls the logger every 0.1 s | `log_update` when new messages appear |
| `_system_status_loop` | Every 1.5 s | `system_status` |

Profiling and error events are pushed from the heartbeat thread by reading `pipeline.get_latest_profile_snapshot()` and the error cache — pipeline threads do not publish SSE directly.

## SSE architecture

One `queue.Queue(maxsize=100)` buffers events for the single connected client; a new connection replaces the queue (last connection wins). `GET /sse/stream` streams from it as `text/event-stream`, emitting `: keepalive` comments when idle for a second. Events are encoded as:

```
event: <event_name>\ndata: <json_payload>\n\n
```

When the queue is full, the oldest event is dropped to make room. See [SSE & Real-time](../architecture/sse-realtime).

## CORS

`CORS_ALLOWED_ORIGINS` in `src/webui/web_server_utils/constants.py` is `"*"`, applied to both the Flask-CORS `r"/*"` resource rule and the SocketIO server. No origin list needs editing to reach the UI from another machine.

## Configuration constants

`src/webui/web_server_utils/constants.py`:

| Constant | Value |
|---|---|
| `WEB_SERVER_HOST` | `0.0.0.0` |
| `WEB_SERVER_PORT` | `5001` |
| `CORS_ALLOWED_ORIGINS` | `*` |
| `VISUALIZATION_STREAM_FPS` | `12` |
| `VIEW_STREAM_FPS` | `30` |
| `PROFILING_PUBLISH_INTERVAL_SECONDS` | `0.3` |
| `SSE_SERIALIZATION_WARN_INTERVAL_SECONDS` | `5.0` |
| `DEFAULT_GENERAL_CONF` | `{"network_table_address": "0.0.0.0", "view_stream_downscale": 0.5}` |

## Visualization endpoints

`POST /start-visualize/<pipeline_name>/<operation_uuid>` marks one operation for visualization; `GET /visualize/stream/<pipeline_name>` then streams its output as MJPEG at `VISUALIZATION_STREAM_FPS`. Only operations that implement `visualize()` produce frames; the rest fall back to the no-image placeholder.

## State flags

| Flag | Set by | Cleared by |
|---|---|---|
| `restart_required_for_config` | Config endpoints that change values marked `restart_for_change` | Backend restart |

`GET /get_restart_required` and `POST /set_restart_required` let the frontend read and set it. `runtime_id` (`<pid>-<time_ns>`) lets the frontend detect that the backend process was replaced.
