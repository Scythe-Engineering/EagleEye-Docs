# Codebase Overview

EagleEye Vision System ingests camera frames, routes them through configurable DAG pipelines, leverages heterogeneous compute devices, and exposes a WebUI for real-time control and monitoring.

## Engineering principles

EagleEye aims to be efficient, extendable, and simple enough for a beginner team to set up. It
should cover the capabilities teams expect from Limelight and PhotonVision while keeping the
normal path short and leaving advanced teams free to adapt pipelines to their needs.

Keep additions aligned with that goal. Prefer small, maintainable changes over new layers of
abstraction. Keep backend changes narrow and reliable. The backend must keep running through a
match, so correctness and recovery there take priority over frontend polish. Frontend work still
needs sound structure, but a visual or interaction issue is lower priority than a backend failure.

Cybersecurity is generally out of scope for EagleEye's intended robot-network use. Do not add
security work by default. Add it only when a concrete threat, deployment requirement, or explicit
project requirement calls for it.

## Directory structure

```
EagleEye-Vision-System/
├── src/
│   ├── main_backend.py              # Entry point — MainBackend class
│   ├── general_conf.json            # NetworkTables address config
│   ├── config/
│   │   ├── pipeline_config.json     # DAG pipeline definitions
│   │   └── utils/
│   │       ├── pipeline.py          # Pipeline class (operation runner)
│   │       ├── flow_manager.py      # Topological scheduler & thread allocator
│   │       ├── generate_all_pipelines.py  # Builds all pipelines from JSON
│   │       └── operation.py         # Operation node model
│   ├── main_operations/
│   │   └── definitions/             # Main operation wrappers + config_data/
│   │       └── base/base_class.py   # OperationInstance base class
│   ├── secondary_operations/        # Lightweight secondary ops + config_data/
│   ├── main_operations/modules/     # Heavy implementation modules (ONNX, etc.)
│   ├── rust_implementations/        # PyO3 Rust modules + build.py
│   ├── utils/
│   │   ├── camera_utils/            # CameraThreadManager, CameraWorker, configs
│   │   ├── device_registry.py       # Immutable cpu/cuda:N/mx3:N inventory
│   │   ├── model_library.py         # Managed model metadata and artifacts
│   │   ├── mx3_runtime.py           # Shared MemryX runtime coordinator
│   │   ├── flatpack_schema/         # Standalone schema utilities (not live NT output)
│   │   ├── logging/                 # Logger class
│   │   └── field_data/              # FRC field JSON files
│   └── webui/
│       ├── web_server.py            # Flask server and SSE (EagleEyeInterface)
│       ├── assets/                  # Static assets (camera, robot, and field assets)
│       ├── html/tabs/               # UI tab partials
│       ├── js/                      # Frontend source modules
│       ├── static/                  # Vite build output
│       └── web_server_utils/        # Route mixins, static helpers, Draco loader
├── tests/                           # pytest test suite
├── eagleeye.service                 # systemd service file
└── pyproject.toml                   # uv/Python project config
```

## High-level data flow

```
USB cameras
    │
    ▼
CameraThreadManager
(per-camera CameraWorker threads)
    │  frame + timestamp
    ▼
Pipeline.thread_run()
(one thread per pipeline)
    │
    ▼
FlowManager.run_flow()
(topological DAG execution, multi-thread if parallel branches)
    │  operation outputs
    ├──▶ EagleEyeInterface (SSE → WebUI)
    └──▶ NetworkTables (robot)
```

## Key entry points

| File | Role |
|---|---|
| `src/main_backend.py` | Top-level entry point; orchestrates all subsystems |
| `src/config/utils/generate_all_pipelines.py` | Reads `pipeline_config.json`, builds `Pipeline` objects |
| `src/config/utils/pipeline.py` | Wraps `FlowManager`; owns per-pipeline thread |
| `src/config/utils/flow_manager.py` | Topological sort, thread allocation, profiling |
| `src/utils/device_registry.py` | Immutable startup device inventory |
| `src/utils/model_library.py` | Managed model metadata and artifact resolution |
| `src/webui/web_server.py` | Flask routes and SSE events |
| `src/utils/camera_utils/camera_thread_manager.py` | Camera thread lifecycle |
| `src/utils/flatpack_schema/schema_manifest.py` | Standalone schema-manifest utility (not published at runtime) |

## Thread model

| Thread | Owner | Role |
|---|---|---|
| Main thread | `main_backend.py` | Runs `while True: sleep(1)` to keep the process alive |
| Flask daemon thread | `EagleEyeInterface` | Serves HTTP and SSE on port 5001 |
| SSE heartbeat thread | `EagleEyeInterface` | Sends heartbeat every 5 s |
| Log monitor thread | `EagleEyeInterface` | Polls logger for new messages → SSE |
| System status thread | `EagleEyeInterface` | Publishes CPU, memory, storage, pipeline, and NetworkTables status every 1.5 s → SSE |
| Camera worker threads | `CameraThreadManager` | One per camera; calls `camera.get_frame()` in a loop |
| Pipeline threads | `Pipeline.thread_run()` | One per pipeline; drives `FlowManager.run_flow()` each frame |
| Operation threads | `FlowManager` | One per parallel branch; run concurrently when `num_threads > 1` |
