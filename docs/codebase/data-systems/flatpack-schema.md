# Flatpack Schema

Flatpack is a compact binary serialization module in `src/utils/flatpack_schema/`. It defines a schema manifest format (`FPKM`) and a value payload format (`FPK1`).

:::note
Flatpack is not currently wired into the running system. `generate_schema_manifest_bytes()` is not called outside its own module, and the pipeline operation that writes to NetworkTables (`publish_to_networktables.py`) publishes wpimath struct types through NT4 topics rather than Flatpack payloads. Treat this page as a description of the module, not of live wire traffic.
:::

## Schema manifest

`generate_schema_manifest_bytes()` (`schema_manifest.py`) returns a binary manifest describing every known schema descriptor.

### Manifest wire format

```
Header:  [4 bytes] MANIFEST_HEADER (b"FPKM")
Version: [1 byte]  uint8 MANIFEST_VERSION
Length:  [4 bytes] uint32 LE — payload length
Payload: [N bytes] uint16 LE descriptor count, then packed descriptors
```

### Schema descriptor encoding

```
name_len:        [1 byte]  uint8
name:            [N bytes] UTF-8
kind:            [1 byte]  uint8 — SchemaKind constant
component_count: [1 byte]  uint8
components:      per component: [1 byte len][N bytes UTF-8]
```

Names and component names are limited to `MAX_NAME_LENGTH` (255) encoded bytes.

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

Each schema class implements:

- `can_handle(value) -> bool` — whether the value matches this schema's shape
- `serialize(value) -> bytes` — little-endian packing

Example — `Pose2DSchema.serialize()`:

```python
def serialize(self, value: dict) -> bytes:
    return pack("<fff", float(value["x"]), float(value["y"]), float(value["rotation"]))
```

`FlatpackRegistry.serialize(value)` (`registry.py`) walks its schema list in order, uses the first schema whose `can_handle()` returns `True`, and returns `(encoded_payload, schema_name)`. Schemas are registered most-specific first (3D before 2D) so a 3D value is not matched by a 2D schema.

### Payload framing

`_wrap_payload` prefixes the packed value with the schema name:

```
b"FPK1" + [1 byte name_len] + name (UTF-8) + payload
```

## Python value conventions

| Schema | Expected Python value |
|---|---|
| `pose3d` | `{"x": float, "y": float, "z": float, "roll": float, "pitch": float, "yaw": float}` |
| `pose2d` | `{"x": float, "y": float, "rotation": float}` |
| `vector3` | `{"x": float, "y": float, "z": float}` |
| `vector2` | `{"x": float, "y": float}` |

All component values are cast to `float` during serialization; integer inputs are accepted.
