# Add a New Operation

Use this checklist when adding a new processing operation to EagleEye.

## 1. Choose the operation type

| Type | Use when | Location |
|---|---|---|
| **Secondary operation** | Single-file logic, no heavy model loading | `src/secondary_operations/<name>.py` |
| **Main operation** | Requires device allocation, model loading, or its own module | `src/main_operations/definitions/<name>.py` |

For very simple transforms or custom logic during competition, prefer a secondary operation — it can also be created in the browser via the **Custom Ops** tab.

## 2. Implement the operation

All operations must extend `OperationInstance`:

### Secondary operation

```python
# src/secondary_operations/my_filter.py
from typing import Any
from src.main_operations.definitions.base.base_class import OperationInstance

class MyFilter(OperationInstance):
    def __init__(self, strength: float = 0.5) -> None:
        self.strength = strength

    def run(self, data: Any) -> Any:
        # Apply filtering logic here
        return data
```

### Main operation (wrapper + module)

```python
# src/main_operations/definitions/my_op.py
from src.modules.my_op.implementation import MyOpImplementation
from src.utils.device_management_utils.compute_pool import ComputePool
from src.main_operations.definitions.base.base_class import OperationInstance

class MyOpDefinition(OperationInstance):
    def __init__(self, model_path: str, device_id: str, compute_pool: ComputePool, threshold: float = 0.1) -> None:
        device = compute_pool.get_compute_device(device_id)
        self.impl = MyOpImplementation(model_path, device, threshold)

    def run(self, frame):
        return self.impl.run(frame)
```

## 3. Add the config definition JSON

The Pipeline Editor requires a config def file to render the parameter form and validate connections.

**Secondary:** `src/secondary_operations/config_data/my_filter_config_def.json`
**Main:** `src/main_operations/definitions/config_data/my_op_config_def.json`

```json
{
  "class_name": "MyFilter",
  "description": "Applies strength-based filtering to pose estimates",
  "category": "filt",
  "input_nodes": [
    {"name": "poses", "has_default": false}
  ],
  "output_nodes": ["filtered_poses"],
  "parameters": {
    "strength": {
      "type": "float",
      "description": "Filter strength (0–1)",
      "default": 0.5,
      "min": 0.0,
      "max": 1.0
    }
  }
}
```

## 4. Wire into a pipeline

Add the operation to a pipeline in the WebUI Pipeline Editor (drag from the operation palette → connect ports → save), or edit `src/config/pipeline_config.json` manually:

```json
{
  "action_name": "my_filter.py",
  "action_params": {
    "strength": 0.7
  },
  "position": { "x": 600, "y": 100 },
  "uuid": "op-<generate-a-unique-id>",
  "connections": [...]
}
```

Injected parameters (`compute_pool`, `web_interface`, `network_table`, `camera_manager`, `camera_config_registry`, `logger`) are passed automatically — **do not include them in `action_params`**.

## 5. Verify

- Restart the backend and check logs for any `ImportError` or `ValueError` during pipeline construction.
- The operation should appear in the Pipeline Editor's operation palette (if its config def is present).
- Open the Pipeline Editor and confirm the operation's ports match your `input_nodes` / `output_nodes` config.
- Use the profiling overlay in the Pipeline Editor to confirm the operation is executing and measure its runtime.

## Optional: add `visualize()` and `update_config()`

```python
import numpy as np

def visualize(self) -> np.ndarray | None:
    """Return a BGR frame for the visualization stream, or None."""
    return self._last_debug_frame

def update_config(self, json_config: dict) -> None:
    """Apply live parameter updates without a restart."""
    for key, value in json_config.items():
        if hasattr(self, key):
            setattr(self, key, value)
```
