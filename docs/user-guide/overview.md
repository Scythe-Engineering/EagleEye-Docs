---
sidebar_position: 1
title: Start Here
---

# Start here

EagleEye runs on a coprocessor, usually a Raspberry Pi, next to your robot. It reads camera frames, runs a pipeline configured in the browser, and publishes timestamped robot poses to NetworkTables.

## What you will set up

- EagleEye running as a service at `http://eagleeye.local:5001` or the device's IP address.
- One or more calibrated USB cameras with saved robot-relative positions.
- A bundled localization pipeline configured for your camera and field.
- `EagleEyeCamera` feeding accepted vision observations into your WPILib pose estimator.

## Setup order

1. [Prepare the Raspberry Pi](./prepare-pi).
2. [Install EagleEye](./install).
3. [Open the UI](./open-the-ui).
4. [Check your cameras](./cameras).
5. [Calibrate intrinsics](./calibrate-intrinsics).
6. [Configure extrinsics](./configure-extrinsics).
7. [Connect NetworkTables](./networktables).
8. [Create a localization pipeline](./pipeline-setup).
9. [Add EagleEye to robot code](./robot-integration).
10. [Add temporal acceleration](./temporal-acceleration) if the basic pipeline needs more throughput.
11. [Verify and tune](./verify-and-tune).

## WebUI tabs

| Tab | Use |
|-----|-----|
| **Views** | Aim and focus camera feeds |
| **3D View** | Compare the reported robot pose with the field |
| **Pipeline** | Create a template pipeline, connect operations, and configure files |
| **System** | Check pipeline state and device load |
| **Settings** | Configure Wi-Fi, NetworkTables, managed assets, updates, logs, and terminal access |
| **Utils** | Calibrate cameras and save their robot-relative transforms |

## Important distinctions

**Robot Pose Output only updates the 3D view.** A separate **Publish To NetworkTables** node sends data to the robot. Bundled localization templates wire both paths correctly.

**The robot library needs pose and metadata.** The default front-camera keys are `localization/front/pose` and `localization/front/meta` below the `EagleEye` table.

**Intrinsics and extrinsics are separate.** Intrinsics describe the lens. Extrinsics describe where the camera sits on the robot. PnP and Camera To Robot Pose need both.

**Managed file controls replace raw paths.** When a map or model is absent from a dropdown, use the adjacent **Manage** button to upload it.

The [UI reference](./user-interface) covers individual controls. [Troubleshooting](./troubleshooting) starts from symptoms.
