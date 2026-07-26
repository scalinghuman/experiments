# Google Glass XE Companion Installation

The Food Scanner and Glasshole AI iPhone apps work without a wearable. Install
a companion only when you use a Google Glass Explorer Edition (Glass XE).

## Downloads

Download only the companion for the iPhone app you use:

| iPhone app | Google Glass XE companion | Voice command |
| --- | --- | --- |
| Food Scanner | [foodscanner-glass-companion-v1.0.0.apk](https://github.com/scalinghuman/experiments/releases/download/glass-companions-v1.0.0/foodscanner-glass-companion-v1.0.0.apk) | `scan food` |
| Glasshole AI | [glasshole-glass-companion-v1.0.0.apk](https://github.com/scalinghuman/experiments/releases/download/glass-companions-v1.0.0/glasshole-glass-companion-v1.0.0.apk) | `fact check` |

## Before you begin

- Google Glass Explorer Edition (Glass XE)
- A micro-USB cable
- A computer with Android Debug Bridge (ADB)
- USB debugging enabled on Glass

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
   Glass touchpad, then run `adb devices` again.
4. Install the APK you downloaded:

   ```bash
   adb install -r foodscanner-glass-companion-v1.0.0.apk
   # or
   adb install -r glasshole-glass-companion-v1.0.0.apk
   ```

5. Connect Glass to your iPhone Personal Hotspot, open the matching iPhone app,
   and confirm its connection indicator.

## Updating

Download the newer APK from the [latest release](https://github.com/scalinghuman/experiments/releases/latest)
and repeat the same `adb install -r` command. Public companion releases use a
stable signing key, so later public releases install as updates.

If `adb` reports `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, remove only the affected
older app and install again:

```bash
adb uninstall com.scanmyfood.companion
# or
adb uninstall com.glasshole.companion
```

## Verify

Say **“Ok Glass”** and then:

- **“scan food”** for Food Scanner
- **“fact check”** for Glasshole AI

## Checksums

Verify a downloaded file before installing when possible:

```text
foodscanner-glass-companion-v1.0.0.apk
SHA-256: 7c32fd0f86d49ecebaba4628f03f7ebfd549754d99f11b874ab250f2a46e5093

glasshole-glass-companion-v1.0.0.apk
SHA-256: ac5ba8ffdccd79152df7eae5b12f10f3476709166c6699d93fc8b1175719ced1
```
