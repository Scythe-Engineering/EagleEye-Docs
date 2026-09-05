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

Use the two-key constructor below for **Basic localization**. `forSource("localization/front")`
also subscribes to `/detections`; use it only with a pipeline that publishes detections.
The source name is an example: copy the actual publisher keys from your pipeline.

## Coordinate contract

| Quantity | Convention |
| --- | --- |
| Field position | Corner-origin NWU, meters: +X downfield, +Y left, +Z up |
| Robot heading | Counterclockwise-positive yaw; WPILib angles are radians |
| Published pose | Robot-origin `Pose3d`, after camera mounting compensation |
| Estimator input | `Pose3d.toPose2d()` retains field X/Y and yaw |
| WebUI display | Centered Y-up rendering; display conversions stay in the frontend |

Keep odometry, vision, and the field map in the same field frame. Do not swap X/Y,
negate Y/yaw, or apply the WebUI's centered display transform in Java. Do not change
vision origin when alliance changes unless every estimator input uses that same frame.

## Add it to Drive.java

Add the import and camera field to the subsystem that owns your pose estimator:

```java
import frc.robot.vision.EagleEyeCamera;

public class Drive extends SubsystemBase {
  private final EagleEyeCamera[] eagleEyeCameras = {
    new EagleEyeCamera("localization/front/pose", "localization/front/meta"),
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
  new EagleEyeCamera("localization/front/pose", "localization/front/meta"),
  new EagleEyeCamera("localization/back/pose", "localization/back/meta"),
};
```

For a differential drive, use the same camera array and update your existing estimator
with measured wheel distances before adding vision:

```java
@Override
public void periodic() {
  poseEstimator.update(gyro.getRotation2d(), leftDistanceMeters, rightDistanceMeters);
  EagleEyeCamera.update(poseEstimator::addVisionMeasurement, eagleEyeCameras);
}
```

For logging or custom processing, use `poll()` instead of `update()` on that camera
in the same cycle; both drain its queue:

```java
for (var observation : eagleEyeCameras[0].poll()) {
  poseEstimator.addVisionMeasurement(
      observation.pose(), observation.timestampSeconds(),
      EagleEyeCamera.standardDeviations(observation));
  // Log observation.tagCount(), meanTagDistanceMeters(), and reprojectionErrorPixels().
}
```

The SDK intentionally assigns heading a very large standard deviation by default,
so a drivetrain with a trustworthy gyro primarily uses vision to correct translation.

## Why you do not subtract latency

EagleEye carries the source-frame timestamp through the pipeline and publishes it with the pose. NetworkTables converts the coprocessor timestamp into the roboRIO server clock, which is the FPGA-time domain expected by `addVisionMeasurement`.

`EagleEyeCamera` therefore passes `sample.timestamp / 1e6` directly to WPILib. Do not replace it with `Timer.getFPGATimestamp()` and do not subtract processing or network latency again.

A V4L2 source reports exposure time when the driver marks its buffer as monotonic and start-of-exposure. Other drivers, OpenCV sources, and video files fall back to frame-delivery time.

## Quality filtering

Each metadata sample contains:

```text
[tagCount, meanTagDistanceMeters, reprojectionErrorPixels]
```

The defaults reject observations with fewer than two tags, tags farther than 6 m, reprojection error above 2 px, or age above 0.5 seconds. Future samples, non-finite pose/metric values, negative distance/error values, and non-integer tag counts are also rejected. Translation uncertainty grows with distance squared and falls as tag count rises. Tune the public static fields on `EagleEyeCamera` only after logging real field data.

A connected topic does not guarantee an accepted measurement: for example, a 2.8 px
observation is correctly rejected by the default 2 px gate. Inspect calibration, tag-map
geometry, and raw metrics before changing limits. Public static limits affect every camera;
a relaxed diagnostic stream is not evidence that measurements are safe to fuse.

Pose and metadata must share the exact capture timestamp. The SDK carries unmatched
samples across poll calls until they arrive or age out, and returns accepted observations
in capture order. Publishers retain identical values at new timestamps, so a stationary
robot still receives new measurements.

## Simulation

For a complete runnable project with contract tests, open
[`library/examples/localization-sim`](https://github.com/Scythe-Engineering/EagleEye-Vision-System/tree/main/library/examples/localization-sim).
Run `./gradlew test build`, then **WPILib: Simulate Robot Code** with **Sim GUI** enabled.
In AdvantageScope choose **File → Connect to Simulator → NetworkTables 4** and display
`SmartDashboard/EagleEye`, including the `GroundTruth` object and the robot estimate.

To add simulation to an existing robot project, copy `EagleEyeCameraSim.java`, then create a publisher in simulation setup:

```java
import edu.wpi.first.apriltag.AprilTagFieldLayout;
import edu.wpi.first.apriltag.AprilTagFields;
import edu.wpi.first.math.geometry.Transform3d;
import frc.robot.vision.EagleEyeCameraSim;

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

Use the single-argument constructor `new EagleEyeCameraSim("localization/front")`
for a plumbing-only test with fixed valid metadata and no tag-layout visibility model.
Keep simulated and physical publishers on different source keys when both are running.
A stationary room camera should not be fused with an unrelated moving drive simulation.

When a remote coprocessor connects to desktop simulation, enter the **simulation host's
reachable address** in EagleEye Settings, not the coprocessor's localhost. Leave an already
connected backend running while testing Java. In AdvantageScope, check timestamps or an
accepted-observation counter: a retained pose can remain visible after publishing stops.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Driver Station warns that both keys are missing | Confirm EagleEye is connected to the roboRIO and the pipeline is running |
| Only the metadata key is missing | Connect a publisher to PnP `pose_meta` and use `localization/front/meta` |
| Only the pose key is missing | Confirm Camera To Robot Pose feeds the `pose3d` publisher at `localization/front/pose` |
| Topics exist but no observations are accepted | Check tag count, range, reprojection error, and timestamp age |
| Estimate jumps toward vision | Raise `EagleEyeCamera.translationStdDevBase` or tighten quality limits |

Desktop validation exercised exact live pose/metadata joins, Java X/Y/yaw preservation, and five independent remote heading/position fixtures. The runnable example includes the Java regression tests. A physical roboRIO round-trip has not yet been documented as field-verified, so test this integration on your robot before competition.
