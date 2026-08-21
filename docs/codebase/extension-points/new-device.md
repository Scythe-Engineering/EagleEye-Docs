# Adding a New Device

There is no device plugin interface. A device is a descriptor in `DeviceRegistry` plus an artifact-selection rule in `ModelLibrary`; the code that actually runs a model lives in the operation that uses the device.

## 1. Extend discovery

Add the detection branch to `DeviceRegistry.discover` in `src/utils/device_registry.py`, appending one `DeviceDescriptor` per unit:

```python
DeviceDescriptor(
    device_id=f"coral:{index}",       # canonical, lowercase, colon-separated
    display_name=f"Coral Edge TPU ({path})",
    device_type="coral",
    physical_index=index,
)
```

Follow the existing conventions: import vendor SDKs lazily inside the branch, catch `ImportError`/`RuntimeError`/`OSError` and log rather than raise, and emit devices in a deterministic order. Add an optional keyword argument (like the existing `cuda_devices` and `mx3_paths`) so tests can inject a fake inventory.

## 2. Teach ModelLibrary about the artifact slot

`ModelLibrary.resolve_artifact` (`src/utils/model_library.py`) maps a device ID prefix to an ordered tuple of artifact slots and raises `ArtifactError` for anything it does not recognize. Add a branch for the new prefix and, if the device needs extra metadata or a companion file, follow the `mx3_dfp` / `mx3_profile` / `mx3_postprocessor` pattern.

## 3. Use the device in an operation

The operation declares `device_registry` and `model_library` in its `__init__` so pipeline construction injects them, then validates and resolves:

```python
def __init__(self, device_registry, model_library, model_id: str, device_id: str, ...):
    device_registry.get(device_id)          # raises DeviceNotFoundError on bad IDs
    artifact = model_library.resolve_artifact(model_id, device_id)
    self._session = load_my_runtime(artifact.path)
```

If the hardware needs a long-lived shared runtime across operations, that belongs in a coordinator object created in `MainBackend.__init__` and added to the injectable dependency set in `src/config/utils/pipeline.py`, as `mx3_coordinator` is.

## 4. Expose it in configuration

Declare the parameters in the operation's `_config_def.json` so the Web UI renders the right pickers:

```json
"device_id": {
  "type": "str",
  "description": "Inference device",
  "default": "cpu",
  "required": true,
  "restart_for_change": true,
  "ui_hint": "device_registry",
  "model_param": "model_id",
  "allowed_device_kinds": ["cpu", "coral"]
}
```

`allowed_device_kinds` filters by `DeviceDescriptor.device_type`. Because discovery runs once at startup, new hardware requires a backend restart before it appears.
