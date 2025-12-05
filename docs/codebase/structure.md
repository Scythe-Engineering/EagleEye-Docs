# Codebase Structure

This map shows where major concerns live so you can navigate quickly.

## Top-level
- `src/config/`: pipeline config (`pipeline_config.json`), generation utils, helpers.
- `src/main_operations/`: operation definitions (thin wrappers) and modules.
- `src/secondary_operations/`: lightweight operations and their config definitions.
- `src/utils/device_management_utils/`: compute abstractions and pool.
- `src/webui/`: Flask backend, frontend assets (JS/HTML/CSS), API docs.
- `files/`: sample data/models/configs (e.g., apriltag maps, calibration).
- `docs/`: source documentation (legacy).

## Pipeline path
- Define operations (main/secondary) → reference in `src/config/pipeline_config.json` → `generate_all_pipelines.py` builds pipelines → `Pipeline` runs frames.

## Device path
- Device implementations under `device_management_utils` → registered in `ComputePool` → injected into operations that request `compute_pool`.

## WebUI path
- Backend `web_server.py` serves APIs/streams/state.
- Frontend under `webui/js/`, templates `webui/html/`, styles `webui/css/`, assets `webui/assets/`.

## Where to add things
- New operation: `src/main_operations/definitions/` or `src/secondary_operations/` (+ config defs).
- New hardware: subclass `ComputeDevice` and register in `ComputePool`.
- New UI feature: endpoint in backend + module/template updates in `webui/js`/`webui/html`.



