'use strict';
/* ================================================================
   SUPER MARIO — WEB EDITION
   A self-contained, dependency-free HTML5 canvas platformer.
   Controls:
     Move:  Arrow keys / A D
     Jump:  Space / W / Up / Z        (hold = higher jump)
     Run:   Shift / X
     Pause: P or Esc    Mute: M      Restart level: R
   ================================================================ */

// ---------------- Canvas ----------------
const TILE = 48;
const ROWS = 12;
const VIEW_W = 960;   // 20 tiles
const VIEW_H = 576;   // 12 tiles
const GROUND_ROW = 9; // first solid ground row (rows 9..11 = ground)

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ---------------- Physics constants ----------------
const GRAV = 0.45;
const MAX_FALL = 12;
const JUMP_V = 15;
const WALK_MAX = 3.4;
const RUN_MAX = 5.4;
const GROUND_ACC = 0.34;
const AIR_ACC = 0.26;
const FRICTION = 0.80;
const COYOTE_FRAMES = 6;

const SMALL_H = 46, SMALL_W = 34;
const BIG_H = 78, BIG_W = 38;

const SOLID = new Set(['#', 'B', '?', 'M', 'U', '[', ']', 'l', 'r', '=']);

// ---------------- Audio (tiny WebAudio synth) ----------------
const AudioSys = {
  ctx: null,
  muted: false,
  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, dur, type = 'square', vol = 0.14, slide = 0, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t0); o.stop(t0 + dur + 0.03);
  },
  noise(dur = 0.2, vol = 0.22, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(g); g.connect(this.ctx.destination);
    src.start(t0);
  },
  jump()   { this.tone(300, 0.18, 'square', 0.11, 520); },
  coin()   { this.tone(988, 0.07, 'square', 0.11); this.tone(1319, 0.24, 'square', 0.11, 0, 0.07); },
  stomp()  { this.tone(240, 0.12, 'triangle', 0.26, -160); },
  bump()   { this.tone(120, 0.09, 'square', 0.18, -70); },
  brick()  { this.noise(0.22, 0.25); },
  power()  { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.09, 'square', 0.11, 0, i * 0.07)); },
  shrink() { [784, 659, 523, 392, 262].forEach((f, i) => this.tone(f, 0.09, 'square', 0.12, 0, i * 0.06)); },
  die()    { [660, 622, 587, 554, 440, 392, 330, 262].forEach((f, i) => this.tone(f, 0.12, 'square', 0.13, 0, 0.12 + i * 0.09)); },
  flag()   { [392, 523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.1, 'square', 0.11, 0, i * 0.06)); },
  tick()   { this.tone(1046, 0.05, 'square', 0.08); },
};

// ---------------- Input ----------------
const Input = {
  left: false, right: false, jump: false, run: false,
  jumpBuffer: 0,
  keydown(e) {
    AudioSys.ensure();
    const k = e.code;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(k)) e.preventDefault();
    if (e.repeat) return;

    if (k === 'ArrowLeft' || k === 'KeyA') this.left = true;
    if (k === 'ArrowRight' || k === 'KeyD') this.right = true;
    if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW' || k === 'KeyZ') {
      this.jump = true;
      this.jumpBuffer = 7;
    }
    if (k === 'ShiftLeft' || k === 'ShiftRight' || k === 'KeyX') this.run = true;
    if (k === 'KeyM') { AudioSys.muted = !AudioSys.muted; if (!AudioSys.muted) AudioSys.tick(); }
    if (k === 'KeyP' || k === 'Escape') Game.togglePause();
    if (k === 'KeyR') Game.restartLevel();
    if (k === 'Enter' || k === 'Space') Game.onStartKey();
  },
  keyup(e) {
    const k = e.code;
    if (k === 'ArrowLeft' || k === 'KeyA') this.left = false;
    if (k === 'ArrowRight' || k === 'KeyD') this.right = false;
    if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW' || k === 'KeyZ') this.jump = false;
    if (k === 'ShiftLeft' || k === 'ShiftRight' || k === 'KeyX') this.run = false;
  },
};
window.addEventListener('keydown', e => Input.keydown(e));
window.addEventListener('keyup', e => Input.keyup(e));
window.addEventListener('blur', () => { Input.left = Input.right = Input.jump = Input.run = false; });

// Touch controls
function bindTouch(id, on, off) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('pointerdown', ev => { ev.preventDefault(); AudioSys.ensure(); on(); });
  for (const t of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(t, off);
}
bindTouch('btn-left',  () => { Game.onStartKey(); Input.left = true; },  () => Input.left = false);
bindTouch('btn-right', () => { Game.onStartKey(); Input.right = true; }, () => Input.right = false);
bindTouch('btn-jump',  () => { Game.onStartKey(); Input.jump = true; Input.jumpBuffer = 7; }, () => Input.jump = false);
bindTouch('btn-run',   () => { Game.onStartKey(); Input.run = true; },   () => Input.run = false);
if (window.matchMedia && matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');
else if ('ontouchstart' in window) document.body.classList.add('touch');

// ---------------- Level builders ----------------
// Grid characters:
//   ' ' air    '#' ground   '=' stone   'B' brick
//   '?' ?-coin 'M' ?-mushroom 'U' used block
//   '[' ']' pipe top    'l' 'r' pipe body
//   'o' floating coin (non-solid)
function makeLevelBase(W) {
  const grid = Array.from({ length: ROWS }, () => Array(W).fill(' '));
  const set = (c, r, t) => { if (r >= 0 && r < ROWS && c >= 0 && c < W) grid[r][c] = t; };
  const ground = (a, b) => { for (let c = a; c < b; c++) { set(c, 9, '#'); set(c, 10, '#'); set(c, 11, '#'); } };
  const pipe = (x, h) => {
    const top = GROUND_ROW - h;
    for (let c = x; c < x + 2; c++) {
      set(c, top, c === x ? '[' : ']');
      for (let r = top + 1; r < GROUND_ROW; r++) set(c, r, c === x ? 'l' : 'r');
    }
  };
  const brick = (x, y, n = 1) => { for (let i = 0; i < n; i++) set(x + i, y, 'B'); };
  const q = (x, y, mushroom = false) => set(x, y, mushroom ? 'M' : '?');
  const stairUp = (x, h) => { for (let i = 0; i < h; i++) for (let r = GROUND_ROW - (i + 1); r < GROUND_ROW; r++) set(x + i, r, '#'); };
  const stairDown = (x, h) => { for (let i = 0; i < h; i++) for (let r = GROUND_ROW - (h - i); r < GROUND_ROW; r++) set(x + i, r, '#'); };
  const stone = (x, y) => set(x, y, '=');
  return { grid, set, ground, pipe, brick, q, stairUp, stairDown, stone, W };
}

function makeLevel1() {
  const L = makeLevelBase(224);
  const coins = [];
  const enemies = [];
  const coin = (c, r) => coins.push({ c, r });
  const goomba = (c, r = GROUND_ROW) => enemies.push({ type: 'goomba', c, r });
  const koopa = (c, r = GROUND_ROW) => enemies.push({ type: 'koopa', c, r });

  // terrain
  L.ground(0, 69);   L.ground(71, 86);
  L.ground(90, 153); L.ground(157, 224);

  // opening: ? blocks and bricks
  L.q(16, 5);
  L.brick(20, 5); L.q(21, 5); L.brick(22, 5); L.q(23, 5, true); L.brick(24, 5); L.q(22, 2);

  // pipes
  L.pipe(28, 2); L.pipe(38, 3); L.pipe(46, 4); L.pipe(57, 4);

  // after first pit
  L.brick(77, 5); L.q(78, 5); L.brick(79, 5, 2);
  L.q(95, 5); L.q(96, 5, true);

  // floating coins
  [100, 101, 102, 103].forEach(c => coin(c, 5));
  coin(69, 4); coin(70, 4);
  coin(86, 4); coin(87, 3); coin(88, 3); coin(89, 4);
  coin(153, 4); coin(154, 3); coin(155, 4);

  // brick platform with goombas on top
  L.brick(118, 5, 4);
  goomba(119, 5); goomba(120, 5);

  // double staircase
  L.stairUp(134, 4); L.stairDown(140, 4);
  coin(137, 3); coin(138, 3);

  // final staircase + flag
  L.stairUp(180, 8);
  coin(182, 4); coin(183, 4);

  // enemies
  [22, 40, 51, 52, 80, 82, 97, 99, 107, 113, 122, 124, 145, 146].forEach(c => goomba(c));
  [35, 76, 105, 143].forEach(c => koopa(c));

  return { ...L, coins, enemies, flagCol: 200, castleCol: 205, time: 300, name: '1-1' };
}

function makeLevel2() {
  const L = makeLevelBase(240);
  const coins = [];
  const enemies = [];
  const coin = (c, r) => coins.push({ c, r });
  const goomba = (c, r = GROUND_ROW) => enemies.push({ type: 'goomba', c, r });
  const koopa = (c, r = GROUND_ROW) => enemies.push({ type: 'koopa', c, r });

  // terrain (more pits)
  L.ground(0, 30);    L.ground(34, 52);
  L.ground(56, 90);   L.ground(95, 130);
  L.ground(135, 175); L.ground(180, 240);

  // opening blocks
  L.q(12, 5);
  L.brick(16, 5, 2); L.q(18, 5, true); L.brick(19, 5, 2); L.q(17, 2);

  // pipes (taller)
  L.pipe(24, 3); L.pipe(40, 4); L.pipe(60, 4); L.pipe(70, 4);

  // mid blocks
  L.brick(78, 5, 2); L.q(80, 5); L.brick(81, 5, 2);

  // coins over pits
  coin(30, 4); coin(31, 3); coin(32, 4);
  coin(52, 4); coin(53, 3); coin(54, 4);
  coin(90, 4); coin(91, 3); coin(92, 3); coin(93, 4);
  coin(130, 4); coin(131, 3); coin(132, 3); coin(133, 4);
  coin(175, 4); coin(176, 3); coin(177, 3); coin(178, 4);

  // brick platform with goombas
  L.brick(104, 5, 4);
  goomba(105, 5); goomba(106, 5);

  // staircase pair
  L.stairUp(116, 4); L.stairDown(122, 4);

  // later blocks + coin row
  L.q(150, 5); L.q(152, 5); L.brick(154, 5, 3);
  [160, 161, 162, 163].forEach(c => coin(c, 5));

  // final staircase + flag
  L.stairUp(200, 8);
  coin(202, 4); coin(203, 4);

  // enemies (more of them)
  [18, 36, 37, 48, 66, 67, 84, 86, 97, 98, 140, 141, 160, 161, 185, 190].forEach(c => goomba(c));
  [26, 58, 76, 100, 146, 188].forEach(c => koopa(c));

  return { ...L, coins, enemies, flagCol: 218, castleCol: 223, time: 300, name: '1-2' };
}

const LEVEL_FACTORIES = [makeLevel1, makeLevel2];
const LEVEL_COUNT = LEVEL_FACTORIES.length;

// ---------------- Game state ----------------
const Game = {
  state: 'title',        // title | playing | paused | dying | flag | walkoff | splash | gameover | win
  stateT: 0,
  levelIdx: 0,
  grid: null, W: 0,
  levelName: '1-1',
  player: null,
  enemies: [],
  items: [],             // mushrooms + bump coins
  particles: [],
  popups: [],
  bumpAnims: [],
  camX: 0,
  score: 0, coins: 0, lives: 3,
  time: 300,
  flagX: 0, flagTopY: 0, castleX: 0,
  flagScoreGiven: false,

  resetMatch() {
    this.score = 0; this.coins = 0; this.lives = 3;
    this.levelIdx = 0;
    this.loadLevel(0);
  },
  loadLevel(idx) {
    const L = LEVEL_FACTORIES[idx]();
    this.levelIdx = idx;
    this.grid = L.grid;
    this.W = L.W;
    this.levelName = L.name;
    this.time = L.time;
    this.flagX = L.flagCol * TILE + TILE / 2;
    this.flagTopY = 2 * TILE;
    this.castleX = L.castleCol * TILE;
    this.enemies = [];
    this.items = [];
    this.particles = [];
    this.popups = [];
    this.bumpAnims = [];
    // avoid a stray spawn-hop when the match is started with Space
    Input.jumpBuffer = 0;
    Input.jump = false;
    // coins from map
    for (const c of L.coins) this.grid[c.r][c.c] = 'o';
    // player
    const p = {
      x: 3 * TILE, y: GROUND_ROW * TILE - SMALL_H,
      w: SMALL_W, h: SMALL_H,
      vx: 0, vy: 0, onGround: false, coyote: 0,
      facing: 1, big: false, invincible: 0,
      state: 'alive', deadT: 0, anim: 0,
    };
    this.player = p;
    // enemies
    for (const e of L.enemies) this.spawnEnemy(e);
    this.camX = 0;
    this.state = 'playing';
    this.stateT = 0;
    this.flagScoreGiven = false;
  },
  spawnEnemy(def) {
    const isKoopa = def.type === 'koopa';
    const h = isKoopa ? 56 : 38;
    const w = 40;
    this.enemies.push({
      type: def.type,
      x: def.c * TILE + (TILE - w) / 2,
      y: def.r * TILE - h,
      w, h,
      vx: (isKoopa ? 1.5 : 1.2) * (Math.random() < 0.5 ? -1 : 1),
      vy: 0, onGround: false, hitWall: false,
      active: false, dead: false, squashT: 0, gone: false,
      mode: isKoopa ? 'walk' : null,
      shellTimer: 0, anim: Math.random() * 10,
    });
  },
  togglePause() {
    if (this.state === 'playing') this.state = 'paused';
    else if (this.state === 'paused') this.state = 'playing';
  },
  restartLevel() {
    if (this.state === 'playing' || this.state === 'paused') this.loadLevel(this.levelIdx);
  },
  onStartKey() {
    AudioSys.ensure();
    if (this.state === 'title') this.resetMatch();
    else if (this.state === 'gameover' || this.state === 'win') this.state = 'title';
  },
};

// ---------------- Tile helpers ----------------
function isSolid(c, r) {
  const g = Game.grid;
  if (!g || r < 0 || r >= ROWS || c < 0 || c >= Game.W) return false;
  return SOLID.has(g[r][c]);
}
function solidInCol(c, y1, y2) {
  for (let y = y1; y <= y2; y += 8) if (isSolid(c, Math.floor(y / TILE))) return true;
  return false;
}
function solidInRow(r, x1, x2) {
  for (let x = x1; x <= x2; x += 8) if (isSolid(Math.floor(x / TILE), r)) return true;
  return false;
}

// ---------------- Entity movement ----------------
function moveX(e) {
  e.hitWall = false;
  e.x += e.vx;
  const top = e.y + 5, bot = e.y + e.h - 5;
  if (e.vx > 0) {
    const c = Math.floor((e.x + e.w) / TILE);
    if (solidInCol(c, top, bot)) { e.x = c * TILE - e.w - 0.01; e.hitWall = true; }
  } else if (e.vx < 0) {
    const c = Math.floor(e.x / TILE);
    if (solidInCol(c, top, bot)) { e.x = (c + 1) * TILE + 0.01; e.hitWall = true; }
  }
}
function moveY(e) {
  e.y += e.vy;
  e.onGround = false;
  if (e.vy > 0) {
    const r = Math.floor((e.y + e.h) / TILE);
    if (solidInRow(r, e.x + 2, e.x + e.w - 2)) {
      e.y = r * TILE - e.h; e.vy = 0; e.onGround = true;
    }
  } else if (e.vy < 0) {
    const r = Math.floor(e.y / TILE);
    if (solidInRow(r, e.x + 2, e.x + e.w - 2)) {
      e.y = (r + 1) * TILE + 0.01; e.vy = 0;
      return r; // ceiling hit -> row
    }
  }
  return -1;
}

// ---------------- Block interactions ----------------
function addPopup(x, y, text, color = '#ffffff') {
  Game.popups.push({ x, y, text, color, t: 0 });
}
function addShards(x, y, color) {
  for (let i = 0; i < 4; i++) {
    Game.particles.push({
      x, y,
      vx: (i % 2 ? 1 : -1) * (2 + Math.random() * 2),
      vy: -(4 + Math.random() * 3),
      t: 0, color, size: 7,
    });
  }
}
function killEnemy(e, how) {
  if (e.dead) return;
  e.dead = true; e.squashT = 26; e.vx = 0; e.vy = 0;
  const pts = e.type === 'koopa' ? 200 : 100;
  Game.score += pts;
  addPopup(e.x + e.w / 2, e.y, String(pts));
  if (how === 'stomp') AudioSys.stomp(); else AudioSys.bump();
}

function bumpBlock(c, r) {
  const t = Game.grid[r][c];
  Game.bumpAnims.push({ c, r, t: 0 });
  const cx = c * TILE + TILE / 2, cy = r * TILE;
  if (t === '?') {
    Game.grid[r][c] = 'U';
    Game.coins++; Game.score += 200;
    addPopup(cx, cy - 8, '200', '#ffd54a');
    AudioSys.coin();
    Game.items.push({ kind: 'bumpCoin', x: cx - 12, y: cy - 6, vy: -8.5, t: 0 });
  } else if (t === 'M') {
    Game.grid[r][c] = 'U';
    AudioSys.power();
    Game.items.push({ kind: 'mushroom', x: c * TILE + 4, y: r * TILE - 40, w: 40, h: 40, vy: 0, vx: 0, emerge: 24 });
  } else if (t === 'B') {
    if (Game.player.big) {
      Game.grid[r][c] = ' ';
      Game.score += 50;
      addPopup(cx, cy - 8, '50', '#e8a06a');
      addShards(cx, cy + TILE / 2, '#b3572e');
      AudioSys.brick();
      stompEnemiesOn(c, r);
    } else {
      AudioSys.bump();
    }
  } else {
    AudioSys.bump();
  }
}
function stompEnemiesOn(c, r) {
  const tx = c * TILE, ty = r * TILE;
  for (const e of Game.enemies) {
    if (e.dead || e.gone) continue;
    if (e.y + e.h > ty - 4 && e.y + e.h < ty + 14 && e.x + e.w > tx && e.x < tx + TILE) {
      killEnemy(e, 'bump');
    }
  }
}
function bumpTop(entity, r) {
  const c1 = Math.floor(entity.x / TILE), c2 = Math.floor((entity.x + entity.w) / TILE);
  let best = -1, bestOv = 0;
  for (let c = c1; c <= c2; c++) {
    if (!isSolid(c, r)) continue;
    const ov = Math.min(entity.x + entity.w, (c + 1) * TILE) - Math.max(entity.x, c * TILE);
    if (ov > bestOv) { bestOv = ov; best = c; }
  }
  if (best >= 0) bumpBlock(best, r);
}

// ---------------- Player ----------------
function updatePlayer() {
  const p = Game.player;
  if (p.state === 'dying') {
    p.deadT++;
    if (p.deadT > 20) p.vy = Math.min(p.vy + GRAV, MAX_FALL);
    if (p.deadT > 20) p.y += p.vy;
    if (p.deadT > 170) {
      if (Game.lives <= 0) { Game.state = 'gameover'; Game.stateT = 0; }
      else Game.loadLevel(Game.levelIdx);
    }
    return;
  }
  if (p.state === 'flag') {
    // slide down the pole
    const groundY = GROUND_ROW * TILE - p.h;
    p.x = Game.flagX - 16 - p.w;
    p.y = Math.min(p.y + 3.4, groundY);
    if (p.y >= groundY - 1) {
      p.state = 'walkoff';
      p.facing = 1;
    }
    return;
  }
  if (p.state === 'walkoff') {
    p.facing = 1;
    p.x += 3.0;
    p.anim += 3;
    p.y = GROUND_ROW * TILE - p.h; // keep on ground
    if (p.x > Game.castleX + 190) {
      if (Game.levelIdx + 1 < LEVEL_COUNT) {
        Game.state = 'splash'; Game.stateT = 0;
        Game.stateNext = Game.levelIdx + 1;
      } else {
        Game.state = 'win'; Game.stateT = 0;
        Game.score += Game.time * 20;
      }
    }
    return;
  }

  // --- normal play ---
  moveX(p);
  if (p.hitWall) p.vx = 0; // player does not bounce off walls
  const acc = p.onGround ? GROUND_ACC : AIR_ACC;
  const max = Input.run ? RUN_MAX : WALK_MAX;
  if (Input.left)  { p.vx -= acc; p.facing = -1; }
  if (Input.right) { p.vx += acc; p.facing = 1; }
  if (!Input.left && !Input.right && p.onGround) {
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.05) p.vx = 0;
  }
  p.vx = Math.max(-max, Math.min(max, p.vx));

  // jumping
  if (Input.jumpBuffer > 0) Input.jumpBuffer--;
  if (Input.jumpBuffer > 0 && (p.onGround || p.coyote > 0) && p.vy >= 0) {
    p.vy = -JUMP_V;
    Input.jumpBuffer = 0;
    p.coyote = 0;
    AudioSys.jump();
  }
  if (!Input.jump && p.vy < -5) p.vy = -5; // variable jump height

  p.vy = Math.min(p.vy + GRAV, MAX_FALL);

  const ceil = moveY(p);
  if (ceil >= 0) bumpTop(p, ceil);

  if (p.onGround) p.coyote = COYOTE_FRAMES; else if (p.coyote > 0) p.coyote--;
  if (p.invincible > 0) p.invincible--;
  if (p.vx !== 0 && p.onGround) p.anim += Math.abs(p.vx);

  p.x = Math.max(0, p.x);

  // fell into a pit
  if (p.y > VIEW_H + 140) killPlayer();
}

function collectGridCoins() {
  const p = Game.player;
  const c1 = Math.floor(p.x / TILE), c2 = Math.floor((p.x + p.w) / TILE);
  const r1 = Math.floor(p.y / TILE), r2 = Math.floor((p.y + p.h) / TILE);
  let collected = false;
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (r < 0 || r >= ROWS || c < 0 || c >= Game.W) continue;
      if (Game.grid[r][c] === 'o') {
        Game.grid[r][c] = ' ';
        Game.coins++;
        Game.score += 200;
        AudioSys.coin();
        collected = true;
        for (let i = 0; i < 5; i++) Game.particles.push({
          x: c * TILE + TILE / 2, y: r * TILE + TILE / 2,
          vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 4 - 1,
          t: 0, color: '#ffd54a', size: 4,
        });
      }
    }
  }
  // 1UP only on the frame the 100th (or later multiple) coin is actually collected
  if (collected && Game.coins > 0 && Game.coins % 100 === 0) {
    Game.lives++;
    addPopup(p.x + p.w / 2, p.y - 10, '1UP!', '#7dff8a');
    AudioSys.power();
  }
}

function growPlayer() {
  const p = Game.player;
  if (p.big) {
    Game.score += 1000;
    addPopup(p.x + p.w / 2, p.y - 10, '1000', '#7dff8a');
  } else {
    p.big = true;
    p.h = BIG_H; p.w = BIG_W;
    p.y -= (BIG_H - SMALL_H);
    Game.score += 1000;
    addPopup(p.x + p.w / 2, p.y - 10, '1000', '#7dff8a');
  }
  AudioSys.power();
}
function damagePlayer() {
  const p = Game.player;
  if (p.invincible > 0 || p.state !== 'alive') return;
  if (p.big) {
    p.big = false;
    p.y += (BIG_H - SMALL_H);
    p.h = SMALL_H; p.w = SMALL_W;
    p.invincible = 120;
    AudioSys.shrink();
  } else {
    killPlayer();
  }
}
function killPlayer() {
  const p = Game.player;
  if (p.state !== 'alive') return;
  Game.lives--;
  p.state = 'dying';
  p.deadT = 0;
  p.vx = 0;
  p.vy = -13;
  AudioSys.die();
}

// ---------------- Items ----------------
function updateItems() {
  for (const it of Game.items) {
    if (it.kind === 'bumpCoin') {
      it.t++;
      it.vy += 0.5;
      it.y += it.vy;
      if (it.t > 40) it.gone = true;
      continue;
    }
    // mushroom
    if (it.emerge > 0) {
      it.emerge--;
      it.y -= 0.8;
      continue;
    }
    if (!it.vx) it.vx = 1.6 * (Math.random() < 0.5 ? -1 : 1);
    it.vy = Math.min(it.vy + GRAV, MAX_FALL);
    moveX(it);
    if (it.hitWall) it.vx = -it.vx;
    moveY(it);
    if (it.y > VIEW_H + 200) it.gone = true;
  }
  Game.items = Game.items.filter(i => !i.gone);
}

function itemsVsPlayer() {
  const p = Game.player;
  if (p.state !== 'alive') return;
  for (const it of Game.items) {
    if (it.kind === 'mushroom' && it.emerge === 0 && overlap(p, it)) {
      it.gone = true;
      growPlayer();
    }
  }
}

// ---------------- Enemies ----------------
function updateEnemies() {
  const activeLimit = Game.camX + VIEW_W + 64;
  for (const e of Game.enemies) {
    if (e.gone) continue;
    if (e.dead) {
      if (e.squashT > 0) e.squashT--;
      else e.gone = true; // squash animation finished
      continue;
    }
    if (!e.active) {
      if (e.x < activeLimit) e.active = true;
      else continue;
    }
    e.anim += 1;
    e.vy = Math.min(e.vy + GRAV, MAX_FALL);
    moveX(e);
    if (e.hitWall) e.vx = -e.vx;
    moveY(e);
    if (e.y > VIEW_H + 240) { e.dead = true; e.gone = true; continue; }

    if (e.mode === 'shell') {
      e.shellTimer++;
      if (e.shellTimer > 420) { // shell wakes back up
        e.mode = 'walk';
        e.h = 56;
        e.y -= 22;
        e.vx = 1.5;
        e.shellTimer = 0;
      }
    }
  }
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerVsEnemies() {
  const p = Game.player;
  if (p.state !== 'alive') return;
  for (const e of Game.enemies) {
    if (e.dead || e.gone || !e.active) continue;
    if (!overlap(p, e)) continue;

    if (e.type === 'goomba') {
      if (p.vy > 0.5 && p.y + p.h - e.y < e.h * 0.75) {
        killEnemy(e, 'stomp');
        p.vy = -9.5;
      } else {
        damagePlayer();
      }
    } else if (e.mode === 'walk') { // koopa walking
      if (p.vy > 0.5 && p.y + p.h - e.y < e.h * 0.7) {
        // turn into a shell
        e.mode = 'shell';
        e.h = 34;
        e.y += (56 - 34);
        e.vx = 0;
        e.shellTimer = 0;
        Game.score += 200;
        addPopup(e.x + e.w / 2, e.y, '200');
        AudioSys.stomp();
        p.vy = -9.5;
      } else {
        damagePlayer();
      }
    } else if (e.mode === 'shell') {
      if (e.vx === 0) {
        // kick the shell
        e.vx = p.facing * 7;
        e.shellTimer = 0;
        AudioSys.stomp();
        p.vx = p.facing * 5;
        p.vy = -6;
        // separate player from shell so the player can never be clipped by
        // the very shell they just kicked on the next frame
        if (p.x + p.w / 2 <= e.x + e.w / 2) p.x = e.x - p.w;
        else p.x = e.x + e.w;
      } else if (p.vy > 0.5 && p.y + p.h - e.y < e.h * 0.85) {
        // stop a rolling shell
        e.vx = 0;
        e.shellTimer = 0;
        Game.score += 100;
        addPopup(e.x + e.w / 2, e.y, '100');
        AudioSys.stomp();
        p.vy = -9.5;
      } else {
        damagePlayer();
      }
    }
  }
}

function enemyVsEnemy() {
  const list = Game.enemies.filter(e => !e.dead && !e.gone && e.active);
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (!overlap(a, b)) continue;
      // shell kills anything it touches
      if (a.mode === 'shell' && a.vx !== 0) { killEnemy(b, 'shell'); continue; }
      if (b.mode === 'shell' && b.vx !== 0) { killEnemy(a, 'shell'); continue; }
      // two enemies bumping: both bounce
      a.vx = -a.vx; b.vx = -b.vx;
      a.x += a.vx > 0 ? 1 : -1;
      b.x += b.vx > 0 ? 1 : -1;
    }
  }
}

// ---------------- Flag / clear sequence ----------------
function checkFlag() {
  const p = Game.player;
  if (p.state !== 'alive') return;
  if (p.x + p.w > Game.flagX - 8 && p.x < Game.flagX + 40) {
    const row = Math.floor((p.y + p.h) / TILE);
    const pts = Math.max(100, Math.min(5000, (8 - Math.max(1, row)) * 500));
    Game.score += pts;
    addPopup(Game.flagX + 30, p.y, String(pts), '#ffd54a');
    p.state = 'flag';
    p.vx = 0; p.vy = 0;
    Game.state = 'flag';
    AudioSys.flag();
  }
}

// ---------------- Particles / popups ----------------
function updateFx() {
  for (const pt of Game.particles) {
    pt.t++;
    pt.vy += 0.35;
    pt.x += pt.vx;
    pt.y += pt.vy;
  }
  Game.particles = Game.particles.filter(p => p.t < 70);
  for (const pp of Game.popups) { pp.t++; pp.y -= 0.7; }
  Game.popups = Game.popups.filter(p => p.t < 55);
  for (const b of Game.bumpAnims) b.t++;
  Game.bumpAnims = Game.bumpAnims.filter(b => b.t < 14);
}

// ---------------- Camera & time ----------------
function updateCamera() {
  const target = Game.player.x + Game.player.w / 2 - VIEW_W * 0.42;
  const maxCam = Game.W * TILE - VIEW_W;
  let t = Math.max(0, Math.min(maxCam, target));
  Game.camX += (t - Game.camX) * 0.18;
  Game.camX = Math.round(Game.camX * 100) / 100;
}
function updateTime() {
  if (Game.state !== 'playing') return;
  Game.timeAcc = (Game.timeAcc || 0) + 1;
  if (Game.timeAcc >= 60) {
    Game.timeAcc = 0;
    Game.time--;
    if (Game.time <= 0) { Game.time = 0; killPlayer(); }
  }
}

// ---------------- Main update ----------------
function tick() {
  Game.stateT++;
  switch (Game.state) {
    case 'playing':
      updatePlayer();
      collectGridCoins();
      updateItems();
      itemsVsPlayer();
      updateEnemies();
      playerVsEnemies();
      enemyVsEnemy();
      checkFlag();
      updateFx();
      updateCamera();
      updateTime();
      break;
    case 'flag':
    case 'walkoff':
      updatePlayer();
      updateEnemies();
      enemyVsEnemy();
      updateFx();
      updateCamera();
      break;
    case 'dying':
      updatePlayer();
      updateFx();
      break;
    case 'splash':
      if (Game.stateT > 110) Game.loadLevel(Game.stateNext);
      break;
    default:
      break;
  }
}

// ================================================================
//  RENDERING
// ================================================================
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground(camX) {
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, '#5c94fc');
  g.addColorStop(1, '#8fc0ff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // clouds (parallax)
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  const cOff = (camX * 0.25) % 420;
  for (let i = -1; i < 5; i++) {
    const cx = i * 420 - cOff + 80;
    const cy = 70 + ((i * 53) % 40);
    cloud(cx, cy, 1);
    cloud(cx + 240, cy + 46, 0.7);
  }
  // hills
  ctx.fillStyle = '#3f9e46';
  const hOff = (camX * 0.5) % 640;
  for (let i = -1; i < 4; i++) {
    const hx = i * 640 - hOff + 100;
    ctx.beginPath();
    ctx.arc(hx, VIEW_H, 215, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx + 340, VIEW_H, 140, Math.PI, 0);
    ctx.fill();
  }
  // bushes
  ctx.fillStyle = '#57c25e';
  const bOff = (camX * 0.65) % 520;
  for (let i = -1; i < 4; i++) {
    const bx = i * 520 - bOff + 60;
    bush(bx, VIEW_H - 96, 1);
  }
}
function cloud(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 26 * s, y - 10 * s, 26 * s, 0, Math.PI * 2);
  ctx.arc(x + 56 * s, y, 22 * s, 0, Math.PI * 2);
  ctx.fill();
}
function bush(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, Math.PI, 0);
  ctx.arc(x + 24 * s, y, 24 * s, Math.PI, 0);
  ctx.arc(x + 50 * s, y, 18 * s, Math.PI, 0);
  ctx.fill();
}

// ---- tile art ----
function drawGroundTile(c, r, x, y) {
  const above = r > 0 ? Game.grid[r - 1][c] : ' ';
  const isTop = !SOLID.has(above);
  ctx.fillStyle = '#a3611f';
  ctx.fillRect(x, y, TILE, TILE);
  // speckles (deterministic)
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  const seed = (c * 7 + r * 13) % 5;
  ctx.fillRect(x + 8 + seed * 6, y + 14 + (seed * 7) % 20, 5, 5);
  ctx.fillRect(x + 28 - seed * 3, y + 30 - (seed * 5) % 14, 4, 4);
  if (isTop) {
    ctx.fillStyle = '#43b047';
    ctx.fillRect(x, y, TILE, 14);
    ctx.fillStyle = '#2f8f37';
    ctx.fillRect(x, y + 12, TILE, 4);
    ctx.fillStyle = '#67d46c';
    ctx.fillRect(x, y, TILE, 4);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
}
function drawBrick(x, y) {
  ctx.fillStyle = '#b3572e';
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = '#8a3f1e';
  ctx.fillRect(x, y + 14, TILE, 4);
  ctx.fillRect(x, y + 32, TILE, 4);
  ctx.fillRect(x + 22, y, 4, 14);
  ctx.fillRect(x + 10, y + 18, 4, 14);
  ctx.fillRect(x + 34, y + 18, 4, 14);
  ctx.fillRect(x + 22, y + 36, 4, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x, y, TILE, 3);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
}
function drawQBlock(x, y, used) {
  if (used) {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#6d4520';
    for (const [dx, dy] of [[8, 8], [TILE - 12, 8], [8, TILE - 12], [TILE - 12, TILE - 12]])
      ctx.fillRect(x + dx, y + dy, 5, 5);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    return;
  }
  ctx.fillStyle = '#f8b800';
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = '#ffdf6b';
  ctx.fillRect(x, y, TILE, 6);
  ctx.fillRect(x, y, 6, TILE);
  ctx.fillStyle = '#c07f00';
  ctx.fillRect(x, y + TILE - 6, TILE, 6);
  ctx.fillRect(x + TILE - 6, y, 6, TILE);
  ctx.fillStyle = '#7a4d00';
  for (const [dx, dy] of [[7, 7], [TILE - 11, 7], [7, TILE - 11], [TILE - 11, TILE - 11]])
    ctx.fillRect(x + dx, y + dy, 4, 4);
  ctx.fillStyle = '#7a3d00';
  ctx.save();
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', x + TILE / 2, y + TILE / 2 + 2);
  ctx.restore();
}
function drawStone(x, y) {
  ctx.fillStyle = '#9aa0a8';
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = '#c2c8d0';
  ctx.fillRect(x, y, TILE, 5);
  ctx.fillRect(x, y, 5, TILE);
  ctx.fillStyle = '#6f757e';
  ctx.fillRect(x, y + TILE - 5, TILE, 5);
  ctx.fillRect(x + TILE - 5, y, 5, TILE);
}
function drawPipe(x, y, kind) {
  const light = '#3ec463', mid = '#2f9e4f', dark = '#1f7a3a';
  if (kind === '[' || kind === ']') {
    const left = kind === '[';
    ctx.fillStyle = mid;
    ctx.fillRect(x - (left ? 6 : 0), y, TILE + (left ? 0 : 6), TILE);
    ctx.fillStyle = light;
    ctx.fillRect(x + (left ? 4 : TILE - 16), y, 12, TILE);
    ctx.fillStyle = dark;
    ctx.fillRect(x + (left ? TILE - 8 : 2), y, 6, TILE);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeRect(x - (left ? 6 : 0) + 0.5, y + 0.5, TILE + (left ? 0 : 6) - 1, TILE - 1);
  } else {
    const left = kind === 'l';
    ctx.fillStyle = mid;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = light;
    ctx.fillRect(x + (left ? 6 : TILE - 18), y, 12, TILE);
    ctx.fillStyle = dark;
    ctx.fillRect(x + (left ? TILE - 8 : 4), y, 4, TILE);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
  }
}
function drawCoinSprite(x, y, spin, scale = 1) {
  const w = Math.max(2, Math.abs(Math.cos(spin))) * 13 * scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#c98a00';
  ctx.beginPath();
  ctx.ellipse(0, 0, w + 2, 17 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd54a';
  ctx.beginPath();
  ctx.ellipse(0, 0, w, 15 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  if (w > 5) {
    ctx.fillStyle = '#e8a800';
    ctx.fillRect(-2 * scale, -9 * scale, 4 * scale, 18 * scale);
  }
  ctx.restore();
}

function bumpOffset(c, r) {
  for (const b of Game.bumpAnims) {
    if (b.c === c && b.r === r) return -Math.sin((b.t / 14) * Math.PI) * 12;
  }
  return 0;
}

function drawTiles() {
  const c0 = Math.max(0, Math.floor(Game.camX / TILE) - 1);
  const c1 = Math.min(Game.W - 1, c0 + 22);
  const spin = performance.now() / 120;
  for (let r = 0; r < ROWS; r++) {
    for (let c = c0; c <= c1; c++) {
      const t = Game.grid[r][c];
      if (t === ' ') continue;
      const x = c * TILE;
      const y = r * TILE + bumpOffset(c, r);
      switch (t) {
        case '#': drawGroundTile(c, r, x, y); break;
        case '=': drawStone(x, y); break;
        case 'B': drawBrick(x, y); break;
        case '?': drawQBlock(x, y, false); break;
        case 'M': drawQBlock(x, y, false); break;
        case 'U': drawQBlock(x, y, true); break;
        case '[': case ']': case 'l': case 'r': drawPipe(x, y, t); break;
        case 'o': drawCoinSprite(x + TILE / 2, y + TILE / 2, spin + c); break;
      }
    }
  }
}

function drawFlagAndCastle() {
  const fx = Game.flagX;
  // pole
  ctx.fillStyle = '#cfd6dd';
  ctx.fillRect(fx - 3, Game.flagTopY, 6, GROUND_ROW * TILE - Game.flagTopY);
  ctx.fillStyle = '#ffd54a';
  ctx.beginPath();
  ctx.arc(fx, Game.flagTopY, 9, 0, Math.PI * 2);
  ctx.fill();
  // flag
  const fy = Game.state === 'walkoff' || Game.state === 'win'
    ? GROUND_ROW * TILE - 60
    : (Game.state === 'flag' ? Math.min(Game.player.y + 20, GROUND_ROW * TILE - 60) : Game.flagTopY + 14);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(fx - 3, fy);
  ctx.lineTo(fx - 3, fy + 34);
  ctx.lineTo(fx - 40, fy + 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e52521';
  ctx.beginPath();
  ctx.arc(fx - 20, fy + 17, 6, 0, Math.PI * 2);
  ctx.fill();
  // base block
  ctx.fillStyle = '#9aa0a8';
  ctx.fillRect(fx - 14, GROUND_ROW * TILE - 2, 28, 2);

  // castle (decor)
  const cx = Game.castleX;
  const gy = GROUND_ROW * TILE;
  ctx.fillStyle = '#b8bdc6';
  ctx.fillRect(cx, gy - 120, 192, 120);
  ctx.fillRect(cx + 36, gy - 180, 120, 60);
  // crenellations
  ctx.fillStyle = '#a6acb6';
  for (let i = 0; i < 6; i++) ctx.fillRect(cx + i * 34 + 4, gy - 132, 20, 12);
  for (let i = 0; i < 4; i++) ctx.fillRect(cx + 40 + i * 30, gy - 192, 18, 12);
  // door
  ctx.fillStyle = '#3a3f47';
  rr(cx + 72, gy - 66, 48, 66, 10);
  ctx.fill();
  // windows
  ctx.fillStyle = '#565d68';
  ctx.fillRect(cx + 24, gy - 100, 18, 22);
  ctx.fillRect(cx + 150, gy - 100, 18, 22);
}

// ---- character art (procedural pixel style) ----
function drawMario(p) {
  const big = p.big;
  const w = p.w, h = p.h;
  const walking = p.onGround && Math.abs(p.vx) > 0.3;
  const phase = walking ? Math.sin(p.anim * 0.25) : 0;
  const inAir = !p.onGround;

  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y);
  ctx.scale(p.facing, 1);
  ctx.translate(-w / 2, 0);

  const U = (x, y, ww, hh, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, ww, hh); };
  const RED = '#e52521', BLUE = '#2a5bcc', SKIN = '#ffcc99', HAIR = '#5a3218',
        SHOE = '#7a4a21', WHITE = '#ffffff', EYE = '#20242c', GLOVE = '#ffffff';

  if (big) {
    // legs & shoes
    const sh = inAir ? 4 : 0;
    U(3, 62 + (inAir ? 4 : phase * 3), 13, 14, SHOE);
    U(22, 62 - (inAir ? 0 : phase * 3) - 2, 13, 16, SHOE);
    // overalls
    U(7, 34, 24, 32, BLUE);
    // shirt / arms
    U(4, 30, 26, 12, RED);
    U(0, 32 + (inAir ? -6 : 0), 8, 14, RED);
    U(30, 32 + (inAir ? -6 : 0), 8, 14, RED);
    U(0, 44 + (inAir ? -6 : 0), 8, 8, GLOVE);
    U(30, 44 + (inAir ? -6 : 0), 8, 8, GLOVE);
    // overall straps + buttons
    U(10, 30, 6, 8, BLUE);
    U(22, 30, 6, 8, BLUE);
    U(11, 36, 4, 4, '#ffd54a');
    U(23, 36, 4, 4, '#ffd54a');
    // head
    U(9, 4, 22, 26, SKIN);
    U(14, 6, 8, 6, HAIR);
    // eye
    U(22, 14, 4, 6, EYE);
    U(23, 15, 2, 2, WHITE);
    // nose
    U(27, 18, 7, 6, SKIN);
    // mustache
    U(20, 24, 12, 4, HAIR);
    // hat
    U(7, 0, 26, 8, RED);
    U(24, 6, 14, 5, RED);
    U(14, 2, 8, 4, WHITE);
    U(15, 3, 6, 2, RED);
    void sh;
  } else {
    // shoes
    U(2, 38 + (inAir ? 2 : phase * 2), 12, 8, SHOE);
    U(20, 38 - (inAir ? 2 : phase * 2), 12, 8, SHOE);
    // overalls
    U(6, 24, 22, 16, BLUE);
    // shirt
    U(4, 19, 26, 9, RED);
    // arms
    U(0, 20 + (inAir ? -4 : 0), 6, 10, RED);
    U(28, 20 + (inAir ? -4 : 0), 6, 10, RED);
    U(0, 28 + (inAir ? -4 : 0), 6, 6, GLOVE);
    U(28, 28 + (inAir ? -4 : 0), 6, 6, GLOVE);
    // buttons
    U(9, 26, 3, 3, '#ffd54a');
    U(22, 26, 3, 3, '#ffd54a');
    // head
    U(7, 3, 20, 17, SKIN);
    U(12, 5, 7, 5, HAIR);
    U(18, 10, 3, 4, EYE);
    U(23, 13, 6, 5, SKIN);
    U(16, 15, 10, 3, HAIR);
    // hat
    U(5, 0, 22, 6, RED);
    U(20, 4, 14, 4, RED);
    U(12, 1, 6, 3, WHITE);
    U(13, 2, 4, 1, RED);
  }
  ctx.restore();
}

function drawGoomba(e) {
  const x = e.x, y = e.y, w = e.w;
  const squash = e.dead;
  ctx.save();
  ctx.translate(x + w / 2, y + e.h);
  if (squash) { ctx.scale(1, 0.35); }
  const bob = Math.sin(e.anim * 0.25) * 1.5;
  // feet
  ctx.fillStyle = '#5a3218';
  const step = Math.sin(e.anim * 0.3) * 3;
  rr(-17 + step, -8, 14, 8, 4); ctx.fill();
  rr(3 - step, -8, 14, 8, 4); ctx.fill();
  // body
  ctx.fillStyle = '#a5622c';
  ctx.beginPath();
  ctx.ellipse(0, -16 + bob * 0.4, 19, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a4a1f';
  ctx.beginPath();
  ctx.ellipse(0, -10 + bob * 0.4, 19, 9, 0, 0, Math.PI);
  ctx.fill();
  // eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(-7, -18, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7, -18, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.arc(-6, -16, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -16, 2.4, 0, Math.PI * 2); ctx.fill();
  // brows
  ctx.strokeStyle = '#3a2210';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-12, -25); ctx.lineTo(-3, -22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, -25); ctx.lineTo(3, -22); ctx.stroke();
  ctx.restore();
}

function drawKoopa(e) {
  const x = e.x, y = e.y, w = e.w;
  ctx.save();
  ctx.translate(x + w / 2, y + e.h);
  if (e.mode === 'shell') {
    // shell
    ctx.fillStyle = '#2f9e4f';
    ctx.beginPath();
    ctx.ellipse(0, -15, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8d9a0';
    rr(-12, -20, 24, 16, 6); ctx.fill();
    ctx.fillStyle = '#2f9e4f';
    ctx.fillRect(-12, -12, 24, 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.stroke();
    if (e.shellTimer > 0 && Math.floor(e.shellTimer / 8) % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(14, -18, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }
  const dir = e.vx >= 0 ? 1 : -1;
  ctx.scale(dir, 1);
  // feet
  ctx.fillStyle = '#f2b544';
  const step = Math.sin(e.anim * 0.3) * 3;
  rr(-16 + step, -7, 13, 7, 3); ctx.fill();
  rr(4 - step, -7, 13, 7, 3); ctx.fill();
  // shell
  ctx.fillStyle = '#2f9e4f';
  ctx.beginPath();
  ctx.ellipse(-2, -24, 17, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8d9a0';
  rr(-14, -30, 24, 15, 6); ctx.fill();
  ctx.fillStyle = '#2f9e4f';
  ctx.fillRect(-14, -21, 24, 3);
  // head
  ctx.fillStyle = '#f2d45c';
  ctx.beginPath();
  ctx.arc(13, -42, 8, 0, Math.PI * 2);
  ctx.fill();
  // eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(16, -44, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.arc(17, -44, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawMushroom(it) {
  ctx.save();
  ctx.translate(it.x + 20, it.y + 40);
  // stem
  ctx.fillStyle = '#ffe9c9';
  rr(-10, -18, 20, 18, 4); ctx.fill();
  ctx.fillStyle = '#3a2c1a';
  ctx.fillRect(-6, -12, 3, 6);
  ctx.fillRect(3, -12, 3, 6);
  // cap
  ctx.fillStyle = '#e52521';
  ctx.beginPath();
  ctx.arc(0, -18, 18, Math.PI, 0);
  ctx.fill();
  rr(-18, -20, 36, 8, 4); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-9, -24, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(9, -24, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -30, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawEntities() {
  for (const it of Game.items) {
    if (it.kind === 'mushroom') drawMushroom(it);
    else if (it.kind === 'bumpCoin') drawCoinSprite(it.x + 12, it.y + 12, it.t * 0.4);
  }
  for (const e of Game.enemies) {
    if (e.gone) continue;
    if (!e.active) continue;
    if (e.type === 'goomba') drawGoomba(e);
    else drawKoopa(e);
  }
  if (Game.state !== 'title') drawMario(Game.player);
}

function drawFx() {
  for (const pt of Game.particles) {
    ctx.globalAlpha = Math.max(0, 1 - pt.t / 70);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const pp of Game.popups) {
    ctx.globalAlpha = Math.max(0, 1 - pp.t / 55);
    ctx.fillStyle = pp.color;
    ctx.fillText(pp.text, pp.x, pp.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ---- HUD & screens ----
function drawHUD() {
  ctx.font = 'bold 17px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  const items = [
    ['SCORE', String(Game.score).padStart(6, '0')],
    ['COINS', '\u25CE ' + String(Game.coins).padStart(2, '0')],
    ['WORLD', Game.levelName],
    ['TIME', String(Math.max(0, Game.time)).padStart(3, '0')],
    ['LIVES', '\u2665 ' + String(Math.max(0, Game.lives))],
  ];
  const xs = [28, 240, 400, 560, 760];
  items.forEach(([label, val], i) => {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(label, xs[i] + 1, 19);
    ctx.fillText(val, xs[i] + 1, 39);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, xs[i], 18);
    ctx.fillText(val, xs[i], 38);
  });
  if (AudioSys.muted) {
    ctx.font = 'bold 13px monospace';
    ctx.fillText('MUTED', 880, 20);
  }
}

function panel(w, h) {
  const x = (VIEW_W - w) / 2, y = (VIEW_H - h) / 2;
  ctx.fillStyle = 'rgba(8,10,18,0.78)';
  rr(x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  rr(x, y, w, h, 14);
  ctx.stroke();
  return { x, y };
}
function centerText(text, y, size, color = '#fff') {
  ctx.save();
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, VIEW_W / 2, y);
  ctx.restore();
}
function blink(on = true) {
  return on ? Math.floor(performance.now() / 400) % 2 === 0 : true;
}

function drawTitle() {
  panel(620, 420);
  centerText('SUPER MARIO', 150, 54, '#e52521');
  centerText('WEB EDITION', 192, 20, '#ffd54a');
  centerText('A tiny HTML5 platformer', 232, 15, 'rgba(255,255,255,0.65)');
  centerText('Move  ← →  /  A D', 278, 16);
  centerText('Jump  SPACE / W    Run  SHIFT', 302, 16);
  centerText('P pause   M mute   R restart', 326, 16);
  if (blink()) centerText('PRESS  ENTER  OR  TAP  TO  START', 392, 18, '#7dff8a');
}
function drawPause() {
  panel(420, 190);
  centerText('PAUSED', 250, 34);
  centerText('Press P or Esc to resume', 300, 16, 'rgba(255,255,255,0.7)');
}
function drawSplash() {
  panel(520, 220);
  centerText('COURSE CLEAR!', 240, 30, '#7dff8a');
  centerText(`WORLD ${Game.stateNext === 0 ? '1-1' : '1-2'}`, 296, 22);
}
function drawGameOver() {
  panel(560, 260);
  centerText('GAME OVER', 220, 44, '#e52521');
  centerText(`Final score: ${Game.score}`, 280, 20);
  if (blink()) centerText('PRESS ENTER FOR TITLE', 340, 16, '#ffd54a');
}
function drawWin() {
  panel(620, 330);
  centerText('🏁  YOU SAVED THE KINGDOM!  🏁', 180, 26, '#ffd54a');
  centerText('THE END', 226, 40, '#e52521');
  centerText(`Final score: ${Game.score}`, 280, 20);
  centerText(`Coins: ${Game.coins}`, 306, 18);
  if (blink()) centerText('PRESS ENTER FOR TITLE', 360, 16, '#7dff8a');
}

function render() {
  const camX = Game.state === 'title' ? 0 : Game.camX;
  drawBackground(camX);
  ctx.save();
  ctx.translate(-Math.round(camX), 0);
  if (Game.grid) {
    drawTiles();
    drawFlagAndCastle();
    drawEntities();
    drawFx();
  }
  ctx.restore();
  if (!Game.grid) return;
  drawHUD();
  switch (Game.state) {
    case 'title': drawTitle(); break;
    case 'paused': drawPause(); break;
    case 'splash': drawSplash(); break;
    case 'gameover': drawGameOver(); break;
    case 'win': drawWin(); break;
  }
}

// ---------------- Main loop (fixed timestep) ----------------
let last = performance.now();
let acc = 0;
const STEP = 1000 / 60;
function frame(now) {
  let dt = now - last;
  last = now;
  if (dt > 200) dt = 200;
  acc += dt;
  while (acc >= STEP) {
    tick();
    acc -= STEP;
  }
  render();
  requestAnimationFrame(frame);
}

// click/tap also starts the game
canvas.addEventListener('pointerdown', () => {
  AudioSys.ensure();
  Game.onStartKey();
});

// preload a level so the title screen has a live backdrop
Game.loadLevel(0);
Game.state = 'title';
Game.stateT = 0;

requestAnimationFrame(frame);
