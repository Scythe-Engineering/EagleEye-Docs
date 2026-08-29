---
sidebar_position: 5
title: Tested cameras
---

# Tested cameras

No camera model has a documented Pi 5 validation record yet. Do not treat a webcam as supported
because it is USB or because it works on a laptop. This table stays short on purpose. Add a row
only after the exact camera, lens, resolution, frame rate, cable or hub, Pi port, and test result
are recorded.

| Camera model | Sensor shutter | Pi 5 test status | Evidence |
|---|---|---|---|
| No documented model yet | Not recorded | Awaiting hardware validation | [record test or benchmark configuration] |

## Buy global shutter for AprilTags

For a robot-mounted AprilTag camera, buy a global-shutter sensor when practical. A
rolling-shutter sensor exposes rows at different times. During fast rotation or vibration, that
can skew tag corners between the top and bottom of one frame. PnP uses those corners to calculate
pose, so a frame that looks sharp enough to a driver can still produce a poorer estimate.

A global-shutter sensor exposes the full frame at once. It removes that row-timing distortion,
but it does not fix motion blur. Use a short manual exposure, enough light, and a lens that is in
focus at your expected tag distances. Manual exposure control and fixed focus make repeatable
field testing easier.

## Before standardizing a camera

Test the exact camera on the Pi 5 in the same USB layout planned for the robot. Confirm that
EagleEye detects it after a reboot, that it delivers the intended resolution and frame rate, and
that AprilTag pose remains usable while the robot drives and rotates at match speed. Record the
configuration on [Benchmarks](./benchmarks) before adding it to this table.
