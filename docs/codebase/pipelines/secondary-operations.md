# Secondary Operations

Secondary operations live in `src/secondary_operations/` as single-file, lightweight processing steps. They must extend `OperationInstance` (same as main operations) and implement a `run()` method.

## When to use secondary operations

- Operation logic fits in a single file (under ~200 lines).
- No heavy model loading, no separate module directory needed.
- Can also be written and edited in-browser via the **Custom Ops** tab in the WebUI.

## Pattern

```python
from typing import Any
from src.main_operations.definitions.base.base_class import OperationInstance

class MySecondaryOp(OperationInstance):
    def __init__(self, threshold: float = 0.5) -> None:
        self.threshold = threshold

    def run(self, input_data: Any) -> Any:
        # Transform input_data and return output
        return input_data
```

The class name is `CamelCase` derived from the snake_case file name (e.g. `velocity_based_filtering.py` → `VelocityBasedFiltering`).

## Bundled secondary operations

| File | Class | Description |
|---|---|---|
| `device_input.py` | `DeviceInput` | Data-source node that reads frames from a camera by `bus_id` |
| `detect_apriltags.py` | `DetectApriltags` | Runs the `pupil-apriltags` detector on a frame |
| `pnp_camera_localization.py` | `PnpCameraLocalization` | Solves PnP using tag detections + map, returns 3D camera pose |
| `flatten_pose.py` | `FlattenPose` | Drops the height/pitch/roll components, returns a 2D pose |
| `robot_pose_output.py` | `RobotPoseOutput` | Publishes robot pose to NetworkTables |
| `fps_limiter.py` | `FpsLimiter` | Throttles downstream processing to a target FPS |
| `velocity_based_filtering.py` | `VelocityBasedFiltering` | Rejects pose outliers using MAD-based velocity filtering |
| `temporal_acceleration_preprocessor_rust.py` | `TemporalAccelerationPreprocessorRust` | Rust-backed temporal region-of-interest preprocessor |
| `dynamic_pose_group_test.py` | `DynamicPoseGroupTest` | Development/test operation for multi-input pose comparison |

## Config definitions

Each secondary operation must have a matching config definition JSON at:

```
src/secondary_operations/config_data/<name>_config_def.json
```

Example for `velocity_based_filtering.py`:

```json
{
  "class_name": "VelocityBasedFiltering",
  "description": "Filters pose estimates using MAD-based velocity rejection",
  "category": "filt",
  "input_nodes": [
    {"name": "poses", "has_default": false}
  ],
  "output_nodes": ["filtered_poses"],
  "parameters": {
    "velocity_mad_multiplier": {
      "type": "float",
      "description": "Outlier rejection multiplier",
      "default": 3.0,
      "min": 1.0,
      "max": 10.0
    }
  }
}
```

## Custom operations via WebUI

The **Custom Ops** tab in the WebUI provides a CodeMirror editor to create, edit, and lint secondary operations directly in the browser. Saving a custom op writes atomically to `src/secondary_operations/<name>.py` and its config JSON, and sets the `restart_required` flag. See [Custom Ops](../../user-guide/webui-usage#custom-ops-tab) in the User Guide for the workflow.

## Promoting to a main operation

If a secondary operation grows complex enough to warrant its own module or requires separate test coverage, move it to `src/main_operations/definitions/<name>.py` (rename the class to `<Name>Definition`) and create an implementation module under `src/modules/<name>/`.
