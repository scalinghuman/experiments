---
layout: default
title: Streaming Devices - Kids Meal Mode
permalink: /apps/streaming-devices-kids-meal-mode
---

# Streaming Devices - Kids Meal Mode

Kids Meal Mode is a Fire TV / Android TV experiment that helps children keep eating during screen time with friendly timed bite prompts, parent-confirmed meal completion, and positive early-finish rewards.

The current build targets Fire TV Cube and Android TV streaming devices. It pauses video at a configurable interval, shows a kid-friendly bite prompt, resumes playback, and protects meal-mode exits with a configurable 4-digit parent PIN.

**Package:** `com.kidsmealmode`  
**Current build:** `1.0.13` (versionCode 14)<br>
**Primary distribution:** public APK for personal / family sideload (not Appstore yet)<br>
**Status:** Phase 1 complete  

**Public page:** [https://scalinghuman.ai/apps/streaming-devices-kids-meal-mode](https://scalinghuman.ai/apps/streaming-devices-kids-meal-mode)

**APK download:** [KidsMealMode-firetv-debug.apk](https://scalinghuman.ai/downloads/KidsMealMode-firetv-debug.apk)

[Project brief](../projects/kids-meal-mode.md) · [All experiments](../projects/README.md)

## Status: Phase 1 complete (family-usable on Fire TV)

Phase 0 delivered a working Fire TV MVP. Phase 1 finished product iteration on real devices: UX polish, parent-gated flows, max meal timer, and a tested streaming-app compatibility matrix.

### Working today

- Configurable bite interval and pause duration
- Parent PIN protected stop / exit / settings / completion flows
- Fullscreen bite prompt with reliable resume path on supported apps
- Persistent meal-mode indicator (pulsing dot + icon) while active
- Early-finish rewards: uninterrupted screen-time timer or piggy-bank credit
- Reward thank-you screen; PIN not re-prompted when already authorized on the piggy path
- Configurable max meal duration with end-of-meal parent confirmation
- Soft TV focus styling for D-pad navigation
- Fire-gray square launcher icon tuned for sideload home-row tiles
- Local FastAPI / WebSocket server scaffold for upcoming LAN vision validation
- Public debug APK for family sideload; full source kept in private implementation repositories

### Source & distribution

- **APK:** public (links above) for personal / family Fire TV sideload.
- **Source code:** private. This page tracks product status and compatibility only.

## Roadmap

### Phase 1 - Fire TV Product Iteration ✅ Complete

Family-usable Fire TV build with parent-gated flows, UX polish, max meal timer, and an honest streaming compatibility matrix (see above).

### Phase 2 - Local Vision Validation on LAN

Validate a local vision model on the home network. The Fire TV app remains the overlay and media-control client; a LAN server handles bite detection over WebSocket. Timer mode remains the fallback. Camera frames and inference stay local.

### Phase 3 - Private Distribution

Versioned APK builds for friends and family with Android-based Fire TVs. Short install guide, changelogs, known issues, and clear unsupported-app expectations (Netflix, Paramount+).

### Phase 4 - Fire TV Appstore (optional / hard)

Only if a review-safe product shape emerges (likely without overlay + cross-app media control, or with strong justification).

### Phase 5 - Google Play for Android

Android TV / Google TV first, then tablets and phones if the product shape fits.

### Phase 6 - Apple Platform Exploration

iPadOS / iOS / tvOS later: more likely companion, camera, or parent-dashboard roles than a direct Fire TV overlay port.

### Cross-Phase Principles

- Parent control always wins.
- Keep kid-facing flows positive, simple, and hard to accidentally exit.
- Keep vision local-first and privacy-preserving.
- Do not claim streaming-app support until tested.
- Do not reintroduce accessibility automation unless it becomes reliable and policy-safe.
- Prefer honest sideload distribution over a compromised store build.

## Notes

- Designed for parent-supervised mealtimes.
- AI validation (when added) is assistive and does not replace parent judgment.
- Camera and vision work should prefer local-network / local-processing paths.

[Privacy Policy](../privacy.md)  
[Support](../support.md)
