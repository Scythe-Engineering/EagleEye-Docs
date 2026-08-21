# Flow Manager

`FlowManager` (`src/config/utils/flow_manager.py`) is the runtime scheduler for a pipeline's DAG. It assigns execution timesteps to operations at initialization time and drives frame-by-frame execution.

## Initialization

When a `Pipeline` is built, `FlowManager.__init__()`:
1. Runs the **forward pass** to assign each operation an execution timestep.
2. Runs the **backward pass** to assign each operation a finish timestep.
3. Calculates the number of threads required.
4. Assigns each operation to a `ThreadObject` (a reusable worker thread).

## Forward pass (topological sort)

`recursive_forward_flow_register()` implements a BFS-like topological sort:

1. Start with all operations whose inputs are all resolved (initially: data sources and operations with no non-default inputs).
2. Assign them timestep `N`.
3. Find all downstream operations connected via non-default edges from this group.
4. Recurse with timestep `N+1`.

**Temporal connections (`is_default: true`)** are excluded from the forward pass — they represent "previous frame" data and do not create ordering constraints within the current frame.

**Data sources** (operations with no inputs) get special treatment: they are initially placed at timestep 0, then moved to one timestep before their earliest downstream consumer. This ensures the freshest possible data source reading.

## Backward pass (finish timesteps)

`backward_flow_register()` calculates when each operation must be done:

```
finish_timestep = min(downstream_operation.execution_timestep) - 1
```

For terminal operations (no downstream non-default connections), `finish_timestep == execution_timestep`.

Finish timesteps are used by the threaded scheduler to know when to wait for a thread to complete before collecting its output.

## Thread allocation

`_calculate_required_threads()` computes the maximum number of operations that are simultaneously active at any timestep (considering that an operation occupies all timesteps from `execution_timestep` to `finish_timestep` inclusive).

Each operation is then assigned to the least-loaded `ThreadObject` that has no occupancy conflicts in the required timestep range.

## Runtime execution

### Single-thread pipelines (`num_threads == 1`)

`_run_flow_direct()` executes operations sequentially in timestep order with no thread synchronization. This is the common case for linear pipelines.

### Multi-thread pipelines (`num_threads > 1`)

`_run_flow_threaded()` dispatches each operation to its assigned `ThreadObject` via `set_needs_processing()`. After dispatching all operations in a timestep group, it waits for operations whose `finish_timestep` equals the current timestep via `wait_done_processing()`.

This allows parallel branches to execute concurrently while the main scheduler waits only when necessary.

## Input gathering

`_gather_operation_inputs(operation)` resolves inputs for each operation before execution:

- **Single non-default input** → returns the current frame's output from the upstream operation directly.
- **Single default (temporal) input** → returns the previous frame's output (from `previous_operation_outputs`). Returns `None` on the first frame.
- **Multiple inputs** → returns a dict keyed by `to_port` name, mixing current and previous frame outputs.
- **Data source** → returns `None` (generates its own data).

## Profiling

After every frame, `_record_profile_snapshot()` captures:
- `frame_time_ms` — total frame wall-clock time
- Per-operation `execution_time_ms`
- Per-timestep `total_time_ms` + slowest operation

Snapshots are stored under `_profile_lock` and read by `get_latest_profile_snapshot()` from the SSE publisher thread.

## Error handling

- `TypeError` with `"None"` in the message → silently skip the current frame (operation received `None` input; expected on first frame for temporal connections).
- Other exceptions → call `on_operation_error` to record the error for later SSE publication, then raise `ValueError`.
- Thread timeout (5 s) → reset thread state and raise `ValueError`.
