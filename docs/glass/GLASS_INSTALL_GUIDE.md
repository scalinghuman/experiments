# Google Glass XE Companion Installation

The Food Scanner and Glasshole AI iPhone apps work without a wearable. Install
a companion only when you use a Google Glass Explorer Edition (Glass XE).

## Path from the website

If you found these apps on [scalinghuman.ai](https://scalinghuman.ai):

1. Open the app page for [Food Scanner](https://scalinghuman.ai/apps/foodscanner) or
   [Glasshole AI](https://scalinghuman.ai/apps/glasshole).
2. Download the matching **Google Glass companion (APK)** from that page
   (or from the [Downloads](#downloads) table below).
3. Follow the install steps on **this guide**.
4. On Glass, launch the app with a **touchpad tap** on the
   **fact check** or **scan food** command. Do **not** rely on saying
   “Ok Glass.”

## Downloads

Download only the companion for the iPhone app you use:

| iPhone app | Google Glass XE companion | Glass command | Launch with |
| --- | --- | --- | --- |
| Food Scanner | [foodscanner-glass-companion-v1.0.0.apk](https://github.com/scalinghuman/experiments/releases/download/glass-companions-v1.0.0/foodscanner-glass-companion-v1.0.0.apk) | `scan food` | **Tap** on Glass |
| Glasshole AI | [glasshole-glass-companion-v1.0.0.apk](https://github.com/scalinghuman/experiments/releases/download/glass-companions-v1.0.0/glasshole-glass-companion-v1.0.0.apk) | `fact check` | **Tap** on Glass |

Release assets:
[glass-companions-v1.0.0](https://github.com/scalinghuman/experiments/releases/tag/glass-companions-v1.0.0)

## Before you begin

- Google Glass Explorer Edition (Glass XE)
- A micro-USB cable
- A computer with Android Debug Bridge (ADB)
- USB debugging enabled on Glass
- Matching free iPhone app from the App Store
  ([Food Scanner](https://apps.apple.com/us/app/food-scanner-ai-overlay/id6790629113) or
  [Glasshole AI](https://apps.apple.com/us/app/glasshole-ai-for-google-glass/id6784266697))

On macOS, install ADB with:

```bash
brew install android-platform-tools
```

## Install

1. Download the APK above to your computer.
2. Connect Glass with the micro-USB cable and run:

   ```bash
   adb devices
   ```

3. If Glass reports `unauthorized`, accept the USB debugging prompt on the
   Glass touchpad, then run `adb devices` again until the device shows
   `device`.
4. Install the APK you downloaded (use the full path if needed):

   ```bash
   adb install -r foodscanner-glass-companion-v1.0.0.apk
   # or
   adb install -r glasshole-glass-companion-v1.0.0.apk
   ```

5. On iPhone: enable **Personal Hotspot**.
6. On Glass: **Settings → Wi-Fi** → join the iPhone hotspot.
7. Open the matching iPhone app and wait for the connection indicator
   (companion connected / waiting for companion).

If the hotspot password is hard to enter on Glass:

```bash
adb shell input text "YOUR_HOTSPOT_PASSWORD"
adb shell input keyevent 66
```

## How to launch on Glass (tap: not “Ok Glass”)

**Do not depend on saying “Ok Glass.”** Voice wake is unreliable on many Glass
units in the field. Use the touchpad instead.

Each companion registers a Glass command:

| App | Glass command | What to do |
| --- | --- | --- |
| Glasshole AI | **fact check** | Find **fact check**, then **tap** the touchpad to open it. After it opens, **tap** again to start/stop listening. |
| Food Scanner | **scan food** | Find **scan food**, then **tap** the touchpad to open the camera. **Tap** again to capture a food photo (wait ~1 second after launch before tapping). |

Tips:

- Swipe on the touchpad to move between cards/timeline items until you see
  **fact check** or **scan food**, then tap to select.
- Keep Glass on the same iPhone Personal Hotspot while the iPhone app is open.
- Analysis runs on the iPhone; results return to Glass over the local link.

## Updating

Download the newer APK from the
[latest release](https://github.com/scalinghuman/experiments/releases/latest)
and repeat the same `adb install -r` command. Public companion releases use a
stable signing key, so later public releases install as updates.

If `adb` reports `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, remove only the affected
older app and install again:

```bash
adb uninstall com.scanmyfood.companion
# or
adb uninstall com.glasshole.companion
```

## Multiple Glass units

```bash
adb devices
adb -s SERIAL install -r foodscanner-glass-companion-v1.0.0.apk
# or
adb -s SERIAL install -r glasshole-glass-companion-v1.0.0.apk
```

## App details

| App | Glass label | Glass command | TCP port | Package |
| --- | --- | --- | --- | --- |
| Glasshole AI | Glasshole | fact check | 9000 | `com.glasshole.companion` |
| Food Scanner | Scan My Food | scan food | 9001 | `com.scanmyfood.companion` |

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `unauthorized` in `adb devices` | Accept USB debugging on the Glass touchpad |
| `INSTALL_FAILED_DEXOPT` | Uninstall first, then reinstall |
| Glass not connecting to iPhone | Rejoin iPhone hotspot; confirm `adb shell ifconfig wlan0` shows an IP (often `172.20.10.x` on Personal Hotspot) |
| Command hard to find | Reboot Glass (`adb reboot`), reinstall the APK, swipe the timeline for **fact check** / **scan food**, and **tap** (do not rely on “Ok Glass”) |
| Camera captures immediately on launch | Wait ~1 second after launch, then tap to capture |
| Wi-Fi lost after reboot | Reconnect to the iPhone hotspot manually |

## Checksums

Verify a downloaded file before installing when possible:

```text
foodscanner-glass-companion-v1.0.0.apk
SHA-256: 7c32fd0f86d49ecebaba4628f03f7ebfd549754d99f11b874ab250f2a46e5093

glasshole-glass-companion-v1.0.0.apk
SHA-256: ac5ba8ffdccd79152df7eae5b12f10f3476709166c6699d93fc8b1175719ced1
```
