---
sidebar_position: 1
title: Start here
---

# Start here

Start with the image. Flash it, boot the Pi, and open
[http://eagleeye.local:5001](http://eagleeye.local:5001). That is the normal EagleEye path.
The SSH installer and manual node editor are advanced options.

## First setup

1. [Flash the EagleEye image](./prepare-pi) to a Raspberry Pi 5.
2. Boot it on Ethernet or configured Wi-Fi.
3. Open [http://eagleeye.local:5001](http://eagleeye.local:5001) from a computer on the same
network. Use the Pi's IP address if `.local` does not resolve.
4. Follow [the setup wizard](./pipeline-setup) when your release provides it.
5. Check [tested cameras](./tested-cameras) before choosing robot hardware.
6. Verify the pose and NetworkTables output before driving.

:::warning Current-release status
The source tree reviewed for this guide has no first-boot setup wizard yet. Its fresh pipeline is
intentionally incomplete. Until a wizard ships, use [advanced manual pipeline setup](./advanced-pipeline-editor)
after calibrating the camera and configuring NetworkTables.
:::

## What you need

- Raspberry Pi 5, storage, power, and network access.
- A UVC USB camera. Prefer a global-shutter camera for AprilTags. See [tested cameras](./tested-cameras).
- A laptop on the same network for the web UI.
- The current season's field map and a robot-side NetworkTables consumer.

## Advanced paths

- [Install over SSH](./install) for a stock Raspberry Pi OS setup.
- [Manual pipeline editor](./advanced-pipeline-editor) for custom graphs or current releases without the wizard.
- [User interface reference](./user-interface) for individual tabs and controls.
- [Benchmarks](./benchmarks) for maintainer measurements and the record required for a rerun.
- [License](./license) for noncommercial-use terms.
