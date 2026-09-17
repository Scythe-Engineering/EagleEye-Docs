# Rust modules

EagleEye includes PyO3-based Rust extensions for performance-sensitive frame processing. The build system lives in `src/rust_implementations/` and uses Maturin to install compiled Python extensions.

## Current modules

- `modules/pose_outlier_filter` rejects pose measurements that fall outside a motion-based gate.
- `modules/temporal_acceleration` predicts AprilTag search regions from the previous pose.
- `module_template` is the starting layout for a new extension.

Each module has its own `Cargo.toml`, `Cargo.lock`, Rust source, and README. The build script discovers crates below `modules/` rather than relying on a single workspace manifest.

## Build system

The backend builds Rust modules at startup. The build script hashes each module's manifest and Rust sources, skips unchanged modules, runs `python -m maturin develop` for changed modules, checks that the Python import works, and records the hashes in `.build_cache.json`.

Run it from the EagleEye repository root:

```bash
python src/rust_implementations/build.py
python src/rust_implementations/build.py --all
python src/rust_implementations/build.py pose_outlier_filter
python src/rust_implementations/build.py --clean
```

The first build can take one to three minutes. Compiled `.so` files are placed where Python can import them.

## Create a module

Use the scaffold script:

```bash
python src/rust_implementations/create_module.py <module_name>
```

The script creates a crate under `src/rust_implementations/modules/<module_name>/`. Add the crate's `Cargo.toml` and Rust sources, then build and import-test it before wiring it into an operation.

## Python wrapper

Operations should keep the Rust import and error handling at the Python boundary:

```python
from src.main_operations.definitions.base.base_class import OperationInstance

try:
    import my_processor
except ImportError as error:
    raise RuntimeError("my_processor Rust module is not available") from error


class MyProcessor(OperationInstance):
    def run(self, frame):
        if frame is None:
            return None
        return my_processor.process_frame(frame)
```

The wrapper receives normal pipeline dependencies and should validate inputs before calling the extension. Keep hardware or compiler failures explicit rather than silently falling back to a slower implementation.

## Requirements and debugging

Install a stable Rust toolchain and keep `maturin` available in the EagleEye Python environment:

```bash
rustup toolchain install stable
uv sync
```

If a build fails, compile the affected crate directly, check the generated Maturin command and import error, and look for missing system libraries. Build output is forwarded to the EagleEye logger.
