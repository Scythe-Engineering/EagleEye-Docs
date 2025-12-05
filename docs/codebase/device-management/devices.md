# Device Implementations

Each device class subclasses `ComputeDevice` and implements `load_model`, `run`, and `stop`.

## CPU (`cpu.py`)
- Backend: ONNX Runtime (CPU EP).
- Supports ONNX models.
- Good for portability and fallback.

## GPU (`gpu.py`)
- Backend: PyTorch with CUDA.
- Expects CUDA-enabled environment; verify `torch.cuda.is_available()`.
- Best for heavy models; ensure model format matches PyTorch loading path.

## MX3 (`mx3_accelerator.py`)
- Backend: MemryX MultiStreamAsyncAccl.
- Optimized for MX3 hardware; uses ONNX models tailored for MX3.
- Supports asynchronous multi-stream processing.

## Adding a new device
```python
from src.utils.device_management_utils.compute_device import ComputeDevice

class CoralTpu(ComputeDevice):
    def __init__(self, device_id: str = "CORAL_0"):
        super().__init__(device_id=device_id, device_type="CORAL")
        self.engine = None

    def load_model(self, model_path: str):
        # load edgetpu model (placeholder)
        self.engine = model_path

    def run(self, input_data):
        return input_data  # replace with accelerator call

    def stop(self):
        self.engine = None
```

Register the new device in `ComputePool` and reference its `device_id` in pipeline configs.



