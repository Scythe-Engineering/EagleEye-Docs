# Device Types

Devices are described by `DeviceDescriptor`, a frozen dataclass in `src/utils/device_registry.py`:

```python
@dataclass(frozen=True, slots=True)
class DeviceDescriptor:
    device_id: str        # canonical ID, e.g. "cpu", "cuda:0", "mx3:0"
    display_name: str     # human-readable hardware label
    device_type: str      # "cpu", "cuda", or "mx3"
    physical_index: int | None  # None for CPU
```

The descriptor carries no execution methods. How a model actually runs is decided by the operation that uses the device ID.

## CPU

- **ID:** `cpu`
- **Display name:** `platform.processor()`, falling back to `"CPU"`
- **Artifacts:** `ModelLibrary.resolve_artifact` prefers `onnx`, then `pt`

CPU is always present in the inventory, on every platform.

## CUDA

- **IDs:** `cuda:0`, `cuda:1`, … in `torch.cuda` enumeration order
- **Display name:** `torch.cuda.get_device_name(index)`
- **Artifacts:** preference order `engine` (TensorRT), then `pt`, then `onnx`
- **Requirements:** NVIDIA driver plus a CUDA-enabled `torch` build

Discovery imports `torch` lazily. `ImportError`, `RuntimeError`, and `OSError` are caught and logged, and the inventory continues with no CUDA entries.

## MemryX MX3

- **IDs:** `mx3:0`, `mx3:1`, … taken from the `/dev/memxN` node number
- **Display name:** `MemryX MX3 (/dev/memxN)`
- **Artifacts:** requires an `mx3_dfp` artifact and `mx3_profile` metadata on the model record; an optional `mx3_postprocessor` artifact is returned alongside it
- **Requirements:** MemryX SDK and driver providing `/dev/memx*`

Node discovery uses `glob.glob("/dev/memx[0-9]*")` and only runs when `os.name == "posix"`. Devices are sorted by index so the inventory is deterministic.

Execution on MX3 is not performed by the descriptor. `Mx3RuntimeCoordinator` owns one runtime per physical device and hands operations an `Mx3StreamBinding`, which feeds frames through `input_callback`/`output_callback` and yields `Mx3ResultPacket` values.

## Testing hooks

`DeviceRegistry.discover` accepts `cuda_devices` and `mx3_paths` keyword arguments so tests can build a deterministic inventory without hardware.
