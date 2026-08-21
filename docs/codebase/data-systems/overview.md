# Data Systems Overview

EagleEye publishes processed vision data through two parallel output channels:

| Channel | Consumer | Format | Transport |
|---|---|---|---|
| **NetworkTables** | Robot (roboRIO via WPILib) | wpimath struct and primitive topics | NT4 over LAN |
| **SSE** | WebUI (browser) | JSON via Server-Sent Events | HTTP |

These are independent — the robot and WebUI each receive data through their own path.

## NetworkTables output

EagleEye connects as an NT4 client named `EagleEye` and publishes under the `EagleEye` table. Operations such as `publish_to_networktables` convert pipeline values to wpimath geometry types and publish them through struct, double, boolean, or string topics, timestamped with the capture time of the frame the value came from.

See [NetworkTables](./networktables) for the publishing rules and table layout.

## Flatpack

`src/utils/flatpack_schema/` implements a compact binary format with its own schema manifest. It is a standalone module: nothing in the running backend currently serializes or publishes Flatpack data. See [Flatpack Schema](./flatpack-schema).

## SSE output

The WebUI receives real-time data via SSE at `GET /sse/stream`. Named events deliver, among others:

- `system_status` — CPU, memory, storage, pipeline, and NT status
- `log_update` — log messages
- `pipeline_operation_errors` — operation construction and runtime errors
- `profiling_update` — per-frame timing snapshots

Camera feeds use MJPEG streaming via `GET /feed/<camera_name>` — a separate persistent HTTP connection per camera.

See [SSE & Real-time](../architecture/sse-realtime) for the full event reference.
