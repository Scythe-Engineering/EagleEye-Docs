---
sidebar_position: 4
title: Run the setup wizard
---

# Run the setup wizard

The intended EagleEye setup is a generated pipeline, not a graph-building exercise. Flash the
image, open [http://eagleeye.local:5001](http://eagleeye.local:5001), then follow the wizard
for each camera.

:::warning Current-release status
The source tree reviewed for this guide does not yet include a first-boot wizard, generated
pipelines, or a wizard verification screen. Do not expect these controls on a current image.
Use the [advanced manual pipeline setup](./advanced-pipeline-editor) until a release includes
the wizard.
:::

## Planned guided flow

When a release includes the wizard, it is expected to guide one camera at a time through:

1. Select the camera.
2. Calibrate or upload its intrinsics.
3. Enter and save the camera's robot-relative position.
4. Choose localization, detection, or both.
5. Set the roboRIO NetworkTables address.
6. Generate the pipeline and verify the pose in 3D View and the NetworkTables keys.

For more cameras, repeat the camera steps and give each generated publisher a distinct source
name such as `localization/front` or `localization/back`.

## What still needs release verification

Before this page can become a runnable wizard guide, a maintainer needs to confirm the shipped
wizard's entry point, labels, generated pipeline choices, model-upload behavior, NetworkTables
key names, and verification result on a current image. This page deliberately does not guess at
those details.

Until then, use the linked manual path. It is advanced material because it requires editing a
pipeline graph and its node settings.
