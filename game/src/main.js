// Boot and game loop for Dapur Kilat. Normal play runs the live loop; with
// ?shot=<name>&seed=<n> the game stages one frozen scene (see shots.js) and
// renders it, so screenshots are deterministic frames of the real game.
import { VIEW } from './config.js';
import { newGame } from './state.js';
import { createInput } from './input.js';
import { nearestStation, nextShift, update } from './logic.js';
import { render } from './render.js';
import { initAudio, playSound, toggleMute } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '7');

let state = shotName ? stageShot(shotName, seed) : newGame(seed);
const input = createInput(canvas);

window.addEventListener('pointerdown', () => initAudio(), { once: true });
window.addEventListener('keydown', () => initAudio(), { once: true });

let last = performance.now();
let shiftShownAt = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (shotName) {
    state.time += dt;
    render(ctx, state, input);
    window.__shotReady = true;
    requestAnimationFrame(frame);
    return;
  }
  if (input.muteQueued) {
    input.muteQueued = false;
    toggleMute();
  }
  if (state.screen === 'play') {
    update(state, input, dt);
  } else if (state.screen === 'title' && input.confirmQueued) {
    input.confirmQueued = false;
    state.screen = 'play';
    playSound('ding');
  } else if (state.screen === 'shift') {
    if (shiftShownAt === 0) shiftShownAt = now;
    if (input.confirmQueued || now - shiftShownAt > 4000) {
      input.confirmQueued = false;
      shiftShownAt = 0;
      nextShift(state);
    }
  } else if (state.screen === 'over' && (input.restartQueued || input.confirmQueued)) {
    input.restartQueued = false;
    input.confirmQueued = false;
    state = newGame(seed);
    state.screen = 'play';
  }
  input.confirmQueued = false;
  input.restartQueued = false;
  if (state.screen === 'play') {
    const near = nearestStation(state);
    state.nearStation = near ? near.id : null;
  }
  render(ctx, state, input);
  requestAnimationFrame(frame);
}

render(ctx, state, input);
if (shotName) window.__shotReady = true;
requestAnimationFrame(frame);
