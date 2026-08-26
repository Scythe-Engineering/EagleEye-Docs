---
sidebar_position: 2
title: Prepare the Raspberry Pi
---

# Prepare the Raspberry Pi

EagleEye targets 64-bit Raspberry Pi OS Lite based on Debian 12. Use the prebuilt EagleEye image when a current image artifact is available. Use the stock-image path when you need a clean upstream OS or cannot download the artifact.

## Option A: flash the EagleEye image

The **Build Raspberry Pi image** GitHub Actions workflow produces an `eagleeye-pi-image` artifact containing an `.img.xz` file on tagged builds and manual releases.

1. Open the [Build Raspberry Pi image workflow](https://github.com/Scythe-Engineering/EagleEye-Vision-System/actions/workflows/pi-image.yml).
2. Open the newest successful tagged run.
3. Download the `eagleeye-pi-image` artifact. GitHub may require you to sign in.
4. Extract the downloaded artifact until you have `eagleeye-YYYY-MM-DD.img.xz`.
5. Open [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
6. Choose **Use custom**, select the `.img.xz`, choose the target storage, and write it.
7. Insert the storage, connect Ethernet, and boot the Pi.

The image hostname is `eagleeye`, so the WebUI should become available at `http://eagleeye.local:5001` after startup.

:::danger Change the image password
The current image build enables SSH with username `eagleeye` and password `eagleeye`. Change it immediately:

```bash
ssh eagleeye@eagleeye.local
passwd
```

Do not connect an unchanged image to an untrusted network.
:::

If no current successful image artifact exists, use Option B. Do not flash an old image merely because it is available.

## Option B: flash stock Raspberry Pi OS

1. Open Raspberry Pi Imager.
2. Choose **Raspberry Pi OS Lite (64-bit)** and confirm it is Debian 12.
3. Select the microSD card or USB SSD.
4. In Imager settings, set:
   - hostname `eagleeye`, or another name you will remember;
   - your own username and password;
   - Wi-Fi and country code when needed;
   - **Enable SSH**, preferably with your public key.
5. Write and verify the image.
6. Boot the Pi and connect:

```bash
ssh <username>@eagleeye.local
```

7. Update the OS:

```bash
sudo apt update && sudo apt full-upgrade -y
sudo reboot
```

Then continue to [Install EagleEye](./install).

## Keep camera connections consistent

EagleEye identifies a USB camera by its physical USB path. Label camera cables and keep each camera in the same Pi USB port after calibration. Moving it can disconnect saved calibration and pipeline settings from that camera.
