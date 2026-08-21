# SSE & Real-time

EagleEye uses Server-Sent Events (SSE) to push real-time updates to the WebUI. The SSE stream is served at `GET /sse/stream` as a persistent `text/event-stream` HTTP response.

## Queue architecture

A single `queue.Queue` buffers events for the connected client:

```python
self._sse_queue: queue.Queue | None = None
self._sse_queue_lock = threading.Lock()
```

When a client connects to `/sse/stream`, `_sse_stream()` creates a fresh `queue.Queue(maxsize=100)` and installs it as *the* queue (last connection wins; only one active SSE connection is supported). On connect it also replays cached pipeline operation errors and any cached system-update progress.

The generator blocks on `q.get(timeout=1.0)`; on timeout it yields a `: keepalive` comment so proxies do not close the connection. Messages are formatted by `_format_sse`:

```
event: <event_name>\ndata: <json_payload>\n\n
```

`_publish_event(name, data)` JSON-serializes with `allow_nan=False` (serialization failures are logged at most once every 5 s and dropped) and uses `put_nowait`. When the queue is full it drops the **oldest** event and retries, logging the drop.

## Named events

| Event | Published by | Rate | Payload |
|---|---|---|---|
| `heartbeat` | `_sse_heartbeat_loop` | Every 5 s | `{"ts": float}` |
| `log_update` | `_log_monitor_loop` | On new log lines (polls every 0.1 s) | `{"messages": [...]}` — all formatted log lines |
| `system_status` | `_system_status_loop` | Every 1.5 s | Nested dicts: `cpu`, `memory`, `storage`, `pipelines`, `network_table` |
| `profiling_update` | `_sse_heartbeat_loop` via `_publish_profiling_updates` | At most every 0.3 s per pipeline, only for a new `frame_seq` | Profiling snapshot (below) |
| `pipeline_operation_errors` | `_sse_heartbeat_loop` via `_publish_cached_pipeline_errors`, and on config writes | When the error cache is dirty | Normalized per-pipeline operation error payload |
| `system_update_progress` | System update routines | During an update | Progress payload (replayed to new clients) |
| `mx3_compilation_progress` | `model_library_mixin` | During MX3 compilation | `Mx3CompilationStatus.to_dict(log_limit=5)` |
| `update_robot_transform` | `update_robot_transform()` | On call | `{"transform_matrix": [...]}` |
| `update_camera_pose` | `update_camera_pose()` | On call | `{"camera_bus_id": str, "camera_name": str, ...}` |
| `update_detected_objects` | `update_detected_objects()` | On call | `{"detections": [...]}` |

## Background threads

Three daemon threads are started in `EagleEyeInterface.__init__()`:

### Heartbeat thread

`_sse_heartbeat_loop` wakes every `min(profiling_interval, 0.1)` seconds. On each pass it publishes cached pipeline errors and pending profiling snapshots, and emits `heartbeat` when 5 s have elapsed. Profiling and error events therefore originate on this thread, not on pipeline threads.

### Log monitor thread

`_log_monitor_loop` polls `logger.message_history` every 0.1 s and publishes `log_update` when the message count grows.

### System status thread

`_system_status_loop` builds the payload with `psutil` every 1.5 s. If `psutil` fails, `cpu`/`memory`/`storage` are replaced with `{"status": "unavailable", "error": ...}` and the failure is logged once.

### `system_status` payload shape

```json
{
  "cpu": {"percent": 12.5, "cores": 8, "temperature_c": 46.0, "status": "ok"},
  "memory": {"percent": 41.2, "used_mb": 6600.0, "total_mb": 16000.0, "status": "ok"},
  "storage": {"percent": 55.0, "used_gb": 110.0, "total_gb": 200.0, "status": "ok"},
  "pipelines": [],
  "network_table": {}
}
```

CPU temperature is read from `/sys/class/thermal/thermal_zone*/temp` when available, otherwise from `psutil` sensors, and may be `null`.

## Pipeline error events

Pipeline construction and config writes populate an error cache. `_publish_cached_pipeline_errors` uses `_pipeline_error_dirty_pipelines` and `_pipeline_error_last_seq_sent` so each unique error is sent once per sequence number, and re-sends the whole cache when a new SSE client connects.

## Pipeline profiling events

`FlowManager._record_profile_snapshot()` captures per-operation and per-timestep wall-clock runtimes after each frame and stores the latest snapshot under a lock. `_publish_profiling_updates` reads `pipeline.get_latest_profile_snapshot()` for every pipeline, skips snapshots whose `frame_seq` is not greater than the last sent, and emits `profiling_update`.

### Profiling snapshot shape

```json
{
  "pipeline_name": "Test",
  "frame_seq": 42,
  "frame_time_ms": 18.3,
  "timestamp_ms": 1706000000000,
  "operations": {
    "op-mljk5q36-arwb": {
      "name": "device_input.py",
      "timestep": 0,
      "thread": 1,
      "execution_time_ms": 2.1
    }
  },
  "timesteps": [
    {
      "timestep": 0,
      "total_time_ms": 3.5,
      "max_operation_uuid": "op-mljk5q36-arwb",
      "max_operation_name": "device_input.py",
      "max_operation_time_ms": 2.1,
      "operation_count": 1
    }
  ]
}
```

## CORS

`CORS_ALLOWED_ORIGINS` in `src/webui/web_server_utils/constants.py` is `"*"`, so any origin may connect. This allows the Vite dev server on another port to reach the backend during development; in production the UI and API share `http://<host>:5001`.
