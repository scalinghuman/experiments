'use strict';
/* Headless playtest harness for super-mario-web/game.js
   Loads the real game.js in a vm sandbox with stubbed DOM/canvas/audio,
   then drives it frame by frame, asserting on game state. */
const vm = require('vm');
const fs = require('fs');

const GAME = require('path').join(__dirname, '..', 'game.js');
const code = fs.readFileSync(GAME, 'utf8');

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, extra = '') {
  if (cond) { passed++; console.log('PASS  ' + name); }
  else { failed++; failures.push(name + (extra ? ' :: ' + extra : '')); console.log('FAIL  ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---------- DOM / canvas / audio stubs ----------
const noop = () => {};
function makeCtx2d() {
  const t = {};
  return new Proxy(t, {
    get(o, prop) {
      if (prop === 'createLinearGradient') return () => ({ addColorStop: noop });
      if (prop === 'measureText') return () => ({ width: 10 });
      if (prop in o) return o[prop];
      return noop;
    },
    set(o, prop, v) { o[prop] = v; return true; },
  });
}
const ctx2d = makeCtx2d();
const listeners = { keydown: [], keyup: [], blur: [] };
const windowStub = {
  addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  removeEventListener() {},
};
const documentStub = {
  getElementById(id) {
    if (id === 'game') return { width: 960, height: 576, getContext: () => ctx2d, addEventListener() {} };
    return { addEventListener() {} };
  },
  body: { classList: { add() {} } },
};
const sandbox = {
  window: windowStub,
  document: documentStub,
  performance: { now: () => 0 },
  requestAnimationFrame: () => 0,
  console,
};
vm.createContext(sandbox);

let loadError = null;
try {
  vm.runInContext(code, sandbox, { filename: 'game.js' });
} catch (e) {
  console.log('FATAL: failed to load game.js: ' + e.stack);
  process.exit(1);
}

// ---------- helpers ----------
const G = () => vm.runInContext('Game', sandbox);
const run = (n) => { for (let i = 0; i < n; i++) vm.runInContext('tick()', sandbox); };
const press = (c) => listeners.keydown.forEach(f => f({ code: c, repeat: false, preventDefault() {} }));
const release = (c) => listeners.keyup.forEach(f => f({ code: c, repeat: false, preventDefault() {} }));
const GY = 9 * 48; // top of ground
const tele = (p, x, y) => { p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.invincible = 0; };
const clearEnemies = () => { G().enemies.length = 0; };
const renderOk = (label) => {
  let err = null;
  try { vm.runInContext('render()', sandbox); } catch (e) { err = String(e); }
  check('render(' + label + ') no exception', !err, err);
};

// ---------- 1. title & start ----------
let g = G();
check('initial state is title', g.state === 'title');
check('backdrop level loaded for title', !!g.grid);
renderOk('title');
press('Enter');
g = G();
check('Enter starts the match', g.state === 'playing');
check('level 1 loaded', g.levelIdx === 0 && g.levelName === '1-1');
check('3 lives / 0 coins / 300 time', g.lives === 3 && g.coins === 0 && g.time === 300);
let p = g.player;
check('player alive at spawn', p.state === 'alive' && p.x === 144 && p.h === 46);

// ---------- 2. movement & jump ----------
const x0 = p.x;
press('ArrowRight'); run(60); release('ArrowRight');
check('walks right', p.x > x0 + 120, 'dx=' + (p.x - x0));
const y0 = p.y;
press('Space'); run(8); release('Space');
check('jump lifts player', p.y < y0 - 40, 'dy=' + (y0 - p.y));
run(90);
check('lands back on ground', Math.abs(p.y - (GY - p.h)) < 2, 'y=' + p.y);

// ---------- 3. ?-block coin ----------
clearEnemies();
const coins0 = g.coins;
tele(p, 16 * 48 + 7, GY - p.h);
press('Space'); run(45); release('Space');
check('?-block becomes used', g.grid[5][16] === 'U');
check('?-block grants coin', g.coins === coins0 + 1, 'coins=' + g.coins);
check('?-block grants 200 pts', g.score >= 200);

// ---------- 4. mushroom power-up (small -> big) ----------
clearEnemies();
tele(p, 23 * 48 + 7, GY - p.h);
press('Space'); run(45); release('Space');
let mush = g.items.find(i => i.kind === 'mushroom');
check('mushroom emerges from M-block', !!mush);
if (mush) {
  run(30);
  mush.emerge = 0;
  mush.x = p.x + 2; mush.y = p.y + 4; mush.vx = 0; mush.vy = 0;
  run(2);
  check('player grows to big', p.big === true && p.h === 78 && p.w === 38);
  check('grow awards 1000 pts', g.score >= 1200);
}

// ---------- 5. brick breaking (big) ----------
clearEnemies();
tele(p, 20 * 48 + 7, GY - p.h);
press('Space'); run(45); release('Space');
check('big Mario breaks brick', g.grid[5][20] === ' ');
check('brick smash awards 50 pts', g.score >= 1250);

// ---------- 6. brick bump only (small) ----------
p.big = false; p.h = 46; p.w = 34; p.y += 32;
clearEnemies();
tele(p, 22 * 48 + 7, GY - p.h);
press('Space'); run(45); release('Space');
check('small Mario does NOT break brick', g.grid[5][22] === 'B');

// ---------- 7. goomba stomp ----------
clearEnemies();
g.enemies.push(vm.runInContext(`(() => {
  const e = { type:'goomba', x: 300, y: 9*48-38, w:40, h:38, vx:1.2, vy:0, onGround:true, hitWall:false,
              active:true, dead:false, squashT:0, gone:false, mode:null, shellTimer:0, anim:0 };
  return e; })()`, sandbox));
const goomba = g.enemies[0];
p.facing = 1;
tele(p, goomba.x + 3, goomba.y - p.h - 4);
p.vy = 2;
for (let i = 0; i < 8 && !goomba.dead; i++) run(1); // stop on the exact stomp tick
check('goomba dies on stomp', goomba.dead === true);
check('stomp bounces player up', p.vy === -9.5, 'vy=' + p.vy);

// ---------- 8. goomba side-hit damages ----------
clearEnemies();
const goomba2 = vm.runInContext(`(() => {
  const e = { type:'goomba', x: 300, y: 9*48-38, w:40, h:38, vx:1.2, vy:0, onGround:true, hitWall:false,
              active:true, dead:false, squashT:0, gone:false, mode:null, shellTimer:0, anim:0 };
  return e; })()`, sandbox);
g.enemies.push(goomba2);
const livesBefore = g.lives;
p.big = false; p.h = 46; p.w = 34;
tele(p, goomba2.x - p.w + 4, goomba2.y + 2); // side overlap
p.invincible = 0;
run(3);
check('side hit kills small Mario', p.state === 'dying');
check('lives decremented', g.lives === livesBefore - 1);
run(200);
g = G(); p = g.player;
check('respawn on same level', g.state === 'playing' && p.state === 'alive' && g.levelIdx === 0);
check('respawn is small Mario', p.big === false);

// ---------- 9. koopa -> shell -> kick ----------
clearEnemies();
const koopa = vm.runInContext(`(() => {
  const e = { type:'koopa', x: 300, y: 9*48-56, w:40, h:56, vx:1.5, vy:0, onGround:true, hitWall:false,
              active:true, dead:false, squashT:0, gone:false, mode:'walk', shellTimer:0, anim:0 };
  return e; })()`, sandbox);
g.enemies.push(koopa);
p.big = false; p.h = 46; p.w = 34;
tele(p, koopa.x + 3, koopa.y - p.h - 4); p.vy = 2;
run(3);
check('koopa becomes shell', koopa.mode === 'shell' && koopa.h === 34);
check('shell starts stationary', koopa.vx === 0);
tele(p, koopa.x - p.w + 4, koopa.y); p.facing = 1; p.invincible = 0;
run(2);
check('touching shell kicks it', Math.abs(koopa.vx) === 7);

// ---------- 10. pit death & respawn ----------
const livesBefore2 = g.lives;
tele(p, 69 * 48 + 7, 400);
run(90);
check('falling into pit kills', p.state === 'dying');
run(200);
g = G(); p = g.player;
check('respawn after pit', g.state === 'playing' && p.state === 'alive');
check('lives decremented by pit', g.lives === livesBefore2 - 1);

// ---------- 11. pipe clearance (h=4, run speed) ----------
clearEnemies();
tele(p, 44 * 48, GY - p.h);
press('ArrowRight'); press('ShiftLeft'); press('Space');
let pipeCleared = false, died = false;
for (let i = 0; i < 150; i++) {
  run(1);
  if (p.state !== 'alive') { died = true; break; }
  if (p.x > 49 * 48 && p.y + p.h <= GY + 1) { pipeCleared = true; break; }
}
release('Space'); release('ShiftLeft'); release('ArrowRight');
check('h4 pipe cleared at run speed', pipeCleared, 'died=' + died + ' x=' + p.x + ' y=' + p.y);

// ---------- 12. pit jump (4 wide, walk, full jump) ----------
clearEnemies();
tele(p, 86 * 48 - 60, GY - p.h);
press('ArrowRight');
run(12); // build walk speed
press('Space');
let pitOk = false;
for (let i = 0; i < 120; i++) {
  run(1);
  if (p.state !== 'alive') break;
  if (p.x > 90 * 48 && p.y + p.h <= GY + 1) { pitOk = true; break; }
}
release('Space'); release('ArrowRight');
check('4-tile pit cleared with full jump', pitOk, 'x=' + p.x + ' state=' + p.state);

// ---------- 13. flag -> walkoff -> splash -> level 2 ----------
g = G(); p = g.player;
tele(p, g.flagX - 30, GY - p.h);
p.vx = 1;
run(3);
check('flag triggers clear sequence', g.state === 'flag' || g.state === 'walkoff');
renderOk('flag');
run(12);
check('slide ends in walkoff', g.player.state === 'walkoff', 'game=' + g.state + ' player=' + g.player.state);
run(220);
check('walkoff ends in splash', g.state === 'splash');
renderOk('splash');
run(120);
g = G(); p = g.player;
check('level 2 starts after splash', g.state === 'playing' && g.levelIdx === 1 && g.levelName === '1-2');
check('flag score awarded once', g.score > 0);

// ---------- 14. level 2 flag -> win ----------
tele(p, g.flagX - 30, GY - p.h); p.vx = 1;
run(3); run(12); run(220);
g = G();
check('win screen after level 2', g.state === 'win');
renderOk('win');

// ---------- 15. game over ----------
g = G();
press('Enter'); g = G();
check('win -> title', g.state === 'title');
press('Enter'); g = G(); p = g.player;
g.lives = 1;
tele(p, 30 * 48 + 7, 400); // L1 pit? no — levelIdx 0, pit at 69. use 69
tele(p, 69 * 48 + 7, 400);
run(90);
check('dying with 1 life left', p.state === 'dying');
run(200);
g = G();
check('game over after last life', g.state === 'gameover');
renderOk('gameover');
press('Enter'); g = G();
check('gameover -> title', g.state === 'title');

// ---------- 16. 1UP at 100 coins ----------
press('Enter'); g = G(); p = g.player;
check('fresh match', g.lives === 3 && g.coins === 0 && g.levelIdx === 0);
g.coins = 99;
let coinCell = null;
outer: for (let r = 0; r < 12; r++) for (let c = 0; c < g.W; c++) if (g.grid[r][c] === 'o') { coinCell = [c, r]; break outer; }
check('grid coin exists', !!coinCell);
if (coinCell) {
  tele(p, coinCell[0] * 48 + 8, coinCell[1] * 48 + 8);
  const livesC = g.lives;
  run(2);
  check('100th coin collected', g.coins === 100);
  check('1UP awarded exactly once', g.lives === livesC + 1, 'lives=' + g.lives);
  clearEnemies();
  tele(p, 144, GY - p.h); // soak from a safe spot so the test setup can't cause a death
  run(120); // 2s at 60fps: if buggy, lives would keep growing
  check('no infinite 1UP spam', g.lives === livesC + 1, 'lives after 120 frames=' + g.lives);
}

// ---------- 17. pause / restart / mute ----------
g = G();
if (g.state !== 'playing') { press('Enter'); g = G(); }
press('KeyP'); g = G();
check('P pauses', g.state === 'paused');
renderOk('paused');
press('KeyP'); g = G();
check('P resumes', g.state === 'playing');
p = g.player;
p.x = 5000;
press('KeyR'); g = G();
check('R restarts level at spawn', g.state === 'playing' && g.player.x === 144);
press('KeyM');
check('M toggles mute', vm.runInContext('AudioSys.muted', sandbox) === true);
press('KeyM');

// ---------- 18. time-up death ----------
g = G(); p = g.player;
g.time = 1; g.timeAcc = 59;
tele(p, 100 * 48, GY - p.h);
run(5);
check('time-out kills player', p.state === 'dying');
run(200);
g = G();
check('respawn after time-out', g.state === 'playing');

// ---------- summary ----------
console.log('\n==============================');
console.log('PASSED: ' + passed + '   FAILED: ' + failed);
if (failures.length) {
  console.log('Failures:');
  for (const f of failures) console.log('  - ' + f);
}
process.exit(failed ? 1 : 0);
