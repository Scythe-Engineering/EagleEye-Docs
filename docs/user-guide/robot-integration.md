---
sidebar_position: 10
title: Add EagleEye to robot code
---

# Add EagleEye to robot code

EagleEye publishes timestamped robot poses and quality measurements. The robot library joins the two NetworkTables topics, filters weak observations, and sends accepted poses to a WPILib pose estimator.

## Choose the WPILib version and copy the library

Use the SDK source tree matching the robot project's WPILib version. The public EagleEye camera API and topic contracts are the same in both versions.

| Robot project | SDK source directory | Runnable example | Toolchain |
| --- | --- | --- | --- |
| WPILib 2026 | `library/java/` | `library/examples/localization-sim/` | Java 17 / GradleRIO 2026 |
| WPILib 2027 alpha-7 | `library/java-2027/` | `library/examples/localization-sim-2027/` | Java 25 / `org.wpilib.GradleRIO` 2027.0.0-alpha-7 / Gradle 9.4.1 |

Copy these files for **WPILib 2026**:

```text
library/java/frc/robot/vision/EagleEyeCamera.java
library/java/frc/robot/vision/EagleEyeCameraSim.java  # optional, for simulation
```

For **WPILib 2027 alpha-7**, copy these instead:

```text
library/java-2027/frc/robot/vision/EagleEyeCamera.java
library/java-2027/frc/robot/vision/EagleEyeCameraSim.java  # optional, for simulation
```

For alpha-7, install WPILib with the official installer before building the example. It installs to a `2027_alpha7` folder: `~/.wpilib/2027_alpha7` on macOS, `$XDG_DATA_HOME/wpilib/2027_alpha7` on Linux when `XDG_DATA_HOME` is an absolute path (otherwise `~/.local/share/wpilib/2027_alpha7`), and `C:\Users\Public\wpilib\2027_alpha7` on Windows. Only the macOS install was run in testing; the Linux and Windows folders come from WPILib's project template. The example's Gradle build looks there for the WPILib plugin. To build from a macOS terminal, set Java to the installer's JDK 25:

```sh
export JAVA_HOME="$HOME/.wpilib/2027_alpha7/jdk"
```

Alpha-7 uses `org.wpilib.*` imports, including `org.wpilib.math.linalg.Matrix` and `VecBuilder`, `org.wpilib.math.geometry.*`, and `org.wpilib.networktables.*`. Keep your existing drivetrain/estimator code on the matching WPILib API; do not combine the two SDK trees in one project. The `frc.robot.vision.EagleEyeCamera` import below is unchanged.

Place the files under `src/main/java/frc/robot/vision/`, or change their `package` declarations to match your project. They only depend on WPILib. There is no vendordep.

The default 2026 Python coprocessor communicates with alpha-7 Java robots over NT4. Changing the robot SDK does not require upgrading the coprocessor. See [installation variants](./install#wpilib-coprocessor-variants) before opting into alpha Python. For the controller image, Driver Station, team number, and address setup that an alpha-7 robot needs, see [Use EagleEye with Systemcore](./systemcore).

## Configure EagleEye and find your source keys

On a fresh installation, complete the [camera setup wizard](./open-the-ui#2-complete-first-time-camera-setup).
Name each camera by placement, calibrate it, enter its mounting extrinsics, and select
**Localize** or **Both**. Enter the robot controller address, or the reachable simulation host address,
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

These snippets show only the EagleEye calls. They apply to both SDKs, but the WPILib types in your own code (gyro, estimator, `SubsystemBase`) use the package names of your WPILib version. For a complete alpha-7 file, see the [alpha-7 example's `Robot.java`](https://github.com/Scythe-Engineering/EagleEye-Vision-System/blob/main/library/examples/localization-sim-2027/src/main/java/frc/robot/Robot.java).

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

### Poll every robot loop

Each camera keeps the 20 most recent pose samples and the 20 most recent metadata samples between polls. Call `update()` or `poll()` every robot loop (20 ms by default) so the queues stay nearly empty. At 90 frames per second, 20 samples cover about 220 ms. If robot code stalls longer than that, or more than 20 frames arrive in one burst, the oldest unread samples are dropped, and a pose that loses its matching metadata (or the reverse) is not accepted. The 2026 and alpha-7 SDKs both work this way, so the alpha-7 move did not introduce the limit.

A five-minute desktop test **failed** its exact-count check. A 90 Hz publisher that caught up after delays sent bursts of 22 and 26 frames, and the SDK, polled every 3 ms, accepted 26,974 of 27,000 frames. A test subscriber with a large queue received every frame, but we did not trace each missing frame to the SDK queue. A separate 60-second test polled every 20 ms accepted all 4,420 frames, but its publisher never sent catch-up bursts and averaged about 74 frames per second rather than 90, so it does not show sustained 90 Hz delivery. The [alpha-7 report](https://github.com/Scythe-Engineering/EagleEye-Vision-System/blob/main/reports/wpilib-2027-alpha7/README.md#python-to-java-runtime-probes) has the details. If your logs show gaps, check for coprocessor stalls, network backlog, and robot loops that run long.

## Optional enhancement: poll vision every 5 ms

Start with the 20 ms integration above. To reduce the time vision waits for robot
code to read it, move odometry and vision updates into a 5 ms callback. Use the same
camera keys and `EagleEyeCamera` calls.

### 1. Move the updates in Drive.java

Move the odometry and EagleEye calls out of `Drive.periodic()` and into one public
method:

```java
public void updateOdometryAndVision() {
  poseEstimator.update(gyro.getRotation2d(), getModulePositions());
  EagleEyeCamera.update(poseEstimator::addVisionMeasurement, eagleEyeCameras);
}

@Override
public void periodic() {
  // Keep dashboard updates and other subsystem work here.
  // The 5 ms callback now handles odometry and vision.
}
```

Replace `getModulePositions()` with your drivetrain's method for reading current
module positions. Read the sensors on each call. Reusing positions cached by the
20 ms loop won't give the estimator fresh odometry every 5 ms.

For differential drive, pass measured left and right wheel distances to
`poseEstimator.update()` along with the gyro angle.

### 2. Schedule the method in Robot.java

Add this call to your existing `Robot` constructor, after you create
`robotContainer`:

```java
addPeriodic(robotContainer.getDrive()::updateOdometryAndVision, 0.005, 0.002);
```

Use your container's field name. If it has no `getDrive()` method, add one that
returns the drive subsystem it already owns. The callback period is 5 ms, with a
2 ms offset from the normal robot loop. Keep the command scheduler and the rest
of the robot loop at 20 ms.

`TimedRobot.addPeriodic` runs on the same thread as the normal robot callbacks.
This path needs no extra thread or locks. Keep dashboard publishing, blocking
waits, and expensive calculations out of `updateOdometryAndVision()` so it can
finish within its 5 ms period.

Remove the old odometry and vision calls from `Drive.periodic()`. Don't poll the
same cameras from another callback or worker thread. If your drivetrain already
updates odometry on a separate thread, add vision through that thread's existing
estimator access rules instead of adding this callback.

### Coprocessor setup and checks

EagleEye requests a NetworkTables flush after all branches of a completed publishing
pipeline finish. This reduces batching delay for both the 20 ms and 5 ms robot
paths. It needs no extra ports or packages. NetworkTables still limits how often
it sends data.

The faster robot callback does not increase camera capture rate or sensor refresh
rate. Check sample age, accepted observations, and loop overruns on your robot.
Keep the SDK's stale-sample rejection enabled and check that vision resumes after
a disconnect.

To return to 20 ms updates, remove the `addPeriodic` call and call
`updateOdometryAndVision()` once from `Drive.periodic()`.

## Why you do not subtract latency

EagleEye carries the source-frame timestamp through the pipeline and publishes it with the pose. NetworkTables synchronizes the coprocessor timestamp to the robot server clock.

| Robot SDK | Native NT timestamp unit | Conversion to estimator seconds | Default robot clock |
| --- | --- | --- | --- |
| WPILib 2026 | Microseconds | `sample.timestamp / 1e6` | FPGA time / `Timer.getFPGATimestamp()` |
| WPILib 2027 alpha-7 | Nanoseconds | `sample.timestamp / 1e9` | NT/robot monotonic time / `Timer.getTimestamp()` |

The matching SDK performs this conversion. Do not replace capture time with the current timer value or subtract processing/network latency again. NT4 wire timestamps remain microseconds; the alpha-7 Java API exposes nanoseconds.

For alpha-7, this direct conversion assumes the default `RobotController` time source. If your robot calls `RobotController.setTimeSource`, ensure the estimator uses the NT monotonic time base or explicitly translate timestamps to your custom source. In desktop alpha-7 simulation, NT follows simulated time and pauses/steps with simulation.

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

### WPILib 2026

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

### WPILib 2027 alpha-7

Open [`library/examples/localization-sim-2027`](https://github.com/Scythe-Engineering/EagleEye-Vision-System/tree/main/library/examples/localization-sim-2027) with the alpha-7 tooling and Java 25. Run `./gradlew test build`, then simulate the project. The example uses `org.wpilib.framework.TimedRobot`, `org.wpilib.system.Timer.getTimestamp()`, and `org.wpilib.telemetry.Telemetry.log`.

With RobotBase's default telemetry backend, display `Telemetry/EagleEye` in AdvantageScope, including `GroundTruth`, and `Telemetry/EagleEye/Accepted`. These replace the 2026 example's `SmartDashboard/EagleEye` and accepted-count path. A custom telemetry backend may route data differently.

For an existing alpha-7 project, use the alpha simulator and field API:

```java
import org.wpilib.fields.Field;
import org.wpilib.fields.Fields;
import org.wpilib.math.geometry.Transform3d;
import frc.robot.vision.EagleEyeCameraSim;

private EagleEyeCameraSim frontCameraSim;

@Override
public void simulationInit() {
  frontCameraSim = new EagleEyeCameraSim(
      "localization/front", new Transform3d(),
      Field.loadField(Fields.DEFAULT_FIELD));
}
```

The alpha SDK reads each tag through `getPose()` and handles the optional bearing from `Translation2d.getAngle()`; a tag at the camera's position is skipped. Choose a field matching your actual map. An alpha API upgrade does not provide a future game's field assets.

### Both versions

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

Both SDKs warn through Driver Station when configured topics remain unresolved, with a five-second throttle. The 2026 SDK uses `DriverStation.reportWarning`; alpha-7 uses `org.wpilib.driverstation.DriverStationErrors.reportWarning`, which retains Driver Station delivery.

Desktop loopback and contract tests exercise timestamp joins, pose preservation, and freshness. Physical roboRIO/Systemcore deployment, camera round-trips, and Driver Station/dashboard GUI operation are not field-verified by these tests. Validate on your robot before competition.
