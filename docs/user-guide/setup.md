# Setup

## 1. Clone the repository

```bash
git clone https://github.com/Scythe-Engineering/EagleEye-Vision-System.git
cd EagleEye-Vision-System
```

## 2. Install Python dependencies

EagleEye uses [`uv`](https://github.com/astral-sh/uv) for dependency management — **do not use `pip`**.

```bash
uv sync
```

This creates a `.venv/` in the project root and installs all required packages including OpenCV, Flask, pynetworktables, and line-profiler.

If you need GPU (CUDA/ONNX) or MX3 support, install the extras after `uv sync` per your hardware vendor's instructions.

## 3. Build the WebUI frontend

The WebUI frontend is built with Vite + Handlebars + Tailwind and must be compiled before the backend serves it.

```bash
cd src/webui
npm install
npm run build
cd ../..
```

This produces compiled JS and CSS under `src/webui/js/` and `src/webui/style.css`.

## 4. Rust toolchain (first run only)

EagleEye includes Rust acceleration modules that are built automatically at startup via `maturin`. On the first run this can take several minutes. Subsequent runs use a hash-cached build and are instant.

Ensure you have a Rust stable toolchain:

```bash
rustup toolchain install stable
```

If `rustup` is not installed, get it from [rustup.rs](https://rustup.rs).

## 5. Place assets

| Asset | Default location |
|---|---|
| AprilTag map | `files/apriltag_map_path/frc2025r2.json` (bundled) |
| Camera intrinsics | `src/config/camera_configs/<bus_id>/intrinsics.yaml` (upload via WebUI) |
| ONNX model weights | Wherever your `action_params.model_path` points (can use `{project_root}` token) |

The `{project_root}` token in any path string is resolved to the absolute path of the project directory at runtime.

## 6. Camera connections

Connect USB cameras before starting the backend. EagleEye identifies cameras by their USB **bus ID** (e.g. `1-3.2`), which is printed at startup. Bus IDs are stable across reboots on the same physical port.

See [Camera Setup](./camera-setup) for how to discover bus IDs and configure cameras.

## 7. NetworkTables (optional for testing)

EagleEye can run without a robot. Set the NT server address to `0.0.0.0` in `src/general_conf.json` (or via the WebUI Settings tab) to disable NT publishing.

```json
{"network_table_address": "0.0.0.0"}
```
