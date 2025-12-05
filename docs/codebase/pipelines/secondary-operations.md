# Secondary Operations

Secondary operations live in `src/secondary_operations/` and should stay concise (single file, under ~200 lines). They often transform outputs, filter data, or publish results.

## Pattern
- File: `src/secondary_operations/{name}.py`
- Class: `CamelCase` (no `Definition` suffix)
- Implements `run(self, input)`; may expose `back_propagate_input` if needed.

### Example: filtering
```python
# src/secondary_operations/velocity_based_filtering.py
class VelocityBasedFiltering:
    def __init__(self, velocity_mad_multiplier: float = 3.0):
        self.velocity_mad_multiplier = velocity_mad_multiplier

    def run(self, pose_estimates):
        # Apply MAD-based filter (placeholder)
        return pose_estimates
```

## Config definitions
- Path: `src/secondary_operations/config_data/{name}_config_def.json`
- Same schema as main operations but `class_name` matches the secondary class.

```json
{
  "class_name": "VelocityBasedFiltering",
  "description": "Filters robot pose estimates using velocity measurements",
  "category": "filt",
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

## Common secondary ops
- `flatten_pose.py`: drop height/rotation components.
- `robot_pose_output.py`: emit robot pose.
- `publish_to_networktables.py`: publish over NetworkTables (ensure server reachable).
- `fps_limiter.py`: throttle processing rate.

## Guidance
- Keep logic small; if complexity grows, promote to a main operation with a module.
- Ensure `action_params` cover all non-injected arguments.



