---
sidebar_position: 2
title: Flash the EagleEye image
---

# Flash the EagleEye image

Use the prebuilt EagleEye image on a Raspberry Pi 5. It already has EagleEye and its system
service installed. After boot, open [http://eagleeye.local:5001](http://eagleeye.local:5001).

## Flash the image

1. Download the `.rpi-imager-manifest` asset from a tagged
[EagleEye release](https://github.com/Scythe-Engineering/EagleEye-Vision-System/releases).
2. Open the manifest in the current [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
3. Select EagleEye Vision System, choose the target storage, and use OS customization to set
Wi-Fi or a phone hotspot when needed.
4. Write the image, insert the storage in the Pi, connect the Pi to the network, and boot it.
5. From a computer on the same network, open `http://eagleeye.local:5001`.

If `.local` does not resolve, find the Pi's address from your router or network tool and open
`http://<pi-address>:5001` instead.

:::danger Change the image password
The image enables SSH with username `eagleeye` and password `eagleeye`. Change it before using
the Pi on an untrusted network:

```bash
ssh eagleeye@eagleeye.local
passwd
```
:::

## If no current image is available

Do not flash an old image just because it exists. Flash Raspberry Pi OS Lite 64-bit based on
Debian 12, enable SSH, update the OS, then use the [advanced SSH installer](./install).

## Keep camera ports consistent

EagleEye associates a USB camera with its physical USB path. Label cables and leave each camera
in the same Pi port after calibration. Moving it can disconnect its saved calibration and
pipeline settings.
