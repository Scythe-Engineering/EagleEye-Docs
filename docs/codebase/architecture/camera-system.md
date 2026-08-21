# Camera System

EagleEye's camera layer provides stable, thread-safe access to cameras identified by USB bus ID. All camera code lives in `src/utils/camera_utils/`.

## Frames and timing

Frames move through the system as `FramePacket`, which is `TimedValue[Any]` from `src/utils/timing.py`:

```python
@dataclass(frozen=True)
class TimingMetadata:
    capture_nt_us: int              # capture time on the NetworkTables clock
    capture_monotonic_ns: int       # capture time on CLOCK_MONOTONIC
    frame_seq: int | None = None
    camera_name: str | None = None
    bus_id: str | None = None

@dataclass(frozen=True)
class TimedValue(Generic[T]):
    value: T
    timing: TimingMetadata

FramePacket = TimedValue[Any]
```

Capture backends return `CapturedFrame` (`cameras/captured_frame.py`): an unrotated image (BGR, or a single grayscale plane from a monochrome V4L2 stream) plus `capture_monotonic_ns`. Backends that can report a hardware capture time do; the rest stamp delivery time.

Carrying timing with the value is what lets `publish_to_networktables` set a per-sample timestamp from the originating frame.

## Key classes

### CameraThreadManager

Created once in `MainBackend`, it discovers cameras, starts one `CameraWorker` per camera, and exposes frame access by camera name or bus ID:

```python
packet = camera_manager.get_current_packet_by_bus_id("1-3.2")
if packet is not None:
    image = packet.value
    capture_ns = packet.timing.capture_monotonic_ns
```

Related methods: `get_current_packet(camera_name)`, `get_current_timing_by_bus_id`, `wait_for_new_frame_by_bus_id`, `get_all_bus_ids`, `get_all_camera_names`, `get_camera_name_by_bus_id`, `get_bus_id_for_camera_name`, `start_camera_thread`, `stop_camera_thread`, `stop_all_cameras`.

### CameraWorker

Each camera runs in its own thread driven by `CameraThreadManager.camera_feed_worker`. The worker reads frames, publishes them with `set_current_packet`, and keeps a cached last-good packet (`set_cached_packet` / `get_cached_packet`) for when a read returns `None`. `next_frame_seq()` assigns monotonically increasing sequence numbers, and `wait_for_new_frame(...)` lets consumers block until a newer frame arrives instead of polling.

Consecutive read failures are counted by `FailureTracker` (default `max_failures=10`). Frame access is guarded by a lock.

### PhysicalCamera

`cameras/physical_camera.py` opens either `V4l2Capture` (`cameras/v4l2_capture.py`) or `OpenCvCapture` depending on platform support, at a default `frame_width=1280`, `frame_height=720`. `get_available_fps_for_resolution()` parses `v4l2-ctl` output and the frame rate is negotiated against that list.

### VideoFileCamera

`cameras/video_file_camera.py` wraps an OpenCV `VideoCapture` over a video file, for running pipelines without hardware.

## Bus ID identification

USB bus IDs (e.g. `1-3.2`) are the stable identifier for a physical camera port. `CameraThreadManager.register_bus_id(bus_id, camera_name)` records the mapping when a camera is initialized; pipelines reference cameras by bus ID through the `camera_bus_id` parameter of `device_input`.

## CameraConfigRegistry

`CameraConfigRegistry` (`camera_config_manager.py`) loads and caches a `CameraConfig` per camera ID.

```python
registry = CameraConfigRegistry()
registry.load_all_from_directory()

config = registry.get_config("1-3.2")   # creates a default config if missing
all_configs = registry.get_all_configs()
```

Other methods: `has_config`, `remove_config`, `get_all_camera_ids`, `save_all`.

### CameraConfig

`CameraConfig` is a plain class, not a dataclass. It holds `camera_id`, an `intrinsics_path`, and a `CameraExtrinsics`. Extrinsic fields have per-field getters and setters (`get_pitch`/`set_pitch`, …) which keep the in-memory object and its JSON representation in sync, plus `set_extrinsics_from_json`, `update_extrinsics_live`, `save_extrinsics`, `load_extrinsics`, and `save_and_reload_extrinsics`.

### CameraExtrinsics

```python
@dataclass
class CameraExtrinsics:
    pitch: float = 0.0      # degrees
    yaw: float = 0.0        # degrees
    roll: float = 0.0       # degrees
    x_offset: float = 0.0   # meters
    y_offset: float = 0.0   # meters
    z_offset: float = 0.0   # meters
```

Angles are in degrees, offsets in meters.

### File layout

Configs live under `src/utils/camera_utils/camera_calibrations/<camera_id>/`:

- `intrinsics.json` — calibration output
- `extrinsics.json` — `{"pitch": ..., "yaw": ..., "roll": ..., "x_offset": ..., "y_offset": ..., "z_offset": ...}`

## Camera readiness

`CameraThreadManager.wait_for_all_cameras_ready()` polls every camera's ready flag (set when the first frame arrives) until a timeout. `MainBackend` logs a warning and continues to pipeline creation if the wait times out.
