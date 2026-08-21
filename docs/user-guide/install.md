---
sidebar_position: 3
title: Install EagleEye
---

# Install EagleEye

Run this on the Pi you prepared in [Prepare the Raspberry Pi](./prepare-pi), over SSH.
The Pi must have internet access. A robot network normally does not provide it; if you used
Ethernet for the first connection, [connect the Pi to Wi-Fi or a hotspot](./connect-wifi)
before continuing.

## 1. Run the installer

```bash
curl -fsSL https://raw.githubusercontent.com/Scythe-Engineering/EagleEye-Vision-System/main/install.sh | bash
```

Run it as your normal sudo-capable user, **not** as root and not with `sudo`. The installer creates `~/EagleEye-Vision-System`, installs and enables the `eagleeye` service, and includes `v4l-utils` for camera discovery.

The installer sets up system packages, the Python environment, the web UI build, and a
systemd service. It takes a while on a Pi — the Rust extensions are compiled during setup.

**Expected result:** the installer finishes without an error and tells you the UI address.

## 2. Confirm the service is running

EagleEye runs as a systemd service named `eagleeye`:

```bash
systemctl status eagleeye
```

**Expected result:** the status shows `active (running)` and the log lines below the status
mention initializing the EagleEye backend and detected inference devices.

Useful commands:

| Task | Command |
|------|---------|
| Start | `sudo systemctl start eagleeye` |
| Stop | `sudo systemctl stop eagleeye` |
| Restart | `sudo systemctl restart eagleeye` |
| Start on boot | `sudo systemctl enable eagleeye` |
| Follow the log live | `journalctl -u eagleeye -f` |

## 3. Note the address

The web UI listens on port **5001** on every interface. You will reach it at
`http://<hostname>.local:5001` or `http://<pi-ip>:5001`.

## If the install fails

- Read the last 40 lines of output. Most failures are network (package download) or a
  partially updated system — re-run `sudo apt update && sudo apt full-upgrade -y` and try
  again.
- If the backend starts and then exits with
  `Failed to build Rust implementations. Backend initialization cannot continue.`, the Rust
  toolchain or a compile step failed. See
  [Troubleshooting → Backend exits at startup](./troubleshooting#backend-exits-at-startup).
- Check free space with `df -h`. A full card produces confusing errors.

Next: [Open the UI](./open-the-ui).

:::note
The installer was clean-tested on a Raspberry Pi Compute Module 5 running Debian 12 on 2026-08-21. It generates the service for the user who runs the install command and that user's checkout path.
:::
