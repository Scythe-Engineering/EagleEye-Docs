# WebUI Backend

`EagleEyeInterface` (`src/webui/web_server.py`) is the Flask + Flask-SocketIO server that powers the WebUI. It starts as a daemon thread on port `5001` and stays alive for the process lifetime.

## Initialization

```python
self.web_interface = EagleEyeInterface(
    restart_callback=self.restart,
    pipeline_objects_callback=self.get_pipelines,
    logger=self.logger,
)
```

The two callbacks connect the WebUI to the backend:
- `restart_callback` — called when the user clicks **Restart** in the Settings tab; triggers `sudo systemctl restart $SERVICE_NAME`.
- `pipeline_objects_callback` — called by endpoints that need live `Pipeline` objects (profiling, visualization, etc.).

## Background threads

Three daemon threads start inside `EagleEyeInterface.__init__()`:

| Thread | Loop | Publishes |
|---|---|---|
| Heartbeat | Every 5 s | `heartbeat` SSE event |
| Log monitor | Polls logger continuously | `log_update` SSE event when new messages appear |
| System status | Every 1.5 s | `system_status` SSE event with CPU/RAM/GPU percentages |

Pipeline profiling and error events are pushed by the pipeline threads themselves via `publish_pipeline_profile()` and `publish_pipeline_error()` on the `EagleEyeInterface` instance.

## SSE architecture

A single `Queue` (per connected client) buffers SSE events. The `GET /sse/stream` endpoint streams from this queue as `text/event-stream`. Events are encoded as:

```
event: <event_name>\ndata: <json_payload>\n\n
```

The queue is replaced when a new client connects (single-client model — last connection wins).

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:5174` (Vite dev server alt)
- `http://localhost:5001` (production)

To allow access from a remote machine, add its origin to `CORS_ALLOWED_ORIGINS` in `web_server.py`.

## Custom operations endpoints

The custom ops editor writes directly to `src/secondary_operations/`. Safety measures:
- Operation names are validated against `^[a-z][a-z0-9_]*$` (snake_case only).
- Code is syntax-checked via `ast.parse()` before saving.
- Ruff is run via `uvx ruff check` for style linting.
- Files are written atomically (temp file + `os.replace()`).
- Setting `restart_required_for_config = True` after save triggers the orange restart badge in the UI.

## Visualization endpoints

`POST /start-visualize/<pipeline_name>/<operation_uuid>` calls `operation.instance.visualize()` and starts streaming the result as MJPEG at 12 FPS via `GET /visualize/stream/<pipeline_name>`. Only operations that implement `visualize()` produce output; others return the "no image" placeholder.

## State flags

| Flag | Set by | Cleared by |
|---|---|---|
| `restart_required_for_config` | Pipeline/op save endpoints | Backend restart |

`GET /get_restart_required` and `POST /set_restart_required` allow the frontend to read and set this flag.
