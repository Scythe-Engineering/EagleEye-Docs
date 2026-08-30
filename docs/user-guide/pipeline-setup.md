---
sidebar_position: 4
title: Run the setup wizard
---

# Run the setup wizard

Flash the image, boot the Pi, then open [http://eagleeye.local:5001](http://eagleeye.local:5001).
On a fresh image, EagleEye opens the first-boot wizard before the normal camera and pipeline
pages. The wizard creates a running pipeline for each camera. You do not need to use the
Pipeline editor.

The automatic launch only happens while there are no configured pipelines. On the welcome page,
click **Start setup** to begin. **Skip for now** stops automatic first-boot launches. If you skip,
close the wizard, or later want to change the generated setup, open **Settings** and click
**Open** next to **Camera setup wizard**.

## Before starting

- Connect every camera you want to configure and make sure it appears in **Views**.
- Keep each camera in the USB port it will use on the robot.
- Have a printed ChArUco board and a tape measure ready.
- Know the roboRIO address, usually `10.TE.AM.2` on the robot network.
- For **Detect** only, upload or select a CPU-compatible model from the model library.

## 1. Choose the camera

On **Camera 1: choose camera**, select the physical camera from **Active camera**, then click
**Continue to calibration**. EagleEye displays the camera name and its USB bus ID in the list.
That ID is how it keeps the calibration and generated pipeline tied to the physical port.

![First-boot wizard camera selector](/img/ui-screenshots/wizard/choose-camera.png)

If the list is empty, connect the camera and click **Refresh cameras**. If a camera was plugged
in after EagleEye started, restart the backend, return to the wizard, and refresh the list.

## 2. Calibrate intrinsics

The wizard opens **Utils** with a guide panel on the right. The selected camera is already chosen
in **Camera Config Utils**. Click **Calibrate Camera**. You can instead use **Upload Intrinsics**
when you have a calibration JSON for that exact camera, lens, and capture resolution.

![Wizard guide on Camera Config Utils](/img/ui-screenshots/wizard/calibration-step.png)

In the calibration window:

1. Enter the dimensions and measured square and marker sizes for the ChArUco board you actually
printed. Sizes are in metres. Do not copy values from another board.
2. Keep the board flat, well lit, and in focus. Move it through the centre, all four corners,
near and far distances, and several tilts.
3. Capture at least 10 sharp, varied frames. Use **Capture**, or press <kbd>Space</kbd> or
<kbd>C</kbd>. Do not collect a stack of nearly identical centre frames.
4. Check the corner-coverage plot. It should cover the image rather than clustering in one area.
Remove blurry captures with their `×` buttons, or use **Reset** to start over.
5. Click **Calibrate & Save**. The guide will not let you continue until the selected camera has
a saved intrinsics file.

![ChArUco capture window with the coverage plot](/img/ui-screenshots/wizard/calibration-capture.png)

Click **Continue** in the guide after the calibration saves. **Cancel** returns to camera
selection without generating a pipeline.

## 3. Set the camera position

The same **Utils** page now shows the camera-position guide. Measure from the robot origin your
robot code uses to the front of the camera lens. Enter:

| Field | Units | Meaning |
|---|---|---|
| **Pitch**, **Yaw**, **Roll** | degrees | Camera mount rotation |
| **X Offset**, **Y Offset**, **Z Offset** | metres | Lens position relative to the robot origin |

Use **Camera Position Preview** to check that the camera marker is on the right side of the
robot and points the right way. Click **Save Extrinsics**, then click **Continue** in the guide.
The wizard saves these values before it advances.

![Camera position guide and extrinsics fields](/img/ui-screenshots/wizard/camera-position.png)

If the position is wrong, reopen the wizard or return to **Utils**, correct the values, and save
them before using the pose on a robot.

## 4. Choose what the camera does

Choose one purpose, then click **Save this camera**:

| Choice | Generated pipeline | Result |
|---|---|---|
| **Localize** | AprilTag localization | Robot pose published to NetworkTables and shown in 3D View |
| **Detect** | CPU object detection | Game-piece detections published in field space |
| **Both** | CPU object detection with localization | Robot pose and game-piece detections from the same camera |

![Wizard pipeline-purpose choices](/img/ui-screenshots/wizard/pipeline-purpose.png)

**Detect** requires a selected model that EagleEye confirms can run on the CPU. Click **Upload
or choose a model** to open the model library. **Both** can be saved without a model. Its
detector stays idle until a compatible model is available, while localization still runs. The
wizard does not create MX3 pipelines. Configure an MX3 pipeline in the
[advanced editor](./advanced-pipeline-editor).

## 5. Add cameras or connect NetworkTables

The summary lists each saved camera and its purpose. Click **Add another camera** to repeat the
camera, calibration, position, and purpose steps. Each camera gets its own generated pipeline
and NetworkTables source name. When the list is complete, click **Continue to NetworkTables**.

The wizard opens **Settings** and highlights the Network Table section. Enter the roboRIO or
simulation address in **Roborio (or sim) IP Address**, then click **Save Settings**. Click
**Continue** in the guide only after the address is saved.

![NetworkTables guide in Settings](/img/ui-screenshots/wizard/networktables-step.png)

EagleEye generates the pipelines and restarts the backend once. Wait for the page to reconnect.
Do not edit the generated graph while it is restarting.

## 6. Verify live output

After the restart, the wizard opens **3D View** with **Verify live output**. Select the current
field assets if needed, then put a 2026 AprilTag in the camera view. The robot marker should
move on the field.

![Wizard verification in 3D View](/img/ui-screenshots/wizard/verification.png)

The panel checks four things:

- **NetworkTables** is connected to the configured server.
- Every generated pipeline is active.
- Each required generated key is present below the `EagleEye` table.
- At least one expected key is present.

Click **Check again** after changing a cable, camera, field map, or robot address. **Finish**
stays disabled until the required checks pass. **Reopen setup** returns to the wizard if you
need to correct a camera or NetworkTables address.

## Generated keys and pipeline names

The wizard derives a safe, unique source from the camera name. For a source named
`front-camera`, it creates a pipeline named `wizard-front-camera-localize`,
`wizard-front-camera-detect`, or `wizard-front-camera-both`.

| Purpose | Generated key below `EagleEye` |
|---|---|
| **Localize** | `localization/<camera-source>` as a `Pose3d` |
| **Detect** | `detections/<camera-source>` as JSON |
| **Both** | Both keys above. The detection key is optional during verification when its model slot is empty. |

Use the exact key displayed in **Verify live output** when configuring robot code or a dashboard.
The source changes if camera names collide, so do not assume a hard-coded `front` name.

The [UI reference](./user-interface#setup-wizard) explains where the wizard lives in the rest of
the interface. Use [advanced manual pipeline setup](./advanced-pipeline-editor) only for custom
node graphs or MX3 inference.
