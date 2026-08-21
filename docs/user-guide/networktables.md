---
sidebar_position: 8
title: Connect NetworkTables
---

# Connect NetworkTables

EagleEye joins NetworkTables as a **client** named `EagleEye` and publishes under the
**`EagleEye` table**. The roboRIO (or a simulation host) is the server.

:::danger Read this before you build a pipeline
The **Robot Pose Output** node does *not* send anything to NetworkTables. It pushes the pose to
the web UI's 3D view over the UI's own event stream. The only node that writes to
NetworkTables is **Publish To NetworkTables**. A pipeline that ends at Robot Pose Output will
look perfect in the UI and send nothing to your robot.
:::

## 1. Point EagleEye at the roboRIO

1. Open the **Settings** tab.
2. Under **Network Table**, set the robot address.
3. Click **Save Settings**.
4. Click **Restart Backend**.

![Settings tab](/img/ui-screenshots/settings-tab.png)

A fresh install starts with `localhost`; replace it before using a real robot.
For a real robot use one of:

| Address | When to use |
|---------|-------------|
| `10.TE.AM.2` | Normal. Team 3322 → `10.33.22.2` |
| `roborio-TEAM-frc.local` | If mDNS works reliably on your network |
| `172.22.11.2` | roboRIO over USB |
| `127.0.0.1` | Simulation server on the same machine |

## 2. Check the connection status

Still in Settings, look at the **Network Table** status indicator next to the address field.

**Expected result:** it reports a connected state. Before the first successful connection it
reads `Unknown`.

If it does not connect:

```bash
ping 10.33.22.2
```

from the Pi, with your team's address. No reply means it is a network problem, not an EagleEye
problem — check the radio, the Ethernet run, and that the roboRIO is powered and its code is
running (NetworkTables server only runs when robot code is running).

## 3. Publish something

Add a **Publish To NetworkTables** node to your pipeline and feed it the data you want on the
robot. Its settings:

| Setting | Meaning |
|---------|---------|
| `target_key` | The key inside the `EagleEye` table, e.g. `robot_pose` |
| `schema` | `auto` lets EagleEye pick a WPILib type that matches the data |
| `data_path` | Optional path into a structured value; leave empty to publish the whole value |

The shipped `test` pipeline uses `robot_pose` for the robot transform and `camera_pose` for the camera transform. The `2026_apriltag_starter` does not publish until you add this node.

For a 4 by 4 pose matrix:

| Schema | Published value |
|--------|-----------------|
| `auto` or `pose3d` | WPILib `Pose3d` struct |
| `pose2d` | WPILib `Pose2d` projected onto the field plane |

Unsupported values are passed to the next pipeline node but are not published. Full wiring is covered in [Build an AprilTag Pipeline](./pipeline-setup).

## 4. Verify the data is arriving

Use a NetworkTables viewer such as the one built into your dashboard, or AdvantageScope,
connected to the same roboRIO.

**Expected result:** an `EagleEye` table appears with your `target_key` under it, and the
value changes when the camera sees tags and freezes when it does not.

:::note
This guide's authors did not test a roboRIO consuming the published values end to end. Confirm
on your own robot before relying on it in a match.
:::

## Reading values from the robot

The **Get NetworkTables Value** node reads a key from NetworkTables and injects it into the
pipeline — useful for feeding gyro heading or robot state into a pipeline. Configure it with
the NetworkTables key to read.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Status never connects | Wrong address, or robot code not running | `ping` the roboRIO; start robot code |
| Table appears, key missing | No Publish To NetworkTables node, or pipeline not running | Add the node; check the pipeline is active in the System tab |
| Key exists but never changes | Upstream is producing nothing — usually no tags detected or missing intrinsics | See [Verify and Tune](./verify-and-tune) |
| Works tethered, fails on the field | Address hard-coded to a USB or `.local` address | Use `10.TE.AM.2` |

Next: [Build an AprilTag Pipeline](./pipeline-setup).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20). The backend
connects as NetworkTables 4 client `EagleEye` to the address saved in settings.
:::
