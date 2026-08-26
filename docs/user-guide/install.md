---
sidebar_position: 3
title: Install EagleEye
---

# Install EagleEye

If you flashed the EagleEye image, the software and system service are already installed. Open `http://eagleeye.local:5001`. Use this page for a stock Raspberry Pi OS installation or to verify the service.

## Install on stock Raspberry Pi OS

Connect over SSH as the normal sudo-capable user that should own EagleEye. Do not run the installer as root or prefix it with `sudo`.

```bash
(
  installer="$(mktemp)" &&
  trap 'rm -f "$installer"' EXIT &&
  curl -fsSL https://raw.githubusercontent.com/Scythe-Engineering/EagleEye-Vision-System/main/install.sh -o "$installer" &&
  bash "$installer"
)
```

The installer checks the platform, clones EagleEye into `~/EagleEye-Vision-System`, installs system packages and toolchains, syncs Python dependencies, builds the WebUI and Rust extensions, and creates the `eagleeye` systemd service. It performs fresh installs only. Use **Settings → System Update** for an existing installation.

The Pi needs internet access while installing. A competition robot network normally does not provide it.

## Verify the service

```bash
systemctl status eagleeye
```

The status should show `active (running)`. Useful commands:

| Task | Command |
|------|---------|
| Restart | `sudo systemctl restart eagleeye` |
| Follow logs | `journalctl -u eagleeye -f` |
| Start on boot | `sudo systemctl enable eagleeye` |

The WebUI listens on every interface at port 5001:

```text
http://eagleeye.local:5001
http://<device-ip>:5001
```

## If installation fails

- Check internet access and rerun `sudo apt update`.
- Check free storage with `df -h`.
- If Rust extensions fail to build, inspect the installer output and [backend startup troubleshooting](./troubleshooting#backend-exits-at-startup).
- If the target directory already exists, do not delete a working installation. Open **Settings → System Update** instead.

Next: [Open the UI](./open-the-ui).
