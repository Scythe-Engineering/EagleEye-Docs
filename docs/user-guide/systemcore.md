---
sidebar_position: 10.5
title: Use EagleEye with Systemcore
---

# Use EagleEye with Systemcore

Systemcore is the WPILib 2027 robot controller. This guide covers the supported setup: EagleEye runs on a separate coprocessor, usually a Raspberry Pi, and talks to the robot program on Systemcore over NetworkTables 4 (NT4). Running EagleEye on the Systemcore itself is not supported. Systemcore runs Limelight's Linux-based OS with its own package manager, EagleEye publishes no package for it, and the EagleEye installer has not been run on it, so do not run `install.sh` on the controller. Install EagleEye on the coprocessor with [Prepare the Raspberry Pi](./prepare-pi) and [Install EagleEye](./install).

This page covers the Systemcore side: what to install, which address to give EagleEye, how to deploy robot code, and how to check the result.

:::caution Alpha software, untested on hardware
This guide follows the published WPILib and Systemcore alpha documentation as of **October 13, 2026** and targets **WPILib 2027.0.0-alpha-7**. The EagleEye team has not tested a physical Systemcore, the 2027 Driver Station, an EagleEye camera on a Systemcore robot, radio or switch networking, or the Systemcore web dashboard. Software behavior is covered by desktop tests only. The compatibility information is a dated snapshot and does not promise that a later image or alpha release works, so re-check the [compatibility table](https://github.com/wpilibsuite/SystemcoreTesting#software-compatibility) before you update anything.
:::

## What you need

| Item | Requirement for alpha-7 |
| --- | --- |
| Robot software | WPILib **2027.0.0-alpha-7** from the [allwpilib release](https://github.com/wpilibsuite/allwpilib/releases/tag/v2027.0.0-alpha-7). |
| Java | JDK 25. The alpha-7 example project is built for Java 25. Use the JDK that the WPILib installer provides. |
| Systemcore image | **14 or later.** The alpha-7 release notes say image 14 is required, and the compatibility table lists image 14 and later for WPILib alpha-7 and later. Images 10 to 13 pair with alpha-5 and alpha-6. |
| Driver Station | The [2027 (FIRST) Driver Station](https://github.com/wpilibsuite/FirstDriverStation-Public). The alpha-7 release notes say Driver Station alpha-7 is required. |
| Vendor libraries | Versions built for alpha-7. Alpha-6 and earlier vendordeps do not work with alpha-7. The SystemcoreTesting README lists compatible versions. EagleEye itself needs no vendordep. |
| EagleEye robot library | `library/java-2027/` in the EagleEye repository, with the [alpha-7 example](https://github.com/Scythe-Engineering/EagleEye-Vision-System/tree/main/library/examples/localization-sim-2027). |
| EagleEye coprocessor | A Raspberry Pi running EagleEye. The default 2026 Python stack works with alpha-7 robot code over NT4. The optional alpha-7 Python stack needs glibc 2.39 or later; see [WPILib coprocessor variants](./install#wpilib-coprocessor-variants). |

Image 14 is the minimum that the sources list for alpha-7, not a promise that every later image works. If something misbehaves after an image update, check the compatibility table and the [Systemcore issue tracker](https://github.com/wpilibsuite/SystemcoreTesting/issues) first.

## 1. Image the controller

WPILib documents the full procedure in [Imaging your Systemcore](https://docs.wpilib.org/en/2027/docs/zero-to-robot/step-3/imaging-your-systemcore.html). In short:

1. Download the `.llupdate` file from the [Systemcore OS releases](https://github.com/LimelightVision/systemcore-os-public/releases). Choose the **alpha** file for an alpha unit and the **beta** file for a beta unit. WPILib's guide says to use the alpha file if your unit is unlabeled.
2. Connect to the Systemcore over Wi-Fi or USB.
3. Open `http://robot.local`, go to the configure and update page, and find **OS Update**.
4. Select the file, click **Flash Update**, and wait a few minutes. If the page asks what to keep during the update, the SystemcoreTesting README recommends keeping everything.
5. Over Wi-Fi, reconnect after the reboot and refresh the page.

Use this web flow on image 12 or later. WPILib's imaging guide lists image 11 as the minimum, while the SystemcoreTesting README says 12, so treat 12 as the safe floor. For an older image, or if the web flow fails, use the Limelight Hardware Manager flash-mode steps in the [SystemcoreTesting README](https://github.com/wpilibsuite/SystemcoreTesting).

## 2. Set the team number

1. Boot the Systemcore and connect over USB-C, Ethernet, or Wi-Fi.
2. Open `http://robot.local` and go to the **Configuration** tab.
3. Enter your team number and click **Change Team Number**.
4. Set the same team number in the Driver Station. It should then connect to the controller.

## 3. Find an address the Pi can reach

EagleEye connects from the Pi, so it needs an address that the **Pi** can reach. The official address table lists one controller address per connection method:

| Connection method | Controller address from the official table | Reachable from the Pi? |
| --- | --- | --- |
| Wi-Fi access point | `172.30.0.1` | Yes, if the Pi has joined the Systemcore access point |
| USB, Windows computer | `172.26.0.1` (`172.28.0.1` on image 9 and earlier) | Only if the Pi has a matching direct USB connection or route. Use the Ethernet address on a normal robot network. |
| USB, Linux or macOS computer | `172.27.0.1` (`172.29.0.1` on image 9 and earlier) | Only if the Pi has a matching direct USB connection or route. Use the Ethernet address on a normal robot network. |
| Ethernet | Shown on the Systemcore display | Yes, if the Pi is on the same network |

The USB addresses are the controller's addresses on its USB link to a connected computer. A laptop on that cable can reach them, but a Pi on the robot's Ethernet network usually cannot, so do not copy the address that worked for your laptop into EagleEye.

To choose the address:

1. Connect the Pi and the Systemcore to the same network, using the controller's Ethernet port.
2. Read the Ethernet address from the Systemcore display.
3. From the Pi, check that the address answers. Open a shell on the Pi over SSH, as in [Install EagleEye](./install):

   ```bash
   ping -c 3 <systemcore-address>
   ```

4. Use that address in EagleEye. If the connection fails after a reboot or a network change, read the display again.

You can also try `robot.local`, but only if `ping robot.local` works **from the Pi**. The name relies on mDNS, so the Pi must be able to resolve it and reach the result.

## 4. Point EagleEye at the controller

1. Open **Settings**, and under **Network Table** enter the address from the previous step in the **Robot controller (roboRIO/Systemcore) or simulation IP Address** field. In the first-time wizard, this is the NetworkTables step.
2. Click **Save Settings**, then **Restart Backend**.
3. Check that the status indicator reports a connection.

EagleEye is the NT4 client, named `EagleEye`. The robot program on Systemcore is the server, so a connection exists only while robot code is running. EagleEye uses NT4's default port, 5810. There is no port setting. If the status never connects, start with the [troubleshooting table](#troubleshooting). [Connect NetworkTables](./networktables) covers the setting in more detail.

## 5. Deploy the robot project

Use the [versioned robot integration guide](./robot-integration#choose-the-wpilib-version-and-copy-the-library) for the Java changes. The Systemcore-specific steps are:

1. Install WPILib alpha-7 and open its WPILib VS Code.
2. For a new project, set your real team number in the project creation step. For an existing 2026 project, import it into alpha-7 as the release notes describe, and import your vendor libraries again.
3. Copy `library/java-2027/frc/robot/vision/EagleEyeCamera.java` into `src/main/java/frc/robot/vision/`. Add `EagleEyeCameraSim.java` only if you simulate.
4. Add the camera, call `EagleEyeCamera.update(...)` after your odometry update, and use the exact pose and metadata keys from your pipeline, as shown in [Add EagleEye to robot code](./robot-integration#add-it-to-drivejava). The robot-integration snippets show only the EagleEye calls. Your own WPILib imports use the `org.wpilib.*` names, as the [alpha-7 example](https://github.com/Scythe-Engineering/EagleEye-Vision-System/blob/main/library/examples/localization-sim-2027/src/main/java/frc/robot/Robot.java) does.
5. Deploy as you normally would. The Driver Station should show robot code.

**Do not deploy the alpha-7 example as your robot program.** It is a desktop simulation with synthetic odometry and camera readings, no drivetrain or actuator code, and team number `0` in `.wpilib/wpilib_preferences.json`. Copy the SDK into your own project, as in step 3, and make sure that project has your real team number.

The Java SDK assumes the default robot time source on the controller. See [Why you do not subtract latency](./robot-integration#why-you-do-not-subtract-latency).

Do not change the default `systemcore` SSH password. WPILib warns that doing so stops C++, Java, and Python teams from uploading code.

## 6. Verify the connection and measurements

Work through these checks in order. Each one rules out a different failure.

1. **Robot code is running.** The Driver Station shows robot code.
2. **EagleEye is connected.** The status indicator beside the address under **Network Table** in **Settings** reports a connection.
3. **Both topics exist.** Connect AdvantageScope or OutlineViewer to the robot. With mapped tags visible, `EagleEye/localization/<source>/pose` and `/meta` appear under the `EagleEye` table. Use the exact keys from your pipeline, as described in [Find your source keys](./robot-integration#display-names-are-not-subscription-keys).
4. **Data is fresh.** The timestamps on both topics keep advancing while tags are visible. A pose that stays on screen after publishing stops can look current.
5. **Observations are accepted.** Log how many observations your robot code accepts. The example does this with a counter, and that count should rise while tags are visible. Zero accepted observations with live topics usually means the quality gates are rejecting data. See [Quality filtering](./robot-integration#quality-filtering).
6. **No Driver Station warnings.** The SDK warns, at most once every five seconds, when a configured key has no publisher. If you see the warning, compare the keys in robot code with the pipeline's publishers.
7. **The pose is right.** Place the robot at a known spot and compare the estimate with it. [Verify and tune](./verify-and-tune) covers this step.

The alpha-7 example logs its field and its accepted count under `Telemetry/EagleEye` and `Telemetry/EagleEye/Accepted`. Those paths were checked in desktop simulation only. On a real Systemcore, look for the same names in your dashboard's NetworkTables tree, and expect them to differ if you use a custom telemetry backend.

## Simulation is separate

Desktop simulation runs the robot program on your computer. That is a different server from the physical Systemcore.

- For simulation on the same computer as EagleEye, use `127.0.0.1`. For simulation on another computer, use that computer's reachable address. Never use `127.0.0.1` for a Pi that talks to hardware.
- To move from simulation to a robot, change the address under **Network Table** in **Settings**, save it, and restart the backend.
- Keep simulated and physical publishers on different source keys when both run.
- The runnable [`localization-sim-2027`](https://github.com/Scythe-Engineering/EagleEye-Vision-System/tree/main/library/examples/localization-sim-2027) example and the [simulation section](./robot-integration#simulation) of the integration guide describe the setup.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Status never connects | From the Pi, `ping` the address. Confirm robot code is running and the address is not a USB or access-point address that the Pi has no route to. |
| `robot.local` works on a laptop but not on the Pi | The Pi does not resolve it. Use the IP address from the Systemcore display. |
| Connection worked, then stopped after a reboot | Read the Ethernet address from the display again. |
| Topics are missing | Confirm the pipeline is running, tags are visible, and both **Publish To NetworkTables** keys exist. |
| Driver Station warns about missing keys | Compare the Java constructor keys with the pipeline's `target_key` values. |
| Topics update but nothing is accepted | Check tag count, range, reprojection error, and timestamp age. |
| Deploy fails or targets the wrong robot | Check the team number in your project's `.wpilib/wpilib_preferences.json`. The example project uses `0`. |
| Code upload is refused after SSH changes | WPILib states that changing the default SSH password prevents uploads. |
| Robot code or vendor libraries fail to build | Check that they target alpha-7 and that the project was imported for 2027. |

## Sources

All pages were read on October 13, 2026.

- [SystemcoreTesting README](https://github.com/wpilibsuite/SystemcoreTesting): compatibility table, address table, team number setup, first deployment, and flash-mode instructions.
- [Imaging your Systemcore](https://docs.wpilib.org/en/2027/docs/zero-to-robot/step-3/imaging-your-systemcore.html) (WPILib 2027 docs).
- [Systemcore SSH](https://docs.wpilib.org/en/2027/docs/software/systemcore-info/systemcore-ssh.html) (WPILib 2027 docs): connection addresses and the password warning.
- [Systemcore OS releases](https://github.com/LimelightVision/systemcore-os-public) (Limelight): image downloads and release notes.
- [WPILib v2027.0.0-alpha-7 release notes](https://github.com/wpilibsuite/allwpilib/releases/tag/v2027.0.0-alpha-7): the image 14 and Driver Station requirements.
