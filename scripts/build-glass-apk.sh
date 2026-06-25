#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: build-glass-apk.sh <project-dir> <output-apk>" >&2
  exit 2
fi

PROJECT_DIR="$(cd "$1" && pwd)"
OUT_DIR="$(cd "$(dirname "$2")" && pwd)"
OUT_APK="$OUT_DIR/$(basename "$2")"
SDK_DIR="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
BUILD_TOOLS="$(find "$SDK_DIR/build-tools" -maxdepth 1 -type d | sort -V | tail -1)"
PLATFORM_DIR="$(find "$SDK_DIR/platforms" -maxdepth 1 -type d -name 'android-*' | sort -V | tail -1)"

AAPT="$BUILD_TOOLS/aapt"
D8="$BUILD_TOOLS/d8"
ZIPALIGN="$BUILD_TOOLS/zipalign"
APKSIGNER="$BUILD_TOOLS/apksigner"
ANDROID_JAR="$PLATFORM_DIR/android.jar"

APP_DIR="$PROJECT_DIR/app"
BUILD_DIR="$PROJECT_DIR/build/manual"
GEN_DIR="$BUILD_DIR/gen"
CLASSES_DIR="$BUILD_DIR/classes"
DEX_DIR="$BUILD_DIR/dex"
UNALIGNED_APK="$BUILD_DIR/app-unaligned.apk"
ALIGNED_APK="$BUILD_DIR/app-aligned.apk"
KEYSTORE="${GLASS_DEBUG_KEYSTORE:-$PROJECT_DIR/build/glass-debug.keystore}"

rm -rf "$BUILD_DIR"
mkdir -p "$GEN_DIR" "$CLASSES_DIR" "$DEX_DIR" "$(dirname "$OUT_APK")" "$(dirname "$KEYSTORE")"

"$AAPT" package \
  -f -m \
  -J "$GEN_DIR" \
  -M "$APP_DIR/src/main/AndroidManifest.xml" \
  -S "$APP_DIR/src/main/res" \
  -I "$ANDROID_JAR"

find "$APP_DIR/src/main/java" "$GEN_DIR" -name '*.java' | sort | while IFS= read -r file; do
  printf "'%s'\n" "$file"
done > "$BUILD_DIR/sources.list"

javac \
  -source 8 \
  -target 8 \
  -classpath "$ANDROID_JAR" \
  -d "$CLASSES_DIR" \
  @"$BUILD_DIR/sources.list"

(cd "$CLASSES_DIR" && "$D8" \
  --min-api 19 \
  --lib "$ANDROID_JAR" \
  --output "$DEX_DIR" \
  $(find . -name '*.class' | sort))

"$AAPT" package \
  -f \
  --min-sdk-version 19 \
  --target-sdk-version 19 \
  -M "$APP_DIR/src/main/AndroidManifest.xml" \
  -S "$APP_DIR/src/main/res" \
  -I "$ANDROID_JAR" \
  -F "$UNALIGNED_APK"

(cd "$DEX_DIR" && zip -q "$UNALIGNED_APK" classes.dex)

"$ZIPALIGN" -f 4 "$UNALIGNED_APK" "$ALIGNED_APK"

if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair \
    -keystore "$KEYSTORE" \
    -storepass android \
    -keypass android \
    -alias androiddebugkey \
    -keyalg RSA \
    -sigalg SHA1withRSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null
fi

"$APKSIGNER" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --v1-signing-enabled true \
  --v2-signing-enabled false \
  --v3-signing-enabled false \
  --out "$OUT_APK" \
  "$ALIGNED_APK"

echo "$OUT_APK"
