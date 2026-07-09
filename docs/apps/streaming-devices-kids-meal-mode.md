---
layout: default
title: Streaming Devices - Kids Meal Mode
permalink: /apps/streaming-devices-kids-meal-mode
---

# Streaming Devices - Kids Meal Mode

Kids Meal Mode is a Fire TV / Android TV experiment that helps children keep eating during screen time with friendly timed bite prompts, parent-confirmed meal completion, and positive early-finish rewards.

The current MVP targets Fire TV Cube and Android TV streaming devices. It pauses video at a configurable interval, shows a kid-friendly bite prompt, resumes playback, and protects all meal-mode exits with a configurable 4-digit parent PIN.

## Current Prototype / Phase 0 Complete

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
| Netflix | Not supported in the current build | Netflix does not reliably auto-resume after the bite prompt on Fire TV. It can land on a title/resume screen and ignore the normal `MEDIA_PLAY` path. Accessibility-based workarounds were attempted and removed because Fire OS hides sideloaded accessibility services in Settings and the workaround remained unreliable. |

If "Display+" refers to Disney+, it should be treated as expected compatible pending real-device testing. If it refers to a different streaming app, it should be added to the test matrix before claiming support.

## Private Implementation

Source code, current APK builds, implementation notes, and Phase 2 server code are maintained privately:

[Private repo: scalinghuman/streaming-devices-kids-meal-mode](https://github.com/scalinghuman/streaming-devices-kids-meal-mode)

The public experiments page intentionally tracks product direction and status only. APK distribution, source history, and implementation details remain private until the app is ready for store release.

## Roadmap

### Phase 1 - Fire TV Product Iteration

Iterate on minor UX changes, feature polish, and bugs found during real family use. The focus is to make the current Fire TV build dependable enough for non-developer testers, with clearer onboarding, tighter parent-gated flows, honest supported-app documentation, and lightweight diagnostics for support.

### Phase 2 - Local Vision Validation on LAN

Validate a local vision model running on the home network. The Fire TV app remains the overlay and media-control client, while a LAN server handles bite detection and sends commands over WebSocket. Timer mode remains the fallback. The privacy goal is that camera frames and inference stay local.

### Phase 3 - Private Distribution

Distribute versioned APK builds to friends and family who have Android-based Fire TV devices. This phase needs a short install guide, changelogs, known issues, tester feedback templates, and clear expectations that Netflix is currently unsupported.

### Phase 4 - Fire TV Appstore

Target Amazon Appstore / Fire TV publishing after family-test reliability is stronger. Required work includes release signing, store listing assets, privacy policy, overlay-permission disclosure, minimal permissions, and review-ready explanations of the parent-controlled meal routine use case.

### Phase 5 - Google Play for Android

Evaluate Google Play in this order: Android TV / Google TV streaming devices first, then tablets, then phones. Android TV is technically feasible but has policy risk because the core product draws over other apps. Tablets and phones may work better as companion, camera, parent-control, or AI-validation apps rather than a direct copy of the Fire TV overlay product.

### Phase 6 - Apple Platform Exploration

Explore iPadOS, iOS, and tvOS later. iPad and iPhone are more likely to fit as companion, camera, parent-control, or family-dashboard apps. Apple TV may not support the same cross-app overlay/control model as Fire TV, so the Apple product shape should be evaluated separately.

### Cross-Phase Principles

- Parent control always wins.
- Keep kid-facing flows positive, simple, and hard to accidentally exit.
- Keep vision local-first and privacy-preserving.
- Do not claim streaming-app support until tested.
- Do not reintroduce accessibility automation unless it becomes reliable and policy-safe.
- Treat store approval as a product requirement, not an afterthought.

## Notes

- The app is designed for parent-supervised use at mealtimes.
- AI validation is assistive and should not replace parent judgment.
- Camera and vision work should prefer local-network / local-processing paths where possible.

[Privacy Policy](../privacy.md)  
[Support](../support.md)
