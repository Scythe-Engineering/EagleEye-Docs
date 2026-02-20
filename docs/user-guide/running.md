# Running

## Starting the backend

From the project root, run:

```bash
uv run python -m src.main_backend
```

Or, if using the activated virtual environment:

```bash
.venv/bin/python -m src.main_backend
```

The backend starts the Flask/SocketIO server on `http://0.0.0.0:5001` automatically — you do not start it separately.

## Startup sequence

`MainBackend.__init__` runs these steps in order:

1. **Build Rust modules** — Compiles PyO3 extensions via maturin. Cached after first run (seconds, not minutes).
2. **Discover hardware** — Detects available CPU, GPU, and MX3 devices via `get_available_devices()`.
3. **Load general config** — Reads `src/general_conf.json` for NT server address. Creates it with `0.0.0.0` if missing.
4. **Initialize NetworkTables** — Connects to the configured NT server and publishes the schema manifest.
5. **Start WebUI** — Creates `EagleEyeInterface` (Flask daemon thread on port 5001) plus SSE heartbeat, log monitor, and system status background threads.
6. **Initialize cameras** — `CameraThreadManager` discovers USB cameras, starts per-camera worker threads.
7. **Load camera configs** — `CameraConfigRegistry` loads intrinsics/extrinsics from disk for each known camera.
8. **Initialize compute pool** — Creates CPU, GPU, and MX3 device objects and registers them in `ComputePool`.
9. **Build pipelines** — `generate_all_pipelines()` reads `pipeline_config.json` and instantiates all operations with dependency injection.
10. **Start pipeline threads** — Each pipeline with cameras present gets a `thread_run()` call; pipelines with missing cameras are skipped with a warning.

## Accessing the WebUI

Open `http://localhost:5001` in your browser. On a coprocessor, replace `localhost` with the device's IP.

The WebUI serves seven tabs:
- **Views** — live MJPEG camera feeds
- **3D View** — Three.js field visualization with robot pose overlay
- **Pipeline Editor** — drag-and-drop DAG builder with auto-save
- **System** — CPU, RAM, and GPU monitoring
- **Settings** — NT address configuration and backend restart
- **Utils** — camera calibration and extrinsics editor
- **Custom Ops** — in-browser Python operation editor

## Development mode

To run without a connected robot or cameras (e.g. on a dev machine):

- Set NT address to `0.0.0.0` in `src/general_conf.json`
- Use video file cameras configured in `src/config/video_file_cameras.json` instead of physical USB cameras
- The system starts normally; pipelines with no matching bus IDs are skipped

## Enabling NetworkTables

NetworkTables is enabled whenever the NT address in `general_conf.json` is set to a reachable host. Each pipeline can also be individually enabled/disabled for NT publishing via the Settings tab. The schema manifest is always published to the `EagleEye` table on startup so that SmartDashboard/Elastic can discover data types.

## Stopping

Press `Ctrl+C`. The backend catches `KeyboardInterrupt` and calls `shutdown()`, which stops all camera threads and compute devices.

When running as a systemd service, use:

```bash
sudo systemctl stop eagleeye
```
