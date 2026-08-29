---
sidebar_position: 8
title: Configure Extrinsics
---

# Configure Extrinsics

Extrinsics tell EagleEye where the camera sits on the robot. Intrinsics turn a tag into
"the camera is here relative to the tag"; extrinsics turn that into "the robot is here".

Get these wrong and your pose will be consistently offset — often by exactly the distance
from the camera to robot center, which is easy to spot once you know to look for it.

## What you need before you start

- The camera's bus ID (from [Check Your Cameras](./cameras)).
- Measurements from the robot's center to the camera lens, in **meters**.
- Which way the camera points.

Measure to the front of the lens, not the back of the housing, and measure from the point your
robot code treats as the robot origin — usually the center of the drivetrain footprint.

## 1. Open the camera config

1. Open the **Utils** tab.
2. Select the camera in the **Camera** dropdown.

![Utils tab](/img/ui-screenshots/utils-tab.png)

## 2. Fill in the fields

| Field | Meaning | Units |
|-------|---------|-------|
| Pitch | Tilt up/down | degrees |
| Yaw | Rotation left/right | degrees |
| Roll | Rotation about the lens axis | degrees |
| X Offset | Forward/back from robot center | meters |
| Y Offset | Left/right from robot center | meters |
| Z Offset | Height above the floor | meters |

A camera mounted dead center, 0.6 m up, 0.25 m ahead of center, aimed straight forward and
level would be X `0.25`, Y `0`, Z `0.6`, pitch/yaw/roll all `0`.

Angles are only about the mount. If the camera is physically rotated 90° in its bracket so the
image is sideways, that is handled by `frame_rotation` on the Device Input node in the
pipeline, not here.

:::caution Check the signs, do not assume them
Sign conventions for pitch, yaw, and the offsets are easy to get backwards. Enter your best
guess, then confirm with the preview in the next step and with the on-field check in
[Verify and Tune](./verify-and-tune). If the pose is mirrored or offset the wrong way,
flip the sign of the field that matches the axis you are wrong on and re-test.
:::

## 3. Use the preview

The **Camera Position Preview** below the fields shows a robot model with the camera drawn at
the position and angle you entered. The front of the robot is labelled.

**Expected result:** the little camera in the preview is where the real camera is on the real
robot, pointing the same way. If the preview shows the camera behind the robot or aiming at
the floor when it should aim forward, fix the numbers before saving.

## 4. Save

Click **Save Extrinsics**.

**Expected result:** the save is confirmed and the values persist after you switch cameras and
switch back, or reload the page.

Use **Refresh** to reload the stored values if you want to discard unsaved edits.

## 5. Repeat for every camera

Each camera has its own extrinsics. Do all of them now, while you have the tape measure out.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Pose is offset by a fixed amount in one direction | An offset has the wrong sign or is measured from the wrong origin | Re-measure from robot center; try flipping the sign of that axis |
| Pose is mirrored left/right | Yaw sign backwards | Negate yaw and re-test |
| Robot appears to float above or sink below the field | Z offset wrong, or measured to the wrong reference | Measure lens height from the floor |
| Values reset after restart | Save not clicked, or wrong camera selected when saving | Re-enter and click **Save Extrinsics** with the right camera selected |

Next: [Connect NetworkTables](./networktables).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20). The stored
extrinsics fields are exactly pitch, yaw, roll, and the X/Y/Z offsets — there are no field of
view fields.
:::
