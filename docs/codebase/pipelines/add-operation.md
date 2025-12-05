# Add a New Operation

Use this checklist to add operations safely and keep configs consistent.

## Choose type
- Main operation (definition): needs device allocation, heavier logic, or module delegation. Path: `src/main_operations/definitions/{name}.py`.
- Secondary operation: lightweight, single-file logic. Path: `src/secondary_operations/{name}.py`.

## Implement
### Main definition (wrapper)
```python
# src/main_operations/definitions/my_op.py
from src.modules.my_op.implementation import MyOpImplementation
from src.utils.device_management_utils.compute_pool import ComputePool

class MyOpDefinition:
    def __init__(self, model_path: str, device_id: str, compute_pool: ComputePool, threshold: float = 0.1):
        device = compute_pool.get_compute_device(device_id)
        self.delegate = MyOpImplementation(model_path, device, threshold)

    def run(self, frame):
        return self.delegate.run(frame)
```

### Secondary operation
```python
# src/secondary_operations/my_filter.py
class MyFilter:
    def __init__(self, strength: float = 0.5):
        self.strength = strength

    def run(self, data):
        return data  # apply filtering here
```

## Config definition (required)
- Main: `src/main_operations/definitions/config_data/{name}_config_def.json`
- Secondary: `src/secondary_operations/config_data/{name}_config_def.json`
```json
{
  "class_name": "MyOpDefinition",
  "description": "What it does",
  "category": "proc",
  "parameters": {
    "model_path": {"type": "str", "description": "Weights path", "required": true},
    "device_id": {"type": "str", "description": "Compute device id", "required": true},
    "strength": {"type": "float", "description": "Filter strength", "default": 0.5}
  }
}
```

## Wire into pipeline
- Add an entry to `src/config/pipeline_config.json` under the target camera:
```json
{
  "action_name": "my_op",
  "action_params": {
    "model_path": "/path/to/model.onnx",
    "device_id": "MX3",
    "strength": 0.5
  }
}
```
- `compute_pool` and `web_interface` inject automatically if the constructor takes them by name.

## Verify
- Ensure module names match `action_name`.
- Confirm `device_id` exists in `ComputePool`.
- Keep secondary ops short; promote to main op if complexity grows.



