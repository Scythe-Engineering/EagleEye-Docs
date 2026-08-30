---
title: Develop EagleEye
---

# Develop EagleEye

Use this setup for backend, pipeline, hardware, or WebUI work in the main EagleEye repository.
The supported development environment is Linux with Python 3.11 or newer, Node.js 20 or newer,
Rust, Git, and a camera only when your change needs real hardware.

## Clone and install

```bash
git clone https://github.com/Scythe-Engineering/EagleEye-Vision-System.git
cd EagleEye-Vision-System
uv sync
npm install
git config core.hooksPath .githooks
```

`uv sync` creates the project virtual environment and installs Python dependencies. `npm install`
installs the WebUI build tools. The optional Git-hook command enables the repository's pre-push
checks.

## Run the backend

The backend serves the built WebUI on port 5001. In one terminal, build the frontend whenever you
change it:

```bash
npm run build
```

In another terminal, start EagleEye:

```bash
uv run python -m src.main_backend
```

Open `http://localhost:5001` on the development machine, or
`http://<development-machine-ip>:5001` from another computer on the same network. The first
backend start can take longer because EagleEye builds its Rust modules.

For ongoing frontend work, replace the one-time build with:

```bash
npm run watch
```

Keep the backend running on port 5001 and reload the page after Vite writes new static files.
The Vite development server is useful for inspecting frontend output, but it does not proxy the
EagleEye backend. Test the integrated UI through port 5001.

## Run checks

```bash
uv run pytest
npm run build
```

Run the focused pytest file for a scoped backend change before the full suite. Use `npm run build`
after changing anything under `src/webui/`; it catches production-bundle errors.

## Hardware and configuration

Start without cameras when working on pure backend or frontend code. When testing cameras, plug
them in before starting the backend. EagleEye discovers cameras at startup.

Local camera calibration and pipeline configuration are machine-specific. Do not commit those
changes unless the change intentionally updates a shared configuration or fixture. Keep
`src/config/pipeline_config.json` backed up before switching branches on a robot image.

For repository boundaries and reliability priorities, read the
[engineering principles](./overview#engineering-principles).
