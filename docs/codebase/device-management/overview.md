# Device Management Overview

EagleEye abstracts hardware accelerators behind a uniform `ComputeDevice` API and a central `ComputePool` registry. Operations request devices by ID during construction; the pool serves the correct implementation.

## Core files

| File | Role |
|---|---|
| `src/utils/device_management_utils/compute_device.py` | Abstract base class for all devices |
| `src/utils/device_management_utils/compute_pool.py` | Device registry and lookup |
| `src/utils/device_management_utils/cpu.py` | CPU device (ONNX Runtime CPU EP) |
| `src/utils/device_management_utils/gpu.py` | GPU device (CUDA/ONNX) |
| `src/utils/device_management_utils/mx3_accelerator.py` | Memryx MX3 TPU device |
| `src/utils/get_available_devices.py` | Hardware discovery at startup |

## Device ID formats

| Device | ID | Example |
|---|---|---|
| CPU | `CPU` | `CPU` |
| NVIDIA GPU | `GPU_<index>` | `GPU_0`, `GPU_1` |
| Memryx MX3 | `MX3_<index>` | `MX3_0`, `MX3_1` |

The index comes from the hardware discovery order: GPUs are indexed as reported by CUDA/ONNX, MX3 accelerators are indexed from `memx:0`, `memx:1`, etc.

## Lifecycle

1. `get_available_devices()` probes hardware and returns a dict of available device names.
2. `MainBackend._initialize_compute_devices()` creates device objects and registers them with `ComputePool`.
3. During pipeline construction, each operation that declares `compute_pool` in its constructor receives the pool and calls `pool.get_compute_device(device_id)`.
4. On shutdown, `compute_pool.stop_all_devices()` releases resources.

## When to add a new device

When integrating new accelerator hardware (Coral TPU, Hailo, FPGA, etc.), subclass `ComputeDevice` and register in `MainBackend._initialize_compute_devices()`. See [New Device](../extension-points/new-device) for the walkthrough.
