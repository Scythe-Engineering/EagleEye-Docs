---
title: Device Registry
sidebar_label: Device Registry
---

# Device Registry

`DeviceRegistry` (`src/utils/device_registry.py`) is an immutable inventory of the inference devices found at startup. It replaces the older compute-pool design: it does not create, own, or stop device objects, and it has no registration API after construction.

## API

```python
from src.utils.device_registry import DeviceNotFoundError, DeviceRegistry

# Built once in MainBackend.__init__
registry = DeviceRegistry.discover(logger=logger)

# Full inventory, deterministic order (cpu, then cuda:N, then mx3:N)
for descriptor in registry.descriptors():
    print(descriptor.device_id, descriptor.display_name, descriptor.device_type)

# Exact-ID lookup; aliases are not accepted
descriptor = registry.get("cuda:0")

try:
    registry.get("GPU_0")
except DeviceNotFoundError:
    ...
```

Direct construction from descriptors is also supported (`DeviceRegistry(devices)`); duplicate canonical IDs raise `DeviceRegistryError`.

## Discovery

`DeviceRegistry.discover()` performs, in order:

1. Always append `cpu`, with `platform.processor()` as the display name.
2. Import `torch` lazily. If `torch.cuda.is_available()`, append `cuda:<i>` for each device up to `torch.cuda.device_count()`. `ImportError`, `RuntimeError`, and `OSError` are logged and treated as "no CUDA".
3. On POSIX, glob `/dev/memx[0-9]*` and append `mx3:<n>` for each numeric suffix, sorted by index.

Discovery runs exactly once per process. Hot-plugged hardware is not picked up until restart.

## Error behavior

`DeviceRegistryError` is the base class; `DeviceNotFoundError` subclasses it and `KeyError`. Operations that validate `device_id` at construction surface bad IDs during pipeline creation, which `generate_all_pipelines` reports through `publish_operation_errors(...)` to the Web UI rather than crashing the backend.

`ModelLibrary.resolve_artifact` raises `ArtifactError` for a device ID it cannot map to an artifact slot, including syntactically invalid IDs.

## Thread safety

The registry is read-only after construction, so concurrent reads from pipeline threads are safe. `ModelLibrary` guards its manifest with an `RLock`; the registry needs no lock.
