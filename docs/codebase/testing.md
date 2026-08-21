# Testing

EagleEye uses pytest for its test suite. Tests live in `tests/` at the project root.

## Running tests

```bash
# Run all tests
uv run pytest tests/

# Run a specific test file
uv run pytest tests/test_operation_runs.py

# Run with verbose output
uv run pytest tests/ -v

# Run excluding hardware-dependent tests
uv run pytest tests/ -m "not hardware_skip"
```

## conftest.py — hardware stubs

`tests/conftest.py` injects stub modules for hardware dependencies that are not present in CI or dev environments:

| Stub | Real module | Purpose |
|---|---|---|
| `line_profiler` | `line_profiler` | `@profile` decorator stub (no-op) |
| `cv2` | `opencv-python` | imdecode/imencode stubs |
| `networktables` | `pynetworktables` | NetworkTable stub class |
| `torch` | `torch` | Tensor stub |
| `flask` / `flask_cors` / `flask_socketio` | Flask ecosystem | Minimal class stubs |
| `apriltag` / `pupil_apriltags` | AprilTag detectors | Stub Detector + Detection classes |

Stubs are installed into `sys.modules` with `setdefault` — if the real module is present, it is used; if not, the stub fills in.

### Rust modules

`pytest_sessionstart` in `conftest.py` calls `tests.utils.rust_build.ensure_rust_modules_built()` before test collection. If the Rust build fails, the test session exits immediately with a meaningful error.

## Custom markers

Defined in `tests/pytest.ini`:

| Marker | Meaning |
|---|---|
| `hardware_skip` | Test requires physical hardware (camera, GPU, MX3) — skip in CI |
| `rust_optional` | Test requires Rust extensions that may not be compiled |
| `yolo_excluded` | YOLO operation tests excluded from the standard suite |

Apply markers to tests:

```python
import pytest

@pytest.mark.hardware_skip
def test_requires_camera():
    ...

@pytest.mark.rust_optional
def test_rust_module():
    ...
```

## Test files

| File | What it tests |
|---|---|
| `test_system_init.py` | `MainBackend` initialization sequence with mocked hardware |
| `test_operation_initialization.py` | All discoverable operation constructors with default dummy dependencies |
| `test_operation_runs.py` | `run()` method of each operation with synthetic frame data |
| `test_pose_fusion.py` | Multi-input pose fusion logic |
| `test_granular_profiling.py` | FlowManager profiling snapshots and per-op timing |

## Test utilities

The `tests/utils/` directory contains shared test helpers:
- `rust_build.py` — wraps `src/rust_implementations/build.py` for pre-test Rust compilation
- Additional fixture factories for creating synthetic frames, pipeline configs, and compute pools

## Writing new tests

For a new operation, create or add to `test_operation_runs.py`:

```python
import numpy as np
import pytest
from src.secondary_operations.my_transform import MyTransform


def test_my_transform_returns_filtered_list():
    op = MyTransform(min_confidence=0.6)
    poses = [
        {"confidence": 0.8, "x": 1.0, "y": 2.0},
        {"confidence": 0.4, "x": 3.0, "y": 4.0},
    ]
    result = op.run(poses)
    assert len(result) == 1
    assert result[0]["confidence"] == 0.8


def test_my_transform_handles_none():
    op = MyTransform()
    assert op.run(None) is None
```

## CI pattern

In CI (no physical hardware), run:

```bash
uv run pytest tests/ -m "not hardware_skip and not yolo_excluded" --tb=short
```

Rust modules are compiled at the start of the test session via `conftest.py`. Ensure a Rust stable toolchain is available in the CI environment.
