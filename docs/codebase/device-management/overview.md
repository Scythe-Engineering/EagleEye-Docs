# Device Management Overview

Device management abstracts hardware (CPU, GPU, MX3) behind a consistent API and central pool.

## Core files
- `src/utils/device_management_utils/compute_device.py`: abstract base class.
- `src/utils/device_management_utils/compute_pool.py`: registry and allocator.
- Implementations: `cpu.py`, `gpu.py`, `mx3_accelerator.py`.

## Lifecycle
1. Instantiate devices and register with `ComputePool`.
2. Operations request devices by `device_id` during construction.
3. Pipelines run using the allocated device handles.
4. Shutdown via `stop_all_devices()` to release resources.

## When to add a device
- New accelerator type or vendor library.
- Specialized hardware paths (e.g., Coral, FPGA). Add a new class and register it.



