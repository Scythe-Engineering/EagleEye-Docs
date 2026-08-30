---
sidebar_position: 13
title: User Interface Reference
---

# User interface reference

Reference for the EagleEye web UI, served at `http://<device-address>:5001`. Start with
[Start here](./overview), then follow [the setup wizard](./pipeline-setup) for a new camera.

The large panel on the left holds the current tool. Six tabs stay in the navigation on the
right:

![EagleEye UI with the main panel on the left and navigation on the right](/img/ui-screenshots/views-tab.png)

| Tab | Purpose |
|-----|---------|
| **Views** | Live camera thumbnails |
| **3D View** | Field and robot pose visualization |
| **Pipeline** | Advanced manual pipeline editing |
| **System** | CPU, memory, storage, pipeline states |
| **Settings** | Backend configuration, logs, terminal, system tools |
| **Utils** | Camera calibration and extrinsics |

The first-boot wizard opens **Utils**, **Settings**, and **3D View** at the right time. Outside
the wizard, use **Views** to check the camera, **Utils** for calibration and placement, and
**System** to confirm a pipeline is running. Use **Pipeline** only for
[advanced manual setup](./advanced-pipeline-editor).

---

## Views

![Views tab](/img/ui-screenshots/views-tab.png)

Live stream of every detected camera, one card each, labelled with the camera name. This is
the raw camera feed, not pipeline output. Use it for aiming, focus, and exposure.

If no cameras were detected, the tab shows a message instead of cards. See
[Check Your Cameras](./cameras).

The image quality streamed here is controlled by **view stream downscale** in Settings and
does not affect what pipelines process.

---

## 3D View

![3D View tab](/img/ui-screenshots/3d-view-tab.png)

A 3D field scene with the robot drawn at the latest pose from **Robot Pose Output** nodes.

### Controls

| Input | Action |
|-------|--------|
| Left-click drag | Rotate |
| Scroll | Zoom |
| Right-click drag | Pan |

### Options

| Control | Description |
|---------|-------------|
| **Year** | Which season's field assets to load |
| **Field File** | Which field mesh to use; simplified meshes render faster |
| **Robot File** | Robot model shown at the estimated pose |
| **Game Pieces** | Show or hide game piece objects |
| **Robot Model** | Show or hide the robot model |
| **Cameras** | Show or hide camera markers on the robot |
| **Shadows** | Shadow rendering; turn off to reduce load |

A loading overlay with a progress bar appears while assets download. A stats readout in the
corner shows scene statistics and frame rate.

During first-boot verification, a **Verify live output** panel appears here. It reports
NetworkTables connection, generated-pipeline activity, and expected published keys. **Finish**
becomes available only after the required checks pass. See
[the verification step](./pipeline-setup#6-verify-live-output).

3D assets are managed from **Settings → Robot and Field Files → Manage**. The manager uploads and deletes robot `.glb` files, field `.glb` files, and matching field maps. After upload, select the asset from the 3D View dropdown instead of entering a project path.

---

## Pipeline editor, advanced

Use this tab when you need a custom graph or MX3 inference. The setup wizard creates standard
localization and CPU object-detection pipelines without using this editor. See
[Advanced: manual pipeline setup](./advanced-pipeline-editor).

![AprilTag pipeline at a readable zoom](/img/ui-screenshots/pipeline-setup/apriltag-temporal-input-closeup.png)

The pipeline editor.

### Layout

- **Canvas:** nodes and connections.
- **Operations list:** drag operations onto the canvas.
- **Operation settings:** opens when you click a node.
- **Pipeline dropdown:** switch pipelines; **New Pipeline** creates a graph for manual editing.

### Working with the graph

| Action | How |
|--------|-----|
| Add a node | Drag from the Operations list onto the canvas |
| Connect nodes | Drag from an output port to an input port |
| Edit a node | Click it and use the settings panel |
| Fit the graph in view | Double-click empty canvas |
| Edit a connection | Right-click it |
| Mark a feedback edge | Right-click → **Set as Default Connection** (draws dashed) |
| Unmark it | Right-click → **Remove Default Status** |

If the context menu reads **Cannot Set Default**, that target port does not accept a default
connection.

File parameters have a dropdown and **Manage** control. Use **Manage → Upload File**, close the manager, and select the uploaded file. This is the normal workflow for field maps, models, and other operation assets; raw `{project_root}` paths are for development and imported legacy configurations.

Edits save as you make them. Changing node positions or ordinary tuning values does not stop
the running backend. When an operation supports live configuration, clicking **Done** applies
the new values to that operation immediately.

Some fields build resources that cannot be replaced safely while the operation is running.
Camera selection, model selection, and map selection are common examples. These fields show a
restart note in the settings panel. Graph structure changes also require the backend to rebuild
the pipeline. After you save one of these changes, a red **Backend restart required** banner
appears above the canvas. Click **Restart** there when you are ready to interrupt processing and
load the saved configuration.

![The restart banner that appears above the pipeline canvas when a saved change needs the backend rebuilt](/img/ui-screenshots/pipeline-restart-required.png)

Operation settings can also include a live view. Open the node's gear button to tune it beside
the image it produces. This is useful for detection, filtering, and preprocessing operations.

![Temporal Acceleration settings beside its live processed-frame view](/img/ui-screenshots/pipeline-setup/apriltag-temporal-live-view.png)

### Profiling panels

The canvas overlays two small profiling panels. The left panel lists each execution timestep
and its operation time. The summary shows:

| Value | Meaning |
|-------|---------|
| **Flow** | Time spent running the operation graph for the current frame |
| **FPS** | Estimated completed pipeline cycles per second, including the wait for a fresh input frame |
| **Latency** | Age of the camera frame when processing finished, including capture, transfer, decode, and pipeline work |

Both panels read "No profiling data" until frames flow.

#### Timestep numbers and thread colors

Each node has a colored square at its upper-left corner:

- The number is the zero-based execution timestep. It is not a thread number.
- The color identifies the worker thread. Thread 1 is red, Thread 2 is teal, and later
  threads use blue, light green, yellow, gray, pink, purple, green, and orange. The palette
  repeats if a pipeline needs more than ten threads.
- Nodes with the same number belong to the same timestep. They can run at the same time when
  the scheduler assigns them different thread colors.
- A thread can run several nodes across different timesteps. The color follows the thread,
  not the operation type.

The **PREP**, **DET**, **FILT**, **PROC**, and **NET** chips inside the node header describe
the operation category. Their colors are unrelated to worker threads. The green badge at the
upper-right of a running node is that operation's measured time for the latest frame.

![Timestep badges, thread colors, and live timings on the first half of an AprilTag pipeline](/img/ui-screenshots/pipeline-setup/apriltag-input-detection-closeup.png)

The compact timestep list uses the same colors. If several threads participate in one
timestep, its circle is split into equal colored segments.

#### Profiling details

Click the `i` button to open **Profiling details**. The top section records frame wall time,
full cycle time, capture latency, and the frame sequence. **By timestep** compares the wall
time around a group with **Σ ops**, the sum of its individual operation times. When operations
run in parallel, **Σ ops** can be larger than wall time.

![Profiling details grouped by execution timestep](/img/ui-screenshots/pipeline-profiling.png)

Scroll to **By thread** to see which operations the scheduler assigned to each worker. Thread
numbers start at 1. The scheduler chooses the minimum number of workers needed for operations
that overlap, then reuses those workers in later timesteps.

![Profiling details grouped by worker thread](/img/ui-screenshots/pipeline-profiling-threads.png)

Enable **Cumulative avg** to replace the newest-frame numbers with the arithmetic mean of all
profiling updates received since you enabled it. It is not a rolling window. Turn it off and
back on to start a new average.

### Operations

Every operation available in the editor, grouped by what it does.

#### Input

| Operation | Description |
|-----------|-------------|
| **Device Input** | Reads frames from a camera by `camera_bus_id`. Optional `frame_rotation` in 90° steps. First node in any camera pipeline |
| **Get NetworkTables Value** | Reads a NetworkTables key and injects the value into the pipeline |

#### Detection

| Operation | Description |
|-----------|-------------|
| **Detect AprilTags** | AprilTag detection. Settings: `families`, `nthreads`, `quad_decimate`, `quad_sigma`, `refine_edges`, `decode_sharpening` |
| **Color Threshold Detection** | Finds regions matching an HSV colour range |
| **Most Dense Color Threshold Detection** | As above, returning only the densest region |
| **Object Detection** | Runs a neural network model to detect objects by class |
| **MX3 Async Object Detection** | Object detection on an MX3 accelerator, run asynchronously |

#### Preprocessing

| Operation | Description |
|-----------|-------------|
| **Temporal Acceleration Preprocessor Rust** | Predicts where tags will be from the previous camera pose and passes only those regions to the detector. Needs a default-marked `camera_pose` feedback edge. See [Add Temporal Acceleration](./temporal-acceleration) |

#### Filtering

| Operation | Description |
|-----------|-------------|
| **Minimum AprilTag Count** | Stops the pipeline for this frame unless at least `minimum_detections` tags were found |
| **Tag Filter** | Whitelist or blacklist tag IDs (`filter_mode`, `tag_ids`) |
| **Pose Outlier Filter Rust** | Rejects poses that disagree with recent history using predictive gating |

#### Pose

| Operation | Description |
|-----------|-------------|
| **PnP Camera Localization** | Camera pose on the field from tag detections, intrinsics, and the tag map |
| **Camera To Robot Pose** | Applies the camera's saved extrinsics to turn a camera pose into a robot pose |
| **Camera Local To Robot Transform** | Converts camera-relative detection positions into robot-relative positions |
| **Robot Local To Field Transform** | Converts robot-relative coordinates into field coordinates |
| **Camera Adjust** | Applies an offset correction to a camera pose |
| **Pose Fusion** | Combines multiple pose estimates |
| **Flatten Pose** | Reduces a 3D pose to 2D |
| **Extract Pose** | Pulls a specific pose out of a combined value |
| **Ground Plane Intersection** | Projects a detection onto the field floor to estimate its 3D position |
| **Angle To Objects** | Bearing angles from the camera to detected objects |

#### Output

| Operation | Description |
|-----------|-------------|
| **Publish To NetworkTables** | The only operation that writes to NetworkTables. Settings: `target_key`, `schema`, `data_path` |
| **Robot Pose Output** | Sends the robot pose to the 3D View. Passes the pose through. **Does not publish to NetworkTables** |
| **Camera Pose Output** | Sends a camera pose to the 3D View for the given `camera_bus_id` |
| **Detected Objects Output** | Sends detected object positions to the UI |

---

## System

![System tab](/img/ui-screenshots/system-tab.png)

Live hardware and pipeline status, updated continuously by the backend.

| Panel | Shows |
|-------|-------|
| **Pipelines** | Every configured pipeline and whether it is running |
| **CPU** | Usage percentage, per-core detail, temperature |
| **RAM** | Usage percentage and amounts |
| **Storage** | Usage percentage and amounts |

If the numbers stop moving, the UI has lost its connection to the backend. Reload the page,
then check the service.

---

## Settings

![Settings tab](/img/ui-screenshots/settings-tab.png)

### Setup wizard

On a fresh image with no configured pipelines, EagleEye opens the first-boot wizard. It guides
camera selection, intrinsics calibration, camera position, pipeline purpose, NetworkTables, and
live verification. If you skip it or need to run it again, click **Open** next to **Camera setup
wizard** in Backend Settings.

The wizard stays on the relevant page while you work. Its calibration and camera-position guides
open **Utils**. Its NetworkTables guide opens **Settings**. After it generates the pipelines and
restarts the backend, it opens **3D View** for verification. See
[Run the setup wizard](./pipeline-setup) for the complete procedure and generated-key names.

### General

| Control | Description |
|---------|-------------|
| **Download Logs** | Saves the backend log file to your computer |
| **Test Notifications** | Sends a test notification |
| **Manage Networks** | Wireless network configuration for the device |
| **Update System** | Checks out the selected branch, updates system packages, and restarts EagleEye. See [Update EagleEye](./update-system). |
| **Manage Test Videos** | Manage recorded video files usable as camera sources for offline testing |
| **Robot and Field Files → Manage** | Manage field and robot models used by the 3D View |

#### Connect Wi-Fi

Click **Manage** next to **WiFi Networks**. Enter a password beside the network, then click
**Connect**. The connected row shows a green status label and a **Disconnect** button. See
[Connect to Wi-Fi](./connect-wifi) for SSH setup and internet-routing troubleshooting.

![Network Manager in the Settings tab with the network name pixelated](/img/ui-screenshots/wifi-manager.png)

### Network Table

| Control | Description |
|---------|-------------|
| **Roborio (or sim) IP Address** | roboRIO or simulation host address. On a robot network, enter `10.TE.AM.2` using your FRC team number, for example `10.33.22.2` for team 3322. A fresh install uses `localhost`; replace it. See [Connect NetworkTables](./networktables). |
| **Status indicator** | Current NetworkTables connection state; reads `Unknown` before the first connection |

### Views

| Control | Description |
|---------|-------------|
| **View stream downscale** | How much camera preview streams are shrunk before being sent to the browser. Lower values reduce bandwidth and CPU. This affects previews only; pipelines are unaffected |

### Actions

| Control | Description |
|---------|-------------|
| **Save Settings** | Persists the settings above |
| **Restart Backend** | Restarts the EagleEye backend process |
| **Reboot Computer** | Reboots the whole device |

![Restart Backend and Reboot Computer controls](/img/ui-screenshots/settings-restart-controls.png)

### System Logs

Live backend log output, with a **Clear** button that clears the display.

### Terminal

A terminal panel for running shell commands on the device without a separate SSH session:
prompt, command input, **Send**, output area, and a clear button.

---

## Utils

![Utils tab](/img/ui-screenshots/utils-tab.png)

Per-camera configuration. Select the camera in the **Camera** dropdown first. Everything on
this tab applies to the selected camera.

### Extrinsics

Fields: **Pitch**, **Yaw**, **Roll** (degrees) and **X Offset**, **Y Offset**, **Z Offset**
(meters). **Save Extrinsics** persists them; **Refresh** reloads stored values,
discarding unsaved edits.

The **Camera Position Preview** draws the camera on a robot model so you can sanity-check the
numbers. See [Configure Extrinsics](./configure-extrinsics).

### Intrinsics

| Control | Description |
|---------|-------------|
| Status line | Whether the selected camera has an intrinsics file |
| **Upload Intrinsics** | Upload a `.json` calibration, or drop a file on the dropzone |
| **Calibrate Camera** | Opens the built-in ChArUco calibration tool |
| **View Distortion** | Side-by-side raw and undistorted feeds for checking a calibration |
| **Delete Current Intrinsics** | Removes the selected camera's calibration |

### Calibration tool

![Live ChArUco detections, captured calibration frames, and corner coverage](/img/ui-screenshots/calibration-live-coverage.png)

Live feed with detected corners, board settings (**Squares X**, **Squares Y**, **Square m**,
**Marker m**), a preview-resolution selector, **Capture**, **Reset**, and **Calibrate & Save**
buttons, saved-frame thumbnails, and a corner-coverage plot. Walkthrough:
[Calibrate Intrinsics](./calibrate-intrinsics).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20). The operations
list above is taken from the operation definitions in the source tree at that commit; a
running install may show additional custom operations you have added.
:::
