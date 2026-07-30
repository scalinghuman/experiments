---
layout: default
title: Glasshole AI
permalink: /apps/glasshole
---

# Glasshole AI

Glasshole AI is an iPhone app with optional wearable companion support. It also
works standalone on iPhone.

The app acts as an AI-powered live or real-time fact-checker and overlay for
spoken conversation. It can transcribe spoken conversation, summarize it, and
surface concise factual analysis on iPhone and on the companion display.

## Supported Modes and Models

- Apple Intelligence on compatible iPhones
- xAI Grok
- OpenAI
- Anthropic Claude
- Google Gemini
- Ollama
- PocketPal
- Custom OpenAI-compatible endpoints

## Consent and Recording

Glasshole records audio only when a user starts a session. Use it only with the
consent of everyone being recorded and in compliance with local laws and
regulations where it is used.

Audio recordings are not saved. On-device speech recognition converts audio to
text, and session history is stored locally on device. If the user selects an
external AI provider, only the transcript needed for the request is sent to
that provider.

## Optional Wearable Companion (Google Glass XE)

The optional Google Glass XE companion lets you start sessions from Glass and
view returned results on the prism. The companion connects to the iPhone app
over local Wi-Fi or iPhone Personal Hotspot.

**Requires:** Google Glass XE, ADB on a computer, and an iPhone Personal
Hotspot. Connect Glass to the iPhone hotspot before opening Glasshole AI.

### Install path (website → GitHub)

1. Download the companion APK:
   [glasshole-glass-companion-v1.0.0.apk](https://github.com/scalinghuman/experiments/releases/download/glass-companions-v1.0.0/glasshole-glass-companion-v1.0.0.apk)
2. Follow the step-by-step
   [Google Glass XE installation guide](https://github.com/scalinghuman/experiments/blob/main/docs/glass/GLASS_INSTALL_GUIDE.md)
   (ADB install, hotspot, connection check).
3. On Glass, open the **fact check** command and **tap** the touchpad to
   launch — do **not** rely on saying “Ok Glass.”
4. After launch, **tap** the touchpad again to start/stop listening.

Product site: [scalinghuman.ai/apps/glasshole](https://scalinghuman.ai/apps/glasshole)

## Notes

- AI-generated summaries and fact-check results can be wrong.
- Results should be treated as assistive output, not authoritative truth.

[Privacy Policy](../privacy.md)  
[Support](../support.md)
