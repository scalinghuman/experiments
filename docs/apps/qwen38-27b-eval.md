---
layout: default
title: Build Super Mario Web Edition for $0
permalink: /apps/qwen38-27b-eval
---

# Build Super Mario Web Edition for $0

## Test-riding local model prowess

This is an informal local-model capability test: give a local
[Qwen3.8 27B](https://huggingface.co/Qwen/Qwen3.8-27B) model one open-ended
prompt in [LM Studio](https://lmstudio.ai/), turn Wi-Fi off, and see whether it
can ship a complete browser game without follow-up instructions.

> Create Super Mario game which can be played in a web-browser. Make suitable assumptions.

The result took roughly four hours of unattended local inference and no
follow-up prompts. It is a self-contained, Super Mario-style platformer: no
dependencies, build step, network requests, or downloaded art assets.

This is not a benchmark or a claim that one model is universally better than
another. It is a practical look at what local, offline inference can produce
when the task is concrete and the model has room to make sensible assumptions.

## Watch the run

The screen recording shows the one-shot prompt in
[LM Studio](https://lmstudio.ai/) and the locally served game being played in a
browser.

<video controls playsinline preload="metadata" poster="/experiments/assets/qwen38-27b-eval/qwen-local-mario-demo-poster.png" width="960">
  <source src="/experiments/assets/qwen38-27b-eval/qwen-local-mario-demo.mp4" type="video/mp4">
  Your browser does not support embedded video. <a href="/experiments/assets/qwen38-27b-eval/qwen-local-mario-demo.mp4">Download the recording</a>.
</video>

## Play it

<iframe src="/experiments/apps/qwen38-27b-eval/mario/index.html" title="Playable Super Mario-style web game built during the local model evaluation" width="960" height="700" allow="autoplay"></iframe>

[Open the game in its own tab](/experiments/apps/qwen38-27b-eval/mario/index.html)

**Controls:** arrow keys or `A` / `D` to move; `Space`, `W`, `Z`, or up-arrow
to jump; `Shift` or `X` to run; `P` to pause; `R` to restart; `M` to mute.

## What the artifact contains

- 1,592 lines across three runtime files: HTML, CSS, and vanilla JavaScript
- Canvas-rendered visuals and synthesized WebAudio effects, with no external assets
- Two levels with movement, variable-height jumping, blocks, power-ups,
  enemies, shells, pits, pipes, a timer, flagpole finishes, pause, and restart
- A headless Node test harness with **59 passing assertions** across gameplay
  and render states
- Works directly from `file://`, so it remains playable with no internet

## Why test this locally?

Local and edge models can reduce latency, preserve privacy, and make
experimentation possible without metered API calls. This run used a local model
in LM Studio after the model was already present on the laptop, so the build
itself did not require an internet connection or an inference bill.

The broader point is not that every task should be generated unattended. It is
that useful, testable software can increasingly be prototyped on personal
hardware, where the marginal cost looks much closer to electricity than a
per-request cloud bill.

## Tools used

- [LM Studio](https://lmstudio.ai/) for local, offline inference
- [Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) open-weights model

## GPU poor, still useful

Hugging Face's GPU Poor framing fits this run: personal compute is enough to
ship a complete prototype when the model is small enough to run locally.

![Hugging Face GPU Poor meme used as context for this local evaluation](/experiments/assets/qwen38-27b-eval/huggingface-gpu-poor.png)

## Artifact

- [Download the generated source (`super-mario-web-source.zip`)](/experiments/assets/qwen38-27b-eval/super-mario-web-source.zip)
- [Browse the generated game files](https://github.com/scalinghuman/experiments/tree/main/docs/apps/qwen38-27b-eval/mario)
- [Read the game README](https://github.com/scalinghuman/experiments/blob/main/docs/apps/qwen38-27b-eval/mario/README.md)
- [Run the test harness](https://github.com/scalinghuman/experiments/blob/main/docs/apps/qwen38-27b-eval/mario/test/harness.js)
- [Scaling Human project page](https://scalinghuman.ai/apps/qwen38-27b-eval)
