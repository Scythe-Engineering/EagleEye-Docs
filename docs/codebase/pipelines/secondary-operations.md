# Secondary Operations

Secondary operations live in `src/secondary_operations/` as single-file, lightweight processing steps. They must extend `OperationInstance` (same as main operations) and implement a `run()` method.

## When to use secondary operations

- Operation logic fits in a single file (under ~200 lines).
- No heavy model loading, no separate module directory needed.
- Source is added and edited in the repository; the WebUI does not edit operation source.

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

The class name is `CamelCase` derived from the snake_case file name, such as `tag_filter.py` to `TagFilter`.

## Bundled secondary operations

| File | Class | Purpose |
|---|---|---|
| `angle_to_objects.py` | `AngleToObjects` | Calculates horizontal angles to detections |
| `camera_adjust.py` | `CameraAdjust` | Applies camera brightness, contrast, saturation, gain, and exposure settings |
| `camera_local_to_robot_transform.py` | `CameraLocalToRobotTransform` | Converts camera-local detections to robot coordinates |
| `camera_pose_output.py` | `CameraPoseOutput` | Sends camera poses to the WebUI |
| `camera_to_robot_pose.py` | `CameraToRobotPose` | Applies camera extrinsics to produce robot pose |
| `detected_objects_output.py` | `DetectedObjectsOutput` | Sends detected objects to the WebUI |
| `device_input.py` | `DeviceInput` | Reads frames from a camera by `camera_bus_id` |
| `extract_pose.py` | `ExtractPose` | Extracts 2D pose data from a transform |
| `flatten_pose.py` | `FlattenPose` | Removes height and 3D rotation components |
| `get_networktables_value.py` | `GetNetworktablesValue` | Reads a NetworkTables value |
| `ground_plane_intersection.py` | `GroundPlaneIntersection` | Projects detections onto the ground plane |
| `minimum_apriltag_count.py` | `MinimumApriltagCount` | Rejects frames with too few AprilTags |
| `pose_fusion.py` | `PoseFusion` | Combines pose estimates with outlier rejection |
| `pose_outlier_filter_rust.py` | `PoseOutlierFilterRust` | Filters pose outliers using predictive gating |
| `publish_to_networktables.py` | `PublishToNetworktables` | Publishes typed values to NetworkTables |
| `robot_local_to_field_transform.py` | `RobotLocalToFieldTransform` | Converts robot-local detections to field coordinates |
| `robot_pose_output.py` | `RobotPoseOutput` | Sends robot pose to the WebUI |
| `tag_filter.py` | `TagFilter` | Includes or excludes detections by AprilTag ID |

## Config definitions

Each secondary operation needs a matching config definition:

```
src/secondary_operations/config_data/<name>_config_def.json
```

For example, `minimum_apriltag_count_config_def.json` names the class, ports, category, and settings used by the pipeline editor:

```json
{
  "class_name": "MinimumApriltagCount",
  "category": "filt",
  "input_nodes": [{"name": "detections", "has_default": false}],
  "output_nodes": ["detections"],
  "parameters": {
    "minimum_detections": {
      "type": "int",
      "default": 2,
      "required": false
    }
  }
}
```


## Promoting to a main operation

If a secondary operation grows complex enough to warrant its own module or requires separate test coverage, move it to `src/main_operations/definitions/<name>.py` (rename the class to `<Name>Definition`) and create an implementation module under `src/main_operations/modules/<name>/`.
