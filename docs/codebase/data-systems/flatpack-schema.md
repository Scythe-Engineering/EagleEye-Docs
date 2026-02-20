# Flatpack Schema

EagleEye uses a custom binary serialization format called **Flatpack** (FPKM — FlatPacK Manifest) for publishing structured data to NetworkTables. It is designed to be compact, typed, and self-describing via a schema manifest.

## Schema manifest

At startup, `generate_schema_manifest_bytes()` (`src/utils/flatpack_schema/schema_manifest.py`) produces a binary manifest describing all known schemas. This manifest is published to `EagleEye/schema_manifest` in NetworkTables.

### Manifest wire format

```
Header:  [4 bytes] b"FPKM"
Version: [1 byte]  uint8 = 1
Length:  [4 bytes] uint32 LE — length of the payload
Payload: [N bytes] packed schema descriptors
```

### Schema descriptor encoding

Each schema descriptor in the payload:

```
name_len:        [1 byte]  uint8 — length of name string
name:            [N bytes] UTF-8 string
kind:            [1 byte]  uint8 — SchemaKind constant
component_count: [1 byte]  uint8 — number of component names
components:      for each component: [1 byte len][N bytes UTF-8 name]
```

### SchemaKind constants

| Value | Name | Meaning |
|---|---|---|
| `0` | `OBJECT` | Single structured object |
| `1` | `OBJECT_ARRAY` | Array of structured objects |
| `2` | `FLOAT_ARRAY` | Raw float array |

## Defined schemas

### Object schemas (single values)

| Schema name | Components | Wire size | Use |
|---|---|---|---|
| `pose3d` | `x, y, z, roll, pitch, yaw` | 24 bytes (6 × float32 LE) | 3D camera/robot pose |
| `pose2d` | `x, y, rotation` | 12 bytes (3 × float32 LE) | 2D robot pose on field |
| `vector3` | `x, y, z` | 12 bytes (3 × float32 LE) | 3D position/translation |
| `vector2` | `x, y` | 8 bytes (2 × float32 LE) | 2D position |

### Array schemas (variable-length)

| Schema name | Components | Element size | Use |
|---|---|---|---|
| `pose3d_array` | `x, y, z, roll, pitch, yaw` | 24 bytes | Multiple pose candidates |
| `pose2d_array` | `x, y, rotation` | 12 bytes | Multiple 2D poses |
| `vector3_array` | `x, y, z` | 12 bytes | Point clouds |
| `vector2_array` | `x, y` | 8 bytes | 2D point sets |
| `float_array` | (none) | 4 bytes per float | Raw numeric arrays |

## Serialization

Each schema class extends `FlatpackSchema` and implements:
- `can_handle(value) -> bool` — returns `True` if the value matches this schema's expected shape
- `serialize(value) -> bytes` — packs the value into little-endian binary

Example — `Pose2DSchema.serialize()`:

```python
def serialize(self, value: dict) -> bytes:
    x = float(value["x"])
    y = float(value["y"])
    rotation = float(value["rotation"])
    return pack("<fff", x, y, rotation)
```

The registry (`src/utils/flatpack_schema/registry.py`) selects the appropriate schema by calling `can_handle()` on each registered schema in order.

## Python value conventions

| Schema | Expected Python value |
|---|---|
| `pose3d` | `{"x": float, "y": float, "z": float, "roll": float, "pitch": float, "yaw": float}` |
| `pose2d` | `{"x": float, "y": float, "rotation": float}` |
| `vector3` | `{"x": float, "y": float, "z": float}` |
| `vector2` | `{"x": float, "y": float}` |

All component values are cast to `float` during serialization; integer inputs are accepted.
