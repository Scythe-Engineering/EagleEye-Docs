# Running

## Start services
1. Launch backend and pipelines (fill in your actual entrypoint; placeholder: `python main.py`).
2. Ensure cameras are streaming and the configured device IDs are available.
3. Start the WebUI server (default port `5001`): `python webui/web_server.py`.

## Access the UI
- Open `http://localhost:5001`.
- Verify camera feeds render; pipelines should show as connected.
- Use the pipeline editor to add/remove/reorder operations; changes save automatically.

## Runtime checks
- Watch for restart indicators after config changes.
- Monitor FPS/timing via `debug_mode` in `src/config/utils/pipeline.py` (set to `True` as needed).
- Confirm NetworkTables or other integrations are reachable (placeholder endpoint).

## Stopping
- Stop camera threads gracefully, then shut down the backend.
- Call `ComputePool.stop_all_devices()` if you manage shutdown manually.

