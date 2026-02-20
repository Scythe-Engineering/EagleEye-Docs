# User Guide

EagleEye is an FRC computer vision framework that ingests camera frames, routes them through configurable processing pipelines, and publishes robot pose data to NetworkTables. This guide covers everything an operator needs to set up, configure, and run the system.

## What you can do
- Install all dependencies using `uv` (Python) and `npm` (WebUI frontend).
- Configure pipelines visually using the drag-and-drop pipeline editor.
- Monitor camera feeds, system resources, and pipeline profiling in real time.
- Deploy as a systemd service on a coprocessor.

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.11 or newer |
| [uv](https://github.com/astral-sh/uv) | Latest |
| Node.js | 18 or newer (for frontend build) |
| Rust toolchain | stable (auto-installed via `rustup`) |
| At least one supported compute device | CPU (always), NVIDIA GPU (optional), Memryx MX3 (optional) |

You will also need:
- Camera calibration files (intrinsics YAML, obtainable via the built-in calibration tool)
- An AprilTag field map JSON (`frc2025r2.json` is bundled)
- NetworkTables server reachable on your robot or test machine
