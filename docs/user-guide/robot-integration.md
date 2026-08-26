---
sidebar_position: 10
title: Add EagleEye to robot code
---

# Add EagleEye to robot code

EagleEye publishes timestamped robot poses and quality measurements. The robot library joins the two NetworkTables topics, filters weak observations, and sends accepted poses to a WPILib pose estimator.

## Copy the library

Copy these files from the EagleEye repository into your robot project:

```text
library/java/frc/robot/vision/EagleEyeCamera.java
library/java/frc/robot/vision/EagleEyeCameraSim.java  # optional, for simulation
```

Place them under `src/main/java/frc/robot/vision/`, or change their `package` declarations to match your project. They only depend on WPILib. There is no vendordep.

## Configure the EagleEye pipeline

Create a pipeline from **Basic localization** in the Pipeline tab. Configure the camera and field map, then confirm these publishers remain connected directly to the PnP result:

| PnP output | NetworkTables key | Schema |
|------------|-------------------|--------|
| Robot pose through Camera To Robot Pose | `localization/front/pose` | `pose3d` |
| `pose_meta` | `localization/front/meta` | `auto` |

Both publishers must preserve the same capture timestamp. Do not put a multi-input operation between PnP and either publisher. For another camera, duplicate the pipeline and use another source name such as `localization/back`.

## Add it to Drive.java

Add the import and camera field to the subsystem that owns your pose estimator:

```java
import frc.robot.vision.EagleEyeCamera;

public class Drive extends SubsystemBase {
  private final EagleEyeCamera[] eagleEyeCameras = {
    EagleEyeCamera.forSource("localization/front"),
  };

  // Existing drive fields, constructor, and methods...
}
```

After your normal odometry update in `periodic()`, drain the queued vision observations:

```java
@Override
public void periodic() {
  poseEstimator.update(gyro.getRotation2d(), modulePositions);
  EagleEyeCamera.update(
      poseEstimator::addVisionMeasurement,
      eagleEyeCameras);
}
```

Use your existing gyro and module-position expressions. The important ordering is odometry first, then EagleEye. Call this from `periodic()`, not a NetworkTables listener thread. `SwerveDrivePoseEstimator` is not thread-safe.

For multiple cameras, add each source to the array:

```java
private final EagleEyeCamera[] eagleEyeCameras = {
  EagleEyeCamera.forSource("localization/front"),
  EagleEyeCamera.forSource("localization/back"),
};
```

## Why you do not subtract latency

EagleEye carries the source-frame timestamp through the pipeline and publishes it with the pose. NetworkTables converts the coprocessor timestamp into the roboRIO server clock, which is the FPGA-time domain expected by `addVisionMeasurement`.

`EagleEyeCamera` therefore passes `sample.timestamp / 1e6` directly to WPILib. Do not replace it with `Timer.getFPGATimestamp()` and do not subtract processing or network latency again.

A V4L2 source reports exposure time when the driver marks its buffer as monotonic and start-of-exposure. Other drivers, OpenCV sources, and video files fall back to frame-delivery time.

## Quality filtering

Each metadata sample contains:

```text
[tagCount, meanTagDistanceMeters, reprojectionErrorPixels]
```

The defaults reject observations with fewer than two tags, tags farther than 6 m, reprojection error above 2 px, or age above 0.5 seconds. Translation uncertainty grows with distance squared and falls as tag count rises. Tune the public static fields on `EagleEyeCamera` only after logging real field data.

## Simulation

Copy `EagleEyeCameraSim.java`, then create a publisher in simulation setup:

```java
private EagleEyeCameraSim frontCameraSim;

@Override
public void simulationInit() {
  frontCameraSim =
      new EagleEyeCameraSim(
          "localization/front",
          new Transform3d(),
          AprilTagFieldLayout.loadField(AprilTagFields.kDefaultField));
}
```

Publish the drive simulation's ground-truth pose each simulation cycle:

```java
@Override
public void simulationPeriodic() {
  frontCameraSim.update(driveSim.getPose());
}
```

The simulator publishes pose and metadata with one shared timestamp. It models field-of-view, range, dead zones, and configurable translation noise. It does not model pipeline latency or solver failures.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Driver Station warns that both keys are missing | Confirm EagleEye is connected to the roboRIO and the pipeline is running |
| Only the metadata key is missing | Connect a publisher to PnP `pose_meta` and use `localization/front/meta` |
| Only the pose key is missing | Confirm Camera To Robot Pose feeds the `pose3d` publisher at `localization/front/pose` |
| Topics exist but no observations are accepted | Check tag count, range, reprojection error, and timestamp age |
| Estimate jumps toward vision | Raise `EagleEyeCamera.translationStdDevBase` or tighten quality limits |

The Java library and simulation path are implemented and tested in the repository. A physical roboRIO round-trip has not yet been documented as field-verified, so test this integration on your robot before competition.
