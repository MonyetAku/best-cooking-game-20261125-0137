// Keyboard and mouse input: WASD/arrows to walk, E or Space to use the
// nearest counter, click to walk there (clicking a counter walks over and
// uses it on arrival), Enter to start, R to restart, M to mute.
import { STATIONS } from './config.js';

export function createInput(canvas) {
  const input = {
    keys: new Set(),
    moveTarget: null,
    pendingStation: null,
    interactQueued: false,
    confirmQueued: false,
    restartQueued: false,
    muteQueued: false,
    mouse: { x: 0, y: 0 },
  };

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    if (key === 'e' || key === ' ') input.interactQueued = true;
    if (key === 'enter') input.confirmQueued = true;
    if (key === 'r') input.restartQueued = true;
    if (key === 'm') input.muteQueued = true;
    input.keys.add(key);
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.key.toLowerCase());
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    input.mouse.x = x;
    input.mouse.y = y;
    input.moveTarget = { x, y };
    input.pendingStation = null;
    for (const station of STATIONS) {
      if (x >= station.x - 6 && x <= station.x + station.w + 6 && y >= station.y - 6 && y <= station.y + station.h + 6) {
        input.pendingStation = station.id;
        break;
      }
    }
  });

  return input;
}

/** The walk direction from held keys, or null when no key is held. */
export function keyDirection(input) {
  const keys = input.keys;
  let x = 0;
  let y = 0;
  if (keys.has('a') || keys.has('arrowleft')) x -= 1;
  if (keys.has('d') || keys.has('arrowright')) x += 1;
  if (keys.has('w') || keys.has('arrowup')) y -= 1;
  if (keys.has('s') || keys.has('arrowdown')) y += 1;
  if (x === 0 && y === 0) return null;
  const len = Math.hypot(x, y);
  return { x: x / len, y: y / len };
}
