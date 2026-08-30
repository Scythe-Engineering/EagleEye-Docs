---
sidebar_position: 16
title: Update EagleEye
---

# Update EagleEye

Use the web UI for a normal update. It checks out the selected EagleEye branch, runs `apt update`
and a non-interactive `apt upgrade`, then restarts the backend. It keeps your pipeline
configuration while changing branches.

The built-in updater requires a Wi-Fi connection with internet access. A robot radio is not an
internet connection. Connect the Pi to a shop network or phone hotspot first. See
[Connect to Wi-Fi](./connect-wifi) if you need help.

## Update from the web UI

1. Open **Settings**.
2. In **Backend Settings**, click **Update System**.

![Update System button in Settings](/img/ui-screenshots/update/update-system-button.png)

3. Read the update dialog. It shows the current and remote revisions, plus whether an update is
available.
4. Leave the current tracking branch selected for the normal update. To move the Pi to another
branch, choose it under **Other branch**, or click the offered **Track _branch_** button.
Changing branches changes the software the Pi runs. Use a named feature branch only when you
were told to test it.
5. Click **Update and Restart**. The backend checks out the selected branch, updates system
packages, and restarts. Do not unplug the Pi or close its power supply during this step.
6. Wait for `http://eagleeye.local:5001` to reconnect. Open **Settings → System Logs** if the
page does not return.

![Update dialog with branch selection](/img/ui-screenshots/update/update-system-dialog.png)

The button remains unavailable until EagleEye detects connected Wi-Fi with internet access. If
it says Wi-Fi is missing or has no internet, use [Connect to Wi-Fi](./connect-wifi), then reopen
Settings.

## Update manually over SSH

Use this only when the web UI cannot load or its updater reports an error. Connect to the Pi as
the account that owns the EagleEye checkout. First make sure it has internet access. The same
[Wi-Fi connection guide](./connect-wifi) shows the `nmcli` commands.

1. Connect over SSH and enter the checkout:

```bash
ssh eagleeye@eagleeye.local
cd ~/EagleEye-Vision-System
```

2. Check for local changes. The web updater preserves only `src/config/pipeline_config.json`.
Stop and back up or commit any other modified files before continuing.

```bash
git status --short
```

3. Save the pipeline configuration, fetch the branch you want, and check it out. Replace `main`
only when you intentionally need another remote branch.

```bash
cp src/config/pipeline_config.json ~/eagleeye-pipeline-config.backup.json
git fetch --depth=1 origin +refs/heads/main:refs/remotes/origin/main
git checkout -B main origin/main
cp ~/eagleeye-pipeline-config.backup.json src/config/pipeline_config.json
```

4. Update system packages and restart EagleEye:

```bash
sudo apt update
sudo env DEBIAN_FRONTEND=noninteractive apt upgrade -y
sudo systemctl restart eagleeye
```

5. Confirm the service starts, then open the UI again:

```bash
systemctl status eagleeye
```

If the checkout, package upgrade, or restart fails, keep the terminal output. Do not delete the
checkout or pipeline backup. See [Troubleshooting](./troubleshooting) before retrying.
