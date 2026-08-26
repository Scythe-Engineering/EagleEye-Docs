---
sidebar_position: 9
title: Build an AprilTag Pipeline
---

# Build an AprilTag pipeline

EagleEye includes two localization templates:

| Template | Use it when |
|----------|-------------|
| **Basic localization** | You want the shortest working camera-to-robot pipeline |
| **AprilTag localization** | You want temporal acceleration and its camera-pose feedback loop |

Both publish the robot-library contract at `EagleEye/localization/front/pose` and `EagleEye/localization/front/meta`.

## Before you start

- The camera appears in Views.
- The camera has [intrinsics](./calibrate-intrinsics).
- [Extrinsics](./configure-extrinsics) are saved for that camera.
- [NetworkTables](./networktables) points at the roboRIO.
- The field's AprilTag map is available in EagleEye.

## 1. Create the pipeline

1. Open the **Pipeline** tab.
2. Click **New Pipeline**.
3. Enter a name.
4. Select **Basic localization** or **AprilTag localization**.
5. Create the pipeline.

EagleEye copies the template with fresh node IDs, so creating it more than once does not cross-connect pipelines.

## 2. Select the camera

Open these nodes and select the same camera in each:

- **Device Input**
- **PnP Camera Localization**
- **Camera To Robot Pose**

Set `frame_rotation` on Device Input if the camera is mounted sideways or upside down. Camera selection changes require a backend restart. Use the restart banner above the canvas after saving.

## 3. Select or upload the field map

Open **PnP Camera Localization**, then use the AprilTag map dropdown.

If the map is missing:

1. Click **Manage** beside the map field.
2. Choose **Upload File**.
3. Select the `.fmap` or supported map file.
4. Close the file manager and select the uploaded file from the refreshed dropdown.
5. Restart the backend when prompted.

Do not type a raw `{project_root}` path unless you are developing EagleEye itself. The dropdown stores the managed file path for you. A map from the wrong season can produce a stable-looking but incorrect field pose.

## 4. Check the graph

The Basic localization template follows this path:

```text
Device Input -> Detect AprilTags -> Minimum AprilTag Count -> PnP Camera Localization
                                                               | camera_pose
                                                               v
                                                     Camera To Robot Pose
                                                        |             |
                                                        v             v
                                              Robot Pose Output   pose publisher

PnP Camera Localization.pose_meta -----------------------> metadata publisher
```

The publishers must use:

| Data | `target_key` | `schema` |
|------|--------------|----------|
| Robot pose | `localization/front/pose` | `pose3d` |
| PnP quality metadata | `localization/front/meta` | `auto` |

**Robot Pose Output** only updates the WebUI 3D view. The pose publisher connects directly to **Camera To Robot Pose** so a stationary robot continues publishing fresh measurements.

The AprilTag localization template adds **Temporal Acceleration Preprocessor Rust** before detection and a dashed default feedback connection from PnP camera pose. It keeps the same robot-pose and metadata publishers.

## 5. Start and verify

1. Restart the backend if the banner requests it.
2. Open **System** and confirm the pipeline is active.
3. Point the camera at at least two mapped tags.
4. Open **3D View** and confirm the robot pose moves correctly.
5. Check the `EagleEye` table in AdvantageScope or OutlineViewer.

You should see:

```text
EagleEye/localization/front/pose
EagleEye/localization/front/meta
```

Continue with [Add EagleEye to robot code](./robot-integration).

## Multiple cameras

Create one pipeline per camera. Give each pair of publishers its own source:

```text
localization/front/pose
localization/front/meta
localization/back/pose
localization/back/meta
```

Let the robot pose estimator consume each camera at its own capture timestamp. Do not fuse camera poses in EagleEye before publishing them; fusion averages measurements taken at different times.

## Optional nodes

| Node | Purpose |
|------|---------|
| **Pose Outlier Filter Rust** | Reject estimates that disagree with recent motion |
| **Tag Filter** | Ignore selected tag IDs |
| **Camera Pose Output** | Show camera pose in the 3D view |
| **Flatten Pose** | Convert a 3D pose to x, y, and heading for a custom consumer |

Next: [Add Temporal Acceleration](./temporal-acceleration) or [Add EagleEye to robot code](./robot-integration).
