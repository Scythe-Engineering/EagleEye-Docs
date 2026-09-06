# NetworkTables

EagleEye publishes vision data to a NetworkTables table named `EagleEye`. Robot code reads from this table using the standard WPILib NT API.

## Initialization

```python
import ntcore

network_tables_inst = ntcore.NetworkTableInstance.getDefault()
network_tables_inst.startClient4("EagleEye")
network_tables_inst.setServer(general_conf["network_table_address"])
network_table = network_tables_inst.getTable("EagleEye")
```

EagleEye is an NT4 **client** identified as `EagleEye`; the host at the configured address (normally the roboRIO) is the server. The server address comes from `src/general_conf.json`. The tracked installation config uses `localhost`; the code fallback is `0.0.0.0` when that file is absent.

## Publishing from operations

Operations that output to NetworkTables receive the `network_table` handle by dependency injection — do not list it in `action_params`.

The general-purpose publisher is `src/secondary_operations/publish_to_networktables.py` (`PublishToNetworktables`). Its parameters are:

| Parameter | Meaning |
|---|---|
| `target_key` | Entry key under `EagleEye/` |
| `schema` | `auto` (detect from the value's shape) or a forced type such as `pose3d`, `pose2d`, `transform3d`, `translation2d`, `rotation2d`, `double`, `boolean`, `string` |
| `data_path` | Optional list of keys/indices selecting a nested value out of the upstream data |

Values are converted to wpimath geometry types (`Pose2d`, `Pose3d`, `Translation2d`, `Translation3d`, `Transform2d`, `Transform3d`, `Rotation2d`, `Rotation3d`) or to plain floats, booleans, strings, and lists thereof. A 4×4 numpy matrix is converted to a pose, with the camera EDN axes rotated into WPILib NWU.

The topic type is chosen from the converted value the first time it publishes:

```python
options = ntcore.PubSubOptions(keepDuplicates=True, sendAll=True)
self.network_table.getStructTopic(self.target_key, type(wpi_value)).publish(options)
# or getStructArrayTopic / getDoubleTopic / getDoubleArrayTopic
# / getBooleanTopic / getBooleanArrayTopic / getStringTopic / getStringArrayTopic
```

All publisher types retain duplicate values and send all samples. Unchanged pose or quality
values must still carry each new capture timestamp; suppressing duplicates breaks exact
pose/metadata joins.

Each sample is published with its source frame's capture time:

```python
self._publisher.set(wpi_value, timing.capture_nt_us)
```

`capture_nt_us` travels with the value through the pipeline in `TimingMetadata`, so robot code sees the time the frame was captured rather than the time it was published.

Not every output operation uses NetworkTables — for example `robot_pose_output.py` takes `web_interface` and only forwards the pose to the WebUI 3D view.

## Table layout

```
EagleEye/
├── <target_key>   ← one topic per publish_to_networktables operation
└── ...
```

Key names are entirely determined by the `target_key` of each publishing operation; there is no enforced naming scheme, and no schema manifest is published.

## NT server address changes

The address lives in `src/general_conf.json` and is editable through `POST /save-general-conf`. Changes take effect after a backend restart, since the NT client is configured once during startup.

## Testing without a robot

Leave the tracked address at `localhost`, or point it at another locally running NT4 server (for example WPILib Glass or a simulation) for integration testing.
