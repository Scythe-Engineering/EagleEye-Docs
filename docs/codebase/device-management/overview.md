# Device Management Overview

EagleEye does not wrap accelerators in a device abstraction that executes models. Instead it keeps three separate objects, all created once in `MainBackend.__init__` and injected into operations that ask for them by constructor parameter name:

| Object | File | Role |
|---|---|---|
| `DeviceRegistry` | `src/utils/device_registry.py` | Immutable inventory of inference devices discovered at startup |
| `ModelLibrary` | `src/utils/model_library.py` | Managed model metadata and artifacts under `files/models/` |
| `Mx3RuntimeCoordinator` | `src/utils/mx3_runtime.py` | Owner of shared per-device MemryX MX3 runtimes and stream bindings |

An operation that runs inference typically takes a `model_id` and a `device_id` parameter, resolves the artifact with `model_library.resolve_artifact(model_id, device_id)`, and loads it itself with the appropriate framework (Ultralytics/PyTorch, ONNX Runtime, TensorRT, or the MX3 coordinator).

## Device ID formats

| Device | Canonical ID | Example |
|---|---|---|
| CPU | `cpu` | `cpu` |
| NVIDIA CUDA GPU | `cuda:<index>` | `cuda:0`, `cuda:1` |
| MemryX MX3 | `mx3:<index>` | `mx3:0`, `mx3:1` |

IDs are exact; aliases are not accepted. CUDA indices follow `torch.cuda` enumeration order. MX3 indices come from the `/dev/memxN` node number.

## Lifecycle

1. `DeviceRegistry.discover(logger=...)` runs once in `MainBackend.__init__`. It always adds `cpu`, adds one entry per CUDA device if `torch` imports and reports CUDA available, and adds one entry per `/dev/memx[0-9]*` node on POSIX systems.
2. The registry, model library, and MX3 coordinator are passed to `EagleEyeInterface` (registry and library only) and to `generate_all_pipelines(...)`.
3. Pipeline construction injects `device_registry`, `model_library`, and `mx3_coordinator` into any operation whose `__init__` declares those parameter names.
4. Operations validate their configured `device_id` through `DeviceRegistry.get(device_id)`, which raises `DeviceNotFoundError` for unknown IDs.

There is no runtime registration or removal API: the inventory is fixed for the life of the process, and adding hardware requires a backend restart.

## When to add a new device

Supporting new accelerator hardware means extending `DeviceRegistry.discover` with a new canonical ID prefix and teaching `ModelLibrary.resolve_artifact` which artifact slot that prefix can use. See [New Device](../extension-points/new-device).
