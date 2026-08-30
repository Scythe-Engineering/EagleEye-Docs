---
sidebar_position: 3
title: Open the web UI
---

# Open the web UI

Connect the Pi to the robot Wi-Fi, then connect your laptop to that same robot network. Open the
web UI from the laptop through the robot network. The EagleEye web UI listens on port 5001:

```text
http://eagleeye.local:5001
```

If that name does not resolve, use `http://<pi-address>:5001`. On the Pi itself,
`http://localhost:5001` also works.

## What you should see

A fresh image with no configured pipelines opens the **First-boot wizard**. Click **Start setup**
to build the camera pipelines. The wizard takes you through calibration, camera position,
pipeline purpose, NetworkTables, and live verification. Follow
[Run the setup wizard](./pipeline-setup).

If EagleEye already has pipelines, it opens the normal UI. Use **Settings → Camera setup wizard
→ Open** to start the wizard again.

## If the page does not load

| Symptom | Check |
|---|---|
| Browser cannot connect | Run `systemctl status eagleeye` on the Pi. `ss -tlnp \| grep 5001` should show the port listening. |
| `.local` name fails | Use the Pi's IP address. mDNS is often blocked on event networks. |
| Page loads but is blank | See [Troubleshooting](./troubleshooting#the-ui-loads-blank). |
| Loads on the Pi but not your laptop | Confirm both devices are on the same network and subnet. |

If the wizard cannot find a camera, connect it, restart the backend, then use **Refresh cameras**
on the camera-selection step.
