# Operation Definitions

All operation classes — both main and secondary — must extend `OperationInstance` from `src/main_operations/definitions/base/base_class.py`.

## Base class

```python
from src.main_operations.definitions.base.base_class import OperationInstance

class MyOperation(OperationInstance):
    def __init__(self, my_param: str) -> None:
        self.my_param = my_param

    def run(self, input_data):
        # Process input_data and return output for the next node
        return input_data
```

`run()` is the only required method. The signature should accept whatever the upstream node emits. Return `None` to skip the current frame downstream.

## Optional methods

### `update_config(json_config: dict)`

Called by the WebUI when a user edits operation parameters live (without a full restart). Only operations with a config definition that has editable parameters receive this call.

```python
def update_config(self, json_config: dict) -> None:
    for key, value in json_config.items():
        if hasattr(self, key):
            setattr(self, key, value)
```

### `visualize() -> np.ndarray | None`

Called by the visualization system when the user clicks **Visualize** on an operation node in the Pipeline Editor. Should return a BGR `np.ndarray` suitable for MJPEG streaming. Return `None` to indicate nothing to show.

```python
def visualize(self) -> np.ndarray | None:
    return self._last_annotated_frame
```

## Main operations

Main operations live in `src/main_operations/definitions/` and typically wrap heavier module code under `src/main_operations/modules/`.

- **File:** `src/main_operations/definitions/<name>.py`
- **Class:** `<CamelCase>Definition` (e.g. `ApriltagCnnPreprocessorDefinition`)
- **Pattern:** Parse params → validate a `DeviceRegistry` ID → resolve a managed model artifact → instantiate implementation.

```python
from src.main_operations.modules.my_model.implementation import MyModelImpl
from src.main_operations.definitions.base.base_class import OperationInstance
from src.utils.device_registry import DeviceRegistry
from src.utils.model_library import ModelLibrary

class MyModelDefinition(OperationInstance):
    def __init__(self, model_id: str, device_id: str, device_registry: DeviceRegistry,
                 model_library: ModelLibrary) -> None:
        device_registry.get(device_id)
        artifact = model_library.resolve_artifact(model_id, device_id)
        self.impl = MyModelImpl(artifact.path, device_id)

    def run(self, frame):
        return self.impl.run(frame)
```

## Config definition JSON

Every operation that appears in the Pipeline Editor must have a matching config definition file describing its parameters. This file is used to render the parameter form in the editor and for validation.

- **Main ops:** `src/main_operations/definitions/config_data/<name>_config_def.json`
- **Secondary ops:** `src/secondary_operations/config_data/<name>_config_def.json`

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
    "model_id": {
      "type": "str",
      "description": "Managed model ID",
      "required": true,
      "ui_hint": "model_library",
      "device_param": "device_id"
    },
    "device_id": {
      "type": "str",
      "description": "Canonical device ID (e.g. cpu, cuda:0, mx3:0)",
      "required": true,
      "ui_hint": "device_registry",
      "model_param": "model_id"
    },
    "conf_threshold": {
      "type": "float",
      "description": "Detection confidence threshold",
      "default": 0.15,
      "min": 0.0,
      "max": 1.0
    }
  }
}
```

### Category values

| Category | Meaning |
|---|---|
| `prep` | Preprocessing / image transforms |
| `det` | Detection (AprilTags, objects) |
| `proc` | General processing |
| `filt` | Filtering / outlier rejection |
| `net` | NetworkTables output |

### Input/output nodes

`input_nodes` and `output_nodes` define the port names that appear as connection anchors in the Pipeline Editor. Each input node can optionally accept temporal connections (`has_default: true`).

## Secondary operations

Secondary operations live directly in `src/secondary_operations/` as a single file (no module subdirectory).

- **File:** `src/secondary_operations/<name>.py`
- **Class:** `<CamelCase>` (no `Definition` suffix)

See [Secondary Operations](./secondary-operations) for the full list and examples.
