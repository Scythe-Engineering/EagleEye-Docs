# Codebase Overview

EagleEye Vision System ingests camera frames, routes them through configurable DAG pipelines, leverages heterogeneous compute devices, and exposes a WebUI for real-time control and monitoring.

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
│   ├── modules/                     # Heavy implementation modules (ONNX, etc.)
│   ├── rust_implementations/        # PyO3 Rust modules + build.py
│   ├── utils/
│   │   ├── camera_utils/            # CameraThreadManager, CameraWorker, configs
│   │   ├── device_management_utils/ # ComputePool, CPU, GPU, MX3Accelerator
│   │   ├── flatpack_schema/         # Binary serialization for NT output
│   │   ├── logging/                 # Logger class
│   │   └── field_data/              # FRC field JSON files
│   └── webui/
│       ├── web_server.py            # Flask/SocketIO server (EagleEyeInterface)
│       ├── assets/                  # Static assets (no-image PNG, favicon, robots)
│       ├── js/                      # Built frontend JS (output of npm run build)
│       ├── style.css                # Built frontend CSS
│       └── web_server_utils/        # Static file helpers, Draco loader
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
| `src/utils/device_management_utils/compute_pool.py` | Device registry, lookup by ID |
| `src/webui/web_server.py` | Flask routes, SSE events, custom ops editor |
| `src/utils/camera_utils/camera_thread_manager.py` | Camera thread lifecycle |
| `src/utils/flatpack_schema/schema_manifest.py` | Binary NT schema publication |

## Thread model

| Thread | Owner | Role |
|---|---|---|
| Main thread | `main_backend.py` | Runs `while True: sleep(1)` to keep the process alive |
| Flask daemon thread | `EagleEyeInterface` | Serves HTTP/WebSocket on port 5001 |
| SSE heartbeat thread | `EagleEyeInterface` | Sends heartbeat every 5 s |
| Log monitor thread | `EagleEyeInterface` | Polls logger for new messages → SSE |
| System status thread | `EagleEyeInterface` | Publishes CPU/RAM/GPU stats every 1.5 s → SSE |
| Camera worker threads | `CameraThreadManager` | One per camera; calls `camera.get_frame()` in a loop |
| Pipeline threads | `Pipeline.thread_run()` | One per pipeline; drives `FlowManager.run_flow()` each frame |
| Operation threads | `FlowManager` | One per parallel branch; run concurrently when `num_threads > 1` |
