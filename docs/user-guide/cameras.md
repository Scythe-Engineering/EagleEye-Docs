---
sidebar_position: 6
title: Check your cameras
---

# Check your cameras

Use a UVC USB camera and test the exact camera and USB arrangement planned for the robot. A
global-shutter sensor is the better choice for AprilTags because fast rotation cannot skew its
image rows the way a rolling-shutter sensor can.

EagleEye detects USB cameras when the backend starts. After plugging in, unplugging, or moving a
camera, open **Settings**, scroll to the buttons at the bottom of Backend Settings, and click
**Restart Backend**. Wait for the page to reconnect before opening **Views** again.

![Restart Backend button in Settings](/img/ui-screenshots/restart-backend-button.png)

Use `sudo systemctl restart eagleeye` over SSH only when the web UI is unavailable.

## Check the live feed

Open **Views**. Each detected camera gets a live thumbnail card. The feed is raw camera video,
not pipeline output. Use it to identify the camera, aim it, focus it, and check exposure.

![Views tab](/img/ui-screenshots/views-tab.png)

Then open **Utils** and select each camera in the **Camera** dropdown. Label the camera cable
and its Pi USB port. EagleEye associates saved settings with the physical USB path, so moving a
camera to another port can separate it from its calibration and pipeline settings.

## Before continuing

- The image is sharp at the tag distances you need.
- Exposure does not smear tag edges under field lighting.
- Each camera stays in its labelled port.
- The camera's calibration and pose remain usable while the robot drives and rotates.

## Troubleshooting

| Symptom | Fix |
|---|---|
| No camera cards | In **Settings**, click **Restart Backend** after plugging in the camera. Wait for the UI to reconnect, then try another cable or port. |
| Card is black | Try another port. Some cameras need a powered hub. |
| Settings no longer match | Return the camera to its labelled port, or configure it again. |
| Two identical cameras are confused | Cover one lens and watch which Views card goes dark. |

Next, [calibrate intrinsics](./calibrate-intrinsics).
