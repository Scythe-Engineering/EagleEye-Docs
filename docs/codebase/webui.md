# WebUI

The WebUI is a Flask + JS interface for monitoring and configuring pipelines. Default port: `5001`.

## Backend
- Entry: `webui/web_server.py` (Flask + SocketIO/SSE for live data).
- Responsibilities: serve static assets, stream camera feeds, manage settings, expose pipeline endpoints.
- Build note: some features (pipeline tab) require `npm run build` for the frontend assets.

## Frontend
- JS modules under `webui/js/` handle feeds, pipeline editing, settings, and UI components.
- Three.js powers 3D robot/field visualization; Tailwind-style classes for styling.
- Templates under `webui/html/` and assets under `webui/assets/` (robots, fields, AprilTags, icons).

## Key features
- Multi-camera MJPEG streaming with discovery.
- Drag-and-drop pipeline editing; automatic save/restart indicators.
- Restart state monitoring and time sync checks.
- Settings and calibration management.
- Pipeline error handling (see `webui/PIPELINE_ERROR_HANDLING.md`).

## Directory sketch
```
webui/
├── web_server.py
├── js/              # main.js, init3DView.js, pipeline/, settings/, ui/, feeds/
├── html/            # tabs and partials
├── css/             # component styles
├── assets/          # robots, fields, apriltags, images
└── web_server_utils/
```

