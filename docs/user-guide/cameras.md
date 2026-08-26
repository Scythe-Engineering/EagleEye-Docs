---
sidebar_position: 5
title: Check Your Cameras
---

# Check Your Cameras

EagleEye finds USB cameras automatically at startup. There is no "add camera" button — you
plug the camera in, restart the backend, and it appears. Confirm that every camera is
detected and label its cable and USB port before continuing.

## How cameras are identified

The Web UI normally identifies each camera by its displayed name. Internally, EagleEye ties
its settings to the camera's physical USB path so they remain stable across reboots. Keep
each camera in the same USB port after calibration and pipeline setup.

Moving a camera to another port changes that internal path, so its saved settings may no
longer match.

## 1. Plug in the cameras, then restart the backend

Cameras are detected during startup. After plugging in or unplugging anything:

```bash
sudo systemctl restart eagleeye
```

or open the **Settings** tab from the navigation on the right, then click **Restart
Backend** at the bottom of the **Backend Settings** panel.

![Restart Backend and Reboot Computer controls in the Settings tab](/img/ui-screenshots/settings-restart-controls.png)

## 2. Check the Views tab

Open the **Views** tab. Every detected camera gets a live thumbnail card.

![Views tab](/img/ui-screenshots/views-tab.png)

**Expected result:** one card per connected camera, each showing live video and labelled with
the camera name. If you see the "no cameras" message, nothing was detected.

Views shows the raw camera stream, not pipeline output. It is meant for aiming the cameras
and for driver assistance.

## 3. Match each camera to its physical port

Open the **Utils** tab and use the **Camera** dropdown at the top. It lists every camera
EagleEye knows about. Select each camera and confirm which physical camera it represents,
then label that camera's cable and Pi USB port.

![Utils tab camera selector](/img/ui-screenshots/utils-tab.png)

You should not need to inspect Linux device paths or look up bus IDs manually during normal
setup. When an operation asks for a camera, use the camera identifier shown by the Web UI.

## Camera selection

Use a UVC-compatible USB camera that Linux exposes through V4L2 and that can deliver MJPEG at your target resolution and frame rate. EagleEye does not yet publish a hardware-verified model list, so test the exact camera, cable, hub, and Pi port before standardizing your robot.

For AprilTags, prefer a **global-shutter** sensor. A rolling-shutter camera exposes image rows at different times, so fast robot rotation bends tag corners and degrades PnP even when the frame looks sharp. A global shutter captures the full frame at one instant. Manual exposure control and a fixed-focus lens are also useful under changing field light.

A common webcam can still work for development and low-speed testing. Treat it as unverified until you measure detection range and pose stability while driving and rotating at match speed.

## 4. Aim and focus

With the live view open, point each camera where it needs to look and check:

- The tags or targets you care about are in frame at the distances you care about.
- The image is in focus. Many cheap USB cameras have a manual focus ring.
- Exposure is not blowing out the tags under field lighting. A dark image with crisp tag
  edges beats a bright, smeared one.

**Expected result:** a sharp, correctly exposed image with your targets visible.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| No cards in Views | Camera not detected at startup | Restart the backend after plugging it in; try another port or cable |
| Card present, black image | Camera opened but delivering no frames | Try a different USB port; some cameras need a powered hub |
| Camera name is blank | Camera discovery failed during startup | Restart the backend and check the System Logs |
| Camera settings no longer match | Camera moved to another USB port | Put it back in its labelled port, or update that camera's settings |
| Two identical cameras confused | Same model, different ports | Cover one lens and watch which Views card goes dark |

Next: [Calibrate intrinsics](./calibrate-intrinsics).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20).
:::
