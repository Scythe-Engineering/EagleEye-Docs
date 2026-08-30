---
sidebar_position: 14
title: "Advanced: manual pipeline setup"
---

# Advanced: manual pipeline setup

The first-boot wizard is the normal way to create a localization or CPU detection pipeline. Use
the Pipeline editor when you need a custom graph, want to tune the generated graph, or need MX3
inference.

Fresh installations start with an empty pipeline configuration. The wizard creates standard
pipelines from the bundled AprilTag-localization and CPU object-detection templates.

## Start from a template

1. Open **Pipeline**.
2. Click **New Pipeline**.
3. Choose the template that is closest to your goal.
4. Give the pipeline a clear name and create it.
5. Select the camera, calibration files, field map, model, and NetworkTables keys required by
that graph.
6. Restart the backend when the editor requests it, then check **System**, **3D View**, and your
NetworkTables client.

For a standard camera, rerunning **Settings → Camera setup wizard → Open** is usually safer than
hand-editing a generated graph. It repeats the camera setup and replaces the wizard's earlier
generated pipelines while leaving unrelated pipelines alone.

## When to use this editor

- **MX3 inference.** The wizard creates CPU object-detection pipelines. Start from the MX3
template and select a compatible MX3 model and device here.
- **Custom processing.** Add filters, transforms, or special publishers the wizard does not ask
about.
- **Manual NetworkTables contract.** Use this when robot code expects custom topic names or the
older pose-plus-metadata pair described in [Connect NetworkTables](./networktables).

## Safe editing

**Robot Pose Output** updates 3D View. It does not publish to NetworkTables. Add a separate
**Publish To NetworkTables** node for every value the robot needs.

Keep one source name per camera. Do not fuse camera poses in EagleEye before publishing them;
let the robot pose estimator fuse measurements at their capture timestamps.

The [user interface reference](./user-interface#pipeline-editor-advanced) lists graph controls,
restart behavior, and operations. [Temporal acceleration](./temporal-acceleration) is an
advanced AprilTag optimization. Add it only after the basic pipeline is accurate and you have
measured its profile.
