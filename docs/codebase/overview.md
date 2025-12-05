# Codebase Overview

EagleEye Vision System ingests camera frames, routes them through configurable pipelines, leverages heterogeneous compute devices, and exposes a WebUI for control. Jump into the sub-sections for depth:

- Pipelines: how frames move, how ops are loaded, and how configs drive the chain.
- Device Management: `ComputePool`, device lifecycles, CPU/GPU/MX3 specifics.
- WebUI: backend Flask/SSE, frontend modules, and API surface.

Use this page to orient, then drill into the subfolders for details and code snippets.

## High-level flow
1. Camera threads feed frames into `Pipeline.run(frame)`.
2. Each operation (main definition or secondary) transforms data.
3. Outputs publish to the WebUI, NetworkTables, or downstream consumers.
4. Compute devices are allocated via `ComputePool` and injected where constructors request them.
5. The WebUI (default port `5001`) renders feeds, pipeline editor, and settings.

## Quick entry points
- `src/config/utils/generate_all_pipelines.py` builds per-camera pipelines from `pipeline_config.json`.
- `src/config/utils/pipeline.py` orchestrates execution, timing, and dependency injection.
- `src/utils/device_management_utils/compute_pool.py` registers/serves devices.
- `src/webui/web_server.py` serves the UI and real-time endpoints; `src/webui/js/` powers the client.

