# Synthetic video benchmarks

EagleEye Vision System can render CAD-backed AprilTag footage and replay every frame through the production full-frame and temporal localization graphs. Reports contain pose and provisional detection metrics, per-clip plots, diagnostic images, and hashes for the dataset, graphs, calibration, map, and runtime environment.

## Run the benchmark

The published dataset is split into two downloads.
`EagleEye-current-benchmark-videos.zip` contains only videos.
`EagleEye-current-benchmark-metadata.zip` contains `manifest.json` plus the
calibration, ground-truth, and events files required by those videos. The
benchmark command downloads and verifies both archives automatically.

From an EagleEye Vision System checkout, verify a cached dataset and run both localization pipelines:

```bash
uv run python -m benchmarks verify path/to/manifest.json --subset pilot
uv run python -m benchmarks run --dataset path/to/manifest.json --subset pilot \
  --pipeline both --output benchmark-results/pilot
```

Add `--timeout SECONDS` for a quick pipeline evaluation. The timer uses elapsed wall-clock time, stops between frames, and still writes a partial report. Without it, the full selected dataset runs.

The rendered Blender smoke test is opt-in:

```bash
EAGLEEYE_RUN_RENDERED_TESTS=1 uv run pytest -q tests/test_rendered_benchmark.py
```

A normal `uv run pytest` skips that smoke test. CI does not set the flag or invoke the benchmark CLI, so it does not render footage, download benchmark media, or require benchmark results.

The code repository owns the full command and file format references:

- [Accuracy benchmark README](https://github.com/Scythe-Engineering/EagleEye-Vision-System/blob/main/benchmarks/README.md)
- [Blender generator README](https://github.com/Scythe-Engineering/EagleEye-Vision-System/blob/main/benchmarks/blender/README.md)

The retained collection has six 30-second combined-realistic routes, totaling 21,600 frames at 1280x800 and 120 FPS. The renderer imports the 2026 field GLB, validates AprilTag mounting faces against the field map, checks robot and blocker clearance, and records camera, robot, blocker, and projected-corner truth. The renderer supports sparse preflight frames and resumable jobs. Packaging writes lossless FFV1 video and verifies every decoded pixel against the packaged source.

A three-frame clean recipe provides the sole opt-in rendered smoke check. Historical pilot recipes, effect-matrix rendering, and worker browser-preview tooling are not part of the maintained workflow.

Replay uses the production scheduler, AprilTag detector, Rust temporal preprocessor, PnP localization, and camera-to-robot conversion. It does not include physical camera transport, the application's outer thread loop, networking, or preview encoding. The benchmark measures accuracy, not sustained live throughput.

Diagnostic images share the production detector overlay. Green outlines are detections and red outlines are searched regions. They do not draw projected truth as if it were a detection.

Pixel-visibility masks and reviewed acceptance limits do not yet exist. Eligible detection recall therefore remains unavailable, and provisional match plots are diagnostic only. A completed report is not a certified accuracy gate.
