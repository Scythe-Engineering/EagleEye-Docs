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

## WPILib coprocessor variants

The installer defaults to **WPILib 2026**, as does the prebuilt Pi image. This stack also communicates with a WPILib 2027 alpha-7 robot over NT4. Choose the matching Java SDK separately in the [robot integration guide](./robot-integration#choose-the-wpilib-version-and-copy-the-library).

| Coprocessor variant | Installer argument | Linux platform requirement |
| --- | --- | --- |
| 2026 (default) | No argument, or `--wpilib 2026` | Supported 64-bit Debian 12 / Raspberry Pi OS Bookworm |
| 2027 alpha-7 (opt-in) | `--wpilib 2027-alpha7` | glibc ≥ 2.39, such as Debian 13 / Raspberry Pi OS Trixie or Ubuntu 24.04 |

To opt in on a supported fresh installation, change the final installer invocation in the download block above to:

```bash
bash "$installer" --wpilib 2027-alpha7
```

Alpha RobotPy wheels cannot install on Debian 12's glibc 2.36. The installer checks this before installation; retain 2026 on Bookworm. Check a Linux host with `getconf GNU_LIBC_VERSION`.

The selected variant is persisted in `.wpilib-variant` in the install directory so updates and startup dependency repair retain it. Do not mix 2026 `pyntcore` with alpha `robotpy-wpimath`, or vice versa; the compatibility adapter rejects mismatched bindings.

For a developer checkout, plain `uv sync` and `uv run pytest` use 2026. An alpha environment uses mutually exclusive dependency groups:

```bash
uv sync --locked --no-group wpilib2026 --group wpilib2027-alpha7 --no-build-package pyntcore --no-build-package robotpy-wpimath
uv run --no-sync pytest tests/
```

Only the WPILib packages are restricted to wheels; other dependencies may need source builds on a Pi. The platform requirement above describes wheel availability, not a physical Trixie installation test.

Keep using `--no-sync` after selecting the alpha group, or explicitly pass `--no-group wpilib2026 --group wpilib2027-alpha7` to subsequent `uv run` commands. A plain `uv run` can restore the default 2026 group. Return to the default with `uv sync --locked`.

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
