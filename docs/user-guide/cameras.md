---
sidebar_position: 5
title: Check Your Cameras
---

# Check Your Cameras

EagleEye finds USB cameras automatically at startup. There is no "add camera" button — you
plug the camera in, restart the backend, and it appears. What you do on this page is confirm
each camera is detected and write down its **bus ID**, which you will type into every node
and settings panel that follows.

## How cameras are identified

Each camera gets a bus ID derived from the USB port it is plugged into, read from
`v4l2-ctl`. Because it comes from the physical port and not from enumeration order, the same
port gives the same bus ID after a reboot — as long as you do not move the cable.

If you move a camera to a different port, its bus ID changes and every node configured with
the old ID stops working.

## 1. Plug in the cameras, then restart the backend

Cameras are detected during startup. After plugging in or unplugging anything:

```bash
sudo systemctl restart eagleeye
```

or use **Restart Backend** in the Settings tab.

## 2. Check the Views tab

Open the **Views** tab. Every detected camera gets a live thumbnail card.

![Views tab](/img/ui-screenshots/views-tab.png)

**Expected result:** one card per connected camera, each showing live video and labelled with
the camera name. If you see the "no cameras" message, nothing was detected.

Views shows the raw camera stream, not pipeline output. It is meant for aiming the cameras
and for driver assistance.

## 3. Read the bus IDs

Open the **Utils** tab and open the **Camera** dropdown at the top. It lists every camera
EagleEye knows about, and the small line under the dropdown shows the selected camera's
details.

![Utils tab camera selector](/img/ui-screenshots/utils-tab.png)

Write down the bus ID for each camera along with which port it is in and where it is mounted
on the robot. For example:

| Camera | USB port | Bus ID | Mounted |
|--------|----------|--------|---------|
| Front AprilTag cam | top-left | `1.3` | front, facing forward |
| Rear AprilTag cam | top-right | `1.4` | back, facing backward |

You can cross-check on the Pi:

```bash
v4l2-ctl --list-devices
```

The bus ID comes from the trailing part of the USB token in the device name line, for example
`... usb-0000:01:00.0-1.3:` gives `1.3`.

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
| No cards in Views | Camera not detected at startup | Restart the backend after plugging in; check `v4l2-ctl --list-devices` |
| Card present, black image | Camera opened but delivering no frames | Try a different USB port; some cameras need a powered hub |
| Camera name is blank | `v4l-utils` not installed | `sudo apt install -y v4l-utils`, then restart the backend |
| Bus ID changed after a reboot | Camera moved to another port | Put it back, or update the bus ID in every node and in Utils |
| Two identical cameras confused | Same model, different ports | Cover one lens and watch which Views card goes dark |

Next: [Calibrate intrinsics](./calibrate-intrinsics).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20).
:::
