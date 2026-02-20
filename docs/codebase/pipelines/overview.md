# Pipelines Overview

A pipeline is a directed acyclic graph (DAG) of processing operations, run per-camera frame. Pipelines are defined in `src/config/pipeline_config.json` and assembled at startup by `generate_all_pipelines()`.

## DAG model

Operations are **nodes**; connections between them are **directed edges**. Each node has named input and output **ports**. An edge carries data from one node's output port to another node's input port.

Two connection types exist:
- **Normal connections** (`is_default: false`) — carry the **current frame's** output from the upstream node.
- **Temporal connections** (`is_default: true`) — carry the **previous frame's** output. Used for feedback loops, e.g. passing the last known pose back into a preprocessing step.

Every operation node has a stable `uuid` (e.g. `op-mljk5q36-arwb`) that persists across pipeline editor saves and is used as the key in `FlowManager.operation_outputs`.

## Operation resolution

When a pipeline is built, each `action_name` is resolved in this order:

1. `src/main_operations/definitions/<name>` — class named `<CamelCase>Definition`
2. `src/secondary_operations/<name>` — class named `<CamelCase>` (no `Definition` suffix)

The `.py` extension is stripped before the class name is derived, so `detect_apriltags.py` maps to `DetectApriltags` in secondary ops or `DetectApriltags` in main ops.

## Dependency injection

These parameters are automatically passed to any operation constructor that declares them by name — **do not include them in `action_params`**:

| Parameter | Type |
|---|---|
| `web_interface` | `EagleEyeInterface` |
| `compute_pool` | `ComputePool` |
| `network_table` | `NetworkTable` |
| `camera_manager` | `CameraThreadManager` |
| `camera_config_registry` | `CameraConfigRegistry` |
| `logger` | `Logger` |

## Execution scheduling

`FlowManager` computes the execution schedule at initialization time via a topological sort (forward pass) and a backward pass for finish timesteps. At runtime, operations are dispatched in timestep groups. If the schedule requires parallel execution, multiple `ThreadObject` workers run concurrently. Single-branch pipelines run on one thread with no synchronization overhead.

See [Flow Manager](./flow-manager) for details.

## Profiling

Every frame, `FlowManager` records a profiling snapshot with per-operation and per-timestep wall-clock runtimes. These snapshots are published to the frontend via the SSE `pipeline_profile` event every 300 ms and displayed in the Pipeline Editor.

## Debugging

- Set `debug_mode = True` in `src/config/utils/pipeline.py` to enable verbose per-op timing to stdout.
- Pipeline errors are published via SSE `pipeline_error` events and shown as red indicators in the Pipeline Editor.
- Check backend logs for `ImportError` (wrong class name) or `ValueError` (no thread available) during pipeline construction.
