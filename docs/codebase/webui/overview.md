# WebUI Overview

The WebUI provides live camera views, pipeline editing, and settings. It runs on Flask + SSE/SocketIO with a JS frontend.

## Core files
- Backend entry: `src/webui/web_server.py`
- Frontend assets: `src/webui/js/`, `src/webui/html/`, `src/webui/css/`, `src/webui/assets/`
- Error handling: `src/webui/PIPELINE_ERROR_HANDLING.md`

## Capabilities
- Multi-camera MJPEG streams
- Drag-and-drop pipeline editor with auto-save
- Restart indicators and backend state monitoring
- 3D visualization via Three.js (robot + field)
- Settings management and calibration surfaces

See backend/frontend pages for deeper details.



