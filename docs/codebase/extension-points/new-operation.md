# Adding a New Operation

EagleEye supports two operation types: **secondary** (single-file, lightweight) and **main** (wrapper + module, for heavy logic). Both must extend `OperationInstance`.

## Path 1: Secondary operation (recommended for simple logic)

Secondary operations are ideal for: data transformations, filtering, output/publish steps, or any logic that fits in a single file.

### Option A: In-browser via Custom Ops tab

1. Open the WebUI at `http://localhost:5001`
2. Go to the **Custom Ops** tab
3. Click **New Operation**, enter a snake_case name (e.g. `my_transform`)
4. Edit the generated class template in the CodeMirror editor
5. Edit the config JSON in the right panel
6. Click **Lint** to check syntax → **Save** to write files
7. Restart the backend

### Option B: Write the file directly

**`src/secondary_operations/my_transform.py`:**

```python
from typing import Any
from src.main_operations.definitions.base.base_class import OperationInstance


class MyTransform(OperationInstance):
    """Applies a simple threshold to pose confidence scores."""

    def __init__(self, min_confidence: float = 0.5) -> None:
        self.min_confidence = min_confidence

    def run(self, input_data: Any) -> Any:
        if input_data is None:
            return None
        # Filter poses below confidence threshold
        return [p for p in input_data if p.confidence >= self.min_confidence]

    def update_config(self, json_config: dict[str, Any]) -> None:
        for key, value in json_config.items():
            if hasattr(self, key):
                setattr(self, key, value)
```

**`src/secondary_operations/config_data/my_transform_config_def.json`:**

```json
{
  "class_name": "MyTransform",
  "description": "Filters poses by confidence score",
  "category": "filt",
  "input_nodes": [
    {"name": "poses", "has_default": false}
  ],
  "output_nodes": ["filtered_poses"],
  "parameters": {
    "min_confidence": {
      "type": "float",
      "description": "Minimum confidence score to keep",
      "default": 0.5,
      "min": 0.0,
      "max": 1.0
    }
  }
}
```

## Path 2: Main operation (for model inference or complex logic)

### Create the wrapper

**`src/main_operations/definitions/my_model.py`:**

```python
from src.modules.my_model.implementation import MyModelImpl
from src.utils.device_management_utils.compute_pool import ComputePool
from src.main_operations.definitions.base.base_class import OperationInstance


class MyModelDefinition(OperationInstance):
    """Runs MyModel on a frame and returns detections."""

    def __init__(
        self,
        model_path: str,
        device_id: str,
        compute_pool: ComputePool,
        conf_threshold: float = 0.15,
    ) -> None:
        device = compute_pool.get_compute_device(device_id)
        self.impl = MyModelImpl(model_path, device, conf_threshold)

    def run(self, frame):
        return self.impl.run(frame)

    def visualize(self):
        return self.impl.get_debug_frame()
```

### Create the module

**`src/modules/my_model/implementation.py`:**

```python
import onnxruntime as ort
import numpy as np

class MyModelImpl:
    def __init__(self, model_path: str, device, conf_threshold: float) -> None:
        providers = device.get_onnx_providers()  # device-specific
        self.session = ort.InferenceSession(model_path, providers=providers)
        self.conf_threshold = conf_threshold
        self._last_debug_frame = None

    def run(self, frame: np.ndarray):
        # ... inference logic ...
        return detections

    def get_debug_frame(self):
        return self._last_debug_frame
```

### Create the config def

**`src/main_operations/definitions/config_data/my_model_config_def.json`:**

```json
{
  "class_name": "MyModelDefinition",
  "description": "Runs MyModel inference on a frame",
  "category": "det",
  "input_nodes": [
    {"name": "frame", "has_default": false}
  ],
  "output_nodes": ["detections"],
  "parameters": {
    "model_path": {
      "type": "str",
      "description": "Path to ONNX weights (supports {project_root} token)",
      "required": true
    },
    "device_id": {
      "type": "str",
      "description": "Compute device ID (CPU, GPU_0, MX3_0)",
      "required": true
    },
    "conf_threshold": {
      "type": "float",
      "description": "Confidence threshold",
      "default": 0.15,
      "min": 0.0,
      "max": 1.0
    }
  }
}
```

## Wire into a pipeline

Add in the WebUI Pipeline Editor, or directly in `pipeline_config.json`:

```json
{
  "action_name": "my_model.py",
  "action_params": {
    "model_path": "{project_root}/files/models/my_model.onnx",
    "device_id": "GPU_0",
    "conf_threshold": 0.2
  },
  "uuid": "op-<unique-id>",
  "position": {"x": 400, "y": 100},
  "connections": [...]
}
```

## Testing

Write a pytest test that:
1. Creates a `ComputePool` with a `CPU` device
2. Instantiates your operation with test params
3. Calls `run()` with a test frame (real or synthetic `np.ndarray`)
4. Asserts the output shape/type is correct

```python
import numpy as np
from src.utils.device_management_utils.compute_pool import ComputePool
from src.utils.device_management_utils.cpu import CPU
from src.main_operations.definitions.my_model import MyModelDefinition

def test_my_model_runs():
    pool = ComputePool()
    pool.add_compute_device(CPU())
    op = MyModelDefinition("path/to/model.onnx", "CPU", pool)
    frame = np.zeros((720, 1280, 3), dtype=np.uint8)
    result = op.run(frame)
    assert result is not None
```
