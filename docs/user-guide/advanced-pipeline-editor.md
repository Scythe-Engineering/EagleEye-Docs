---
sidebar_position: 14
title: "Advanced: manual pipeline setup"
---

# Advanced: manual pipeline setup

Use this page only when the setup wizard is unavailable or when you need a custom graph. The
current source tree ships an intentionally incomplete `2026_apriltag_starter` pipeline. It does
not generate a ready-to-run camera pipeline for you.

Before editing it, make sure the camera appears in [Views](./cameras), has
[intrinsics](./calibrate-intrinsics) and [extrinsics](./configure-extrinsics), and EagleEye can
reach the roboRIO through [NetworkTables](./networktables).

## Complete the starter pipeline

1. Open **Pipeline** and select `2026_apriltag_starter`.
2. In **Device Input**, set the camera bus ID for the connected camera. Set `frame_rotation` if
the image is physically sideways or upside down.
3. In **PnP Camera Localization**, select the current field's AprilTag map.
4. In **Camera To Robot Pose**, select the same camera so EagleEye can use its saved
extrinsics.
5. Add and wire **Publish To NetworkTables** nodes for the robot pose and matching PnP metadata.
Use unique keys per camera, such as `localization/front/pose` and
`localization/front/meta`.
6. Restart the backend when the editor requests it, then verify the 3D View and NetworkTables.

The starter's existing path is:

```text
Device Input -> Detect AprilTags -> PnP Camera Localization
                                     -> Camera To Robot Pose -> Robot Pose Output
```

**Robot Pose Output** updates the 3D View. It does not publish to NetworkTables. Keep the pose
publisher on a direct path from **Camera To Robot Pose** and the metadata publisher on the PnP
result. The robot library joins pose and metadata by capture timestamp.

## Edit the node graph

The [user interface reference](./user-interface#pipeline-editor-advanced) lists graph controls,
restart behavior, and the available operations. The [NetworkTables guide](./networktables)
explains the pose and metadata contract.

Use a separate pipeline and source name for every camera. Do not fuse camera poses in EagleEye
before publishing them. The robot pose estimator can fuse measurements at their own capture
timestamps.

## Optional tuning

[Temporal acceleration](./temporal-acceleration) can reduce AprilTag work after the basic
pipeline is correct. Add it only after you have verified pose accuracy and measured the pipeline
profile. Custom object-detection and MX3 graphs also belong here. Their wizard support still
needs current-release documentation.
