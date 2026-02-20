# Deployment

EagleEye is designed to run as a systemd service on a Linux coprocessor (e.g. Orange Pi, Jetson Nano, Raspberry Pi 5).

## Prerequisites

- The coprocessor runs a systemd-based Linux distro (Ubuntu, Debian, etc.).
- A dedicated user (e.g. `eagle`) owns the project directory.
- Python 3.11+, uv, Node.js 18+, and a Rust stable toolchain are installed.
- The frontend has been built (`cd src/webui && npm install && npm run build`).

## Service file

A ready-to-use service file is included at `eagleeye.service` in the project root:

```ini
[Unit]
Description=EagleEye Object Detection Backend
After=network-online.target

[Service]
Type=simple
User=eagle
Group=eagle
WorkingDirectory=/home/eagle/EagleEye-Object-Detection
ExecStart=/bin/bash -lc 'cd /home/eagle/EagleEye-Object-Detection && /home/eagle/EagleEye-Object-Detection/.venv/bin/python -m src.main_backend'
Restart=on-failure
RestartSec=5s
LimitNOFILE=65535
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

Adjust `WorkingDirectory`, the `ExecStart` path, and `User`/`Group` to match your deployment. The `.venv/bin/python` path assumes `uv sync` was run in the project root.

## Installation

```bash
# Copy the service file
sudo cp eagleeye.service /etc/systemd/system/eagleeye.service

# Reload systemd and enable the service
sudo systemctl daemon-reload
sudo systemctl enable eagleeye
sudo systemctl start eagleeye

# Check status
sudo systemctl status eagleeye
```

## SERVICE_NAME environment variable

The WebUI's **Restart** button calls `sudo systemctl restart $SERVICE_NAME`. The service name defaults to `eagleeye` if the environment variable is not set.

To use a different service name, add it to the `[Service]` section:

```ini
Environment=PYTHONUNBUFFERED=1
Environment=SERVICE_NAME=my-eagleeye
```

## Sudo permissions for restart

The `eagle` user needs passwordless sudo for the restart command. Add a sudoers rule:

```bash
sudo visudo -f /etc/sudoers.d/eagleeye
```

Add this line:

```
eagle ALL=(ALL) NOPASSWD: /bin/systemctl restart eagleeye
```

Without this, the restart button in the Settings tab will fail with a permission error.

## Viewing logs

```bash
# Follow live logs
sudo journalctl -u eagleeye -f

# Last 100 lines
sudo journalctl -u eagleeye -n 100
```

EagleEye also writes structured logs accessible via `GET /get-log-messages` and downloadable from `GET /download-log-file`.

## Accessing the WebUI from the driver station

On the same network, open:

```
http://<coprocessor-ip>:5001
```

The coprocessor IP can be found with `hostname -I` or set as a static IP in your network config.

## Updating

```bash
cd /home/eagle/EagleEye-Object-Detection
git pull
uv sync                           # update Python deps
cd src/webui && npm install && npm run build && cd ../..  # rebuild frontend
sudo systemctl restart eagleeye   # apply updates
```

The Rust modules are rebuilt automatically on the next startup if the source has changed (hash-cached, so unchanged modules are instant).
