# Device Management

Compute devices are abstracted behind `ComputeDevice` and coordinated via `ComputePool` in `src/utils/device_management_utils/`.

## Components
- `ComputeDevice`: abstract base class exposing `load_model()`, `run()`, `stop()`, plus `device_id` and `device_type`.
- Implementations: CPU (ONNX Runtime), GPU (PyTorch CUDA), MX3 accelerator (MemryX MultiStreamAsyncAccl).
- `ComputePool`: add/remove devices, query by ID/type, and stop all devices.

## Typical flow
1) Instantiate device implementations and register them with `ComputePool`.
2) Pipelines request devices by `device_id` when operation definitions construct their delegates.
3) On shutdown, call `stop_all_devices()` to release hardware resources.

## Extending
- Subclass `ComputeDevice`, set `device_id`/`device_type`, and implement `load_model`, `run`, `stop`.
- Handle device availability checks (CUDA presence, MX3 libraries, etc.).
- Document supported model formats (ONNX, PyTorch) in the class docstring.

## Files to know
- `src/utils/device_management_utils/compute_device.py`
- `src/utils/device_management_utils/compute_pool.py`
- `src/utils/device_management_utils/cpu.py`
- `src/utils/device_management_utils/gpu.py`
- `src/utils/device_management_utils/mx3_accelerator.py`

