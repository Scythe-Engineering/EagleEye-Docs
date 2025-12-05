# Configuration

## Pipeline config
- Location: `src/config/pipeline_config.json`.
- Per-camera list of operations, in execution order. Example entry:
```json
{
  "CAM0": [
    {"action_name": "apriltag_cnn_preprocessor", "action_params": {"model_path": "/path/to/model.onnx", "device_id": "MX3", "conf_threshold": 0.15}},
    {"action_name": "detect_apriltags", "action_params": {"families": "tag36h11"}},
    {"action_name": "pnp_camera_localization", "action_params": {"camera_parameters_path": "/path/to/camera_parameters.yaml", "apriltag_map_path": "/path/to/apriltag_map.fmap"}}
  ]
}
```
- `action_params` are forwarded to the operation constructor; `compute_pool` and `web_interface` inject automatically if named.

## Operation definitions
- Main: add thin wrappers under `src/main_operations/definitions/` with `{name}_config_def.json` describing parameters.
- Secondary: add to `src/secondary_operations/` with matching config definition JSON.

## Device IDs
- Ensure `device_id` values referenced in config exist in `ComputePool`.
- Common IDs: `CPU`, `CUDA_0` (example), `MX3` (example). Replace with your actual IDs.

## Paths to fill in
- `model_path`, `camera_parameters_path`, `apriltag_map_path`, and any model-specific assets.
- NetworkTables or other integration endpoints (placeholder: `your-networktables-server`).

