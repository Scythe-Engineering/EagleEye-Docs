# Startup Sequence

Startup happens in two phases in `src/main_backend.py`: module-level bootstrap that runs on import, then `MainBackend.__init__()`. Understanding this sequence is useful when diagnosing startup failures.

## Module import

### Startup requirement check

```python
logger = Logger()
StartupInstallChecker(logger=logger).ensure_startup_requirements()
```

`src/startup/install_check.py` runs before any heavy imports.

### Build Rust modules

```python
build_success = rust_build(logger=logger)
if not build_success:
    raise RuntimeError(error_msg)
```

`src/rust_implementations/build.py` compiles the PyO3 extensions. The first build is slow; later runs are cached. A failed build raises at import time, before `MainBackend` exists — there is no degraded mode without the Rust modules.

### Ensure config files exist

`src/general_conf.json` is created from `DEFAULT_GENERAL_CONF` if missing, and `src/config/pipeline_config.json` is created as `{}` if missing. `general_conf` is then loaded as `{**DEFAULT_GENERAL_CONF, **file_contents}`.

## `MainBackend.__init__`

The whole body is wrapped in `try/except BaseException`, which calls `self.shutdown()` and re-raises, so a partial startup does not leave threads running.

### 1. NetworkTables

```python
network_tables_inst = ntcore.NetworkTableInstance.getDefault()
network_tables_inst.startClient4("EagleEye")
network_tables_inst.setServer(general_conf["network_table_address"])
self.network_table = network_tables_inst.getTable("EagleEye")
```

EagleEye is an NT4 *client* named `EagleEye`; the roboRIO (or whatever `network_table_address` points at) is the server. The tracked installation config starts at `localhost`; `0.0.0.0` is the fallback when the config file is absent. No schema manifest is published here.

### 2. Devices, models, and MX3 runtime

```python
self.device_registry = DeviceRegistry.discover(logger=self.logger)
self.model_library = ModelLibrary(
    root=current_dir.parent / "files" / "models",
    pipeline_config_path=pipeline_conf_path,
)
self.mx3_coordinator = Mx3RuntimeCoordinator(logger=self.logger)
```

Hardware discovery runs exactly once here. The detected device IDs are logged.

### 3. Web interface

```python
self.web_interface = EagleEyeInterface(
    restart_callback=self.restart,
    pipeline_objects_callback=self.get_pipelines,
    logger=self.logger,
    network_table_instance=network_tables_inst,
    device_registry=self.device_registry,
    model_library=self.model_library,
)
```

Starts the Flask server thread on `0.0.0.0:5001` plus its background threads (SSE heartbeat, log monitoring, system status).

### 4. Cameras

```python
self.camera_manager = CameraThreadManager(self.web_interface, logger=self.logger)
self.known_cameras = self.camera_manager.known_cameras
```

`CameraThreadManager` discovers system cameras and video-file cameras and starts one `CameraWorker` thread per camera.

### 5. Camera configuration registry

```python
self.camera_config_registry = CameraConfigRegistry()
self.camera_config_registry.load_all_from_directory()
for camera_info in self.known_cameras:
    self.camera_config_registry.get_config(str(camera_info["bus_id"]))
self.camera_configs = self.camera_config_registry.get_all_configs()
self.web_interface.camera_config_registry = self.camera_config_registry
```

Configs live in `src/utils/camera_utils/camera_calibrations/<camera_id>/` as `intrinsics.json` and `extrinsics.json`. Missing configs are created with defaults.

Then `camera_manager.wait_for_all_cameras_ready()` blocks until every camera reports ready; on timeout it logs a warning and continues.

### 6. Build pipelines

```python
self.pipelines = generate_all_pipelines(
    self.web_interface,
    self.network_table,
    self.camera_manager,
    self.camera_config_registry,
    self.device_registry,
    self.model_library,
    logger=self.logger,
    mx3_coordinator=self.mx3_coordinator,
)
self.mx3_coordinator.start()
```

Reads `src/config/pipeline_config.json`, imports each operation by name, calls its constructor with dependency-injected parameters, and lets `FlowManager` compute the execution schedule. Construction failures are reported to the Web UI through `publish_operation_errors(...)` instead of aborting startup.

### 7. Start pipeline threads

Pipelines with no `camera_bus_ids`, or with bus IDs absent from `camera_manager.get_all_bus_ids()`, are skipped with a yellow warning. The rest start with `pipeline.thread_run(self.camera_manager)`.

## After startup

```python
while True:
    sleep(1)
```

All work happens in daemon threads. The main thread keeps the process alive and handles `KeyboardInterrupt`.

## Shutdown and restart

`shutdown(restart_service=False)` stops the MX3 compiler service, stops and joins pipelines, shuts down MX3 runtimes, then stops cameras. `restart()` calls it with `restart_service=True`, which runs `sudo systemctl restart $SERVICE_NAME` (`SERVICE_NAME` defaults to `eagleeye`).
