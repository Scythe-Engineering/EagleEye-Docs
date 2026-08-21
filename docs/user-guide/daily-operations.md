---
sidebar_position: 12
title: Daily Operations
---

# Daily Operations

What to do at practice and at an event, once EagleEye is set up.

## Before you leave the shop

- Confirm the NetworkTables address in Settings is the field address (`10.TE.AM.2`), not a USB
  or `localhost` address left over from testing.
- Reboot the Pi and confirm everything comes back on its own. See
  [Verify and Tune → Check 6](./verify-and-tune#check-6-survives-a-reboot).
- Download the logs from Settings and keep a copy of a known-good run for comparison.
- Take a screenshot of each camera's extrinsics and note each bus ID. If a Pi needs
  re-flashing at an event, this saves you.
- Pack a printed ChArUco board. Cameras get knocked and need recalibrating.

## Event-day startup

1. Power the robot, wait for the Pi to boot.
2. Open `http://<pi-address>:5001`.
3. **Views** — every camera shows live video, images look sharp and correctly exposed.
4. **System** — every pipeline you need is active.
5. **Settings** — the NetworkTables status shows connected.
6. **3D View** — with tags in sight, the robot pose is where the robot actually is.

If any step fails, work through [Troubleshooting](./troubleshooting) rather than changing
settings at random.

## Between matches

Fast check, in this order:

1. Views: all cameras still streaming? A knock can unseat a USB plug.
2. System: pipelines still active?
3. Settings: NetworkTables still connected?

If the robot took a hard hit, look at a camera's aim in Views. A camera that moved in its
mount invalidates its extrinsics and will quietly report a wrong pose.

## After a collision or a camera change

| What happened | What to redo |
|---------------|--------------|
| Camera bumped in its mount | Re-aim, re-measure and re-save [extrinsics](./configure-extrinsics) |
| Camera replaced with a spare | [Intrinsics](./calibrate-intrinsics) *and* extrinsics, plus bus ID everywhere if the port changed |
| Camera moved to a different USB port | Update `camera_bus_id` in every node and re-check Utils |
| Lens focus ring moved | Refocus, then recalibrate intrinsics |

## Changing settings safely

- Pipeline edits save as you make them. Some backend settings need a restart — use **Restart
  Backend** in Settings, or `sudo systemctl restart eagleeye`.
- Do not edit pipelines while the robot is on the field.
- Make one change at a time and re-check pose accuracy after each. Two changes at once and you
  will not know which one helped.

## Collecting information when something is wrong

Before you start changing things:

1. Settings → **Download Logs**.
2. Screenshot the System tab and the Pipeline tab profiling panels.
3. Note what you last changed.

## Useful commands on the Pi

| Task | Command |
|------|---------|
| Is it running? | `systemctl status eagleeye` |
| Watch the log live | `journalctl -u eagleeye -f` |
| Restart | `sudo systemctl restart eagleeye` |
| Reboot | `sudo reboot` |
| List cameras | `v4l2-ctl --list-devices` |
| Can we reach the roboRIO? | `ping 10.33.22.2` (your team's address) |
| Disk space | `df -h` |

The Settings tab also has a **Reboot Computer** button and a terminal panel if you would rather
not open a separate SSH session.

## Shutting down

Power-cycling the robot cuts power to the Pi without a clean shutdown. This is normal practice
and usually fine, but repeated hard power loss can corrupt an SD card. If a Pi starts behaving
strangely for no reason, suspect the card first.

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20).
:::
