---
sidebar_position: 6
title: Check your cameras
---

# Check your cameras

Read [tested cameras](./tested-cameras) before buying hardware. EagleEye has no documented
model validation record yet, so test the exact camera and USB arrangement planned for the robot.

EagleEye detects USB cameras at startup. Plug in every camera, then restart the backend:

```bash
sudo systemctl restart eagleeye
```

You can also select **Settings → Restart Backend**.

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
| No camera cards | Restart the backend after plugging in the camera. Try another cable or port. |
| Card is black | Try another port. Some cameras need a powered hub. |
| Settings no longer match | Return the camera to its labelled port, or configure it again. |
| Two identical cameras are confused | Cover one lens and watch which Views card goes dark. |

Next, [calibrate intrinsics](./calibrate-intrinsics).
