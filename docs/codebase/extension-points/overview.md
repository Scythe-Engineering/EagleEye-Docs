# Extension Points Overview

EagleEye is designed for extension. This guide helps you choose the right extension type for your goal.

## Decision guide

| Goal | Extension type | Location |
|---|---|---|
| Add lightweight frame processing | [Secondary operation](./new-operation) | `src/secondary_operations/` |
| Add ML model inference or complex orchestration | [Main operation](./new-operation) | `src/main_operations/definitions/` |
| Integrate a new accelerator (TPU, FPGA, etc.) | [New device](./new-device) | `src/utils/device_registry.py` + model/runtime support |
| Add performance-critical frame processing in Rust | [Rust module](./rust-modules) | `src/rust_implementations/` |
| Add a new page or tool to the WebUI | [New UI tab](./new-ui-tab) | `src/webui/` |

## Extension complexity

| Type | Typical complexity | Restart required |
|---|---|---|
| Secondary operation | Low | Yes |
| Main operation | Medium | Yes |
| New device | Medium | Yes |
| Rust module | High (Rust knowledge needed) | Yes (+ recompile) |
| New UI tab | Medium (JS + Handlebars) | No (just rebuild frontend) |

## Common extension checklist

For any new operation (main or secondary):
1. Implement the class extending `OperationInstance`
2. Create the config def JSON (`_config_def.json`)
3. Add to a pipeline config (via WebUI or JSON)
4. Restart the backend

For devices:
1. Extend `DeviceRegistry.discover` with a canonical descriptor.
2. Add model-artifact selection and operation/runtime support.
3. Reference the canonical device ID in operation `action_params`.
