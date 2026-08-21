---
sidebar_position: 4
title: Open the UI
---

# Open the UI

The EagleEye web UI is served by the backend on port **5001**.

## 1. Open it in a browser

On a laptop connected to the same network as the Pi:

```
http://<hostname>.local:5001
```

for example `http://eagleeye.local:5001`, or use the IP address:
`http://10.33.22.11:5001`. If you are working on the Pi itself with a browser,
`http://localhost:5001` works too.

**Expected result:** the UI loads on the **Views** tab, with a navigation sidebar on the right
listing Views, 3D View, Pipeline, System, Settings, and Utils.

![Views tab](/img/ui-screenshots/views-tab.png)

## 2. Confirm the backend is alive

Open the **System** tab. CPU, RAM, and storage numbers should update on their own every
second or two — they stream from the backend, so movement means the connection is healthy.

![System tab](/img/ui-screenshots/system-tab.png)

**Expected result:** metrics change over time and the pipeline list shows at least the
pipelines in your config.

## 3. Look at the log once

Open the **Settings** tab and read the **System Logs** panel from the top. On a healthy first
start you will see initialization lines, a list of detected inference devices, and camera
detection lines.

**Expected result:** no repeating `Traceback` blocks.

## If the page does not load

| Symptom | Check |
|---------|-------|
| Browser cannot connect | `systemctl status eagleeye` on the Pi; `ss -tlnp \| grep 5001` should show the port listening |
| Page loads but is blank | The web UI build may be missing — see [Troubleshooting](./troubleshooting#the-ui-loads-blank) |
| `.local` name fails | Use the IP address instead; mDNS is often blocked on event networks |
| Loads on the Pi but not from your laptop | Firewall or a different subnet — confirm both devices are on the same network |

Next: [Check your cameras](./cameras).

:::note
Verified against EagleEye-Vision-System `main` at commit `c73a871` (2026-08-20). The port is
fixed at 5001 in the backend.
:::
