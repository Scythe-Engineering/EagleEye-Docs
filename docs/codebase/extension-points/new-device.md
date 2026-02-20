# Adding a New Device

To integrate a new hardware accelerator with EagleEye, subclass `ComputeDevice` and register it in `MainBackend`.

## 1. Subclass ComputeDevice

```python
# src/utils/device_management_utils/coral_tpu.py
from src.utils.device_management_utils.compute_device import ComputeDevice


class CoralTpu(ComputeDevice):
    """Google Coral TPU device via pycoral."""

    def __init__(self, device_id: str = "CORAL_0") -> None:
        super().__init__(device_id=device_id, device_type="CORAL")
        self._interpreter = None

    def load_model(self, model_path: str) -> None:
        """Load an Edge TPU compiled TFLite model."""
        from pycoral.utils.edgetpu import make_interpreter
        self._interpreter = make_interpreter(model_path)
        self._interpreter.allocate_tensors()

    def run(self, input_data) -> any:
        """Run inference on the loaded model."""
        import numpy as np
        from pycoral.adapters import common
        interpreter = self._interpreter
        common.set_input(interpreter, input_data)
        interpreter.invoke()
        return common.output_tensor(interpreter, 0).copy()

    def stop(self) -> None:
        """Release TPU resources."""
        self._interpreter = None
```

### Required interface

| Method | Purpose |
|---|---|
| `__init__(device_id, device_type)` | Set ID and type via `super().__init__()` |
| `load_model(model_path)` | Load model weights onto the device |
| `run(input_data)` | Execute inference and return output |
| `stop()` | Release device resources on shutdown |

The `device_id` is the string operations use in `action_params` (e.g. `"CORAL_0"`). `device_type` is a string for `get_compute_devices_by_type()` queries.

## 2. Add hardware discovery

Update `src/utils/get_available_devices.py` to detect the new hardware. For example:

```python
def get_available_devices(logger=None):
    devices = {}
    # ... existing CPU, GPU, MX3 detection ...

    # Coral detection
    try:
        from pycoral.utils.edgetpu import list_edge_tpus
        tpus = list_edge_tpus()
        if tpus:
            devices["CORAL"] = [t.get("type", "usb") for t in tpus]
    except ImportError:
        pass

    return devices
```

## 3. Register in MainBackend

Add an initialization method in `src/main_backend.py`:

```python
def _initialize_coral_devices(self) -> None:
    coral_devices = available_devices.get("CORAL", [])
    if not coral_devices:
        return

    from src.utils.device_management_utils.coral_tpu import CoralTpu
    for idx, _ in enumerate(coral_devices):
        try:
            device = CoralTpu(device_id=f"CORAL_{idx}")
            self.compute_pool.add_compute_device(device)
            self.logger.log(f"Added Coral TPU device: CORAL_{idx}")
        except Exception as e:
            self.logger.log(f"Warning: Failed to add Coral TPU {idx}: {e}")
```

Then call it from `_initialize_compute_devices()`:

```python
def _initialize_compute_devices(self) -> None:
    # ... existing CPU, MX3, GPU init ...
    self._initialize_coral_devices()
```

## 4. Use in operations

Operations reference the new device by ID in `action_params`:

```json
{
  "action_name": "my_coral_op.py",
  "action_params": {
    "model_path": "{project_root}/files/models/my_model_edgetpu.tflite",
    "device_id": "CORAL_0"
  }
}
```

The operation constructor calls `compute_pool.get_compute_device("CORAL_0")` to get the `CoralTpu` instance, then `device.load_model(model_path)`.
