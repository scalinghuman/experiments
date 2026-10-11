---
layout: default
title: Food Scanner
permalink: /apps/foodscanner
---

# Food Scanner

Food Scanner is an iPhone app with optional wearable companion support. It also
works standalone on iPhone.

The app turns a food photo into an AI-assisted nutrition overlay with estimated
calories, macros, and concise pros and cons. Users can capture from the iPhone
camera, choose a photo from the library, or send an image from the optional
wearable companion.

## Supported Modes and Models

- Local iPhone Vision (default, on device)
- xAI Grok
- OpenAI
- Anthropic Claude
- Google Gemini / Gemma
- Ollama vision models
- PocketPal
- Custom OpenAI-compatible endpoints

## Optional Wearable Companion (Google Glass XE)

The optional Google Glass XE companion captures a food image and sends it to
the iPhone app over local Wi-Fi or iPhone Personal Hotspot. Analysis runs on
iPhone, and results are displayed back on the companion display.

**Requires:** Google Glass XE, ADB on a computer, and an iPhone Personal
Hotspot. Connect Glass to the iPhone hotspot before opening Food Scanner.

### Install path (website → GitHub)

1. Download the companion APK:
   [foodscanner-glass-companion-v1.0.0.apk](https://github.com/scalinghuman/experiments/releases/download/glass-companions-v1.0.0/foodscanner-glass-companion-v1.0.0.apk)
2. Follow the step-by-step
   [Google Glass XE installation guide](https://github.com/scalinghuman/experiments/blob/main/docs/glass/GLASS_INSTALL_GUIDE.md)
   (ADB install, hotspot, connection check).
3. On Glass, open the **scan food** command and **tap** the touchpad to
   launch. Do **not** rely on saying “Ok Glass.”
4. After the camera opens, wait about one second, then **tap** again to capture.

Product site: [scalinghuman.ai/apps/foodscanner](https://scalinghuman.ai/apps/foodscanner)

## Notes

- Nutrition values are AI estimates for general information only.
- The app is not medical advice and should not be used for diagnosis or
  treatment.

[Privacy Policy](../privacy.md)  
[Support](../support.md)
