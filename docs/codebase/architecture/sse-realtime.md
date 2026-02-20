# SSE & Real-time

EagleEye uses Server-Sent Events (SSE) to push real-time updates to the WebUI. The SSE stream is served at `GET /sse/stream` as a persistent `text/event-stream` HTTP response.

## Queue architecture

A single `queue.Queue` buffers events for the connected client:

```python
self._sse_queue: queue.Queue | None = None
self._sse_queue_lock = threading.Lock()
```

When a new client connects to `/sse/stream`, a fresh queue is created (last-connection-wins; only one active SSE connection is supported at a time). Events from multiple background threads are placed on this shared queue.

The `_sse_stream()` generator reads from the queue in a blocking loop and yields formatted SSE messages:

```
event: <event_name>\ndata: <json_payload>\n\n
```

## Named events

| Event | Published by | Rate | Payload |
|---|---|---|---|
| `heartbeat` | `_sse_heartbeat_loop` thread | Every 5 s | `{}` |
| `log_update` | `_log_monitor_loop` thread | When new log lines appear | `{"messages": [...]}` |
| `system_status` | `_system_status_loop` thread | Every 1.5 s | `{"cpu": float, "ram": float, "gpu": float\|null}` |
| `pipeline_error` | Pipeline threads (via `web_interface.publish_pipeline_error()`) | On exception | `{"pipeline_name": str, "operation_name": str, "error": str, "seq": int}` |
| `pipeline_profile` | Pipeline threads (via `web_interface.publish_pipeline_profile()`) | Every ~300 ms | Profiling snapshot (see below) |

## Background threads

Three threads are started in `EagleEyeInterface.__init__()`:

### Heartbeat thread

```python
Thread(target=self._sse_heartbeat_loop, daemon=True).start()
```

Sleeps 5 seconds, then pushes a `heartbeat` event. Used by the frontend to detect dropped connections.

### Log monitor thread

```python
Thread(target=self._log_monitor_loop, daemon=True).start()
```

Polls the `Logger` instance for new messages. When the message count increases, it pushes a `log_update` event containing all new messages since the last update.

### System status thread

```python
Thread(target=self._system_status_loop, daemon=True).start()
```

Uses `psutil` to sample CPU and RAM usage every 1.5 seconds, and queries GPU utilization if available. Pushes a `system_status` event with the reading.

## Pipeline error events

Pipeline threads call `web_interface.publish_pipeline_error(pipeline_name, operation, traceback_str)`. A deduplication mechanism (`_pipeline_error_dirty_pipelines`, `_pipeline_error_last_seq_sent`) ensures each unique error is only sent once per sequence number, reducing SSE noise during repeated errors.

## Pipeline profiling events

`FlowManager._record_profile_snapshot()` captures per-operation and per-timestep wall-clock runtimes after each frame. The profiling snapshot is stored under a lock. A background behavior in the pipeline thread reads the latest snapshot every 300 ms and publishes it via `publish_pipeline_profile()`.

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

The SSE endpoint includes permissive CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Cache-Control
```

This allows the Vite dev server (running on a different port) to connect during development. In production, all traffic is on the same origin (`localhost:5001`).
