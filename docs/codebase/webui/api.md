# WebUI API Reference

All routes are registered in `EagleEyeInterface._register_routes()` in `src/webui/web_server.py`. The server runs on `http://0.0.0.0:5001`.

## Static / UI

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Serves the compiled `index.html` |
| `GET` | `/js/main.js` | Serves compiled frontend JavaScript |
| `GET` | `/style.css` | Serves compiled Tailwind CSS |
| `GET` | `/background.png` | Serves background image |
| `GET` | `/favicon.ico` | Serves favicon |
| `GET` | `/frc2025r2.json` | Serves the FRC 2025 AprilTag field layout JSON |
| `GET` | `/src/webui/assets/apriltags/<filename>` | Serves individual AprilTag reference images |
| `GET` | `/draco/<filename>` | Serves Draco decompressor assets for 3D models |
| `GET` | `/get-robot-file/<filename>` | Serves 3D robot model files (GLTF/Draco) |

## Camera feeds

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-available-cameras` | Returns list of available camera names |
| `GET` | `/feed/<camera_name>` | MJPEG stream for the named camera |
| `GET` | `/get-available-robots` | Returns list of available robot model files |

## Camera configuration

| Method | Path | Description |
|---|---|---|
| `GET` | `/camera-config/cameras` | List all cameras that have config files |
| `GET` | `/camera-config/<bus_id>` | Get full camera config (intrinsics + extrinsics) for a camera |
| `POST` | `/camera-config/<bus_id>/extrinsics` | Save extrinsics (mounting position/angles) for a camera |
| `POST` | `/camera-config/<bus_id>/intrinsics` | Upload intrinsics YAML for a camera |
| `DELETE` | `/camera-config/<bus_id>/intrinsics` | Delete intrinsics for a camera |

## Pipeline management

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-pipeline-names` | List all pipeline names from `pipeline_config.json` |
| `GET` | `/get-pipeline-config/<pipeline_name>` | Get the full operation list for a named pipeline |
| `POST` | `/save-pipeline-config/<pipeline_name>` | Save (overwrite) a pipeline's operation list |
| `DELETE` | `/delete-pipeline/<pipeline_name>` | Delete a pipeline from the config |
| `GET` | `/get-pipeline-active/<pipeline_name>` | Check if a pipeline is currently running |
| `GET` | `/get-pipeline-thread-info/<pipeline_name>` | Get thread + timestep info per operation UUID |

## Operations metadata

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-available-operations` | List all operations (main + secondary) with their config defs |
| `GET` | `/get-operation-config-data/<name>/<is_secondary>` | Get config def JSON for a specific operation |
| `GET` | `/get-operation-files/<name>/<param_name>` | List files for a file-type parameter |
| `POST` | `/upload-operation-file/<name>/<param_name>` | Upload a file for a file-type parameter |
| `DELETE` | `/delete-operation-file/<name>/<param_name>/<filename>` | Delete an uploaded operation file |

## Visualization

| Method | Path | Description |
|---|---|---|
| `POST` | `/start-visualize/<pipeline_name>/<operation_uuid>` | Start visualization for a specific operation |
| `POST` | `/stop-visualize/<pipeline_name>` | Stop active visualization for a pipeline |
| `GET` | `/visualize/<pipeline_name>` | Single JPEG frame from the active visualization |
| `GET` | `/visualize/stream/<pipeline_name>` | MJPEG stream of visualization at 12 FPS |

## Backend control

| Method | Path | Description |
|---|---|---|
| `POST` | `/restart-backend` | Trigger systemctl restart of the EagleEye service |
| `POST` | `/shutdown` | Shut down the backend process |
| `GET` | `/get_restart_required` | Returns `{"restart_required": bool}` |
| `POST` | `/set_restart_required` | Set the restart-required flag |

## Settings

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-general-conf` | Returns `{"network_table_address": "..."}` |
| `POST` | `/save-general-conf` | Save the general config (NT address) |

## Logs

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-log-messages` | Returns recent log messages array |
| `GET` | `/download-log-file` | Download the full log file |

## System monitoring

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-system-status` | Returns CPU %, RAM %, GPU % snapshot |

## Custom operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/custom-operations` | List all secondary operations with metadata |
| `POST` | `/custom-operations` | Create a new operation from a name (generates template files) |
| `GET` | `/custom-operations/<name>/<file_type>` | Read `code` or `config` for an operation |
| `POST` | `/custom-operations/<name>/lint` | Lint code + config; returns diagnostics list |
| `POST` | `/custom-operations/<name>/save` | Save code + config atomically (validates syntax first) |
| `DELETE` | `/custom-operations/<name>` | Delete a custom operation and its config file |

## SSE stream

| Method | Path | Description |
|---|---|---|
| `GET` | `/sse/stream` | Server-Sent Events stream (`text/event-stream`) |

Named events on this stream:

| Event name | Rate | Payload shape |
|---|---|---|
| `heartbeat` | Every 5 s | `{}` |
| `log_update` | On new log lines | `{"messages": ["..."]}` |
| `system_status` | Every 1.5 s | `{"cpu": float, "ram": float, "gpu": float\|null}` |
| `pipeline_error` | On exception | `{"pipeline_name": str, "operation_name": str, "error": str, "seq": int}` |
| `pipeline_profile` | Every ~300 ms | `{"pipeline_name": str, "frame_time_ms": float, "operations": {...}, "timesteps": [...]}` |
