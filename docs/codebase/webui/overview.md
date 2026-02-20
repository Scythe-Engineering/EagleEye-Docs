# WebUI Overview

The WebUI is a single-page application served by the Flask backend on port `5001`. It provides seven tabs for operators to monitor and control the vision system in real time.

## Tabs

| Tab | Purpose |
|---|---|
| **Views** | Live MJPEG camera feeds, one per configured pipeline camera |
| **3D View** | Three.js field visualization with robot pose overlaid on the 2025 FRC field |
| **Pipeline Editor** | Drag-and-drop DAG builder; changes auto-save to `pipeline_config.json` |
| **System** | Real-time CPU, RAM, and GPU usage (published via SSE every 1.5 s) |
| **Settings** | NetworkTables server address and backend restart button |
| **Utils** | Camera calibration (checkerboard → upload intrinsics) and extrinsics editor |
| **Custom Ops** | In-browser Python operation editor backed by CodeMirror 6 |

## Build toolchain

The frontend is built with **Vite** (using the rolldown bundler), **Handlebars** partials for HTML templating, **Tailwind CSS v4**, and ES6 modules.

```bash
cd src/webui
npm install
npm run build
```

Build output:
- `src/webui/js/main.js` — bundled JS
- `src/webui/style.css` — compiled Tailwind CSS

The backend serves these via `/js/main.js` and `/style.css` routes.

## Core files

| File | Role |
|---|---|
| `src/webui/web_server.py` | Flask/SocketIO server, all routes, SSE engine |
| `src/webui/web_server_utils/serve_static_files.py` | Static file helpers |
| `src/webui/web_server_utils/drako_loader/` | Draco-compressed 3D asset serving |
| `src/webui/assets/` | Static assets: `no_image.png`, `favicon.ico`, robot models, AprilTag images |
| `src/webui/js/` | Frontend JS source (Vite project) |

## Real-time communication

The frontend maintains a persistent `EventSource` connection to `GET /sse/stream`. Named SSE events keep the UI synchronized:

| Event | Rate | Content |
|---|---|---|
| `heartbeat` | Every 5 s | Connection keepalive |
| `log_update` | On new log line | Latest log messages array |
| `system_status` | Every 1.5 s | CPU %, RAM %, GPU % |
| `pipeline_error` | On error | Pipeline name + traceback |
| `pipeline_profile` | Every 300 ms | Per-op timing snapshot |
