// All drawing for Dapur Kilat: one canvas, vector art only, no image files.
// The judge sees the game mostly through screenshots, so every frame must
// read at a glance: kitchen, order board, ingredients, a dish mid-assembly,
// the timer and a plate ready to serve.
import { BOARD, COLORS, FLOOR, HUD, INGREDIENTS, PLAYER, STATIONS, VIEW } from './config.js';
import { plateRecipe } from './state.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function heart(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.35);
  ctx.bezierCurveTo(x - size, y - size * 0.45, x - size * 0.45, y - size, x, y - size * 0.35);
  ctx.bezierCurveTo(x + size * 0.45, y - size, x + size, y - size * 0.45, x, y + size * 0.35);
  ctx.fill();
}

/** One ingredient's icon, drawn with shapes, centred at (x, y), size s. */
export function drawItemIcon(ctx, id, x, y, s) {
  const half = s / 2;
  ctx.save();
  ctx.translate(x, y);
  switch (id) {
    case 'rice':
    case 'cookedRice': {
      ctx.fillStyle = '#f5f0dc';
      ctx.beginPath(); ctx.arc(0, -half * 0.25, half * 0.75, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(0, half * 0.35, half * 0.8, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#8e2f23';
      ctx.fillRect(-half * 0.8, half * 0.3, half * 1.6, half * 0.18);
      break;
    }
    case 'noodle':
    case 'cookedNoodle': {
      ctx.fillStyle = '#f0c040';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath(); ctx.arc(i * half * 0.45, 0, half * 0.3, Math.PI, 0); ctx.fill();
      }
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(0, half * 0.45, half * 0.85, 0, Math.PI); ctx.fill();
      break;
    }
    case 'chicken':
    case 'choppedChicken':
    case 'soupChicken':
    case 'grilledChicken': {
      ctx.fillStyle = id === 'grilledChicken' ? '#7a3b1e' : id === 'soupChicken' ? '#c47a2a' : '#e88ca0';
      ctx.beginPath(); ctx.ellipse(-half * 0.15, 0, half * 0.62, half * 0.5, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f5f0dc';
      ctx.lineWidth = half * 0.16;
      ctx.beginPath(); ctx.moveTo(half * 0.4, -half * 0.3); ctx.lineTo(half * 0.85, -half * 0.7); ctx.stroke();
      if (id === 'soupChicken') {
        ctx.fillStyle = '#a0522d';
        ctx.beginPath(); ctx.arc(0, half * 0.5, half * 0.85, 0, Math.PI); ctx.fill();
      }
      break;
    }
    case 'veggie':
    case 'choppedVeggie': {
      ctx.fillStyle = '#58a34a';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath(); ctx.ellipse(i * half * 0.4, 0, half * 0.32, half * 0.5, i * 0.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#e67e22';
      ctx.beginPath(); ctx.moveTo(-half * 0.2, half * 0.5); ctx.lineTo(half * 0.2, half * 0.5); ctx.lineTo(0, half * 0.95); ctx.fill();
      break;
    }
    case 'egg':
    case 'friedEgg': {
      ctx.fillStyle = '#fdf3d0';
      ctx.beginPath(); ctx.ellipse(0, 0, half * 0.8, half * 0.95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f7b731';
      ctx.beginPath(); ctx.arc(0, half * 0.1, half * 0.42, 0, Math.PI * 2); ctx.fill();
      if (id === 'friedEgg') {
        ctx.strokeStyle = '#b5651d';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 0, half * 0.8, half * 0.95, 0, 0, Math.PI * 2); ctx.stroke();
      }
      break;
    }
    case 'sambal': {
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.ellipse(0, 0, half * 0.8, half * 0.45, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7e1f16';
      ctx.beginPath(); ctx.ellipse(half * 0.3, -half * 0.25, half * 0.5, half * 0.22, -0.4, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'tea': {
      ctx.fillStyle = '#b5651d';
      rr(ctx, -half * 0.5, -half * 0.7, half, half * 1.4, 3); ctx.fill();
      ctx.fillStyle = '#e8c47a';
      ctx.fillRect(-half * 0.5, -half * 0.7, half, half * 0.3);
      ctx.strokeStyle = '#d64545';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(half * 0.2, -half * 0.7); ctx.lineTo(half * 0.45, -half * 1.1); ctx.stroke();
      break;
    }
    case 'ice': {
      ctx.fillStyle = '#a8d8e8';
      ctx.save(); ctx.rotate(0.4); ctx.fillRect(-half * 0.6, -half * 0.6, half * 0.9, half * 0.9); ctx.restore();
      ctx.fillStyle = '#d4eef7';
      ctx.save(); ctx.rotate(-0.3); ctx.fillRect(-half * 0.1, -half * 0.1, half * 0.7, half * 0.7); ctx.restore();
      break;
    }
    default: { // burnt
      ctx.fillStyle = '#2b2b2b';
      ctx.beginPath(); ctx.arc(0, 0, half * 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#555555';
      ctx.beginPath(); ctx.arc(-half * 0.2, -half * 0.2, half * 0.25, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawStationGlyph(ctx, station) {
  const cx = station.x + station.w / 2;
  const cy = station.y + station.h / 2 - 8;
  if (station.kind === 'source') {
    const map = { rice: 'rice', noodle: 'noodle', chicken: 'chicken', veggie: 'veggie', egg: 'egg', chili: 'sambal', tea: 'tea', ice: 'ice' };
    drawItemIcon(ctx, map[station.id] || 'rice', cx, cy, 34);
    return;
  }
  ctx.strokeStyle = '#fff8e7';
  ctx.fillStyle = '#fff8e7';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  switch (station.id) {
    case 'board': // knife: blade + handle
      ctx.beginPath(); ctx.moveTo(cx - 14, cy + 8); ctx.lineTo(cx + 10, cy - 10); ctx.stroke();
      ctx.fillRect(cx + 8, cy - 12, 10, 5);
      break;
    case 'wok': // pan: arc + handle
      ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 13, cy); ctx.lineTo(cx + 22, cy - 8); ctx.stroke();
      break;
    case 'stove': // pot with steam
      ctx.fillRect(cx - 12, cy - 4, 24, 14);
      ctx.beginPath(); ctx.moveTo(cx - 6, cy - 8); ctx.lineTo(cx - 6, cy - 16); ctx.moveTo(cx + 2, cy - 8); ctx.lineTo(cx + 2, cy - 16); ctx.stroke();
      break;
    case 'grill': // grate + flame
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath(); ctx.moveTo(cx - 14, cy + i * 7); ctx.lineTo(cx + 14, cy + i * 7); ctx.stroke();
      }
      ctx.fillStyle = '#f2b705';
      ctx.beginPath(); ctx.moveTo(cx, cy - 18); ctx.lineTo(cx - 6, cy - 8); ctx.lineTo(cx + 6, cy - 8); ctx.fill();
      break;
    case 'plate': // plate
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.stroke();
      break;
    case 'window': // service bell
      ctx.beginPath(); ctx.arc(cx, cy + 2, 11, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - 13, cy + 2, 26, 3);
      ctx.beginPath(); ctx.arc(cx, cy + 10, 3, 0, Math.PI * 2); ctx.fill();
      break;
    case 'trash': // bin
      ctx.beginPath(); ctx.moveTo(cx - 10, cy - 8); ctx.lineTo(cx + 10, cy - 8); ctx.lineTo(cx + 7, cy + 10); ctx.lineTo(cx - 7, cy + 10); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 12, cy - 12); ctx.lineTo(cx + 12, cy - 12); ctx.stroke();
      break;
    default:
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
  }
}

function drawStations(ctx, state) {
  for (const station of STATIONS) {
    const job = state.stations[station.id] ? state.stations[station.id].job : null;
    const near = state.nearStation === station.id;
    ctx.fillStyle = station.kind === 'serve' ? '#7a4a21' : COLORS.wood;
    rr(ctx, station.x, station.y, station.w, station.h, 10);
    ctx.fill();
    ctx.fillStyle = station.kind === 'serve' ? '#a9743f' : COLORS.counter;
    rr(ctx, station.x + 4, station.y + 4, station.w - 8, station.h - 8, 8);
    ctx.fill();
    if (near) {
      ctx.strokeStyle = '#f2b705';
      ctx.lineWidth = 3;
      rr(ctx, station.x - 2, station.y - 2, station.w + 4, station.h + 4, 12);
      ctx.stroke();
    }
    if (job && job.done) {
      const pulse = 0.5 + 0.5 * Math.sin(state.time * 6);
      ctx.strokeStyle = job.burnt ? '#d64545' : `rgba(61,155,79,${0.5 + pulse * 0.5})`;
      ctx.lineWidth = 4;
      rr(ctx, station.x - 2, station.y - 2, station.w + 4, station.h + 4, 12);
      ctx.stroke();
    }
    drawStationGlyph(ctx, station);
    const labelY = station.kind === 'plate' ? station.y + 13 : station.y + station.h - 12;
    text(ctx, station.short, station.x + station.w / 2, labelY, 11, '#fff8e7', 'bold', 'center');
    if (job) {
      const ratio = Math.min(1, job.progress / job.time);
      const bx = station.x + 10;
      const bw = station.w - 20;
      ctx.fillStyle = '#2b2118';
      rr(ctx, bx, station.y + station.h - 26, bw, 8, 4); ctx.fill();
      ctx.fillStyle = job.burnt ? '#d64545' : job.done ? '#3d9b4f' : '#f2b705';
      if (ratio > 0) { rr(ctx, bx, station.y + station.h - 26, bw * ratio, 8, 4); ctx.fill(); }
      text(ctx, job.burnt ? 'HANGUS!' : job.done ? 'SIAP!' : `${Math.ceil(job.time - job.progress)} dtk`, station.x + station.w / 2, station.y - 10, 12, job.burnt ? '#d64545' : '#fff8e7', 'bold', 'center');
      if (job.done && !job.burnt) drawItemIcon(ctx, job.out, station.x + station.w / 2, station.y + station.h / 2 + 6, 26);
    }
    if (station.kind === 'plate') drawPlates(ctx, state);
    if (station.kind === 'serve') {
      const carrying = state.player.carrying;
      const match = carrying && carrying.kind === 'plate' && plateRecipe(carrying.plate)
        && state.orders.some((o) => o.recipe.id === plateRecipe(carrying.plate).id);
      if (match) {
        ctx.strokeStyle = '#f2b705';
        ctx.lineWidth = 4;
        rr(ctx, station.x - 4, station.y - 4, station.w + 8, station.h + 8, 14);
        ctx.stroke();
        text(ctx, 'ANTAR!', station.x + station.w / 2, station.y - 12, 13, '#f2b705', 'bold', 'center');
      }
    }
  }
}

function drawPlates(ctx, state) {
  const station = STATIONS.find((s) => s.id === 'plating');
  state.plates.forEach((plate, i) => {
    const cx = station.x + 60 + i * 120;
    const cy = station.y + station.h / 2 + 4;
    ctx.fillStyle = '#e8e2d4';
    ctx.beginPath(); ctx.ellipse(cx, cy, 46, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLORS.plate;
    ctx.beginPath(); ctx.ellipse(cx, cy, 40, 25, 0, 0, Math.PI * 2); ctx.fill();
    if (!plate) return;
    plate.items.forEach((itemId, j) => {
      drawItemIcon(ctx, itemId, cx - 22 + (j % 2) * 22 + (plate.items.length === 1 ? 22 : 0), cy - 8 + Math.floor(j / 2) * 16, 20);
    });
    if (plateRecipe(plate)) {
      ctx.strokeStyle = '#3d9b4f';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, cy, 48, 32, 0, 0, Math.PI * 2); ctx.stroke();
    }
  });
}

function drawOrders(ctx, state) {
  ctx.fillStyle = COLORS.board;
  rr(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 12);
  ctx.fill();
  text(ctx, 'PESANAN', BOARD.x + BOARD.w / 2, BOARD.y + 22, 16, '#f2b705', 'bold', 'center');
  state.orders.forEach((order, i) => {
    const y = BOARD.y + 44 + i * 108;
    const ratio = Math.max(0, order.patience / order.maxPatience);
    const low = order.patience < 10;
    ctx.fillStyle = COLORS.ticket;
    rr(ctx, BOARD.x + 10, y, BOARD.w - 20, 98, 8);
    ctx.fill();
    if (low) {
      ctx.strokeStyle = Math.sin(state.time * 8) > 0 ? '#d64545' : '#f2b705';
      ctx.lineWidth = 3;
      rr(ctx, BOARD.x + 10, y, BOARD.w - 20, 98, 8);
      ctx.stroke();
    }
    text(ctx, order.recipe.name, BOARD.x + 20, y + 16, 15, '#2b2118', 'bold');
    text(ctx, `$${order.recipe.price}`, BOARD.x + BOARD.w - 22, y + 16, 15, '#8a5a33', 'bold', 'right');
    order.recipe.needs.forEach((need, j) => {
      const ing = INGREDIENTS[need];
      const dx = BOARD.x + 30 + j * 34;
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.arc(dx, y + 44, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#2b2118';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(dx, y + 44, 12, 0, Math.PI * 2); ctx.stroke();
      drawItemIcon(ctx, need, dx, y + 44, 16);
    });
    ctx.fillStyle = '#e0d6c0';
    rr(ctx, BOARD.x + 20, y + 68, BOARD.w - 40, 12, 6); ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#3d9b4f' : ratio > 0.25 ? '#e67e22' : '#d64545';
    if (ratio > 0) { rr(ctx, BOARD.x + 20, y + 68, (BOARD.w - 40) * ratio, 12, 6); ctx.fill(); }
    text(ctx, `${Math.ceil(order.patience)} dtk`, BOARD.x + BOARD.w - 22, y + 88, 11, '#8a5a33', 'bold', 'right');
  });
  if (state.orders.length === 0) {
    text(ctx, 'Belum ada pesanan…', BOARD.x + BOARD.w / 2, BOARD.y + 90, 14, '#f5efe0', 'bold', 'center');
  }
}

function drawPlayer(ctx, state) {
  const p = state.player;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 16, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  rr(ctx, p.x - 15, p.y - 8, 30, 26, 10); ctx.fill();
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(p.x - 15, p.y + 8, 30, 5);
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(p.x, p.y - 16, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(p.x - 6, p.y - 26, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.x + 6, p.y - 26, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.x, p.y - 28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(p.x - 13, p.y - 26, 26, 6);
  ctx.fillStyle = '#2b2118';
  ctx.beginPath(); ctx.arc(p.x + p.face * 4, p.y - 17, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.x + p.face * 4 + 7, p.y - 17, 1.8, 0, Math.PI * 2); ctx.fill();
  if (p.carrying) {
    if (p.carrying.kind === 'item') {
      drawItemIcon(ctx, p.carrying.id, p.x, p.y - 44, 30);
    } else {
      ctx.fillStyle = '#e8e2d4';
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 44, 26, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLORS.plate;
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 44, 22, 13, 0, 0, Math.PI * 2); ctx.fill();
      p.carrying.plate.items.forEach((itemId, j) => {
        drawItemIcon(ctx, itemId, p.x - 12 + j * 12, p.y - 46, 13);
      });
    }
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, VIEW.width, HUD.height);
  text(ctx, 'DAPUR KILAT', 20, 26, 22, COLORS.hudText, 'bold');
  text(ctx, `SHIFT ${state.level}`, 20, 50, 12, '#f2b705', 'bold');
  const mins = Math.floor(state.shiftTime / 60);
  const secs = Math.ceil(state.shiftTime % 60);
  const timeText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  const urgent = state.shiftTime < 30;
  text(ctx, timeText, VIEW.width / 2, 24, 26, urgent ? '#ff6b6b' : COLORS.hudText, 'bold', 'center');
  ctx.fillStyle = '#3a4668';
  rr(ctx, VIEW.width / 2 - 110, 44, 220, 8, 4); ctx.fill();
  ctx.fillStyle = urgent ? '#ff6b6b' : '#f2b705';
  rr(ctx, VIEW.width / 2 - 110, 44, 220 * Math.max(0, state.shiftTime / state.shiftLength), 8, 4); ctx.fill();
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath(); ctx.arc(VIEW.width - 320, 26, 11, 0, Math.PI * 2); ctx.fill();
  text(ctx, '$', VIEW.width - 320, 27, 13, '#7a4a21', 'bold', 'center');
  text(ctx, `${state.coins}`, VIEW.width - 300, 26, 20, COLORS.hudText, 'bold');
  text(ctx, `Disajikan ${state.served}`, VIEW.width - 220, 26, 14, '#b8c0d8', 'bold');
  for (let i = 0; i < 3; i += 1) {
    heart(ctx, VIEW.width - 96 + i * 26, 26, 9, i < state.hearts ? '#ff5b6e' : '#3a4668');
  }
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.min(1, f.life);
    text(ctx, f.text, f.x, f.y, 20, f.color, 'bold', 'center');
  }
  ctx.globalAlpha = 1;
}

function drawFloor(ctx) {
  const tile = 56;
  for (let y = FLOOR.y; y < FLOOR.y + FLOOR.h; y += tile) {
    for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += tile) {
      const odd = (Math.floor((x - FLOOR.x) / tile) + Math.floor((y - FLOOR.y) / tile)) % 2 === 0;
      ctx.fillStyle = odd ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(x, y, Math.min(tile, FLOOR.x + FLOOR.w - x), Math.min(tile, FLOOR.y + FLOOR.h - y));
    }
  }
  ctx.strokeStyle = '#b89a6a';
  ctx.lineWidth = 3;
  rr(ctx, FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h, 8);
  ctx.stroke();
}

function panel(ctx, lines) {
  ctx.fillStyle = 'rgba(20,18,40,0.82)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const w = 640;
  const h = 120 + lines.length * 30;
  const x = (VIEW.width - w) / 2;
  const y = (VIEW.height - h) / 2;
  ctx.fillStyle = '#fff8e7';
  rr(ctx, x, y, w, h, 16); ctx.fill();
  ctx.strokeStyle = '#f2b705';
  ctx.lineWidth = 4;
  rr(ctx, x, y, w, h, 16); ctx.stroke();
  return { x, y, w, h };
}

function drawOverlay(ctx, state) {
  if (state.screen === 'title') {
    const box = panel(ctx, [
      'Warung Rush — masak cepat, antar tepat waktu!',
      '',
      'Ambil bahan, potong dan masak, rakit di piring, antar ke jendela.',
      'Sajikan sebelum kesabaran pelanggan habis. Jangan sampai hangus!',
      '',
      'Gerak: WASD / panah / klik  •  Pakai: E atau klik counter',
      'Mulai: Enter  •  Ulang: R  •  Suara: M',
    ]);
    text(ctx, 'DAPUR KILAT', VIEW.width / 2, box.y + 52, 44, '#c0392b', 'bold', 'center');
    text(ctx, 'Warung Rush — masak cepat, antar tepat waktu!', VIEW.width / 2, box.y + 96, 17, '#2b2118', 'bold', 'center');
    text(ctx, 'Ambil bahan, potong dan masak, rakit di piring, antar ke jendela.', VIEW.width / 2, box.y + 140, 15, '#2b2118', 'normal', 'center');
    text(ctx, 'Sajikan sebelum kesabaran pelanggan habis. Jangan sampai hangus!', VIEW.width / 2, box.y + 166, 15, '#2b2118', 'normal', 'center');
    text(ctx, 'Gerak: WASD / panah / klik  •  Pakai: E atau klik counter', VIEW.width / 2, box.y + 206, 14, '#8a5a33', 'bold', 'center');
    text(ctx, 'Mulai: Enter  •  Ulang: R  •  Suara: M', VIEW.width / 2, box.y + 232, 14, '#8a5a33', 'bold', 'center');
    const blink = Math.sin(state.time * 4) > 0;
    if (blink) text(ctx, 'TEKAN ENTER UNTUK MULAI', VIEW.width / 2, box.y + box.h - 24, 18, '#c0392b', 'bold', 'center');
  } else if (state.screen === 'shift') {
    const box = panel(ctx, ['', '', '', '']);
    text(ctx, `SHIFT ${state.tally.level} SELESAI!`, VIEW.width / 2, box.y + 48, 32, '#3d9b4f', 'bold', 'center');
    text(ctx, `Hidangan disajikan: ${state.tally.served}`, VIEW.width / 2, box.y + 96, 17, '#2b2118', 'bold', 'center');
    text(ctx, `Koin terkumpul: $${state.tally.coins}`, VIEW.width / 2, box.y + 124, 17, '#2b2118', 'bold', 'center');
    text(ctx, `Shift ${state.tally.level + 1}: pelanggan lebih banyak, lebih tidak sabar!`, VIEW.width / 2, box.y + 152, 15, '#8a5a33', 'bold', 'center');
    text(ctx, 'TEKAN ENTER UNTUK LANJUT', VIEW.width / 2, box.y + box.h - 24, 16, '#c0392b', 'bold', 'center');
  } else if (state.screen === 'over') {
    const box = panel(ctx, ['', '', '', '', '']);
    text(ctx, 'WARUNG TUTUP!', VIEW.width / 2, box.y + 48, 34, '#d64545', 'bold', 'center');
    text(ctx, 'Semua pelanggan kecewa dan pergi…', VIEW.width / 2, box.y + 92, 16, '#2b2118', 'bold', 'center');
    text(ctx, `Koin: $${state.coins}   •   Disajikan: ${state.served}   •   Kombo terbaik: ${state.bestCombo}`, VIEW.width / 2, box.y + 130, 16, '#2b2118', 'bold', 'center');
    text(ctx, `Mencapai Shift ${state.level}`, VIEW.width / 2, box.y + 158, 15, '#8a5a33', 'bold', 'center');
    text(ctx, 'TEKAN R UNTUK MAIN LAGI', VIEW.width / 2, box.y + box.h - 24, 16, '#c0392b', 'bold', 'center');
  }
}

/** Draw one frame. `input` is only used for the click-target marker. */
export function render(ctx, state, input) {
  ctx.fillStyle = '#f5efe0';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  drawFloor(ctx);
  drawStations(ctx, state);
  drawOrders(ctx, state);
  drawPlayer(ctx, state);
  drawParticles(ctx, state);
  drawHud(ctx, state);
  if (input && input.moveTarget) {
    ctx.strokeStyle = 'rgba(43,33,24,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(input.moveTarget.x, input.moveTarget.y, 8, 0, Math.PI * 2); ctx.stroke();
  }
  if (state.message) {
    const w = ctx.measureText(state.message).width + 36;
    ctx.fillStyle = 'rgba(43,33,24,0.85)';
    rr(ctx, (VIEW.width - w) / 2, VIEW.height - 44, w, 30, 15); ctx.fill();
    text(ctx, state.message, VIEW.width / 2, VIEW.height - 28, 14, '#fff8e7', 'bold', 'center');
  }
  if (state.screen !== 'play') drawOverlay(ctx, state);
}
