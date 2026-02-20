# Troubleshooting

## Pipelines not loading

**Symptom:** Pipeline tab shows no operations, or the backend logs `No cameras configured`.

- Confirm `src/config/pipeline_config.json` is valid JSON with at least one top-level pipeline key.
- Check that every `action_name` in the config matches a file in `src/main_operations/definitions/` or `src/secondary_operations/`. Names are matched including the `.py` extension.
- Verify that `device_id` values in `action_params` exist in `ComputePool`. Valid formats: `CPU`, `GPU_0`, `MX3_0`.
- Check backend logs for `ImportError` or `ModuleNotFoundError` lines — these indicate a missing dependency or typo in the module file.

## Rust build fails at startup

**Symptom:** Backend exits immediately with `Failed to build Rust implementations`.

- Make sure a Rust stable toolchain is installed: `rustup toolchain install stable`.
- On a fresh coprocessor install, run `cargo --version` to confirm Rust is on PATH.
- Check for write permission issues in the project directory (maturin writes compiled `.so` files there).
- Look at the full stderr from `src/rust_implementations/build.py` in the logs for the specific compile error.

## No camera feed

**Symptom:** Views tab shows the "no image" placeholder; logs show no cameras detected.

- Unplug and replug cameras and restart the backend. USB bus IDs are assigned at connection time.
- Run `lsusb` to confirm the cameras appear as USB devices.
- Check that the `bus_id` in your `device_input.py` operation matches the bus ID printed at startup (e.g. `1-3.2`).
- For video file cameras, confirm the file path exists and is readable.

## Slow or unstable FPS

- The FlowManager prints per-operation timing to the profiling SSE stream, visible in the Pipeline Editor's profiling overlay.
- Heavy operations (ONNX inference) on CPU are slower than on GPU/MX3 — verify the correct `device_id` is configured.
- Use `fps_limiter.py` as a secondary operation to cap a pipeline to a target frame rate and reduce load.
- Reduce `quad_decimate` in `detect_apriltags.py` if AprilTag detection is the bottleneck (lower value = more detail but slower).

## WebUI not loading

- Confirm the frontend was built: `cd src/webui && npm run build`. The backend serves static files from the build output; a missing build shows a blank page or 404.
- Confirm port `5001` is not occupied by another process: `lsof -i :5001`.
- Check CORS if accessing from a different machine — by default only `localhost:5001`, `localhost:5173`, and `localhost:5174` are allowed. Accessing via IP may require a config change.

## Restart indicator not clearing

**Symptom:** The WebUI shows a persistent "restart required" warning after saving a pipeline or custom operation.

- Click the **Restart** button in the Settings tab. This calls `POST /restart-backend`, which triggers `sudo systemctl restart $SERVICE_NAME`.
- If the restart button fails, ensure the `eagle` user has passwordless sudo for `systemctl restart eagleeye`:
  ```
  eagle ALL=(ALL) NOPASSWD: /bin/systemctl restart eagleeye
  ```
- If not running as a systemd service, restart the backend manually.

## NetworkTables not receiving data

- Confirm the NT server address in `src/general_conf.json` is correct (e.g. `10.TE.AM.2` or `roborio-TEAM-frc.local`).
- Verify the robot/RoboRIO is powered on and reachable: `ping 10.TE.AM.2`.
- Check that the pipeline is not disabled for NT output (Settings tab).
- On first startup the schema manifest is published to the `EagleEye` table — if NT is unreachable this may time out silently. The backend continues running regardless.

## MX3 accelerator not detected

- Confirm the Memryx PCIe/USB device is visible: `lspci | grep -i memryx` or check `dmesg`.
- MX3 detection uses `get_available_devices()` which queries the Memryx SDK. Install or reinstall the SDK per the hardware documentation.
- Device IDs are formatted `MX3_0`, `MX3_1`, etc. The index comes from `memx:0`, `memx:1`.

## GPU not detected

- Confirm CUDA is installed and `nvidia-smi` works.
- GPU detection uses `torch.cuda.is_available()` or the ONNX Runtime CUDA provider, depending on your install.
- GPU IDs are formatted `GPU_0`, `GPU_1`, etc., matching the order reported by `nvidia-smi`.
