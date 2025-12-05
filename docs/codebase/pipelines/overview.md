# Pipelines Overview

Pipelines are frame-processing chains defined in JSON and assembled at runtime. They resolve operations, wire compute devices, and run per-camera.

## Core files
- `src/config/utils/pipeline.py`: `Pipeline` class; loads modules, injects dependencies, runs steps, optional timing.
- `src/config/utils/generate_all_pipelines.py`: builds pipelines for each camera defined in `pipeline_config.json`.
- `src/config/pipeline_config.json`: declarative list of operations per camera.

## Resolution order
1. Try `src/main_operations/definitions/{action_name}.py` (class `CamelCaseDefinition`).
2. Fallback `src/secondary_operations/{action_name}.py` (class `CamelCase`).

## Dependency injection
Constructors that include `compute_pool` or `web_interface` receive them automatically. Other parameters must be provided in `action_params`.

## Run loop (simplified)
```python
from src.config.utils.generate_all_pipelines import generate_all_pipelines
from src.webui.web_server import EagleEyeInterface
from src.utils.device_management_utils.compute_pool import ComputePool

web_interface = EagleEyeInterface()
compute_pool = ComputePool()
pipelines = generate_all_pipelines(web_interface, compute_pool)

# Camera thread
frame = ...  # np.ndarray
pipelines["CAM0"].run(frame)
```

## Debugging
- Set `debug_mode = True` in `pipeline.py` to print per-op timings and FPS.
- Import errors: confirm module name matches `action_name` and is present in main/secondary paths.



