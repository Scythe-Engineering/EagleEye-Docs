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

## Configure EagleEye and find your source keys

On a fresh installation, complete the [camera setup wizard](./open-the-ui#2-complete-first-time-camera-setup).
Name each camera by placement, calibrate it, enter its mounting extrinsics, and select
**Localize** or **Both**. Enter the roboRIO address, or the reachable simulation host address,
at the NetworkTables step. The wizard generates one pipeline per configured camera and
restarts EagleEye. Verify the field map and robot pose before using the measurements.

If the wizard already generated a localization pipeline, use it. You do not need to create
a second pipeline from a template. For manual setup instead, create **Basic localization**
in the Pipeline tab and follow [Build an AprilTag pipeline](./pipeline-setup).

### Display names are not subscription keys

A name such as `Front bumper` is only a UI label. The wizard generates the source segment
from the camera's hardware-derived name, adding a suffix when needed to distinguish cameras
or avoid existing publisher keys. It does not use the placement description.

To connect robot code to a generated pipeline:

1. Open that pipeline in **Pipeline** and inspect its **Publish To NetworkTables** nodes.
2. Copy the pose and metadata publishers' exact `target_key` values. They share a prefix
   of `localization/<source>` and end in `/pose` and `/meta`.
3. Check that both topics appear under the `EagleEye` table in AdvantageScope or OutlineViewer
   while mapped AprilTags are visible.
4. Use those two relative keys in the Java constructor below. Do not include the `EagleEye/`
   table prefix.

For example, if the publishers use `localization/usb-camera/pose` and
`localization/usb-camera/meta`, the robot field is:

```java
private final EagleEyeCamera frontBumperCamera =
    new EagleEyeCamera("localization/usb-camera/pose", "localization/usb-camera/meta");
```

`usb-camera` is an example, not a fixed wizard source ID. Copy the values from your pipeline.
Renaming the camera later in **Settings → Camera Names** leaves these keys unchanged, so
no robot-code edit is needed. If you manually edit publisher keys or generate another
pipeline, check its keys again.

### Check the publishers

For localization, confirm these timestamp-preserving paths:

| PnP output | NetworkTables key | Schema |
|------------|-------------------|--------|
| Robot pose through Camera To Robot Pose | `localization/front/pose` | `pose3d` |
| `pose_meta` | `localization/front/meta` | `auto` |

Both publishers must preserve the same capture timestamp. Do not put a multi-input operation between PnP and either publisher. For another camera, duplicate the pipeline and use another source name such as `localization/back`.

The remaining examples use `localization/front` for readability. Replace it with the exact
prefix you copied from your pipeline, including any suffix. Use the two-key constructor for
pose estimation from **Basic localization**, wizard **Localize**, or the pose output of **Both**.

`forSource("localization/front")` also subscribes to `/detections`; use it only when all three
matching topics are published. **Detect**-only wizard pipelines do not publish the pose/meta
pair and cannot feed the pose-estimator integration below. Use Localize or Both if you want
EagleEye robot-pose measurements.

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

For multiple cameras, copy the distinct source prefix from each pipeline and add each
pose/meta pair to the array. Do not derive these keys from the camera's display name:

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

## Optional enhancement: lower-latency ingestion

The simple 20 ms integration above remains supported and is the default. For faster
consumption, move **both odometry and vision ingestion** into a method scheduled every
5 ms. The camera keys, SDK, quality gates, and capture timestamps stay the same.

### 1. Move the estimator update in Drive.java

Replace the odometry and EagleEye calls in `Drive.periodic()` with a public method:

```java
public void updateOdometryAndVision() {
  // Read fresh measured sensor positions here on every call.
  poseEstimator.update(gyro.getRotation2d(), getModulePositions());
  EagleEyeCamera.update(poseEstimator::addVisionMeasurement, eagleEyeCameras);
}

@Override
public void periodic() {
  // Keep dashboard updates and other normal subsystem work here.
  // Odometry and EagleEye now run only in updateOdometryAndVision().
}
```

`getModulePositions()` stands for your drivetrain's method that reads current module
positions; replace it with your actual sensor API. For differential drive, pass current
left and right wheel distances instead. Do not reuse positions cached only every 20 ms.

### 2. Register the callback once in Robot.java

After constructing your existing `RobotContainer`, register its existing drive subsystem:

```java
public Robot() {
  // Keep your existing initialization, including creation of robotContainer.
  addPeriodic(robotContainer.getDrive()::updateOdometryAndVision, 0.005, 0.002);
}
```

Use your project's container field name and expose its existing drive instance through
`getDrive()` if needed. Do not create a second drive subsystem. Keep the command scheduler
and normal robot loop at 20 ms.

WPILib's `TimedRobot.addPeriodic` runs this callback on the same thread as the normal
robot callbacks. No extra thread or locks are needed for this path. Keep the method short:
no blocking waits, dashboard publishing, or heavy processing. A 5 ms callback does not
increase the camera's capture rate or the sensors' hardware refresh rate.

Use exactly one estimator update path: remove the old periodic odometry/vision calls,
and do not also poll the same cameras from a listener or worker thread. If your drivetrain
already owns odometry on another thread, integrate vision with that existing ownership
model instead of copying this callback. To return to the simple path, remove the callback
and call `updateOdometryAndVision()` once from `Drive.periodic()`.

### Coprocessor behavior and measured benefit

EagleEye requests a NetworkTables flush after all branches of a successful publishing
pipeline finish. This benefits both robot paths automatically, with no additional ports,
packages, or robot API changes. NetworkTables still rate-limits transmission.

In the September 8, 2026 Pi-to-desktop WPILib test, with the same camera configuration
and pipeline flush enabled:

| Robot ingestion | Mean capture timestamp to ingestion | Mean pose/metadata ready to ingestion |
| --- | --- | --- |
| Simple, 20 ms | 32.3 ms | 16.8 ms |
| Enhanced, 5 ms | 24.9 ms | 9.4 ms |

These are clean-window measurements, not guaranteed robot timing or photon-to-pose
latency. A separate run showed an unresolved approximately 29-second NetworkTables
backlog. Verify sample age, accepted counts, loop overruns, and reconnect behavior on
your robot; keep the SDK's stale-sample rejection enabled.

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

For a 3D check, add the raw `/EagleEye/localization/<source>/pose` **Pose3d** topic to
an AdvantageScope **3D Field** tab. Compare X/Y/Z and roll/pitch/yaw with EagleEye's
3D pose. The SDK's estimator measurement is **Pose2d**: it preserves X/Y/yaw and
intentionally discards Z/roll/pitch. Displaying that measurement in 3D places it on
the floor; it cannot validate camera height or tilt. A model that looks rotated while
numeric poses agree can indicate an asset-axis mismatch. Do not compensate for a model
orientation problem by adding 90° in Java or changing measured extrinsics.


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
| Driver Station warns that both keys are missing | Confirm the connection and pipeline state; copy its actual publisher keys rather than using the camera display name |
| Camera was renamed but Java still uses the old source key | Expected: placement-name edits do not rename publisher keys or require robot-code changes |
| Only the metadata key is missing | Connect a publisher to PnP `pose_meta` and use `localization/front/meta` |
| Only the pose key is missing | Confirm Camera To Robot Pose feeds the `pose3d` publisher at `localization/front/pose` |
| Topics exist but no observations are accepted | Check tag count, range, reprojection error, and timestamp age |
| Estimate jumps toward vision | Raise `EagleEyeCamera.translationStdDevBase` or tighten quality limits |

Desktop validation exercised exact live pose/metadata joins, Java X/Y/yaw preservation, and five independent remote heading/position fixtures. The runnable example includes the Java regression tests. A physical roboRIO round-trip has not yet been documented as field-verified, so test this integration on your robot before competition.
