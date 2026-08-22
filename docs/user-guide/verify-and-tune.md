---
sidebar_position: 11
title: Verify and Tune
---

# Verify and Tune

Before anyone drives with this, prove the pose is right and the frame rate is good enough.
Do these checks in order — an accuracy problem looks like a tuning problem if you skip ahead.

## Check 1: the pipeline is actually running

Open the **System** tab.

**Expected result:** your pipeline is listed as active. CPU and RAM readouts move.

If it is not active, open **Settings → System Logs** and read from the top for a traceback.
Common causes are a missing intrinsics file and a bus ID that does not match any camera.

## Check 2: tags are being detected

Point the camera at a known tag from about 1–2 m.

**Expected result:** the 3D View shows a robot pose that appears and moves.

If nothing appears, temporarily lower `minimum_detections` on the Minimum AprilTag Count node
to `1` and re-check. If it works at 1, the camera simply is not seeing two tags — that is a
placement or field-position issue, not a bug. Put the value back afterwards.

## Check 3: the pose is right

This is the check people skip and regret.

1. Put the robot at a measured spot on the field — a known distance from a wall or a tag,
   squared up.
2. Read the pose in the 3D View, or read the published value in your dashboard.
3. Compare against your tape measure.

**Expected result:** position within a few centimetres at short range, and heading within a
couple of degrees. The number degrades with distance; that is normal.

Then move the robot forward one meter and read again.

**Expected result:** the reported position moves one meter in the direction you actually
moved.

Interpreting what you see:

| What you see | Almost always |
|--------------|---------------|
| Off by a constant offset in one axis | An extrinsics offset is wrong or has the wrong sign |
| Moves the wrong direction, or mirrored | Yaw sign, or X/Y swapped in extrinsics |
| Off by a consistent percentage — one meter reads as 1.15 m | Printed ChArUco square size did not match what you typed during calibration |
| Correct near, badly wrong far away | Weak intrinsics — recalibrate with more tilt and corner coverage |
| Correct sometimes, wildly wrong occasionally | Single-tag estimates; raise `minimum_detections` or add Pose Outlier Filter Rust |
| Pose in the wrong place on the field entirely | Wrong AprilTag map for the field you are on |

Fix accuracy before you tune speed.

## Check 4: frame rate

The **Pipeline** tab shows profiling panels over the canvas: an execution timestep list and a
summary panel. The `i` button opens **Profiling details** with per-operation timings, and a
**Cumulative avg** checkbox that averages samples over time instead of showing the latest
frame.

**Expected result:** numbers populate within a few seconds of the pipeline running. "No
profiling data" means the pipeline is not producing frames.

Read down the list for the slowest operation and fix that one. Guessing at settings on fast
operations wastes an afternoon.

### If Detect AprilTags dominates

1. Add [temporal acceleration](./temporal-acceleration) if you have not. Biggest single win.
2. Raise `quad_decimate` from `2.0` to `3.0`. Faster; distant tags drop out sooner.
3. Lower `max_regions` on the temporal acceleration node.
4. Raise `nthreads` to `2`, but re-measure — on a Pi this can make the whole pipeline slower.

### If Device Input dominates

The camera itself is the limit. Try a lower resolution or a different camera; some USB cameras
cap at 30 fps regardless.

### General load

- Run only the pipelines you need. Extra pipelines share the same CPU.
- Lower **view stream downscale** in Settings so streaming previews to your laptop costs less.
  This affects the UI preview only, not what the pipeline processes.
- Close the 3D View tab when you are not looking at it.

## Check 5: behavior when tags disappear

Cover the camera.

**Expected result:** the published value stops updating. It should not jump to zero or to a random field position.

After uncovering the camera, confirm that detection resumes. If temporal acceleration keeps searching stale predicted regions, temporarily bypass it to reacquire tags across the full frame. See [Temporal Acceleration troubleshooting](./temporal-acceleration#troubleshooting).

## Check 6: survives a reboot

```bash
sudo reboot
```

Wait, then reload the UI.

**Expected result:** the service is running, the pipeline is active, the camera has the same
bus ID, and pose comes back with no manual steps.

If the bus ID changed, a camera moved ports. See [Check Your Cameras](./cameras).

For individual controls, keep the [User Interface Reference](./user-interface) nearby. If a
check fails, go to [Troubleshooting](./troubleshooting).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20). Accuracy
figures above are targets to check against, not measured guarantees.
:::
