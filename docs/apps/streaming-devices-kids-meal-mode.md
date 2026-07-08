---
layout: default
title: Streaming Devices - Kids Meal Mode
permalink: /apps/streaming-devices-kids-meal-mode
---

# Streaming Devices - Kids Meal Mode

Kids Meal Mode is a Fire TV / Android TV experiment that helps children keep eating during screen time with friendly timed bite prompts, parent-confirmed meal completion, and positive early-finish rewards.

The current MVP targets Fire TV Cube and Android TV streaming devices. It pauses video at a configurable interval, shows a kid-friendly bite prompt, resumes playback, and protects all meal-mode exits with a configurable 4-digit parent PIN.

## Current Prototype

- Fire TV / Android TV client package: `com.kidsmealmode`
- Configurable bite interval and pause duration
- Parent PIN protected stop / exit / completion flows
- Early finish reward mode with uninterrupted screen-time timer
- Reward-complete thank-you screen for the child
- Netflix resume helper using an accessibility-service fallback
- Local FastAPI / WebSocket server scaffold for upcoming AI bite validation
- Debug APK and source are kept in the private implementation repository

## Private Implementation

Source code, current APK builds, implementation notes, and Phase 2 server code are maintained privately:

[Private repo: scalinghuman/streaming-devices-kids-meal-mode](https://github.com/scalinghuman/streaming-devices-kids-meal-mode)

The public experiments page intentionally tracks product direction and status only. APK distribution, source history, and implementation details remain private until the app is ready for store release.

## Roadmap

- Publish to Amazon Appstore / Android app distribution after release signing and policy review
- Complete Phase 1 AI validation for bite detection and better meal-state confidence
- Expand from Fire TV to Google TV and other Android TV devices
- Add iPad / mobile camera companion support for local vision validation
- Explore Apple TV and other streaming-device clients
- Keep all child-facing flows parent-controlled and privacy-preserving

## Notes

- The app is designed for parent-supervised use at mealtimes.
- AI validation is assistive and should not replace parent judgment.
- Camera and vision work should prefer local-network / local-processing paths where possible.

[Privacy Policy](../privacy.md)  
[Support](../support.md)
