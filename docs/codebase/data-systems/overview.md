# Data Systems Overview

EagleEye publishes processed vision data through two parallel output channels:

| Channel | Consumer | Format | Transport |
|---|---|---|---|
| **NetworkTables** | Robot (RoboRIO via WPILib) | Custom binary (Flatpack) | NT3/NT4 over LAN |
| **SSE** | WebUI (browser) | JSON via Server-Sent Events | HTTP |

These are independent — the robot and WebUI each receive data through their own dedicated path.

## NetworkTables output

Robot pose data is published to the `EagleEye` NetworkTables table using a custom binary serialization format called **Flatpack**. This format is compact and type-safe, designed to be decoded by a WPILib-compatible library on the robot side.

At startup, EagleEye publishes a **schema manifest** to `EagleEye/schema_manifest` so that dashboards (SmartDashboard, Elastic) can discover the data types being published.

See [Flatpack Schema](./flatpack-schema) for the wire format and [NetworkTables](./networktables) for the table layout and per-pipeline enable/disable.

## SSE output

The WebUI receives real-time data via SSE at `GET /sse/stream`. Named events deliver:
- `system_status` — CPU/RAM/GPU metrics
- `log_update` — log messages
- `pipeline_error` — operation exceptions
- `pipeline_profile` — per-frame timing snapshots

Camera feeds use MJPEG streaming via `GET /feed/<camera_name>` — a separate persistent HTTP connection per camera.

See [SSE & Real-time](../architecture/sse-realtime) for the full event reference.
