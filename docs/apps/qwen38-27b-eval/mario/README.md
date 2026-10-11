# Super Mario: Web Edition

A complete, self-contained Super Mario-style platformer that runs in any modern
web browser. **No dependencies, no build step, no external assets**: all art is
drawn procedurally on a `<canvas>` and all sounds are synthesized live with the
WebAudio API.

## Quick start

- **Easiest:** double-click `index.html` (or open it from your file manager).
  The game has no network requests, so it works straight from `file://`.
- **Or** serve the folder with any static server:
  ```sh
  cd super-mario-web
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```

## Controls

| Action          | Keys                                  |
| --------------- | ------------------------------------- |
| Move            | `←` `→` or `A` `D`                    |
| Jump (hold = higher) | `Space` / `↑` / `W` / `Z`       |
| Run             | `Shift` or `X`                        |
| Start / confirm | `Enter` or `Space`                    |
| Pause / resume  | `P` or `Esc`                          |
| Restart level   | `R`                                   |
| Mute / unmute   | `M`                                   |

Touch controls (left/right, RUN, JUMP) appear automatically on touch devices.

## Gameplay

- **2 levels** (1-1 and 1-2) with classic mechanics:
  - Run with variable-height jump (tap = short hop, hold = full jump)
  - Coins, `?`-blocks (coin or mushroom), breakable bricks, bumpable bricks
  - Mushroom power-up (small → big), extra life every 100 coins
  - Goombas (stompable), Koopas → shell (kick the shell to clear enemies)
  - Pits, pipes, a 300-second countdown
  - Flagpole finish → slide → walk-off → course-clear splash → next level
  - Castle, win screen, game over, 1UP, pause, HUD (score / coins / world / time / lives)

## Design notes & assumptions

- **Stack:** plain HTML5 + CSS + vanilla ES5-ish JavaScript, one `<script>` tag
  (no ES modules) so it works from `file://` with zero tooling.
- **Rendering:** 960×576 canvas, 48 px tiles, 12 visible rows, 60 Hz fixed
  timestep; all sprites are drawn with canvas paths (no image files).
- **Audio:** WebAudio square/triangle/noise synth (jump, coin, stomp, break,
  power-up, flag, death). Starts on the first key press (browser autoplay
  policy). Toggle with `M`.
- **Physics constants** (tuned for playability): gravity `0.45 px/f²`, jump
  velocity `15 px/f` (≈250 px max jump), walk `3.4 px/f`, run `5.4 px/f`.
  Pipes are capped at 4 tiles high (5 is unjumpable), and 4-tile pits require
  a full jump: 5-tile pits (level 1-2) are the hard part on purpose.
- **Levels** are generated programmatically from helper functions (ground runs,
  pipes, brick rows, `?`-blocks, coin rows, enemy spawns) rather than hand-drawn
  ASCII, so they are compact and easy to tweak in `game.js`.

## Project layout

| File         | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `index.html` | Entry point: canvas + touch buttons                  |
| `style.css`  | Page/canvas/touch-button styling                     |
| `game.js`    | Everything: input, physics, levels, entities, render |
| `test/`      | Headless test harness (see below)                    |

## Tests

`test/harness.js` loads the real `game.js` in a Node `vm` sandbox with stubbed
DOM/canvas/audio and drives `tick()` frame by frame with synthetic key events:
59 assertions covering the full playthrough (start → blocks → power-up → stomps
→ shell → pits → pipes → flag → splash → level 2 → win → game over → 1UP →
pause/restart/mute → time-out), plus a render check for every screen state.

```sh
node test/harness.js
# PASSED: 59   FAILED: 0
```
