---
layout: default
title: Streaming Devices - Kids Meal Mode
permalink: /apps/streaming-devices-kids-meal-mode
---

# Streaming Devices - Kids Meal Mode

Kids Meal Mode is a Fire TV / Android TV experiment that helps children keep eating during screen time with friendly timed bite prompts, parent-confirmed meal completion, and positive early-finish rewards.

The current build targets Fire TV Cube and Android TV streaming devices. It pauses video at a configurable interval, shows a kid-friendly bite prompt, resumes playback, and protects meal-mode exits with a configurable 4-digit parent PIN.

**Package:** `com.kidsmealmode`  
**Current private build:** `1.0.13` (versionCode 14)  
**Primary distribution:** private ADB / sideload (not Appstore yet)

## Status — Phase 1 in progress (family-usable on Fire TV)

Phase 0 delivered a working Fire TV MVP. Phase 1 is product iteration on real devices: UX polish, parent-gated flows, and dependable pause/resume for supported streaming apps.

### Working today

- Configurable bite interval and pause duration
- Parent PIN protected stop / exit / settings / completion flows
- Fullscreen bite prompt with reliable resume path on supported apps
- Persistent meal-mode indicator (pulsing dot + icon) while active
- Early-finish rewards: uninterrupted screen-time timer or piggy-bank credit
- Reward thank-you screen; PIN not re-prompted when already authorized on the piggy path
- Configurable max meal duration with end-of-meal parent confirmation
- Soft TV focus styling for D-pad navigation
- Fire-gray square launcher icon tuned for sideload home-row tiles (rectangular store banners still require Amazon hosting)
- Local FastAPI / WebSocket server scaffold for upcoming LAN vision validation
- Debug APK and full source kept in private implementation repositories

### Distribution and store outlook

Sideload remains the intended path for the full product (overlay indicator, cross-app media pause/resume, long-running meal service). Amazon Appstore approval is **uncertain** for this architecture: draw-over-other-apps and controlling other apps’ media are high-friction for review. A store “lite” build would need a different product shape. That is fine — the experiment is useful as a private family tool first.

## Streaming App Compatibility

Kids Meal Mode uses standard Android media key events (`MEDIA_PAUSE` / `MEDIA_PLAY`) rather than app-specific automation. Support depends on each streaming app honoring standard media playback controls.

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
| Netflix | Not supported in the current build | Netflix does not reliably auto-resume after the bite prompt on Fire TV. Accessibility-based workarounds were attempted and removed because Fire OS hides sideloaded accessibility services in Settings and the workaround remained unreliable. |

## Private Implementation

Source code, current APK builds, implementation notes, and Phase 2 server code are maintained privately:

- [Private repo: scalinghuman/streaming-devices-kids-meal-mode](https://github.com/scalinghuman/streaming-devices-kids-meal-mode)
- Also mirrored under [experiments-development](https://github.com/scalinghuman/experiments-development) at `apps/streaming-devices-kids-meal-mode`

The public experiments page tracks product direction and status only. APK distribution, source history, and implementation details remain private until the app is ready for broader release.

## Roadmap

### Phase 1 - Fire TV Product Iteration (active)

Iterate on UX, features, and bugs found during real family use. Focus: dependable install for non-developers, clear parent-gated flows, honest supported-app documentation, and lightweight diagnostics.

### Phase 2 - Local Vision Validation on LAN

Validate a local vision model on the home network. The Fire TV app remains the overlay and media-control client; a LAN server handles bite detection over WebSocket. Timer mode remains the fallback. Camera frames and inference stay local.

### Phase 3 - Private Distribution

Versioned APK builds for friends and family with Android-based Fire TVs. Short install guide, changelogs, known issues, and clear Netflix unsupported expectations.

### Phase 4 - Fire TV Appstore (optional / hard)

Only if a review-safe product shape emerges (likely without overlay + cross-app media control, or with strong justification). Release signing, listing assets, privacy policy, and permission disclosures required.

### Phase 5 - Google Play for Android

Android TV / Google TV first, then tablets and phones if the product shape fits. Overlay policy risk remains.

### Phase 6 - Apple Platform Exploration

iPadOS / iOS / tvOS later — more likely companion, camera, or parent-dashboard roles than a direct Fire TV overlay port.

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
