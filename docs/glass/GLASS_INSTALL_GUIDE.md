# Google Glass XE Installation Guide

## Prerequisites

- ADB installed: `brew install android-platform-tools`
- Google Glass Explorer Edition (Google Glass XE) with USB debugging enabled
- Micro-USB cable

## Install All Apps on a New Google Glass XE Unit

### Step 1: Connect and Authorize

```bash
adb devices
```

If `unauthorized`, accept the USB debugging prompt on the Google Glass XE
touchpad.

### Step 2: Install Both Companion Apps

```bash
# Glasshole companion
adb install -r /Volumes/workplace/google-glass/glasshole-companion.apk

# Food Scanner companion
adb install -r /Volumes/workplace/google-glass/PlateCheck/scanmyfood-companion.apk
```

### Step 3: Connect to iPhone Hotspot

1. Enable **Personal Hotspot** on iPhone
2. On Google Glass XE: Settings → Wi-Fi → select iPhone hotspot
3. Enter password via ADB if needed:
```bash
adb shell input text "YOUR_HOTSPOT_PASSWORD"
adb shell input keyevent 66
```

### Step 4: Verify

Say **"Ok Glass"** to Google Glass XE. You should see:
- **"fact check"** -> launches Glasshole
- **"scan food"** -> launches Food Scanner camera

## Multiple Google Glass XE Units

Target a specific device when multiple are connected:

```bash
adb devices  # List serial numbers

adb -s SERIAL install -r glasshole-companion.apk
adb -s SERIAL install -r PlateCheck/scanmyfood-companion.apk
```

## Quick Install Scripts

```bash
# Food Scanner only
./PlateCheck/install-glass.sh

# Both apps (manual)
adb install -r glasshole-companion.apk
./PlateCheck/install-glass.sh
```

## App Details

| App | Google Glass XE Name | Voice Command | TCP Port | APK |
|-----|-----------|---------------|----------|-----|
| Glasshole | Glasshole | "fact check" | 9000 | `glasshole-companion.apk` |
| Food Scanner | Scan My Food | "scan food" | 9001 | `PlateCheck/scanmyfood-companion.apk` |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `unauthorized` in `adb devices` | Accept USB debugging prompt on Google Glass XE |
| `INSTALL_FAILED_DEXOPT` | Uninstall first: `adb uninstall com.glasshole.companion` or `com.scanmyfood.companion` |
| Google Glass XE not connecting to iPhone | Check hotspot: `adb shell ifconfig wlan0` should show `172.20.10.x` |
| Voice command missing | Reboot Google Glass XE: `adb reboot`; custom commands use the APK manifest plus Google Glass development permission |
| Camera captures immediately on launch | Voice trigger sends tap event — 1s delay guard handles this |
| Wi-Fi lost after reboot | Reconnect to hotspot manually (Wi-Fi may not persist) |
