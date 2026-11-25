// The rules of Dapur Kilat: walking, using counters, chopping and cooking,
// building plates, serving orders, and the shift clock. Every change to the
// state happens here, so the renderer and the screenshot stager only read.
import {
  BURN_AFTER, FLOOR, INTERACT_RANGE, LEVELS, MAX_HEARTS, PLAYER, STATIONS, TIP_RATE,
} from './config.js';
import { keyDirection } from './input.js';
import {
  addFloater, addParticles, levelConfig, plateRecipe, serveValue, spawnOrder, stationById,
} from './state.js';
import { playSound } from './audio.js';

function clampToFloor(player) {
  player.x = Math.max(FLOOR.x + PLAYER.radius, Math.min(FLOOR.x + FLOOR.w - PLAYER.radius, player.x));
  player.y = Math.max(FLOOR.y + PLAYER.radius, Math.min(FLOOR.y + FLOOR.h - PLAYER.radius, player.y));
}

function collideStations(player) {
  for (const station of STATIONS) {
    const cx = Math.max(station.x, Math.min(player.x, station.x + station.w));
    const cy = Math.max(station.y, Math.min(player.y, station.y + station.h));
    const dx = player.x - cx;
    const dy = player.y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < PLAYER.radius && dist > 0.001) {
      player.x = cx + (dx / dist) * PLAYER.radius;
      player.y = cy + (dy / dist) * PLAYER.radius;
    } else if (dist <= 0.001) {
      player.y = station.y - PLAYER.radius;
    }
  }
}

function distanceToStation(player, station) {
  const cx = Math.max(station.x, Math.min(player.x, station.x + station.w));
  const cy = Math.max(station.y, Math.min(player.y, station.y + station.h));
  return Math.hypot(player.x - cx, player.y - cy);
}

export function nearestStation(state) {
  let best = null;
  let bestDist = Infinity;
  for (const station of STATIONS) {
    const dist = distanceToStation(state.player, station);
    if (dist < bestDist) {
      bestDist = dist;
      best = station;
    }
  }
  return bestDist <= INTERACT_RANGE ? best : null;
}

function setMessage(state, text) {
  state.message = text;
  state.messageTimer = 2.2;
}

function takeFromStation(state, station) {
  const slot = state.stations[station.id];
  const job = slot.job;
  if (!job || !job.done) return false;
  if (job.burnt) {
    state.player.carrying = { kind: 'item', id: 'burnt' };
  } else {
    state.player.carrying = { kind: 'item', id: job.out };
  }
  slot.job = null;
  playSound('take');
  return true;
}

function startJob(state, station, itemId) {
  const job = station.jobs[itemId];
  if (!job) return false;
  state.stations[station.id].job = {
    item: itemId, out: job.out, time: job.time, progress: 0, done: false, doneTime: 0, burnt: false,
  };
  state.player.carrying = null;
  playSound(station.kind === 'chop' ? 'chop' : 'cook');
  return true;
}

/** Use a counter: the one action the E key and the click-to-use both run. */
export function interact(state, station) {
  const player = state.player;
  if (!station) return;
  if (station.kind === 'source') {
    if (player.carrying) { playSound('error'); setMessage(state, 'Tangan penuh!'); return; }
    player.carrying = { kind: 'item', id: station.gives };
    playSound('take');
    return;
  }
  if (station.kind === 'trash') {
    if (!player.carrying) return;
    if (player.carrying.kind === 'plate') {
      player.carrying.plate.items.length = 0;
      parkPlate(state, player.carrying.plate);
    }
    player.carrying = null;
    setMessage(state, 'Dibuang.');
    playSound('trash');
    return;
  }
  if (station.kind === 'chop' || station.kind === 'cook') {
    const slot = state.stations[station.id];
    if (slot.job) {
      if (slot.job.done && !player.carrying) takeFromStation(state, station);
      return;
    }
    if (player.carrying && player.carrying.kind === 'item' && station.jobs[player.carrying.id]) {
      startJob(state, station, player.carrying.id);
    } else if (player.carrying) {
      playSound('error');
      setMessage(state, 'Tidak bisa diolah di sini.');
    }
    return;
  }
  if (station.kind === 'plate') {
    if (player.carrying && player.carrying.kind === 'item') {
      if (player.carrying.id === 'burnt') { playSound('error'); setMessage(state, 'Makanan hangus tidak bisa disajikan!'); return; }
      const plate = firstOpenPlate(state);
      if (!plate) { playSound('error'); setMessage(state, 'Semua piring penuh!'); return; }
      plate.items.push(player.carrying.id);
      player.carrying = null;
      playSound('place');
      return;
    }
    if (player.carrying && player.carrying.kind === 'plate') {
      parkPlate(state, player.carrying.plate);
      player.carrying = null;
      playSound('place');
      return;
    }
    const plate = fullestPlate(state);
    if (plate) {
      player.carrying = { kind: 'plate', plate };
      removePlate(state, plate);
      playSound('take');
    }
    return;
  }
  if (station.kind === 'serve') {
    if (!player.carrying || player.carrying.kind !== 'plate') return;
    const plate = player.carrying.plate;
    const recipe = plateRecipe(plate);
    const order = state.orders.find((o) => recipe && o.recipe.id === recipe.id);
    if (!order) { playSound('error'); setMessage(state, 'Tidak ada pesanan untuk hidangan ini!'); return; }
    const value = serveValue(order);
    state.coins += value;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.orders.splice(state.orders.indexOf(order), 1);
    addFloater(state, station.x + station.w / 2, station.y - 10, `+$${value}`, '#f2b705');
    addParticles(state, station.x + station.w / 2, station.y + 20, '#f2b705', 14);
    plate.items.length = 0;
    parkPlate(state, plate);
    player.carrying = null;
    playSound('serve');
  }
}

function firstOpenPlate(state) {
  return state.plates.find((plate) => plate && plate.items.length < 4) || null;
}

function fullestPlate(state) {
  let best = null;
  for (const plate of state.plates) {
    if (!plate || plate.items.length === 0) continue;
    if (!best) { best = plate; continue; }
    const bestDone = plateRecipe(best) ? 1 : 0;
    const thisDone = plateRecipe(plate) ? 1 : 0;
    if (thisDone > bestDone || (thisDone === bestDone && plate.items.length > best.items.length)) best = plate;
  }
  return best;
}

function parkPlate(state, plate) {
  const empty = state.plates.findIndex((slot) => slot === null);
  if (empty !== -1) state.plates[empty] = plate;
}

function removePlate(state, plate) {
  const index = state.plates.indexOf(plate);
  if (index !== -1) state.plates[index] = null;
}

function updateJobs(state, dt) {
  for (const station of STATIONS) {
    if (station.kind !== 'chop' && station.kind !== 'cook') continue;
    const slot = state.stations[station.id];
    const job = slot.job;
    if (!job) continue;
    if (!job.done) {
      job.progress += dt;
      if (state.rng() < dt * 6) {
        addParticles(state, station.x + station.w / 2, station.y + 14, station.kind === 'cook' ? '#cfd8dc' : '#d7ccc8', 1);
      }
      if (job.progress >= job.time) {
        job.done = true;
        job.doneTime = 0;
        playSound('ding');
      }
    } else if (!job.burnt) {
      job.doneTime += dt;
      if (job.doneTime > BURN_AFTER) {
        job.burnt = true;
        setMessage(state, 'Ada makanan hangus! Buang ke sampah.');
        playSound('burn');
      }
    }
  }
}

function updateOrders(state, dt) {
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnOrder(state);
    state.spawnTimer = levelConfig(state).spawn;
  }
  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const order = state.orders[i];
    order.patience -= dt;
    order.flash = Math.max(0, order.flash - dt);
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.hearts -= 1;
      state.combo = 0;
      addFloater(state, 160, 120, 'Pesanan hangus!', '#d64545');
      playSound('fail');
      if (state.hearts <= 0) {
        state.screen = 'over';
      }
    }
  }
}

function movePlayer(state, input, dt) {
  const player = state.player;
  const dir = keyDirection(input);
  if (dir) {
    input.moveTarget = null;
    input.pendingStation = null;
    player.x += dir.x * PLAYER.speed * dt;
    player.y += dir.y * PLAYER.speed * dt;
    player.face = dir.x < 0 ? -1 : dir.x > 0 ? 1 : player.face;
  } else if (input.moveTarget) {
    const dx = input.moveTarget.x - player.x;
    const dy = input.moveTarget.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      input.moveTarget = null;
    } else {
      player.x += (dx / dist) * PLAYER.speed * dt;
      player.y += (dy / dist) * PLAYER.speed * dt;
      player.face = dx < 0 ? -1 : 1;
    }
  }
  clampToFloor(player);
  collideStations(player);
  if (input.pendingStation) {
    const station = stationById(input.pendingStation);
    if (station && distanceToStation(player, station) <= INTERACT_RANGE) {
      input.pendingStation = null;
      input.moveTarget = null;
      interact(state, station);
    }
  }
}

function updateParticles(state, dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
    const f = state.floaters[i];
    f.life -= dt;
    f.y -= 26 * dt;
    if (f.life <= 0) state.floaters.splice(i, 1);
  }
  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) state.message = null;
  }
}

/** Advance one frame of live play. Called only while screen is 'play'. */
export function update(state, input, dt) {
  state.time += dt;
  movePlayer(state, input, dt);
  if (input.interactQueued) {
    input.interactQueued = false;
    interact(state, nearestStation(state));
  }
  updateJobs(state, dt);
  updateOrders(state, dt);
  updateParticles(state, dt);
  state.shiftTime -= dt;
  if (state.shiftTime <= 0) {
    state.shiftTime = 0;
    const cfg = LEVELS[Math.min(state.level, LEVELS.length) - 1];
    state.tally = { level: state.level, served: state.served, coins: state.coins };
    state.screen = 'shift';
    playSound('levelup');
  }
}

/** Begin the next shift after the tally screen. */
export function nextShift(state) {
  state.level += 1;
  state.hearts = Math.min(MAX_HEARTS, state.hearts + 1);
  const cfg = LEVELS[Math.min(state.level, LEVELS.length) - 1];
  state.shiftTime = cfg.shift;
  state.shiftLength = cfg.shift;
  state.orders.length = 0;
  state.spawnTimer = 4;
  state.screen = 'play';
}
