---
sidebar_position: 3
title: Open the web UI
---

# Open the web UI

The EagleEye web UI listens on port 5001. On the same network as the Pi, open:

```text
http://eagleeye.local:5001
```

If that name does not resolve, use `http://<pi-address>:5001`. On the Pi itself,
`http://localhost:5001` also works.

## What you should see

The current UI opens on **Views** and shows the navigation for Views, 3D View, Pipeline,
System, Settings, and Utils. Confirm the backend is healthy in **System**. Its CPU, RAM, and
storage values should update continuously.

![System tab](/img/ui-screenshots/system-tab.png)

:::note Wizard status
A first-boot wizard is planned but is not present in the source tree reviewed for this guide.
Do not expect a redirect or wizard screen on a current image. Use the
[advanced manual pipeline setup](./advanced-pipeline-editor) when needed.
:::

## If the page does not load

| Symptom | Check |
|---|---|
| Browser cannot connect | Run `systemctl status eagleeye` on the Pi. `ss -tlnp \| grep 5001` should show the port listening. |
| `.local` name fails | Use the Pi's IP address. mDNS is often blocked on event networks. |
| Page loads but is blank | See [Troubleshooting](./troubleshooting#the-ui-loads-blank). |
| Loads on the Pi but not your laptop | Confirm both devices are on the same network and subnet. |

Next, check [tested cameras](./tested-cameras) and the live camera feed in [Views](./cameras).
