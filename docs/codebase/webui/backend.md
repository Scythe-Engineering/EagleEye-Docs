# WebUI Backend

Backend is a Flask server with SocketIO/SSE for real-time updates.

## Entry point
- `src/webui/web_server.py` (default port `5001`).
- Serves static files, camera streams, API endpoints, and restart state.

## Responsibilities
- Stream MJPEG camera feeds.
- Persist and serve pipeline configs (save on structure changes).
- Expose settings/calibration endpoints.
- Emit backend state (restart required, time sync) to the frontend.

## Key utilities
- `src/webui/web_server_utils/serve_static_files.py`: static serving helpers.
- `src/webui/web_server_utils/drako_loader/`: 3D asset compression/serving.

## Notes
- Some pipeline tab features require a frontend build (`npm run build` in WebUI project) before serving.
- CORS is configured for local dev; adjust if self-hosting behind a tunnel.



