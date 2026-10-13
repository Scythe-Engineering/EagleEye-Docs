# NetworkTables

EagleEye publishes vision data to a NetworkTables table named `EagleEye`. Robot code reads from this table using the standard WPILib NT API.

## Initialization

```python
from src.utils import wpilib_compat as wpi

network_tables_inst = wpi.default_instance()
wpi.start_client(network_tables_inst, "EagleEye", general_conf["network_table_address"])
network_table = wpi.get_table(network_tables_inst, "EagleEye")
```

EagleEye is an NT4 **client** identified as `EagleEye`; the host at the configured address (a robot controller or simulation host) is the server. The server address comes from `src/general_conf.json`. The tracked installation config uses `localhost`; the code fallback is `0.0.0.0` when that file is absent.

`src/utils/wpilib_compat.py` selects the installed 2026 or exact 2027.0.0a7 binding API once. It owns camelCase versus snake_case NT calls and imports geometry from `wpimath.geometry` (2026) or `wpimath` (alpha-7). Unsupported or mixed `pyntcore`/`robotpy-wpimath` environments raise `ImportError`; backend startup logs the detected API and package versions.

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
options = wpi.pubsub_options(keep_duplicates=True, send_all=True)
wpi.topic(self.network_table, "struct", self.target_key, type(wpi_value)).publish(options)
# Other kinds: struct_array, double, double_array, boolean,
# boolean_array, string, string_array
```

All publisher types retain duplicate values and send all samples. Unchanged pose or quality
values must still carry each new capture timestamp; suppressing duplicates breaks exact
pose/metadata joins.

Each sample is published with its source frame's capture time:

```python
self._publisher.set(wpi_value, wpi.to_nt_publish_time(timing.capture_nt_us))
```

`capture_nt_us` travels with the value through the pipeline in `TimingMetadata`, in **microseconds for both versions**. The publish helper keeps it unchanged for 2026 and multiplies by 1000 for alpha-7's nanosecond API. The NT4 wire remains microseconds. Robot code sees capture time rather than publish time; the Java SDK uses `/1e6` for 2026 or `/1e9` for alpha-7.

`timing.now_nt_us()` normalizes the native clock to microseconds. On a 2026 Linux coprocessor the NT clock is Unix-epoch anchored; alpha-7 uses a steady/monotonic epoch. The timing module measures the offset to the host monotonic capture clock, verifies the clock rate, and caches the offset. Neither epoch nor a nonzero offset should be assumed by callers.

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

## Pipeline control and monitoring

Pipeline enable commands use `wpi.read_bool` so a published false value disables the pipeline under either binding. Completed publishing pipelines request `wpi.flush(wpi.table_instance(table))` after all branches finish. Status uses `is_connected` and `connection_count`; first-boot topic verification uses `topic_names`. These calls belong in the adapter so alpha API changes do not silently report unavailable status or ignore disable commands.
