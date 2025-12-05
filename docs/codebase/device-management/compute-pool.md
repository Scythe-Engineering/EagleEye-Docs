# Compute Pool

`ComputePool` manages all compute devices and serves them to operations by ID.

## Responsibilities
- Register devices (CPU/GPU/MX3/etc.).
- Retrieve a device by `device_id`.
- Query by type.
- Stop all devices on shutdown.

## Minimal usage
```python
from src.utils.device_management_utils.compute_pool import ComputePool
from src.utils.device_management_utils.cpu import CPU

pool = ComputePool()
pool.add_compute_device(CPU(device_id="CPU"))

device = pool.get_compute_device("CPU")
# device.run(...) inside an operation

pool.stop_all_devices()
```

## Behavior notes
- GPU path relies on PyTorch CUDA; ensure drivers present.
- MX3 path uses MemryX MultiStreamAsyncAccl; require vendor libs.
- Fallback: CPU is always available for ONNX Runtime inference.

## Error handling
- Missing IDs should surface early—validate configs before pipeline creation.
- Wrap model loads with clear exceptions for absent weights or unsupported hardware.



