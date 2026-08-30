---
sidebar_position: 1
title: Start here
---

# Start here

Start with the image. Flash it, boot the Pi, and open
[http://eagleeye.local:5001](http://eagleeye.local:5001). The first-boot wizard builds camera
pipelines for you. The SSH installer and node editor are advanced options.

## First setup

1. [Flash the EagleEye image](./prepare-pi) to a Raspberry Pi 5.
2. Boot it on Ethernet or configured Wi-Fi.
3. Open [http://eagleeye.local:5001](http://eagleeye.local:5001) from a computer on the same
network. Use the Pi's IP address if `.local` does not resolve.
4. Run [the setup wizard](./pipeline-setup) for each camera.
5. In the wizard, set the roboRIO address, generate the pipelines, and pass live verification in
3D View.
6. Check [tested cameras](./tested-cameras) before standardizing robot hardware.

If you skipped the wizard, open **Settings** and click **Open** next to **Camera setup wizard**.

## What you need

- Raspberry Pi 5, storage, power, and network access.
- A UVC USB camera. Prefer a global-shutter camera for AprilTags. See [tested cameras](./tested-cameras).
- A laptop on the same network for the web UI.
- A printed ChArUco board, a tape measure, and the current season's field map.
- A roboRIO address. For detection-only setup, a CPU-compatible model in the model library.

## Advanced paths

- [Install over SSH](./install) for a stock Raspberry Pi OS setup.
- [Manual pipeline editor](./advanced-pipeline-editor) for custom graphs and MX3 inference.
- [User interface reference](./user-interface) for individual tabs and controls.
- [Benchmarks](./benchmarks) for maintainer measurements and the record required for a rerun.
- [License](./license) for noncommercial-use terms.
