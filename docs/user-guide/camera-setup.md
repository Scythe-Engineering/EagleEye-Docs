# Camera Setup

EagleEye identifies cameras by their USB **bus ID** (e.g. `1-3.2`), not by device index. Bus IDs are stable across reboots on the same physical USB port, making them reliable for production deployments.

## Discovering camera bus IDs

Connect your cameras before starting EagleEye. When the backend starts, `CameraThreadManager` enumerates all connected USB cameras and logs their bus IDs:

```
[INFO] Detected 2 cameras: [{'name': 'Camera_1-3.2', 'bus_id': '1-3.2'}, {'name': 'Camera_1-4.1', 'bus_id': '1-4.1'}]
```

You can also list USB devices from the shell:

```bash
lsusb -t
```

This shows the USB tree with bus/port numbers. Match the camera vendor ID to find its bus ID.

## Configuring cameras in a pipeline

Use the `device_input.py` secondary operation as the source node in any pipeline. Set its `bus_id` parameter to the camera's bus ID:

```json
{
  "action_name": "device_input.py",
  "action_params": {
    "bus_id": "1-3.2",
    "frame_rotation": 0
  }
}
```

`frame_rotation` accepts `0`, `90`, `180`, or `270` (degrees clockwise).

## Simulated / video file cameras

For testing without physical cameras, EagleEye supports video file playback. Configure video file cameras in `src/config/video_file_cameras.json`:

```json
{
  "basic_test": "/path/to/test_video.mp4"
}
```

The key (`basic_test`) becomes the simulated `bus_id`. Use it in `device_input.py` just like a real bus ID. Video file cameras loop automatically.

## Calibrating camera intrinsics

Intrinsics calibration uses an OpenCV checkerboard workflow:

1. **Print a checkerboard** — use a standard 9×6 or 7×5 checkerboard on flat, rigid material. Record the square size in meters (e.g. `0.025` for 25 mm squares).

2. **Capture calibration images** — EagleEye does not include a built-in capture tool; use any OpenCV-compatible method to capture 15–30 images of the checkerboard from varied angles and distances.

3. **Run OpenCV calibration:**
   ```python
   import cv2, glob, numpy as np

   images = glob.glob('calib/*.jpg')
   objp = np.zeros((6*9, 3), np.float32)
   objp[:, :2] = np.mgrid[0:9, 0:6].T.reshape(-1, 2) * 0.025

   obj_points, img_points = [], []
   for fname in images:
       img = cv2.imread(fname)
       gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
       ret, corners = cv2.findChessboardCorners(gray, (9, 6))
       if ret:
           obj_points.append(objp)
           img_points.append(corners)

   ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
       obj_points, img_points, gray.shape[::-1], None, None
   )
   # Save as YAML...
   ```

4. **Upload via WebUI** — in the **Utils** tab, select the camera by bus ID, choose the generated YAML file, and click **Upload Intrinsics**. The file is saved to `src/config/camera_configs/<bus_id>/intrinsics.yaml`.

## Configuring camera extrinsics

Extrinsics describe where the camera is mounted on the robot. This is needed for PnP-based localization to transform camera-frame poses into robot-frame poses.

1. Open the **Utils** tab in the WebUI.
2. Select the camera by bus ID.
3. Enter the camera's position (x, y, z in meters from the robot origin) and rotation (roll, pitch, yaw in radians).
4. Click **Save Extrinsics**.

Saved extrinsics are written to `src/config/camera_configs/<bus_id>/extrinsics.json` and loaded at startup by `CameraConfigRegistry`.

## Multiple cameras

Each pipeline can have only one `device_input.py` (one camera source per pipeline). To process multiple cameras simultaneously, create multiple pipelines — one per camera — each with its own `device_input.py` node and processing chain.

```json
{
  "FrontCamera": [{"action_name": "device_input.py", "action_params": {"bus_id": "1-3.2"}, ...}],
  "BackCamera":  [{"action_name": "device_input.py", "action_params": {"bus_id": "1-4.1"}, ...}]
}
```
