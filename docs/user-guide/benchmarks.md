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

Tests used two AprilTags at about 10 feet. Object-detection tests used the COCO Tiny YOLO v26
model.
