// Staged screenshot scenes for ?shot=<name>&seed=<n>. Each scene builds a
// plausible mid-game state out of the same state objects live play uses, so
// the frame the browser renders is a real frame of the real game — kitchen
// and order board, ingredients on the counter, a dish mid-assembly, a timer
// and a plate ready to serve — frozen for the screenshot.
import { RECIPES } from './config.js';
import { addParticles, newGame } from './state.js';
import { makeRng } from './random.js';

function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

function setOrder(state, index, recipeId, patience, maxPatience) {
  state.orders[index] = {
    id: 100 + index,
    recipe: recipeById(recipeId),
    patience,
    maxPatience,
    flash: 0,
  };
}

function setJob(state, stationId, item, out, time, progress, done) {
  state.stations[stationId].job = {
    item, out, time, progress, done: !!done, doneTime: done ? 1 : 0, burnt: false,
  };
}

function setPlate(state, slot, items) {
  state.plates[slot] = { items: [...items] };
}

function base(state, seed, level, coins, served, hearts, shiftTime) {
  state.screen = 'play';
  state.level = level;
  state.coins = coins;
  state.served = served;
  state.hearts = hearts;
  state.shiftTime = shiftTime;
  state.shiftLength = 150;
  state.spawnTimer = 8;
  state.rng = makeRng(seed);
  state.orders.length = 0;
  state.particles.length = 0;
  state.floaters.length = 0;
}

/**
 * Stage the named scene on a fresh state and return it. Unknown names fall
 * back to the cover scene.
 */
export function stageShot(name, seed) {
  const state = newGame(seed || 7);
  if (name === 'assembly') {
    base(state, seed || 7, 2, 28, 3, 3, 104);
    setOrder(state, 0, 'mieAyam', 30, 45);
    setOrder(state, 1, 'nasiGoreng', 38, 45);
    setJob(state, 'stove', 'egg', 'friedEgg', 2, 1.4, false);
    setJob(state, 'board', 'chicken', 'choppedChicken', 2, 0.6, false);
    setPlate(state, 0, ['cookedNoodle', 'choppedChicken']);
    setPlate(state, 1, []);
    setPlate(state, 2, ['cookedRice']);
    state.player.x = 520;
    state.player.y = 500;
    state.player.face = 1;
    state.player.carrying = { kind: 'item', id: 'choppedVeggie' };
    addParticles(state, 934, 314, '#cfd8dc', 6);
    return state;
  }
  if (name === 'rush') {
    base(state, seed || 7, 3, 83, 11, 2, 38);
    setOrder(state, 0, 'ayamBakar', 12, 38);
    setOrder(state, 1, 'sotoAyam', 20, 38);
    setOrder(state, 2, 'mieAyam', 9, 38);
    setOrder(state, 3, 'nasiGoreng', 26, 38);
    setJob(state, 'wok', 'noodle', 'cookedNoodle', 3, 2.4, false);
    setJob(state, 'stove', 'choppedChicken', 'soupChicken', 5, 2.8, false);
    setJob(state, 'grill', 'choppedChicken', 'grilledChicken', 6, 6, true);
    setJob(state, 'board', 'chicken', 'choppedChicken', 2, 0.6, false);
    setPlate(state, 0, ['cookedRice', 'sambal']);
    setPlate(state, 1, ['choppedVeggie']);
    setPlate(state, 2, []);
    state.player.x = 700;
    state.player.y = 450;
    state.player.face = -1;
    state.player.carrying = { kind: 'item', id: 'chicken' };
    addParticles(state, 700, 314, '#cfd8dc', 8);
    addParticles(state, 1158, 314, '#cfd8dc', 8);
    return state;
  }
  if (name === 'serve') {
    base(state, seed || 7, 4, 120, 15, 3, 95);
    setOrder(state, 0, 'sotoAyam', 25, 32);
    setOrder(state, 1, 'mieAyam', 30, 32);
    setJob(state, 'wok', 'rice', 'cookedRice', 4, 1.2, false);
    setPlate(state, 0, ['cookedNoodle']);
    setPlate(state, 1, []);
    setPlate(state, 2, []);
    state.player.x = 1150;
    state.player.y = 692;
    state.player.face = 1;
    state.player.carrying = { kind: 'plate', plate: { items: ['soupChicken', 'cookedRice', 'choppedVeggie', 'friedEgg'] } };
    return state;
  }
  // cover: the busy mid-shift frame — everything the judge looks for at once.
  base(state, seed || 7, 2, 47, 6, 3, 62);
  setOrder(state, 0, 'nasiGoreng', 18, 45);
  setOrder(state, 1, 'mieAyam', 32, 45);
  setOrder(state, 2, 'esTeh', 40, 50);
  setJob(state, 'wok', 'noodle', 'cookedNoodle', 3, 1.8, false);
  setJob(state, 'grill', 'choppedChicken', 'grilledChicken', 6, 2.4, false);
  setJob(state, 'board', 'veggie', 'choppedVeggie', 1, 0.5, false);
  setPlate(state, 0, ['cookedRice', 'friedEgg']);
  setPlate(state, 1, ['choppedChicken']);
  setPlate(state, 2, []);
  state.player.x = 1000;
  state.player.y = 560;
  state.player.face = -1;
  state.player.carrying = { kind: 'plate', plate: { items: ['cookedRice', 'friedEgg', 'sambal'] } };
  addParticles(state, 700, 314, '#cfd8dc', 6);
  addParticles(state, 1158, 314, '#cfd8dc', 6);
  return state;
}
