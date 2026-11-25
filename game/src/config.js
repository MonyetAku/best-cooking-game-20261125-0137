// Dapur Kilat — configuration: every tunable number, station, ingredient and
// recipe lives here so the rest of the game only reads constants.
export const VIEW = { width: 1280, height: 800 };
export const HUD = { height: 64 };
export const BOARD = { x: 16, y: 80, w: 280, h: 480 };
export const FLOOR = { x: 312, y: 80, w: 952, h: 704 };

export const PLAYER = { radius: 18, speed: 265 };

export const COLORS = {
  floorA: '#e8cfa5',
  floorB: '#dfc193',
  wall: '#2b2118',
  hud: '#232946',
  hudText: '#f5efe0',
  gold: '#f2b705',
  wood: '#8a5a33',
  woodDark: '#6e4525',
  counter: '#a9743f',
  board: '#3d2c1e',
  ticket: '#fff8e7',
  danger: '#d64545',
  ok: '#3d9b4f',
  plate: '#f4f1ea',
};

// Every ingredient the kitchen knows, by id. `color` is its dot in tickets,
// `icon` picks the shape render.js draws for it.
export const INGREDIENTS = {
  rice: { name: 'Nasi', color: '#f5f0dc', icon: 'rice' },
  noodle: { name: 'Mie', color: '#f0c040', icon: 'noodle' },
  chicken: { name: 'Ayam', color: '#e88ca0', icon: 'chicken' },
  veggie: { name: 'Sayur', color: '#58a34a', icon: 'veggie' },
  egg: { name: 'Telur', color: '#fdf3d0', icon: 'egg' },
  sambal: { name: 'Sambal', color: '#c0392b', icon: 'sambal' },
  tea: { name: 'Teh', color: '#b5651d', icon: 'tea' },
  ice: { name: 'Es', color: '#a8d8e8', icon: 'ice' },
  choppedChicken: { name: 'Ayam potong', color: '#e88ca0', icon: 'chicken' },
  choppedVeggie: { name: 'Sayur potong', color: '#58a34a', icon: 'veggie' },
  cookedRice: { name: 'Nasi matang', color: '#f5f0dc', icon: 'rice' },
  cookedNoodle: { name: 'Mie matang', color: '#f0c040', icon: 'noodle' },
  friedEgg: { name: 'Telur goreng', color: '#f7d774', icon: 'egg' },
  soupChicken: { name: 'Ayam kuah', color: '#e8a34c', icon: 'chicken' },
  grilledChicken: { name: 'Ayam bakar', color: '#a0522d', icon: 'chicken' },
};

// Recipes: the dishes customers order. `needs` lists the finished items a
// plate must hold, in any order. Higher levels unlock richer dishes.
export const RECIPES = [
  { id: 'esTeh', name: 'Es Teh', needs: ['tea', 'ice'], price: 6, level: 1 },
  { id: 'nasiGoreng', name: 'Nasi Goreng', needs: ['cookedRice', 'friedEgg', 'sambal'], price: 12, level: 1 },
  { id: 'mieAyam', name: 'Mie Ayam', needs: ['cookedNoodle', 'choppedChicken', 'choppedVeggie'], price: 14, level: 2 },
  { id: 'ayamBakar', name: 'Ayam Bakar', needs: ['grilledChicken', 'sambal', 'cookedRice'], price: 16, level: 3 },
  { id: 'sotoAyam', name: 'Soto Ayam', needs: ['soupChicken', 'cookedRice', 'choppedVeggie', 'friedEgg'], price: 20, level: 4 },
];

// One station entry per counter in the kitchen. `kind` decides the rules:
// source hands out a raw ingredient; chop turns one item into another over
// time; cook does the same on a burner and can burn; plate holds the plates
// customers' dishes are built on; serve takes a finished plate to a ticket;
// trash throws the carried thing away.
export const STATIONS = [
  { id: 'rice', name: 'Nasi', short: 'NASI', x: 336, y: 96, w: 104, h: 84, kind: 'source', gives: 'rice' },
  { id: 'noodle', name: 'Mie', short: 'MIE', x: 452, y: 96, w: 104, h: 84, kind: 'source', gives: 'noodle' },
  { id: 'chicken', name: 'Ayam', short: 'AYAM', x: 568, y: 96, w: 104, h: 84, kind: 'source', gives: 'chicken' },
  { id: 'veggie', name: 'Sayur', short: 'SAYUR', x: 684, y: 96, w: 104, h: 84, kind: 'source', gives: 'veggie' },
  { id: 'egg', name: 'Telur', short: 'TELUR', x: 800, y: 96, w: 104, h: 84, kind: 'source', gives: 'egg' },
  { id: 'chili', name: 'Sambal', short: 'SAMBAL', x: 916, y: 96, w: 104, h: 84, kind: 'source', gives: 'sambal' },
  { id: 'tea', name: 'Teh', short: 'TEH', x: 1032, y: 96, w: 104, h: 84, kind: 'source', gives: 'tea' },
  { id: 'ice', name: 'Es', short: 'ES', x: 1148, y: 96, w: 104, h: 84, kind: 'source', gives: 'ice' },
  { id: 'board', name: 'Talenan', short: 'POTONG', x: 336, y: 300, w: 220, h: 96, kind: 'chop', jobs: { chicken: { time: 2, out: 'choppedChicken' }, veggie: { time: 1, out: 'choppedVeggie' } } },
  { id: 'wok', name: 'Wajan', short: 'WAJAN', x: 600, y: 300, w: 200, h: 96, kind: 'cook', jobs: { rice: { time: 4, out: 'cookedRice' }, noodle: { time: 3, out: 'cookedNoodle' } } },
  { id: 'stove', name: 'Kompor', short: 'KOMPOR', x: 844, y: 300, w: 180, h: 96, kind: 'cook', jobs: { egg: { time: 2, out: 'friedEgg' }, choppedChicken: { time: 5, out: 'soupChicken' } } },
  { id: 'grill', name: 'Panggangan', short: 'PANGGANG', x: 1068, y: 300, w: 180, h: 96, kind: 'cook', jobs: { choppedChicken: { time: 6, out: 'grilledChicken' } } },
  { id: 'plating', name: 'Rakit Piring', short: 'PIRING', x: 336, y: 560, w: 360, h: 88, kind: 'plate' },
  { id: 'window', name: 'Antar', short: 'ANTAR', x: 1060, y: 560, w: 180, h: 88, kind: 'serve' },
  { id: 'trash', name: 'Sampah', short: 'SAMPAH', x: 740, y: 640, w: 120, h: 72, kind: 'trash' },
];

// Difficulty per shift (level). Patience is seconds an order waits; the
// spawn gap is seconds between new tickets; shift is seconds per level.
export const LEVELS = [
  { shift: 150, patience: 50, spawn: 16 },
  { shift: 150, patience: 45, spawn: 13 },
  { shift: 150, patience: 38, spawn: 11 },
  { shift: 150, patience: 32, spawn: 9 },
];

export const MAX_ORDERS = 4;
export const MAX_HEARTS = 3;
export const BURN_AFTER = 6; // seconds a finished dish may sit before it burns
export const TIP_RATE = 0.5; // up to +50% of the price for a fast serve
export const INTERACT_RANGE = 72; // px from a station's edge counts as near
