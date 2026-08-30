---
sidebar_position: 12
title: Benchmarks
---

# Benchmarks

| Workload | Maintainer measurement | Current-release reproduction |
|---|---:|---|
| Two-camera AprilTag localization with temporal acceleration | 120 FPS per camera | Pending |
| One-camera AprilTag localization without temporal acceleration | 60 FPS | Pending |
| Object detection on a Pi 5 CPU | 6 to 10 FPS | Pending |
| Object detection with a MemryX MX3 | 60+ FPS | Pending |

The MX3 result requires an MX3 and a compatible model. It is not a result for CPU-only hardware.

## Reproduce a measurement

Use a Raspberry Pi 5 with the same image, EagleEye release, camera configuration, and pipeline
for every run. Reboot before a run, wait for the pipeline to settle, and record the **Pipeline**
profiling FPS while the camera sees a representative static and moving field scene. Record at
least one sustained sample instead of reporting a single peak. Run one workload at a time except
for the two-camera measurement, where both pipelines must run together.

For object detection, record whether inference uses the CPU or MX3, the model artifact, input
resolution, confidence threshold, and camera frame rate. For AprilTags, record whether temporal
acceleration is enabled and the detector settings. Without those inputs, an FPS comparison is
not reproducible.

## Exact configuration record

Fill one copy of this record for each published rerun. Bracketed fields are intentionally blank
until a maintainer performs and records the run.

| Field | Record |
|---|---|
| Measurement | [two-camera temporal / one-camera non-temporal / CPU detection / MX3 detection] |
| EagleEye release and commit | [record at rerun] |
| Raspberry Pi 5 model, RAM, OS image, and power setup | [record at rerun] |
| Camera model, sensor shutter type, lens, USB path, resolution, and requested frame rate | [record at rerun] |
| Pipeline export or committed configuration path | [record at rerun] |
| AprilTag family, map, detector settings, and temporal-acceleration settings | [record when applicable] |
| Detection model, input size, confidence threshold, and inference device | [record when applicable] |
| MX3 model and DFP, if used | [record when applicable] |
| Scene, tag distance or object motion, warm-up period, sample duration, and FPS statistic | [record at rerun] |
| Result and date | [record at rerun] |

Do not replace the four maintained measurements with a new number until its completed record is
published with the result.
