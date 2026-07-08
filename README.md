# Scaling Human Experiments

Personal Hardware + AI experiments exploring how machines can extend human
perception, memory, judgment, and capability.

> Human + Machines >> Human | Machines

Created and maintained by
[Srikantha Ballani (@c0smicdirt)](https://github.com/c0smicdirt) as part of
[Scaling Human](https://github.com/scalinghuman).

## Companion Experiments

This repository contains Android companion apps for wearable hardware.

- **Food Scanner** captures a food image and sends it to the companion iPhone
  app for nutrition analysis, then displays the result on the companion
  display.
- **Glasshole AI** is an AI-powered conversation fact-checker. It starts and
  stops real-time conversation capture and displays summaries and fact-check
  overlays returned by the companion iPhone app after analysis.

  Use Glasshole only with the consent of everyone being recorded and in
  compliance with local laws and regulations where it is used.

The free iPhone apps are distributed separately through the Apple App Store.
The iPhone apps also support standalone operation without companion hardware.

## Repository Contents

```text
companions/
  foodscanner-glass-companion/
  glasshole-glass-companion/
docs/glass/
assets/images/
scripts/
```

The private iOS source, App Store submission materials, research papers, and
internal development notes are not published in this repository.

## Supported AI Providers

The iPhone apps let the user choose the processing provider:

- **Glasshole:** Apple Intelligence, xAI Grok, OpenAI, Anthropic Claude, Google
  Gemini, Ollama, PocketPal, or a custom OpenAI-compatible endpoint.
- **Food Scanner:** Local iPhone Vision, xAI Grok, OpenAI, Anthropic Claude,
  Google Gemini/Gemma, Ollama vision models, PocketPal, or a custom endpoint.

Apple Intelligence in Glasshole requires an iPhone 15 Pro model or an iPhone 16
model or later, with Apple Intelligence enabled. Other supported iOS 26 iPhones
must use a configured cloud, local-network, PocketPal, or custom provider.
Food Scanner's default Local iPhone Vision mode works without Apple
Intelligence or an API key.

Get API keys or local runtimes:

- [xAI Grok](https://console.x.ai/)
- [OpenAI](https://platform.openai.com/api-keys)
- [Anthropic Claude](https://platform.claude.com/settings/keys)
- [Google Gemini](https://aistudio.google.com/app/apikey)
- [Ollama](https://ollama.com/download) (no API key)

## Install

See [Companion Installation Guide](docs/glass/GLASS_INSTALL_GUIDE.md) for ADB
installation, networking, and voice-command setup.

The companion apps target Android 4.4.4 / API 19 and are sideloaded.

## Screenshots

### Food Scanner

![Food Scanner on iPhone](assets/images/foodscanner_result_iphone_1.png)

![Food Scanner companion display](assets/images/foodscanner_result_glass_1.png)

### Glasshole

![Glasshole on iPhone](assets/images/glasshole_factcheck_iphone_1.png)

![Glasshole companion display](assets/images/glasshole_factcheck_glass_1.png)

## Status

Experimental. AI nutrition estimates and fact-check results can be wrong and must
not be treated as medical advice or authoritative fact.

Source is available under the
[Scaling Human Source-Available License](LICENSE). Redistribution, commercial
use, hosted derivatives, and app-store publication require written permission.
