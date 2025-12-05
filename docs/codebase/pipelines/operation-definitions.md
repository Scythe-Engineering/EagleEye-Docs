# Main Operation Definitions

Main operations live in `src/main_operations/definitions/` as thin wrappers that resolve compute devices and delegate heavy logic to modules under `src/modules/`.

## Pattern
- File: `src/main_operations/definitions/{name}.py`
- Class: `CamelCaseDefinition` (e.g., `ApriltagCnnPreprocessorDefinition`)
- Responsibilities: parse params, fetch devices, instantiate implementation, expose `run`

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

## Config definitions
Describe parameters in JSON for validation and UI metadata:
- Path: `src/main_operations/definitions/config_data/{name}_config_def.json`
- Keys: `class_name`, `description`, `category` (`prep`, `det`, `proc`, `filt`, `net`), `parameters`

```json
{
  "class_name": "ApriltagCnnPreprocessorDefinition",
  "description": "Preprocesses frames before AprilTag detection",
  "category": "prep",
  "parameters": {
    "model_path": {"type": "str", "description": "Weights path", "required": true},
    "device_id": {"type": "str", "description": "Compute device id", "required": true},
    "conf_threshold": {"type": "float", "description": "Confidence threshold", "default": 0.15}
  }
}
```

## Contract
- Implement `run(self, input)`; document expected input/output in the class docstring.
- Optional `back_propagate_input(self, input_data)` to accept feedback from BackPropagate ops.

## When to create a main op
- Operation requires device allocation, models, or complex orchestration.
- Logic is substantial enough to live under `src/modules/{name}/`.



