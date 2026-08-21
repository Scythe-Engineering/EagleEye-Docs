# WebUI API Reference

All routes are registered with `add_url_rule` in `EagleEyeInterface._register_routes()` in `src/webui/web_server.py`. The server listens on `http://0.0.0.0:5001`.

## Static / UI

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Serves the compiled `index.html` |
| `GET` | `/js/main.js` | Serves the compiled frontend bundle |
| `GET` | `/style.css` | Serves the compiled CSS |
| `GET` | `/background.webp` | Background image |
| `GET` | `/assets/<path:filename>` | Compiled static assets |
| `GET` | `/.well-known/appspecific/com.chrome.devtools.json` | Silences the Chrome DevTools probe |
| `GET` | `/frc2025r2.json` | FRC 2025 AprilTag field layout |
| `GET` | `/src/webui/assets/apriltags/<path:filename>` | AprilTag reference images |
| `GET` | `/draco/<path:filename>` | Draco decoder assets for 3D models |
| `GET` | `/get-robot-file/<path:filename>` | Serves a robot model file |

## Camera feeds and test videos

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-available-cameras` | Available camera names |
| `GET` | `/feed/<camera_name>` | MJPEG stream for the named camera |
| `GET` | `/test-videos` | List uploaded test videos |
| `POST` | `/test-videos` | Upload a test video |
| `DELETE` | `/test-videos/<filename>` | Delete a test video |

## Camera configuration and calibration

| Method | Path | Description |
|---|---|---|
| `GET` | `/camera-config/cameras` | Cameras that have configs |
| `GET` | `/camera-config/<camera_bus_id>` | Full config (intrinsics + extrinsics) |
| `POST` | `/camera-config/<camera_bus_id>/extrinsics` | Save extrinsics |
| `POST` | `/camera-config/<camera_bus_id>/intrinsics` | Upload intrinsics |
| `DELETE` | `/camera-config/<camera_bus_id>/intrinsics` | Delete intrinsics |
| `GET` | `/camera-config/<camera_bus_id>/calibration/feed` | Calibration MJPEG feed |
| `GET` | `/camera-config/<camera_bus_id>/distortion/feed` | Undistorted preview feed |
| `POST` | `/camera-config/<camera_bus_id>/calibration/capture` | Capture one calibration frame |
| `GET` | `/camera-config/<camera_bus_id>/calibration/frames` | List captured frames |
| `GET` | `/camera-config/<camera_bus_id>/calibration/frames/<frame_index>` | Get one frame image |
| `DELETE` | `/camera-config/<camera_bus_id>/calibration/frames/<frame_index>` | Delete one frame |
| `POST` | `/camera-config/<camera_bus_id>/calibration/reset` | Discard all captured frames |
| `POST` | `/camera-config/<camera_bus_id>/calibration/run` | Run calibration and write intrinsics |

## 3D assets

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-available-robots` | Robot models available for display |
| `GET` | `/robot-files` | List robot model files |
| `POST` | `/robot-files` | Upload a robot model file |
| `POST` | `/robot-files/<filename>/scale` | Save a model's display scale |
| `DELETE` | `/robot-files/<filename>` | Delete a robot model file |
| `GET` | `/field-files` | List field model files |
| `POST` | `/field-files` | Upload a field model file |
| `POST` | `/field-files/<year>/<filename>/scale` | Save a field model's scale |
| `DELETE` | `/field-files/<year>/<filename>` | Delete a field model file |

## Operations metadata

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-available-operations` | All operations (main + secondary) with config defs |
| `GET` | `/get-operation-config-data/<operation_name>/<is_secondary>` | Config def for one operation |
| `POST` | `/get-operation-config-data-batch` | Config defs for several operations in one call |
| `GET` | `/get-operation-files/<operation_name>/<parameter_name>` | Files for a file-type parameter |
| `POST` | `/upload-operation-file/<operation_name>/<parameter_name>` | Upload a file for a parameter |
| `DELETE` | `/delete-operation-file/<operation_name>/<parameter_name>/<filename>` | Delete an uploaded file |

There is no endpoint for creating or editing operation source code from the browser.

## Devices and model library

| Method | Path | Description |
|---|---|---|
| `GET` | `/device-registry` | Startup device inventory (`cpu`, `cuda:N`, `mx3:N`) |
| `GET` | `/model-library` | List managed models |
| `POST` | `/model-library` | Create a model record |
| `PATCH` | `/model-library/<model_id>` | Update a model record |
| `DELETE` | `/model-library/<model_id>` | Delete a model record |
| `POST` | `/model-library/<model_id>/artifacts/<slot>` | Upload an artifact into a slot |
| `DELETE` | `/model-library/<model_id>/artifacts/<slot>` | Delete an artifact |
| `GET` | `/model-library/<model_id>/resolve` | Resolve the artifact for a device ID |
| `GET` | `/model-library/mx3-compilation` | MX3 compilation status |
| `POST` | `/model-library/<model_id>/mx3-compilation` | Start an MX3 compilation job |
| `DELETE` | `/model-library/mx3-compilation/<job_id>` | Cancel a compilation job |

## Pipeline management

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-pipeline-names` | Pipeline names from `pipeline_config.json` |
| `GET` | `/get-pipeline-config/<pipeline_name>` | Operation list for one pipeline |
| `POST` | `/save-pipeline-config/<pipeline_name>` | Overwrite one pipeline's operation list |
| `GET` | `/pipeline-config/json` | Entire pipeline config as JSON |
| `PUT` | `/pipeline-config/json` | Replace the entire pipeline config |
| `GET` | `/pipeline-settings/<pipeline_name>` | Per-pipeline settings |
| `PUT` | `/pipeline-settings/<pipeline_name>` | Save per-pipeline settings |
| `DELETE` | `/delete-pipeline/<pipeline_name>` | Delete a pipeline |
| `GET` | `/get-pipeline-active/<pipeline_name>` | Whether the pipeline is running |
| `GET` | `/get-pipeline-thread-info/<pipeline_name>` | Thread and timestep info per operation UUID |

## Visualization

| Method | Path | Description |
|---|---|---|
| `POST` | `/start-visualize/<pipeline_name>/<operation_uuid>` | Start visualizing one operation |
| `POST` | `/stop-visualize/<pipeline_name>` | Stop the pipeline's visualization |
| `GET` | `/visualize/<pipeline_name>` | Single JPEG frame |
| `GET` | `/visualize/stream/<pipeline_name>` | MJPEG stream at `VISUALIZATION_STREAM_FPS` (12) |

## Line profiling

| Method | Path | Description |
|---|---|---|
| `POST` | `/line-profiling/start/<pipeline_name>/<operation_uuid>` | Start line profiling an operation |
| `POST` | `/line-profiling/stop/<pipeline_name>/<operation_uuid>` | Stop line profiling |
| `GET` | `/line-profiling/status` | Current profiling state |
| `GET` | `/line-profiling/report/<pipeline_name>/<operation_uuid>` | Line-by-line report |

## Networking

| Method | Path | Description |
|---|---|---|
| `GET` | `/wifi-networks` | Visible Wi-Fi networks |
| `GET` | `/wifi-networks/status` | NetworkManager connection status |
| `POST` | `/wifi-networks/connect` | Connect to a network |
| `POST` | `/wifi-networks/disconnect` | Disconnect |

## Backend control

| Method | Path | Description |
|---|---|---|
| `POST` | `/restart-backend` | Restart the EagleEye service |
| `POST` | `/reboot-system` | Reboot the host |
| `POST` | `/shutdown` | Shut down the backend process |
| `GET` | `/get_restart_required` | Returns `{"restart_required": bool}` |
| `POST` | `/set_restart_required` | Set the restart-required flag |
| `GET` | `/system-update/status` | Update state |
| `GET` | `/system-update/info` | Available update information |
| `POST` | `/system-update/run` | Start a system update |

## Terminal

| Method | Path | Description |
|---|---|---|
| `GET` | `/terminal/cwd` | Current working directory |
| `POST` | `/terminal/execute` | Execute a command and return its output |

## Settings

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-general-conf` | Returns the general config (`network_table_address`, `view_stream_downscale`) |
| `POST` | `/save-general-conf` | Save the general config |

## Logs and system monitoring

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-log-messages` | Recent log messages |
| `GET` | `/download-log-file` | Download the full log file |
| `GET` | `/get-system-status` | Same payload as the `system_status` SSE event |

## SSE stream

| Method | Path | Description |
|---|---|---|
| `GET` | `/sse/stream` | Server-Sent Events stream (`text/event-stream`) |

See [SSE & Real-time](../architecture/sse-realtime) for the full event list and payload shapes.
