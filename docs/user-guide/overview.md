---
sidebar_position: 1
title: Start Here
---

# Start Here

EagleEye runs on a coprocessor (usually a Raspberry Pi) next to your robot. It reads camera
frames, runs them through a pipeline you build in a web UI, and publishes results to
NetworkTables so robot code can use them.

This guide is written for the person setting up the coprocessor. You need to be able to use a
terminal and SSH. You do not need to read the EagleEye source code.

## How the UI is laid out

The main panel fills the left side of the browser. A six-tab navigation bar stays on the
right:

![EagleEye UI with the main panel on the left and navigation on the right](/img/ui-screenshots/views-tab.png)

| Tab | Use it for |
|-----|------------|
| **Views** | Aim and focus each camera from its live feed |
| **3D View** | Check the robot pose against the field model |
| **Pipeline** | Add operations, connect ports, and edit node settings |
| **System** | Watch pipeline state, CPU, memory, temperature, and storage |
| **Settings** | Configure Wi-Fi and NetworkTables, read logs, and restart the backend |
| **Utils** | Calibrate a camera and save its position on the robot |

Most setup work moves between **Views**, **Pipeline**, **Settings**, and **Utils**. The
[UI reference](./user-interface) explains every tab.

## What you will end up with

- A Raspberry Pi running EagleEye as a service, reachable at `http://<pi-address>:5001`.
- One or more USB cameras, each calibrated and positioned on the robot.
- A pipeline that detects AprilTags, estimates the robot pose, and publishes it to
  NetworkTables under the `EagleEye` table.

## Do these in order

1. [Prepare the Raspberry Pi](./prepare-pi) — flash Raspberry Pi OS Lite, enable SSH, update.
2. [Install EagleEye](./install) — one command, then a service that starts on boot.
3. [Open the UI](./open-the-ui) — port 5001, first-run checks.
4. [Check your cameras](./cameras) — confirm each camera is detected and label its USB port.
5. [Calibrate intrinsics](./calibrate-intrinsics) — built-in ChArUco calibration in the Utils tab.
6. [Configure extrinsics](./configure-extrinsics) — where the camera sits on the robot.
7. [Connect NetworkTables](./networktables) — point EagleEye at the roboRIO.
8. [Build an AprilTag pipeline](./pipeline-setup) — the minimum working graph.
9. [Add temporal acceleration](./temporal-acceleration) — the feedback edge that makes it fast.
10. [Verify and tune](./verify-and-tune) — check the numbers before you trust them.

After setup, use the [UI reference](./user-interface) for individual controls and
[Troubleshooting](./troubleshooting) for symptoms, causes, and fixes.

## Two things people get wrong

**Robot Pose Output does not publish to NetworkTables.** It sends the pose to the web UI's 3D
view. To get data to the robot you must add a **Publish To NetworkTables** node. See
[Connect NetworkTables](./networktables).

**Intrinsics are required before pose estimation.** The PnP and temporal acceleration nodes
fail to start if the selected camera has no intrinsics file.

:::note Verification status
This guide was written against EagleEye-Vision-System `main` at commit `c73a871`
(2026-08-20). Robot-side end-to-end output (a roboRIO actually consuming the published pose)
was not tested while writing this guide.
:::
