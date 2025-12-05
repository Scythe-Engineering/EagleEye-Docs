# Troubleshooting

## Pipelines not loading
- Check `pipeline_config.json` for typos and ensure each `action_name` module exists.
- Verify `device_id` matches a device in `ComputePool`.
- Inspect logs for import errors; resolution order is main definitions then secondary operations.

## No camera feed
- Confirm camera source is reachable.
- Validate calibration/config paths.
- Check WebUI server logs for stream errors.

## Slow or unstable FPS
- Enable `debug_mode` in `src/config/utils/pipeline.py` to view per-op timings.
- Reduce model size or switch to a faster device.
- Use `FpsLimiter`/filtering operations if configured.

## WebUI issues
- Rebuild frontend assets if pipeline tab features are missing (`npm run build` placeholder).
- Confirm port `5001` is free and CORS settings allow your host.

## Placeholders to fill
- Hardware-specific install steps (GPU/MX3 drivers).
- Deployment/service manager commands (systemd, docker, etc.).

