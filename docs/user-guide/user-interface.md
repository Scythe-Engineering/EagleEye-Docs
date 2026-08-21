---
sidebar_position: 13
title: User Interface Reference
---

# User Interface Reference

Reference for every tab and control in the EagleEye web UI, served at
`http://<device-address>:5001`. For step-by-step setup, start at
[Start Here](./overview).

Six tabs are listed in the navigation sidebar on the right of every page:

| Tab | Purpose |
|-----|---------|
| **Views** | Live camera thumbnails |
| **3D View** | Field and robot pose visualization |
| **Pipeline** | Build and edit pipelines |
| **System** | CPU, memory, storage, pipeline states |
| **Settings** | Backend configuration, logs, terminal, system tools |
| **Utils** | Camera calibration and extrinsics |

---

## Views

![Views tab](/img/ui-screenshots/views-tab.png)

Live stream of every detected camera, one card each, labelled with the camera name. This is
the raw camera feed, not pipeline output — use it for aiming, focus, and exposure.

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

3D assets are managed from **Settings → Robot and Field Files → Manage**.

---

## Pipeline

![Pipeline tab](/img/ui-screenshots/pipeline-tab.png)

The pipeline editor.

### Layout

- **Canvas** — nodes and connections.
- **Operations list** — drag operations onto the canvas.
- **Operation settings** — opens when you click a node.
- **Pipeline dropdown** — switch pipelines; **New Pipeline** creates one.

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

Edits save as you make them. Some changes prompt for a backend restart.

### Profiling panels

Overlaid on the canvas: an execution timestep list and an execution summary. Both read "No
profiling data" until frames flow. The `i` button opens **Profiling details** with
per-operation timings and a **Cumulative avg** checkbox that averages samples over time rather
than showing the newest frame.

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

If the numbers stop moving, the UI has lost its connection to the backend — reload the page,
then check the service.

---

## Settings

![Settings tab](/img/ui-screenshots/settings-tab.png)

### General

| Control | Description |
|---------|-------------|
| **Download Logs** | Saves the backend log file to your computer |
| **Test Notifications** | Sends a test notification |
| **Manage Networks** | Wireless network configuration for the device |
| **Update System** | Runs the system/software update flow |
| **Manage Test Videos** | Manage recorded video files usable as camera sources for offline testing |
| **Robot and Field Files → Manage** | Manage field and robot models used by the 3D View |

### Network Table

| Control | Description |
|---------|-------------|
| **Roborio (or sim) IP Address** | roboRIO or simulation host address. A fresh install uses `localhost`; replace it. See [Connect NetworkTables](./networktables) |
| **Status indicator** | Current NetworkTables connection state; reads `Unknown` before the first connection |

### Views

| Control | Description |
|---------|-------------|
| **View stream downscale** | How much camera preview streams are shrunk before being sent to the browser. Lower values reduce bandwidth and CPU. Preview only — pipelines are unaffected |

### Actions

| Control | Description |
|---------|-------------|
| **Save Settings** | Persists the settings above |
| **Restart Backend** | Restarts the EagleEye backend process |
| **Reboot Computer** | Reboots the whole device |

### System Logs

Live backend log output, with a **Clear** button that clears the display.

### Terminal

A terminal panel for running shell commands on the device without a separate SSH session:
prompt, command input, **Send**, output area, and a clear button.

:::note
The terminal's behaviour was not exercised while writing this guide. If it does not respond,
use SSH.
:::

---

## Utils

![Utils tab](/img/ui-screenshots/utils-tab.png)

Per-camera configuration. Select the camera in the **Camera** dropdown first — everything on
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

![The built-in camera intrinsics calibration tool](/img/ui-screenshots/utils-calibration-modal.png)

Live feed, board settings (**Squares X**, **Squares Y**, **Square m**, **Marker m**), a live
resolution selector for the preview, a status line, **Capture** / **Reset** / **Calibrate & Save** buttons, a progress readout, and a list of captured frames. Walkthrough:
[Calibrate Intrinsics](./calibrate-intrinsics).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20). The operations
list above is taken from the operation definitions in the source tree at that commit; a
running install may show additional custom operations you have added.
:::
