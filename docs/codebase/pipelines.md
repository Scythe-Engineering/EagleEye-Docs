# Pipelines

Concise guide to the pipeline system that processes each camera frame.

## Architecture
- Orchestrator: `src/config/utils/pipeline.py` defines `Pipeline` (loads config, instantiates ops, runs steps, optional timing).
- Builder: `src/config/utils/generate_all_pipelines.py` reads `pipeline_config.json` and returns pipelines for all cameras.
- Operation lookup order: `src/main_operations/definitions/{action_name}.py`, then `src/secondary_operations/{action_name}.py`.
- Dependency injection: constructor params named `web_interface` or `compute_pool` are auto-injected.

## Configuration (short form)
`src/config/pipeline_config.json` contains per-camera operation lists:
```json
{
  "CAM0": [
    {"action_name": "apriltag_cnn_preprocessor", "action_params": {"model_path": "/path/to/model.onnx", "device_id": "MX3", "conf_threshold": 0.15}},
    {"action_name": "detect_apriltags", "action_params": {"families": "tag36h11"}},
    {"action_name": "pnp_camera_localization", "action_params": {"camera_parameters_path": "/path/to/camera_parameters.yaml", "apriltag_map_path": "/path/to/apriltag_map.fmap"}}
  ]
}
```

## Creating operations
- Main definitions: place thin wrappers in `src/main_operations/definitions/{name}.py` with class `CamelCaseDefinition`.
- Secondary operations: place logic in `src/secondary_operations/{name}.py` with class `CamelCase`.
- Heavy logic: put in `src/modules/{name}/implementation.py` and delegate from the definition.
- Config definitions: add `{name}_config_def.json` under `src/main_operations/definitions/config_data/` or `src/secondary_operations/config_data/` to describe parameters.

## Run contract
- Implement `run(self, input)`; document input/output types in the class docstring.
- Optional `back_propagate_input(self, input_data) -> None` to support BackPropagate adjustments.

## Debugging
- Enable `debug_mode` in `src/config/utils/pipeline.py` for per-op timings and FPS.
- Verify module resolution order if an operation fails to import.

## Minimal usage
```python
from src.config.utils.generate_all_pipelines import generate_all_pipelines
from src.webui.web_server import EagleEyeInterface
from src.utils.device_management_utils.compute_pool import ComputePool

web_interface = EagleEyeInterface()
compute_pool = ComputePool()
pipelines = generate_all_pipelines(web_interface, compute_pool)
# Start camera threads and call Pipeline.run(frame)
```

