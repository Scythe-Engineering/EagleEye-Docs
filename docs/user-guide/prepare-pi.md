---
sidebar_position: 2
title: Prepare the Raspberry Pi
---

# Prepare the Raspberry Pi

EagleEye targets **Raspberry Pi OS Lite (64-bit), Debian 12 "bookworm"**. There is no
pre-built EagleEye disk image yet, so you flash a stock OS and run the installer.

Use the Lite image. Do not install a desktop environment — everything here is done over SSH,
and the desktop wastes CPU that the vision pipeline needs.

## 1. Flash the card

1. Install [Raspberry Pi Imager](https://www.raspberrypi.com/software/) on your laptop.
2. Choose device: your Pi model.
3. Choose OS: **Raspberry Pi OS (other) → Raspberry Pi OS Lite (64-bit)**. Confirm the
   description says Debian 12 (bookworm).
4. Choose storage: your microSD card or USB SSD.
5. Click **Next**, then **Edit Settings** before writing. Set:
   - Hostname — for example `eagleeye`.
   - Username and password. Write these down; there is no default password.
   - Wireless LAN, if the Pi will not be on Ethernet. Set the country code.
   - Locale/timezone.
   - Under **Services**, tick **Enable SSH** and choose password authentication (or paste a
     public key).
6. Write the image and wait for verification to finish.

**Expected result:** Imager reports "Write Successful".

## 2. First boot and SSH in

Put the card in the Pi, connect Ethernet if you are using it, and power it on. Give it about
60 seconds on the first boot.

From your laptop:

```bash
ssh <username>@<hostname>.local
```

For example `ssh pi@eagleeye.local`. If `.local` names do not resolve on your network, find
the Pi's IP address in your router's client list or on the radio's status page and use that
instead.

**Expected result:** you get a shell prompt on the Pi.

## 3. Update the system

```bash
sudo apt update && sudo apt full-upgrade -y
sudo reboot
```

Wait for the reboot, then SSH back in.

**Expected result:** `sudo apt update` reports no pending upgrades on a second run.

## 4. Install camera name support

EagleEye reads USB camera names and port numbers with `v4l2-ctl`. Without it, cameras may
show up with blank names and the bus IDs you rely on later can be harder to identify.

```bash
sudo apt install -y v4l-utils
```

Check it works with a camera plugged in:

```bash
v4l2-ctl --list-devices
```

**Expected result:** each camera is listed with a name line such as
`HD USB Camera: usb-0000:01:00.0-1.3:` followed by one or more `/dev/videoN` paths. The
trailing part of that USB token is what EagleEye turns into the camera's **bus ID**.

## 5. Decide where the cameras plug in

EagleEye derives each camera's bus ID from the physical USB port, so the same port gives the
same bus ID across reboots — but only if you keep the cameras in the same ports. Label the
ports now and keep the wiring fixed.

Next: [Install EagleEye](./install).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20).
:::
