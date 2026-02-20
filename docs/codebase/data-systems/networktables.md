# NetworkTables

EagleEye publishes vision data to a NetworkTables table named `EagleEye`. Robot code reads from this table using the standard WPILib NT API.

## Initialization

```python
from networktables import NetworkTables

NetworkTables.initialize(server=general_conf["network_table_address"])
network_table = NetworkTables.getTable("EagleEye")
```

The server address comes from `src/general_conf.json`. Set to `0.0.0.0` to disable NT publishing (useful when testing without a robot).

## Schema manifest

At startup, the binary schema manifest is published to:

```
EagleEye/schema_manifest  →  raw bytes (FPKM format)
```

This allows dashboards (SmartDashboard, Elastic) and robot code to discover which data types EagleEye is publishing. See [Flatpack Schema](./flatpack-schema) for the manifest format.

## Pipeline data

Operations that output data to NetworkTables (e.g. `robot_pose_output.py`) receive the `network_table` handle via dependency injection and publish directly:

```python
class RobotPoseOutput(OperationInstance):
    def __init__(self, network_table) -> None:
        self.network_table = network_table

    def run(self, pose_2d):
        if pose_2d is None:
            return None
        # Serialize and publish
        payload = flatpack_serialize(pose_2d)
        self.network_table.putRaw("pose2d", payload)
        return pose_2d
```

The `network_table` parameter is automatically injected — do not include it in `action_params`.

## Table layout (example)

```
EagleEye/
├── schema_manifest         ← binary FPKM manifest (published at startup)
├── pose2d                  ← robot 2D pose from active pipeline
├── pose3d                  ← camera 3D pose (optional)
└── ...                     ← additional keys published by your operations
```

Key names are determined by the individual operations that publish them. There is no enforced schema for key names — they are whatever the operation writes.

## Per-pipeline enable/disable

The Settings tab in the WebUI allows individual pipelines to be enabled or disabled for NT output. When a pipeline is disabled, its operations still run (for WebUI display), but they do not write to NetworkTables.

This is managed by a flag on the `Pipeline` object that operations can check via the `web_interface` injection.

## NT server address changes

The NT server address is stored in `src/general_conf.json` and is editable via `POST /save-general-conf`. Changes take effect after restarting the backend — NT must be re-initialized with the new server address.

## Testing without a robot

During development, set the NT address to `0.0.0.0`. EagleEye starts normally; NT calls are no-ops or connect to a local NT server. Use `ntcore-server` or Glass (WPILib) to run a local NT server for integration testing.
