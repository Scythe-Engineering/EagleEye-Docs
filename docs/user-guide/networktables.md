---
sidebar_position: 9
title: Connect NetworkTables
---

# Connect NetworkTables

EagleEye joins NetworkTables as a client named `EagleEye`. The roboRIO, or a simulation host, is
the server. Generated pipelines publish below the `EagleEye` table.

## In the setup wizard

The wizard opens **Settings** for this step and keeps a **Connect to the robot** guide on screen.

1. Under **Network Table**, enter the roboRIO or simulation address in
**Roborio (or sim) IP Address**.
2. Click **Save Settings**.
3. Click **Continue** in the guide. EagleEye generates the selected camera pipelines and
restarts the backend once.
4. Wait for the UI to reconnect. The wizard opens **3D View** and checks the NetworkTables
connection, generated pipelines, and published keys.

| Address | Use |
|---|---|
| `10.TE.AM.2` | Normal robot network. Replace `TE.AM` with the digits of your FRC team number. Team 3322 uses `10.33.22.2`. |
| `roborio-TEAM-frc.local` | Robot network when mDNS is reliable |
| `172.22.11.2` | roboRIO over USB |
| `127.0.0.1` | Simulation server on the same computer |

The address comes from the **team number**, not the team name. If the verification panel says
NetworkTables is disconnected, check the address, network path, and robot code, then click
**Check again**. Do not click **Finish** until the required checks pass.

## Generated pipeline topics

The wizard derives a unique source from each camera name. A camera with source `front-camera`
publishes the following keys:

| Purpose | Full topic | Type |
|---|---|---|
| **Localize** | `EagleEye/localization/front-camera` | `Pose3d` |
| **Detect** | `EagleEye/detections/front-camera` | JSON |
| **Both** | Both topics above | `Pose3d` and JSON |

The actual source is shown by **Verify live output**. Use that exact topic in robot code and
dashboards. The wizard changes the source when camera names collide, so do not assume a fixed
`front` or `back` name.

For a **Both** pipeline without a selected model, the detection topic is allowed to remain absent
during verification. Localization still must publish. A **Detect**-only pipeline requires a
CPU-compatible model, so its detection key is required.

## Manual pipelines

For a custom pipeline, **Publish To NetworkTables** uses a `target_key` relative to the `EagleEye`
table. Enter `localization/front-camera`, not `EagleEye/localization/front-camera`.

**Robot Pose Output** only updates 3D View. It does not write to NetworkTables. Keep a pose
publisher on the output you want the robot to consume.

The older pose-plus-metadata contract uses two timestamp-matched values, for example:

| Full topic | Type | Contents |
|---|---|---|
| `EagleEye/localization/front/pose` | `Pose3d` struct | Robot pose in field coordinates |
| `EagleEye/localization/front/meta` | `double[3]` | Tag count, mean tag distance in metres, and reprojection error in pixels |

That contract is for a manually configured robot consumer. It is not the topic shape generated
by the first-boot wizard.

## Troubleshooting

| Symptom | Check |
|---|---|
| Status never connects | Robot address, network path, and whether robot code is running |
| Generated pipeline is inactive | Open System Logs, then recheck camera calibration, camera connection, and the field map |
| Required key is missing | Keep the camera on a mapped 2026 AprilTag and click **Check again** |
| Works over USB but not radio | Replace `172.22.11.2` with the normal team address |

Next: [verify live output in the setup wizard](./pipeline-setup#6-verify-live-output), or [add
EagleEye to robot code](./robot-integration) for a manual pipeline.
