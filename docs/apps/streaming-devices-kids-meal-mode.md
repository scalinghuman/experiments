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
- Local FastAPI / WebSocket server scaffold for upcoming AI bite validation
- Debug APK and source are kept in the private implementation repository

## Streaming App Compatibility

Kids Meal Mode currently uses standard Android media key events (`MEDIA_PAUSE` / `MEDIA_PLAY`) rather than app-specific automation. This keeps the implementation simpler and more store-friendly, but support depends on each streaming app honoring standard media playback controls.

| App | Status | Notes |
| --- | --- | --- |
| YouTube | Tested supported | Pause and auto-resume work on Fire TV. |
| Prime Video | Tested supported | Pause and auto-resume work on Fire TV. |
| Disney+ | Expected compatible, needs real-device test | Public Fire TV / Android TV availability suggests a normal media-app path, but it has not been validated yet. |
| Hulu | Expected compatible, needs real-device test | Public Fire TV availability suggests likely standard media-key behavior, but it has not been validated yet. |
| Max / HBO Max | Expected compatible, needs real-device test | Public Fire TV availability suggests likely standard media-key behavior, but it has not been validated yet. |
| Peacock | Expected compatible, needs real-device test | Public Fire TV availability suggests likely standard media-key behavior, but it has not been validated yet. |
| Tubi / Pluto TV / Freevee | Expected compatible, needs real-device test | Public Fire TV availability suggests likely standard media-key behavior, but it has not been validated yet. |
| Plex / Jellyfin | Expected compatible, needs real-device test | Media-player apps generally expose Android media controls, but they have not been validated yet. |
| Netflix | Not supported in current Phase 1 | Netflix does not reliably auto-resume after the bite prompt on Fire TV. It can land on a title/resume screen and ignore the normal `MEDIA_PLAY` path. Accessibility-based workarounds were attempted and removed because Fire OS hides sideloaded accessibility services in Settings and the workaround remained unreliable. |

If "Display+" refers to Disney+, it should be treated as expected compatible pending real-device testing. If it refers to a different streaming app, it should be added to the test matrix before claiming support.

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
