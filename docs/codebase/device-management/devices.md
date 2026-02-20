# Device Implementations

All device classes subclass `ComputeDevice` from `src/utils/device_management_utils/compute_device.py`. The base class enforces `device_id` and `device_type` attributes and declares `load_model()`, `run()`, and `stop()` as the interface.

## CPU (`cpu.py`)

- **Device ID:** `CPU`
- **Backend:** ONNX Runtime with the CPU Execution Provider
- **Models:** Standard ONNX files
- **Use when:** No GPU or MX3 available, or for lightweight operations

CPU is always available. All non-device-specific ONNX inference falls back to CPU when other devices are absent.

## GPU (`gpu.py`)

- **Device ID:** `GPU_0`, `GPU_1`, etc. (indexed by CUDA device order)
- **Backend:** ONNX Runtime with CUDA Execution Provider (or PyTorch, depending on operation)
- **Models:** ONNX files compiled for CUDA, or PyTorch `.pt` / `.pth`
- **Requirements:** NVIDIA driver, CUDA toolkit, `onnxruntime-gpu` or `torch` with CUDA

GPU devices are registered in `MainBackend._initialize_gpu_devices()`:

```python
for gpu_index, gpu_device_name in enumerate(gpu_devices):
    gpu_device = GPU(device_id=f"GPU_{gpu_index}")
    self.compute_pool.add_compute_device(gpu_device)
```

`get_available_devices()` uses CUDA device enumeration to discover GPUs. If CUDA is unavailable, no GPU devices are registered.

## MX3 Accelerator (`mx3_accelerator.py`)

- **Device ID:** `MX3_0`, `MX3_1`, etc. (indexed from `memx:0`, `memx:1`)
- **Backend:** MemryX `MultiStreamAsyncAccl`
- **Models:** ONNX models compiled for MX3 (via the Memryx compiler toolchain)
- **Requirements:** MemryX SDK and PCIe/USB driver

MX3 devices are registered in `MainBackend._initialize_tpu_devices()`:

```python
for tpu_device in tpu_devices:
    # tpu_device is e.g. "memx:0"
    device_index = tpu_device.split(":", 1)[1]
    mx3_device = MX3Accelerator(device_id=f"MX3_{device_index}", logger=self.logger)
    self.compute_pool.add_compute_device(mx3_device)
```

The MX3 logger is set via `set_mx3_logger(logger)` so MX3 internal messages flow through the EagleEye log system.

## Base class interface

```python
from src.utils.device_management_utils.compute_device import ComputeDevice

class ComputeDevice:
    device_id: str
    device_type: str

    def load_model(self, model_path: str) -> None: ...
    def run(self, input_data) -> Any: ...
    def stop(self) -> None: ...
```

For adding a new device type, see [New Device](../extension-points/new-device).
