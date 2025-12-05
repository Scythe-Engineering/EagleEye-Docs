# Pipeline Configuration

Declarative pipelines live in `src/config/pipeline_config.json`. Each camera key maps to an ordered list of operation specs.

## Schema
```json
{
  "CAM0": [
    {
      "action_name": "apriltag_cnn_preprocessor",
      "action_params": {
        "model_path": "/path/to/model.onnx",
        "device_id": "MX3",
        "conf_threshold": 0.15
      }
    },
    {
      "action_name": "detect_apriltags",
      "action_params": {
        "families": "tag36h11"
      }
    },
    {
      "action_name": "pnp_camera_localization",
      "action_params": {
        "camera_parameters_path": "/path/to/camera_parameters.yaml",
        "apriltag_map_path": "/path/to/apriltag_map.fmap"
      }
    }
  ]
}
```

## Rules
- Order matters: items are executed sequentially.
- `action_params` keys must match constructor parameters (except injected ones).
- `compute_pool` and `web_interface` inject automatically if present in the signature.
- Files referenced (models, maps, calibration) must be reachable paths.

## Adding cameras
Add a new key (e.g., `CAM1`) with its operation list. Ensure the camera thread feeds frames to that pipeline.

## Validating configs
- Ensure every `action_name` module exists in `src/main_operations/definitions/` or `src/secondary_operations/`.
- Confirm `device_id` values exist in `ComputePool`.
- Keep secondary operations small; promote to a main definition if complexity grows.



