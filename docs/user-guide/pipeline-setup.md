---
sidebar_position: 9
title: Build an AprilTag Pipeline
---

# Build an AprilTag Pipeline

This page builds the smallest pipeline that gets a robot pose from AprilTags onto
NetworkTables. Speed comes later, in [Add Temporal Acceleration](./temporal-acceleration).

## Before you start

- The camera appears in Views and you know its bus ID.
- The camera has [intrinsics](./calibrate-intrinsics). Nodes that need them fail to start
  without them.
- [Extrinsics](./configure-extrinsics) are saved for that camera.
- The [NetworkTables address](./networktables) is set.
- You have the 2026 AprilTag map path. The installed repository includes
  `{project_root}/src/webui/assets/fields/2026/apriltag_maps/FE-2026-_REBUILTTM_Playing_Field.fmap`.
  Use the map that matches the field you are on — a mismatched map produces confident, wrong
  poses.

## The graph you are building

```
Device Input ──frame──► Detect AprilTags ──detections──► Minimum AprilTag Count
                                                              │ detections
                                                              ▼
                                                    PnP Camera Localization
                                                              │ camera_pose
                                                              ▼
                                                     Camera To Robot Pose
                                                              │ robot_pose
                                                              ▼
                                                     Robot Pose Output  ──pose──►  Publish To NetworkTables
                                                     (3D view only)                (robot_pose key)
```

## 1. Open the starter pipeline

1. Open the **Pipeline** tab.
2. Choose **`2026_apriltag_starter`** from the **Pipeline** dropdown.

**Expected result:** the canvas contains Device Input → Detect AprilTags → PnP Camera
Localization → Camera To Robot Pose → Robot Pose Output. It is intentionally incomplete: its
camera IDs and map path are blank, and it does not publish to NetworkTables yet.

![The incomplete 2026 AprilTag starter pipeline](/img/ui-screenshots/pipeline-setup/2026-apriltag-starter.png)

Drag an operation from the **Operations** list onto the canvas, drag from an output port to an
input port to connect, and click a node to open its settings. Changes save as you make them.

## 2. Device Input

Click the existing **Device Input** node and set:

| Setting | Value |
|---------|-------|
| `camera_bus_id` | Your camera's bus ID, e.g. `1-1` |
| `frame_rotation` | `0`, or 90/180/270 if the camera is mounted rotated |

Every camera pipeline starts here. Its output port is `frame`.

## 3. Detect AprilTags

Click the existing **Detect AprilTags** node. The starter already connects `Device Input.frame` → `Detect AprilTags.frame`.

| Setting | Default | Notes |
|---------|---------|-------|
| `families` | `tag36h11` | The FRC family. Leave it |
| `nthreads` | `1` | Raise carefully; more threads competes with the rest of the pipeline |
| `quad_decimate` | `2.0` | Higher is faster and detects fewer distant tags |
| `quad_sigma` | `0.0` | Blur before detection; helps on very noisy images |
| `refine_edges` | `1` | Leave on |
| `decode_sharpening` | `0.25` | Leave alone unless you know why you are changing it |

The settings window opens a live view beside the controls. Detected tags get an outline and
ID marker, so you can check detection without leaving the pipeline editor.

![Detect AprilTags settings beside the live detection view](/img/ui-screenshots/apriltag-live-detections.png)

## 4. Minimum AprilTag Count

The starter connects Detect AprilTags directly to PnP. Delete that connection, then drag
**Minimum AprilTag Count** on and connect
`Detect AprilTags.detections` → `Minimum AprilTag Count.detections` and
`Minimum AprilTag Count.detections` → `PnP Camera Localization.detections`.

| Setting | Suggested |
|---------|-----------|
| `minimum_detections` | `2` |

This stops the rest of the pipeline for this frame when too few tags are visible. A pose from
a single small tag is the main source of the wild jumps teams complain about. Set it to `1` if
you need single-tag operation and you understand the noise you are accepting.

![Device Input, Detect AprilTags, and Minimum AprilTag Count at a readable zoom](/img/ui-screenshots/pipeline-setup/apriltag-input-detection-closeup.png)

## 5. PnP Camera Localization

Click the existing **PnP Camera Localization** node. The connection from Minimum AprilTag Count replaces its original direct connection from Detect AprilTags.

| Setting | Value |
|---------|-------|
| `camera_bus_id` | The same bus ID |
| `apriltag_map_path` | `{project_root}/src/webui/assets/fields/2026/apriltag_maps/FE-2026-_REBUILTTM_Playing_Field.fmap` |

This node loads the camera's intrinsics at startup. If the camera has no calibration, the
pipeline will not start — go back to [Calibrate Intrinsics](./calibrate-intrinsics).

Its output port is `camera_pose`: where the camera is on the field.

## 6. Camera To Robot Pose

Click the existing **Camera To Robot Pose** node. The starter already connects `PnP Camera Localization.camera_pose` → `Camera To Robot Pose.camera_pose`.

| Setting | Value |
|---------|-------|
| `camera_bus_id` | The same bus ID |

It applies the extrinsics you saved. Output port: `robot_pose`.

## 7. Robot Pose Output

Click the existing **Robot Pose Output** node. The starter already connects `Camera To Robot Pose.robot_pose` → `Robot Pose Output.pose`.

This node sends the pose to the **3D View** tab so you can see it. It has no settings. It
does **not** touch NetworkTables. Its `pose` output passes the value through so you can chain
the publisher onto it.

## 8. Publish To NetworkTables

Drag it on and connect `Robot Pose Output.pose` → `Publish To NetworkTables.data`.

| Setting | Value |
|---------|-------|
| `target_key` | `robot_pose` |
| `schema` | `auto` |
| `data_path` | leave empty |

This is the node that gets data to your robot.

![Localization, robot pose, and NetworkTables output at a readable zoom](/img/ui-screenshots/pipeline-setup/apriltag-pose-output-closeup.png)

## 9. Check and save

1. Double-click empty canvas to fit the graph in view.
2. Confirm every required input port has a connection.
3. Open the **System** tab.

**Expected result:** your pipeline is listed as active, and with the camera looking at tags the
3D View shows a robot pose that moves sensibly when you move the camera.

## Optional additions

| Node | Why |
|------|-----|
| **Pose Outlier Filter Rust** | Insert between Camera To Robot Pose and Robot Pose Output to reject estimates that disagree with recent history |
| **Tag Filter** | Whitelist or blacklist tag IDs, e.g. ignore tags on the other alliance's side |
| **Camera Pose Output** | Sends the camera pose to the 3D view for debugging camera placement |
| **Flatten Pose** | Reduce a 3D pose to x, y, heading before publishing |

## Multiple cameras

Build one pipeline per camera, each with its own bus ID, its own intrinsics, and its own
extrinsics. Publish to different keys (`robot_pose_front`, `robot_pose_back`) and let your
robot code feed both into its pose estimator, or combine them in EagleEye with **Pose Fusion**.

Next: [Add Temporal Acceleration](./temporal-acceleration).

:::note
Verified against EagleEye-Vision-System. The starter pipeline name, ports, and settings above
match the repository configuration and operation definitions.
:::
