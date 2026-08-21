# Adding a New Operation

EagleEye has **secondary** operations (single-file processing) and **main** operations (a definition plus heavier implementation code). Both extend `OperationInstance`. Operation source is added in the repository; the WebUI has no Custom Ops source editor.

## 1. Add the class

For a simple secondary operation, create `src/secondary_operations/my_transform.py`:

```python
from typing import Any
from src.main_operations.definitions.base.base_class import OperationInstance

class MyTransform(OperationInstance):
    def __init__(self, min_confidence: float = 0.5) -> None:
        self.min_confidence = min_confidence

    def run(self, input_data: Any) -> Any:
        if input_data is None:
            return None
        return [item for item in input_data if item["confidence"] >= self.min_confidence]
```

For inference or shared implementation code, put a `*Definition` class in `src/main_operations/definitions/` and implementation code below `src/main_operations/modules/`. Constructors can request `device_registry` and `model_library`; pipeline construction injects both. Validate the exact canonical device ID (`cpu`, `cuda:N`, or `mx3:N`) and resolve its managed artifact rather than using the removed `ComputePool` API.

```python
class MyModelDefinition(OperationInstance):
    def __init__(self, model_id, device_id, device_registry, model_library):
        device_registry.get(device_id)
        artifact = model_library.resolve_artifact(model_id, device_id)
        # Load artifact.path in this operation's runtime.
```

## 2. Add the config definition

Create a matching JSON file:

- secondary: `src/secondary_operations/config_data/my_transform_config_def.json`
- main: `src/main_operations/definitions/config_data/my_model_config_def.json`

The definition supplies the class name, category, input/output ports, and editable parameters. For managed inference, use `ui_hint: "model_library"` on `model_id` and `ui_hint: "device_registry"` on `device_id` (with the reciprocal `device_param`/`model_param` fields); see an existing object-detection config definition for the complete shape.

## 3. Add it to a pipeline

Use the Pipeline tab or edit `src/config/pipeline_config.json`. `action_params` contains only configured values, never injected dependencies such as `network_table`, `camera_manager`, `camera_config_registry`, `device_registry`, `model_library`, or `logger`.

## 4. Restart and verify

Restart the backend after source/config changes. Confirm the operation appears in the Pipeline palette, its ports connect as expected, and its pipeline starts without construction errors. `visualize()` may return a BGR frame for the visualization stream; `update_config()` handles live changes for parameters that do not require restart.
