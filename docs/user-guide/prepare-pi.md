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

:::tip No easy access to Wi-Fi?
Connect the Pi by Ethernet to the robot radio or network, then connect your laptop to that
same network and SSH to the Pi's assigned address. From there, follow
[Connect to Wi-Fi from a Robot Network](./connect-wifi) to join an internet-connected Wi-Fi
network or phone hotspot before updating the system and installing EagleEye.
:::

## 3. Update the system

```bash
sudo apt update && sudo apt full-upgrade -y
sudo reboot
```

Wait for the reboot, then SSH back in.

**Expected result:** `sudo apt update` reports no pending upgrades on a second run.

## 4. Keep camera connections consistent

The EagleEye installer installs the Linux camera-discovery tools automatically. You normally
identify cameras by name in the Web UI rather than looking up bus IDs yourself.

EagleEye still tracks a camera by its physical USB path. Label each camera cable and keep it
in the same Pi USB port after setup so its saved calibration and pipeline settings continue
to match.

Next: [Install EagleEye](./install).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20).
:::
