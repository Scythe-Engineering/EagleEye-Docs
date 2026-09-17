---
title: Synthetic video benchmarks
sidebar_label: Synthetic video benchmarks
---

# Synthetic video benchmarks

EagleEye can render CAD-backed AprilTag footage and replay every frame through the production full-frame and temporal localization graphs. Reports contain pose and detection metrics, per-clip plots, diagnostic images, and hashes for the dataset, graphs, calibration, map, and runtime environment.

Synthetic replay does not measure physical camera transport, the application's outer threaded loop, NetworkTables transport, or preview encoding. It measures pipeline behavior against a fixed video and truth set.

## Run an accuracy benchmark

Published datasets use two archives:

- `EagleEye-current-benchmark-videos.zip` contains the videos.
- `EagleEye-current-benchmark-metadata.zip` contains `manifest.json` and the calibration, ground-truth, and events files referenced by it.

The `run` command downloads both archives into the EagleEye checkout, extracts missing files into the ignored `benchmarks/cache` directory, and verifies every selected asset against the manifest.

From an EagleEye Vision System checkout:

```bash
uv run python -m benchmarks verify path/to/manifest.json --subset pilot
uv run python -m benchmarks run --subset pilot \
  --pipeline both --output benchmark-results/pilot
```

When `--dataset` is omitted, `run` reads `manifest.json` from the metadata archive and keeps a copy in the repository root. Use `--dataset path/to/manifest.json` for a local manifest. Use `--archive-url URL` to select another video archive. The URL must end in `-videos.zip`, so the metadata URL can be derived from it.

Use `--pipeline full-frame` or `--pipeline temporal` to run one graph. Use `--manifest-sha256` to pin the manifest and `--overwrite` to replace an existing report directory. Add `--timeout SECONDS` for a bounded partial run. The command stops between frames and writes a valid partial report.

A completed run writes:

- `run.json` with provenance and completion status
- `frames.jsonl.gz` with one scored record per frame
- `summary.json` and `summary.csv`
- `index.html` with offline plots and tables
- a bounded set of diagnostic images under `images/`

Exit code `0` means reporting completed without pipeline frame failures. Invalid input, missing assets, and pipeline failures return `2`.

## Measure temporal performance

Use the temporal experiment command for equal-length timing and reacquisition comparisons:

```bash
uv run python -m benchmarks.temporal_experiments \
  --frames-per-clip 600 --timeout 90 \
  --output benchmark-results/temporal-screen
```

Pass `--config path/to/temporal.json` for a configuration variant. The file must be named `temporal.json`. Omit `--frames-per-clip` for full validation. Compare runs with the same clips and frame limits. A timeout that stops different clips at different points is not a fair comparison.

## Generate Blender footage

Rendered media belongs in `/tmp` or ignored `benchmark-results/`. Do not commit generated frames, videos, manifests, or runner output.

The maintained collection has six CAD-backed 30-second routes, totaling 21,600 frames at 1280x800 and 120 FPS. The active batch renders the `combined-realistic` variant. It combines lighting, exposure, seeded sensor noise, defocus, motion blur, and lens distortion. The renderer validates route motion, field dimensions, robot and blocker clearance, and AprilTag mounting faces against the 2026 field GLB and field map.

### Three-frame clean smoke test

This requires Blender 4.4 or later and FFmpeg:

```bash
blender --background --python-exit-code 1 \
  --python benchmarks/blender/generate.py -- \
  --recipe benchmarks/blender/smoke-recipe.json \
  --output /tmp/eagleeye-blender-smoke \
  --start-x 15 --start-y 4.0345 --yaw-degrees 180 --speed 0

uv run python benchmarks/blender/package.py \
  --frames /tmp/eagleeye-blender-smoke/frames \
  --output /tmp/eagleeye-blender-smoke/clean.mkv --fps 120
```

The generator writes 16-bit PNG intermediates. The packager applies the selected display-domain effects, encodes H.264, and verifies that every frame decodes. Keep the frames until the generated manifest has been checked. `--cleanup-frames` is the only cleanup path.

### Full match collection

Inspect assignments and validate all routes before starting a long render:

```bash
uv run python benchmarks/blender/render_match.py \
  --output benchmark-results/frc2026-media --list

uv run python benchmarks/blender/render_match.py \
  --output benchmark-results/frc2026-media --validate-only

uv run python benchmarks/blender/render_match.py \
  --output benchmark-results/frc2026-media \
  --device OPTIX --samples 64 --denoise --persistent-data \
  --frame-indices 0,960,1920,2880
```

Omit `--validate-only` and `--frame-indices` for a resumable full render:

```bash
uv run python benchmarks/blender/render_match.py \
  --output benchmark-results/frc2026-media \
  --device OPTIX --samples 64 --denoise --persistent-data \
  --jobs red-end-range-ladder:combined-realistic
```

Each job records a `runner.log` and atomic `status.json`. Resume skips a job only when its source signature, generated truth and provenance digests, H.264 manifest, decoded frame count, video size, and video hash still match.

Set `EAGLEEYE_BLENDER` and `EAGLEEYE_FFMPEG` to override tool paths when running the opt-in rendered test:

```bash
EAGLEEYE_RUN_RENDERED_TESTS=1 \
  uv run pytest -q tests/test_rendered_benchmark.py
```

### Publish dataset archives

After the manifest and content-addressed cache are ready, create the two publication archives:

```bash
uv run python -m benchmarks.blender.package_dataset \
  ~/Downloads/EagleEye-current-benchmark-videos_manifest.json \
  --cache-dir ~/.cache/eagleeye/benchmarks \
  --output-dir ~/Downloads
```

This writes a videos archive and a metadata archive. The videos archive contains only manifest-referenced videos. The metadata archive contains `manifest.json` and all referenced calibration, ground-truth, and events files. Existing output archives are replaced.

## What the reports mean

Replay uses the production scheduler, AprilTag detector, Rust temporal preprocessor, PnP localization, and camera-to-robot conversion. Green outlines in diagnostic images show detections. Red outlines show searched regions. The images do not draw geometric truth as if it were a detection.

Pixel-visibility masks and reviewed acceptance limits do not currently exist. Eligible detection recall is therefore unavailable in datasets without those masks, and provisional match plots are diagnostic only. A completed report is not a certified accuracy gate.

## Source files

The benchmark implementation remains in the EagleEye Vision System repository:

- [`benchmarks/__main__.py`](https://github.com/Scythe-Engineering/EagleEye-Vision-System/blob/main/benchmarks/__main__.py) contains the accuracy CLI.
- [`benchmarks/dataset.py`](https://github.com/Scythe-Engineering/EagleEye-Vision-System/blob/main/benchmarks/dataset.py) defines the manifest and cache contract.
- [`benchmarks/replay.py`](https://github.com/Scythe-Engineering/EagleEye-Vision-System/blob/main/benchmarks/replay.py) runs production graphs.
- [`benchmarks/blender/`](https://github.com/Scythe-Engineering/EagleEye-Vision-System/tree/main/benchmarks/blender) contains the renderer and packagers.
