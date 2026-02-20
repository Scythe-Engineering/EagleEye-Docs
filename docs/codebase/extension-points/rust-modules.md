# Rust Modules

EagleEye includes PyO3-based Rust extensions for performance-critical frame processing. The build system is in `src/rust_implementations/`.

## Build system

Rust modules are built automatically at backend startup via `maturin develop`. The build is hash-cached: if the Rust source files haven't changed, the build step is skipped (returns in milliseconds).

```python
# src/rust_implementations/build.py
from src.rust_implementations.build import main as rust_build

build_success = rust_build(logger=logger)
```

The first build can take 1–3 minutes. Compiled `.so` files are placed in the project root where Python can import them.

## Directory structure

```
src/rust_implementations/
├── build.py            # Maturin build runner (with hash-based caching)
├── Cargo.toml          # Workspace manifest
└── <module_name>/
    ├── Cargo.toml      # Crate manifest
    └── src/
        └── lib.rs      # PyO3 module implementation
```

## Creating a new Rust module

A scaffold script is provided:

```bash
python src/rust_implementations/create_module.py <module_name>
```

This creates a new crate under `src/rust_implementations/<module_name>/` with a starter `lib.rs` and `Cargo.toml`.

### Example module structure

**`src/rust_implementations/my_processor/src/lib.rs`:**

```rust
use pyo3::prelude::*;
use numpy::{PyArray2, PyReadonlyArray2};

#[pyfunction]
fn process_frame(
    py: Python<'_>,
    frame: PyReadonlyArray2<u8>,
) -> PyResult<Py<PyArray2<u8>>> {
    let arr = frame.as_array();
    // ... fast processing ...
    let result = /* ... */;
    Ok(PyArray2::from_array(py, &result).to_owned())
}

#[pymodule]
fn my_processor(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(process_frame, m)?)?;
    Ok(())
}
```

**`src/rust_implementations/my_processor/Cargo.toml`:**

```toml
[package]
name = "my_processor"
version = "0.1.0"
edition = "2021"

[lib]
name = "my_processor"
crate-type = ["cdylib"]

[dependencies]
pyo3 = { version = "0.20", features = ["extension-module"] }
numpy = "0.20"
```

## Python wrapper pattern

Wrap the Rust module in a Python class for clean error handling and dependency injection:

```python
# src/secondary_operations/temporal_acceleration_preprocessor_rust.py
from src.main_operations.definitions.base.base_class import OperationInstance

try:
    import my_processor  # the compiled Rust module
    RUST_AVAILABLE = True
except ImportError:
    RUST_AVAILABLE = False


class TemporalAccelerationPreprocessorRust(OperationInstance):
    def __init__(self, camera_bus_id: str, padding_factor: float = 0.35) -> None:
        if not RUST_AVAILABLE:
            raise RuntimeError("my_processor Rust module not available")
        self.camera_bus_id = camera_bus_id
        self.padding_factor = padding_factor

    def run(self, frame):
        if frame is None:
            return None
        return my_processor.process_frame(frame)
```

## Requirements

- Rust stable toolchain: `rustup toolchain install stable`
- `maturin` is installed as a Python dev dependency (included in `uv sync`)
- The Rust crate is added to the workspace `Cargo.toml`

## Debugging Rust builds

If the build fails at startup, check:
1. `rustup toolchain install stable` has been run
2. The crate compiles independently: `cd src/rust_implementations/<module> && cargo build`
3. No link errors from missing system libraries (maturin links against Python's C API)

Build output and errors are forwarded to the EagleEye logger.
