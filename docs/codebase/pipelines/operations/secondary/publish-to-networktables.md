# Publish to NetworkTables

`PublishToNetworktables` publishes an upstream value to a native NetworkTables primitive or WPILib struct topic, then passes the original input downstream.

## Inputs

`data` may be a primitive, primitive array, supported pose dictionary, 4 by 4 NumPy pose matrix, or a sequence of supported values. `data_path` can select a nested value first.

## Outputs

The unchanged `data`. Unsupported, missing, `None`, and empty-array selections are not published.

## When to use

Use this when the robot needs a pipeline result through NetworkTables. Choose an explicit schema when automatic conversion is ambiguous.

## Configuration

- `target_key`: Required topic key.
- `schema`: Conversion hint, default `auto`. Supported hints are `double`, `float`, `number`, `boolean`, `bool`, `string`, `double_array`, `float_array`, `number_array`, `pose2d`, `pose3d`, `transform2d`, `transform3d`, `translation2d`, `translation3d`, `rotation2d`, and `rotation3d`.
- `data_path`: Optional keys or indices, supplied as a dotted string or list. One field name on a sequence extracts that field from matching dictionaries.

## Timestamp behavior

Timed values retain their `TimingMetadata.capture_nt_us` timestamp in **microseconds**, regardless of the installed RobotPy version. Nested selection preserves that timing. Untimed values use publish time. Robot-side pose estimators need capture time rather than later processing time.

At the native publisher boundary, `wpilib_compat.to_nt_publish_time(capture_nt_us)` uses:

| Coprocessor bindings | Native publisher timestamp | Clock epoch on Linux |
| --- | --- | --- |
| 2026 | `capture_nt_us` (microseconds) | Unix-epoch anchored NT clock |
| 2027 alpha-7 | `capture_nt_us * 1000` (nanoseconds) | Steady/monotonic NT clock |

`timing.now_nt_us()` normalizes the clock in the opposite direction. The capture adapter measures the NT-to-host-monotonic offset and checks the clock rate; alpha offsets may be near zero. Do not assume offset magnitude or reuse a Unix timestamp as an alpha NT timestamp.

Pose and metadata from the same solve must receive the same capture timestamp. Publishers keep duplicate values and send all samples, so repeated stationary frames remain distinct. The NT4 wire format still uses microseconds; only the native alpha API boundary scales to nanoseconds. The Java SDK then converts its timestamp to seconds with `/1e6` (2026) or `/1e9` (alpha-7), under the robot's default time source. See [robot integration](../../../../user-guide/robot-integration#why-you-do-not-subtract-latency) for the custom `RobotController.setTimeSource` caveat.

The first publish fixes the topic type. Changing `target_key` creates a new publisher. Changing `schema` alone does not recreate one already in use.
