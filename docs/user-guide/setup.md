# Setup

## Install
1. Clone the repo and create a virtual environment.
2. Install dependencies (`pip install -r requirements.txt`). If GPU/MX3 support is needed, install vendor-specific packages per your hardware.
3. Place models and assets:
   - Model weights: `/path/to/model.onnx` (update to your actual path).
   - AprilTag map: `/path/to/apriltag_map.fmap`.
   - Camera parameters: `/path/to/camera_parameters.yaml`.

## Configure devices
- Define compute devices in code so `ComputePool` can register them (CPU always available; GPU/MX3 require drivers/SDKs).
- Verify device IDs used in config match those registered in `ComputePool` (e.g., `MX3`, `CUDA_0`, `CPU`).

## Cameras
- Calibrate cameras and store intrinsics/extrinsics; update paths in the pipeline config.
- Confirm camera stream URLs or device indices accessible to the application.

