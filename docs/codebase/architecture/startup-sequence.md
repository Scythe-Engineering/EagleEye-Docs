# Startup Sequence

`MainBackend.__init__()` in `src/main_backend.py` runs these steps in order. Understanding this sequence is useful when diagnosing startup failures.

## Step-by-step

### Step 1: Build Rust modules

```python
build_success = rust_build(logger=logger)
if not build_success:
    raise RuntimeError("Failed to build Rust implementations.")
```

`src/rust_implementations/build.py` compiles PyO3 extensions via `maturin develop`. On the first run this takes 1–3 minutes; subsequent runs use a file-hash cache and complete in under a second. If the build fails, the backend exits immediately — there is no degraded mode without Rust modules.

### Step 2: Discover hardware

```python
available_devices = get_available_devices(logger=logger)
```

`src/utils/get_available_devices.py` queries the system for CPUs, CUDA GPUs, and Memryx TPUs. The result is a dict like `{"CPU": ["CPU"], "GPU": ["NVIDIA GeForce RTX 4060"], "TPU": ["memx:0"]}`.

### Step 3: Load general config

```python
if not os.path.exists("src/general_conf.json"):
    with open("src/general_conf.json", "w") as f:
        json.dump({"network_table_address": "0.0.0.0"}, f)
general_conf = json.load(open("src/general_conf.json"))
```

Creates `src/general_conf.json` with a `0.0.0.0` NT address if it doesn't exist.

### Step 4: Initialize NetworkTables

```python
NetworkTables.initialize(server=general_conf["network_table_address"])
self.network_table = NetworkTables.getTable("EagleEye")
schema_manifest_payload = generate_schema_manifest_bytes()
self.network_table.putRaw("schema_manifest", schema_manifest_payload)
```

Connects to the NT server (or `0.0.0.0` for disabled mode) and publishes the Flatpack schema manifest so SmartDashboard/Elastic can discover the data types being published.

### Step 5: Start WebUI

```python
self.web_interface = EagleEyeInterface(
    restart_callback=self.restart,
    pipeline_objects_callback=self.get_pipelines,
    logger=self.logger,
)
```

Creates the Flask/SocketIO server in a daemon thread on port `5001`. Also starts three background threads: heartbeat, log monitor, and system status.

### Step 6: Initialize cameras

```python
self.camera_manager = CameraThreadManager(self.web_interface, logger=self.logger)
self.known_cameras = self.camera_manager.known_cameras
```

`CameraThreadManager` calls `add_system_cameras()` and `add_video_file_cameras()` to discover and register cameras. Each discovered camera gets its own `CameraWorker` thread.

### Step 7: Load camera configs

```python
self.camera_config_registry = CameraConfigRegistry()
self.camera_config_registry.load_all_from_directory()
for camera_info in self.known_cameras:
    camera_bus_id = camera_info.get("bus_id")
    self.camera_config_registry.get_config(str(camera_bus_id))
```

`CameraConfigRegistry` loads intrinsics (YAML) and extrinsics (JSON) for each known camera from `src/config/camera_configs/<bus_id>/`. Missing configs are created with defaults.

Also waits up to 30 seconds for all cameras to report ready (first frame received). Proceeds with a warning if the timeout is reached.

### Step 8: Initialize compute pool

```python
self.compute_pool = ComputePool()
self._initialize_compute_devices()
```

Creates `ComputePool` and registers all available devices:
- CPU (always, if detected)
- MX3 accelerators (one per `memx:X` detected)
- NVIDIA GPUs (one per CUDA device)

### Step 9: Build pipelines

```python
self.pipelines = generate_all_pipelines(
    self.web_interface, self.compute_pool, self.network_table,
    self.camera_manager, self.camera_config_registry, logger=self.logger,
)
```

Reads `src/config/pipeline_config.json` and constructs all `Pipeline` objects. For each pipeline, each operation is imported by name, its constructor is called with dependency-injected parameters, and the `FlowManager` computes the execution schedule.

### Step 10: Start pipeline threads

```python
for pipeline_name, pipeline in self.pipelines.items():
    if not bus_ids or missing_bus_ids:
        continue  # skip pipelines with missing cameras
    pipeline.thread_run(self.camera_manager)
```

Each pipeline that has all its cameras present starts its processing thread. Pipelines with missing cameras are skipped with a yellow warning log.

## After startup

The main thread runs:

```python
while True:
    sleep(1)
```

All work happens in daemon threads. The main thread keeps the process alive and handles `KeyboardInterrupt` for graceful shutdown.
