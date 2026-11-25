// Game state: everything a frame of Dapur Kilat needs, built fresh here and
// mutated only by logic.js. Plates and orders are plain objects so the
// renderer and the screenshot stager can read them without game logic.
import { LEVELS, MAX_HEARTS, MAX_ORDERS, PLAYER, RECIPES, STATIONS } from './config.js';
import { makeRng, pick } from './random.js';

let orderSeq = 0;

export function newPlate() {
  return { items: [] };
}

export function newGame(seed) {
  const rng = makeRng(seed || (Date.now() % 2147483647));
  const state = {
    screen: 'title',
    seed: seed || 1,
    rng,
    time: 0,
    level: 1,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    shiftTime: LEVELS[0].shift,
    shiftLength: LEVELS[0].shift,
    spawnTimer: 6,
    orders: [],
    plates: [newPlate(), newPlate(), newPlate()],
    stations: {},
    player: { x: 640, y: 700, vx: 0, vy: 0, face: -1, carrying: null, target: null },
    particles: [],
    floaters: [],
    message: null,
    messageTimer: 0,
    tally: null,
  };
  for (const station of STATIONS) state.stations[station.id] = { job: null };
  return state;
}

export function levelConfig(state) {
  return LEVELS[Math.min(state.level, LEVELS.length) - 1];
}

export function unlockedRecipes(state) {
  return RECIPES.filter((recipe) => recipe.level <= state.level);
}

export function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return null;
  const recipe = pick(state.rng, unlockedRecipes(state));
  const cfg = levelConfig(state);
  const order = {
    id: orderSeq += 1,
    recipe,
    patience: cfg.patience,
    maxPatience: cfg.patience,
    flash: 0,
  };
  state.orders.push(order);
  return order;
}

/** The recipe a plate completes, or null when its items match no dish. */
export function plateRecipe(plate) {
  const have = [...plate.items].sort().join(',');
  for (const recipe of RECIPES) {
    if ([...recipe.needs].sort().join(',') === have) return recipe;
  }
  return null;
}

/** Coins for serving `order` now: price plus a tip for leftover patience. */
export function serveValue(order) {
  const ratio = Math.max(0, order.patience / order.maxPatience);
  return order.recipe.price + Math.round(order.recipe.price * 0.5 * ratio);
}

export function addFloater(state, x, y, text, color) {
  state.floaters.push({ x, y, text, color: color || '#ffffff', life: 1.4 });
}

export function addParticles(state, x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x: x + (state.rng() - 0.5) * 24,
      y: y + (state.rng() - 0.5) * 10,
      vy: -18 - state.rng() * 22,
      vx: (state.rng() - 0.5) * 10,
      life: 0.9 + state.rng() * 0.5,
      size: 3 + state.rng() * 4,
      color,
    });
  }
}

export function stationById(id) {
  return STATIONS.find((station) => station.id === id);
}
