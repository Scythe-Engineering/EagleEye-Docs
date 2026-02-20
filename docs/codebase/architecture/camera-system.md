# Camera System

EagleEye's camera layer provides stable, thread-safe access to USB cameras identified by bus ID. All camera code lives in `src/utils/camera_utils/`.

## Key classes

### CameraThreadManager

`CameraThreadManager` is the top-level camera coordinator. Created once in `MainBackend`, it:
- Discovers and registers physical USB cameras via `add_system_cameras()`
- Registers video file cameras via `add_video_file_cameras()`
- Creates one `CameraWorker` per camera
- Provides frame access by camera name or bus ID

```python
# Get the current frame for a camera by bus ID
frame_data = camera_manager.get_current_frame_by_bus_id("1-3.2")
if frame_data:
    frame, timestamp_ms = frame_data
```

### CameraWorker

Each camera runs in its own `CameraWorker` thread (named `CameraThread-<camera_name>`). The worker:
- Calls `camera.get_frame()` in a tight loop at the camera's target FPS
- Applies a small sleep to match the target frame time
- Tracks consecutive failures; stops the thread after 10 consecutive failures
- Maintains a cached frame (last good frame) as fallback when `get_frame()` returns `None`

```python
class CameraWorker:
    camera_name: str
    camera: PhysicalCamera | VideoFileCamera
    running: bool

    def set_current_frame(self, frame, timestamp) -> None: ...
    def get_current_frame(self) -> tuple[np.ndarray, float] | None: ...
```

All frame access methods use a `threading.RLock` for thread safety.

### PhysicalCamera

Wraps an OpenCV `VideoCapture` for USB cameras. Configured with frame width (default 1280) and height (default 720). The achieved FPS is read from the camera after initialization.

### VideoFileCamera

Wraps an OpenCV `VideoCapture` for video files. Loops automatically when the file ends. Used for testing without physical hardware.

## Bus ID identification

USB bus IDs (e.g. `1-3.2`) are the stable identifier for a physical camera port. They are:
- Reported by `lsusb -t` on Linux
- Logged at startup in the form `"bus_id": "1-3.2"` for each detected camera
- Registered in `CameraThreadManager.bus_id_to_name` dict

The mapping from bus ID to camera name is registered via `camera_manager.register_bus_id(bus_id, camera_name)` when the camera is first initialized.

## CameraConfigRegistry

`CameraConfigRegistry` (`src/utils/camera_utils/camera_config_manager.py`) loads and caches camera configuration (intrinsics + extrinsics) per bus ID.

```python
registry = CameraConfigRegistry()
registry.load_all_from_directory()  # loads all existing configs from disk

config = registry.get_config("1-3.2")  # returns CameraConfig (creates default if missing)
all_configs = registry.get_all_configs()
```

### CameraConfig dataclass

```python
@dataclass
class CameraConfig:
    bus_id: str
    intrinsics: dict | None        # OpenCV camera matrix and distortion coefficients
    extrinsics: CameraExtrinsics   # mounting position and rotation
```

### CameraExtrinsics dataclass

```python
@dataclass
class CameraExtrinsics:
    x: float       # meters from robot origin
    y: float
    z: float
    roll: float    # radians
    pitch: float
    yaw: float
```

Config files are stored under `src/config/camera_configs/<bus_id>/`:
- `intrinsics.yaml` — OpenCV calibration output
- `extrinsics.json` — `{"x": ..., "y": ..., "z": ..., "roll": ..., "pitch": ..., "yaw": ...}`

## Camera readiness

`CameraThreadManager.wait_for_all_cameras_ready()` polls all cameras until their `camera_ready` flag is set (first frame received) or a 30-second timeout expires. The backend proceeds with a warning if any cameras time out.
