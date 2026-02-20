# Compute Pool

`ComputePool` (`src/utils/device_management_utils/compute_pool.py`) is a simple registry that maps device IDs to `ComputeDevice` instances. It is created once in `MainBackend` and injected into every pipeline as a shared resource.

## API

```python
from src.utils.device_management_utils.compute_pool import ComputePool
from src.utils.device_management_utils.cpu import CPU

pool = ComputePool()

# Register devices
pool.add_compute_device(CPU())               # CPU (id: "CPU")
pool.add_compute_device(GPU(device_id="GPU_0"))   # first NVIDIA GPU
pool.add_compute_device(MX3Accelerator(device_id="MX3_0"))  # first MX3

# Retrieve by ID (used by operations)
cpu = pool.get_compute_device("CPU")
gpu = pool.get_compute_device("GPU_0")

# Query by type
cpu_devices = pool.get_compute_devices_by_type("CPU")

# Remove
pool.remove_compute_device_by_id("GPU_0")

# Shutdown
pool.stop_all_devices()
```

## Initialization path

`MainBackend._initialize_compute_devices()` handles all registration:

1. **CPU** — always registered if `get_available_devices()` reports `"CPU"` present.
2. **MX3** — one `MX3Accelerator` instance per detected `memx:X` device. Device IDs: `MX3_0`, `MX3_1`, etc.
3. **GPU** — one `GPU` instance per CUDA-capable GPU. Device IDs: `GPU_0`, `GPU_1`, etc.

Failed device registrations are logged as warnings and skipped — the backend continues without the failed device.

## Error behavior

`get_compute_device(id)` raises `ValueError` if the ID is not registered. This surfaces early during pipeline construction (at startup), not at runtime. Always validate your `device_id` values in `action_params` before deploying.

## Thread safety

`ComputePool` itself is not thread-safe (no locking). Devices are registered once at startup before any pipeline threads begin; reads during pipeline execution are safe because no concurrent writes occur after initialization.
