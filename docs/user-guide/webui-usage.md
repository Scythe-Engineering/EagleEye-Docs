# WebUI Usage

The WebUI is served at `http://localhost:5001` (or your coprocessor's IP on port 5001). It provides seven tabs for monitoring and controlling EagleEye.

## Views tab

Displays live MJPEG camera feeds. One feed card appears per camera that has an active `device_input.py` operation in a running pipeline. If a camera is unavailable, a "no image" placeholder is shown.

Click on a feed to expand it full-screen.

## 3D View tab

Shows a Three.js visualization of the FRC 2025 field with the robot's estimated pose overlaid in real time. The pose is updated as pipeline outputs publish through SSE.

You can:
- Rotate, pan, and zoom the field using mouse drag and scroll.
- Select a robot model from the available 3D models (loaded via Draco-compressed GLTF).

## Pipeline Editor tab

The core operator interface for building and modifying detection pipelines.

**Features:**
- **Node palette** — all available main and secondary operations are listed on the left with their categories and descriptions.
- **Drag-and-drop canvas** — drag operations from the palette onto the canvas to add them. Drag existing nodes to reposition them.
- **Port connections** — click and drag from an output port to an input port to create a connection. The connection type (normal or temporal) depends on whether the input port supports temporal connections.
- **Config panel** — click a node to open its parameter editor on the right. Edit parameters and confirm to update the operation's config.
- **Auto-save** — every change to the pipeline is immediately saved to `pipeline_config.json` via `POST /save-pipeline-config/<name>`.
- **Profiling overlay** — a live timing overlay shows per-operation execution times (updated every ~300 ms). The slowest operation in each timestep is highlighted.
- **Visualization** — click the eye icon on a node to start streaming its `visualize()` output in a modal overlay.
- **Error indicators** — operations that throw exceptions show a red indicator. Click to see the traceback.

After saving, an orange **Restart Required** banner appears at the top of the page. Click **Restart** in the Settings tab to apply the new pipeline.

## System tab

Displays real-time resource usage updated via SSE every 1.5 seconds:
- **CPU %** — overall CPU utilization
- **RAM %** — used / total system memory
- **GPU %** — GPU utilization (if a supported GPU is present)

## Settings tab

- **NetworkTables address** — enter the NT server IP or hostname (e.g. `10.TE.AM.2` or `roborio-TEAM-frc.local`). Click **Save** to write to `src/general_conf.json`.
- **Restart backend** — triggers `sudo systemctl restart $SERVICE_NAME`. Requires the service to be running and the user to have passwordless sudo for this command (see [Deployment](./deployment)).

## Utils tab

Camera calibration and extrinsics management.

**Intrinsics (camera calibration):**
1. Print or display a standard OpenCV checkerboard pattern.
2. Capture multiple images from different angles using the calibration tool.
3. Run OpenCV calibration to generate a `camera_parameters.yaml` intrinsics file.
4. Upload the YAML file via the intrinsics upload form in the Utils tab, selecting the camera by its bus ID.

**Extrinsics (mounting position):**
The extrinsics editor lets you set the camera's position and orientation relative to the robot:
- **Position** (x, y, z in meters from robot center)
- **Rotation** (roll, pitch, yaw in radians)

Saving extrinsics writes to `src/config/camera_configs/<bus_id>/extrinsics.json`.

## Custom Ops tab

An in-browser Python operation editor backed by CodeMirror 6. Use this to create and edit secondary operations without leaving the WebUI.

**Workflow:**
1. Click **New Operation** and enter a snake_case name (e.g. `my_filter`).
2. A template class inheriting from `OperationInstance` is generated.
3. Edit the Python code in the left panel and the JSON config in the right panel.
4. Click **Lint** to check for syntax errors and ruff warnings before saving.
5. Click **Save** to write the files atomically. The restart-required badge appears.
6. Restart the backend to load the new operation.

The linter runs `ast.parse()` for syntax checking and `uvx ruff check` for style linting. Config JSON is validated separately. Syntax errors block saving; style warnings do not.
