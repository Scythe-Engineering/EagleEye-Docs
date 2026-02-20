# Pipeline Configuration

Pipelines are declared in `src/config/pipeline_config.json`. The WebUI Pipeline Editor reads and writes this file automatically via the `/save-pipeline-config/<name>` API endpoint.

## Real-world example

This is a trimmed excerpt from the actual `pipeline_config.json` showing the key schema fields:

```json
{
  "Test": [
    {
      "action_name": "device_input.py",
      "action_params": {
        "bus_id": "basic_test",
        "frame_rotation": 0
      },
      "position": { "x": 100, "y": 100 },
      "uuid": "op-mljk5q36-arwb",
      "connections": [
        {
          "from_uuid": "op-mljk5q36-arwb",
          "from_port": "frame",
          "to_uuid": "op-mljk60f4-az78",
          "to_port": "frame",
          "data_type": "frame",
          "is_default": false,
          "custom_waypoints": null
        }
      ]
    },
    {
      "action_name": "temporal_acceleration_preprocessor_rust.py",
      "action_params": {
        "camera_bus_id": "basic_test",
        "apriltag_map_path": "{project_root}/files/apriltag_map_path/frc2025r2.json",
        "padding_factor": 0.35,
        "max_regions": 20,
        "min_region_size_px": 16
      },
      "position": { "x": 380, "y": 100 },
      "uuid": "op-mljk60f4-az78",
      "connections": [...]
    },
    {
      "action_name": "pnp_camera_localization.py",
      "action_params": {
        "camera_bus_id": "basic_test",
        "apriltag_map_path": "{project_root}/files/apriltag_map_path/frc2025r2.json",
        "jump_threshold": 2
      },
      "position": { "x": 1140, "y": 100 },
      "uuid": "op-mljk64nf-hrl6",
      "connections": [
        {
          "from_uuid": "op-mljk64nf-hrl6",
          "from_port": "camera_pose",
          "to_uuid": "op-mljk60f4-az78",
          "to_port": "camera_pose",
          "data_type": "camera_pose",
          "is_default": true,
          "custom_waypoints": [...]
        }
      ]
    }
  ]
}
```

## Schema reference

### Operation node

| Field | Type | Required | Description |
|---|---|---|---|
| `action_name` | `string` | yes | Module file name including `.py` |
| `action_params` | `object` | yes | Constructor kwargs (excludes injected params) |
| `position` | `{x, y}` | yes | Canvas layout position (cosmetic) |
| `uuid` | `string` | yes | Unique node ID (`op-<random>`) |
| `connections` | `array` | yes | Outgoing edges from this node |

### Connection (edge)

| Field | Type | Description |
|---|---|---|
| `from_uuid` | `string` | UUID of the source node |
| `from_port` | `string` | Named output port on the source |
| `to_uuid` | `string` | UUID of the destination node |
| `to_port` | `string` | Named input port on the destination |
| `data_type` | `string` | Informational type label (used by the editor UI) |
| `is_default` | `bool` | `true` = temporal edge (previous frame's output) |
| `custom_waypoints` | `array\|null` | Editor canvas routing waypoints (cosmetic) |

## The `{project_root}` token

Any string in `action_params` containing `{project_root}` is substituted with the absolute path to the project root at pipeline build time. This keeps configs portable across machines:

```json
"apriltag_map_path": "{project_root}/files/apriltag_map_path/frc2025r2.json"
```

## Adding a new pipeline

1. Add a new top-level key to `pipeline_config.json` with at least a `device_input.py` node configured with the correct `bus_id`.
2. Connect downstream operations as edges in the `connections` array.
3. Restart the backend (or click **Restart** in the Settings tab).

The easier route is to use the **Pipeline Editor** in the WebUI, which generates the JSON automatically and saves it on every change.

## Validation checklist

- Every `action_name` exists as a file in `src/main_operations/definitions/` or `src/secondary_operations/`.
- Every `device_id` in `action_params` matches a registered device ID (`CPU`, `GPU_0`, `MX3_0`).
- The connection graph is acyclic (except for temporal `is_default` edges, which are allowed feedback loops).
- All `uuid` values are unique within the pipeline.
- Paths using `{project_root}` resolve to files that exist on the target machine.
