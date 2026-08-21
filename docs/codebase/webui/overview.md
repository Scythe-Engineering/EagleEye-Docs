# WebUI Overview

The WebUI is a single-page application served by the Flask backend on port `5001`. It provides six tabs for operators to monitor and control the vision system in real time.

## Tabs

Tab markup lives in `src/webui/html/tabs/`:

| Tab | Partial | Purpose |
|---|---|---|
| **Camera Views** | `camera_views_tab_content.html` | Live MJPEG camera feeds |
| **3D View** | `3d_tab_content.html` | Three.js field visualization with robot pose, camera poses, and detected objects |
| **Pipeline** | `pipeline_tab_content.html` | Drag-and-drop DAG editor, operation configuration, model library, MX3 compilation, profiling overlay |
| **System Status** | `system_status_tab_content.html` | CPU, memory, storage, pipeline, and NetworkTables status from the `system_status` event |
| **Settings** | `settings_tab_content.html` | NetworkTables address, Wi-Fi, system update, terminal, robot/field/test-video assets, restart |
| **Utils** | `utils_tab_content.html` | Camera calibration capture and intrinsics/extrinsics management |

There is no in-browser operation source editor.

## Build toolchain

Vite (rolldown), Handlebars partials, Tailwind CSS v4, and ES modules. The Vite project is rooted at the repository root, not at `src/webui`:

```bash
npm install
npm run build
```

Build output goes to `src/webui/static/` (`bundle.js`, `main.css`) and is served through the `/js/main.js`, `/style.css`, and `/assets/<path>` routes.

## Core files

| File | Role |
|---|---|
| `src/webui/web_server.py` | `EagleEyeInterface`: Flask app, route registration, SSE engine |
| `src/webui/web_server_utils/*_mixin.py` | Route handler groups composed into `EagleEyeInterface` |
| `src/webui/web_server_utils/constants.py` | Host, port, stream FPS, CORS, default general config |
| `src/webui/web_server_utils/serve_static_files.py` | Static file helpers |
| `src/webui/web_server_utils/drako_loader/` | Draco decoder assets for compressed 3D models |
| `src/webui/assets/` | `background.webp`, `favicon.ico`, `no_image.png`, AprilTag images, robot and field models |
| `src/webui/js/` | Frontend source |

## Real-time communication

The frontend keeps a persistent `EventSource` on `GET /sse/stream`. Named events keep the UI synchronized:

| Event | Rate | Content |
|---|---|---|
| `heartbeat` | Every 5 s | `{"ts": float}` keepalive |
| `log_update` | On new log lines | Formatted log lines |
| `system_status` | Every 1.5 s | `cpu`, `memory`, `storage`, `pipelines`, `network_table` |
| `pipeline_operation_errors` | When the error cache changes | Per-pipeline operation errors |
| `profiling_update` | Up to every 0.3 s per pipeline | Per-operation timing snapshot |
| `mx3_compilation_progress` | During compilation | Job status and recent log lines |
| `system_update_progress` | During a system update | Update progress |
| `update_robot_transform`, `update_camera_pose`, `update_detected_objects` | On call from pipeline output operations | 3D view state |
