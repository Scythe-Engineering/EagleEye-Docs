# Architecture Overview

EagleEye Vision System is a multi-threaded, multi-pipeline computer vision backend. This page describes the high-level component interactions, data flow, and thread model.

## Component map

```
┌─────────────────────────────────────────────────────────┐
│ MainBackend                                              │
│                                                         │
│  ┌─────────────────┐    ┌──────────────────────┐        │
│  │ CameraThread    │    │ EagleEyeInterface     │        │
│  │ Manager         │    │ (Flask/SocketIO)      │        │
│  │                 │    │                       │        │
│  │  CameraWorker  ─┼───▶│  SSE → WebUI clients  │        │
│  │  CameraWorker   │    │                       │        │
│  └────────┬────────┘    └──────────┬────────────┘        │
│           │ frame+ts               │ web_interface        │
│           ▼                        ▼                      │
│  ┌─────────────────────────────────────────────────┐     │
│  │ Pipeline(s)                                     │     │
│  │  FlowManager (topological DAG scheduler)        │     │
│  │   ├─ Operation nodes (main + secondary)         │     │
│  │   └─ ThreadObjects (parallel branches)          │     │
│  └──────────────┬──────────────────────────────────┘     │
│                 │                                        │
│    ┌────────────┴──────────┐                            │
│    ▼                       ▼                            │
│  NetworkTables          SSE events                      │
│  (robot)                (WebUI)                         │
└─────────────────────────────────────────────────────────┘
```

## Data flow

1. **Camera capture** — `CameraWorker` threads call `camera.get_frame()` in a loop at the camera's target FPS and push frames to `EagleEyeInterface` (for the live feed in Views tab) and to the `CameraThreadManager` frame buffer.

2. **Pipeline execution** — Each `Pipeline` has its own thread. The pipeline thread calls `FlowManager.run_flow()` each frame, pulling the current frame from the camera manager.

3. **FlowManager scheduling** — Operations are executed in topological timestep order. Operations at the same timestep that occupy different thread slots run concurrently. Single-branch pipelines run on one thread with no synchronization overhead.

4. **Output publishing** — Terminal operations in the pipeline write results to NetworkTables (via the injected `network_table`) and/or to SSE (via the injected `web_interface`).

5. **WebUI updates** — The SSE stream delivers `pipeline_profile`, `pipeline_error`, `system_status`, and `log_update` events to connected browser clients.

## Dependency injection

`generate_all_pipelines()` constructs each operation by introspecting its `__init__` signature and providing matching objects from the backend:

```python
injected = {
    "web_interface": web_interface,
    "compute_pool": compute_pool,
    "network_table": network_table,
    "camera_manager": camera_manager,
    "camera_config_registry": camera_config_registry,
    "logger": logger,
}
```

Any constructor parameter whose name matches a key in `injected` is automatically provided. The remaining parameters come from `action_params` in the pipeline config.

## Startup sequence

See [Startup Sequence](./startup-sequence) for the exact 10-step `MainBackend.__init__` order.

## Camera system

See [Camera System](./camera-system) for `CameraThreadManager`, `CameraWorker`, and bus ID identification.

## SSE and real-time events

See [SSE & Real-time](./sse-realtime) for the SSE queue architecture, named events, and background threads.
