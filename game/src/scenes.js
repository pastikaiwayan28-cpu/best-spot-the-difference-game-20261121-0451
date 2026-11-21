// The three scenes, painted fresh with canvas 2D — no images, no assets.
// Every painter draws the same picture twice: once for the left panel and
// once for the right, with `right` flipping the seven hidden differences.
// The differences table in differences.js is the single source of truth for
// where each change sits, so the painters place each changed thing exactly
// on its tabled spot. Panel space is 556 by 600.

import { createRandom, range } from './random.js';
import { DIFFERENCES } from './differences.js';

const SCENE_SEEDS = { market: 11, harbour: 23, garden: 37 };

/** A rounded-rectangle path, ready to fill or stroke. */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A filled circle. */
export function disc(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A filled ellipse. */
export function ellipse(ctx, x, y, rx, ry, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function sky(ctx, stops) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 600);
  for (const [at, colour] of stops) gradient.addColorStop(at, colour);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 556, 600);
}

function stars(ctx, rng, count, twinkle) {
  for (let i = 0; i < count; i += 1) {
    const x = range(rng, 8, 548);
    const y = range(rng, 8, 220);
    const r = range(rng, 0.8, 2.2);
    const alpha = 0.5 + 0.5 * Math.sin(twinkle + i * 1.7);
    ctx.fillStyle = `rgba(255, 244, 200, ${0.35 + 0.55 * Math.abs(alpha)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A round paper lantern with ribs, a cap and a tassel. */
function paperLantern(ctx, x, y, scale, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#f7c948';
  ctx.fillRect(-3, -26, 6, 5);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 20, 20, 0.55)';
  ctx.lineWidth = 1.5;
  for (const dx of [-12, -6, 0, 6, 12]) {
    ctx.beginPath();
    ctx.ellipse(dx * 0.6, 0, 5, 24, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#f7c948';
  ctx.fillRect(-3, 22, 6, 5);
  ctx.strokeStyle = '#e2574c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 27);
  ctx.lineTo(0, 40);
  ctx.stroke();
  ctx.restore();
}

/** A small fish, facing left, for the fish stall and the pond. */
function fishShape(ctx, x, y, scale, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(26, -8);
  ctx.lineTo(26, 8);
  ctx.closePath();
  ctx.fill();
  disc(ctx, -8, -2, 2, '#1d2b3a');
  ctx.restore();
}

/** A gull drawn as two curved strokes. */
function gull(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.quadraticCurveTo(-5, -8, 0, 0);
  ctx.quadraticCurveTo(5, -8, 12, 0);
  ctx.stroke();
  ctx.restore();
}

/** A five-petal blossom. */
function blossom(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(angle) * r * 0.55, y + Math.sin(angle) * r * 0.55, r * 0.55, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  disc(ctx, x, y, r * 0.32, '#ffd94d');
}

// ---------------------------------------------------------------------------
// Scene 1 — Lantern Night Market
// ---------------------------------------------------------------------------
function paintMarket(ctx, right, rng, time) {
  sky(ctx, [[0, '#171238'], [0.55, '#3b2060'], [1, '#6b2d5c']]);
  stars(ctx, rng, 42, time);

  // The moon, top left, with two craters.
  disc(ctx, 88, 82, 30, '#ffeec2');
  disc(ctx, 78, 74, 6, '#e8d39a');
  disc(ctx, 98, 92, 4, '#e8d39a');

  // A string of paper lanterns across the top; the right picture hangs one more.
  ctx.strokeStyle = '#2a1f45';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(16, 52);
  ctx.quadraticCurveTo(278, 84, 540, 52);
  ctx.stroke();
  for (const x of [58, 128, 198, 268, 338, 408]) {
    const sag = 52 + Math.sin((x / 556) * Math.PI) * 26;
    paperLantern(ctx, x, sag + 26, 0.9, '#e2574c');
  }
  if (right) paperLantern(ctx, DIFFERENCES.market[0].x, DIFFERENCES.market[0].y, 0.9, '#e2574c');

  // Cobblestone ground.
  ctx.fillStyle = '#241a33';
  ctx.fillRect(0, 478, 556, 122);
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.12)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const x = col * 64 + (row % 2) * 32;
      roundRect(ctx, x, 492 + row * 28, 56, 22, 8);
      ctx.stroke();
    }
  }

  // The vendor behind the fruit stall.
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(196, 268, 26, 64);
  disc(ctx, 209, 246, 17, '#f2c79b');
  ctx.fillStyle = '#f2c79b';
  ctx.beginPath();
  ctx.arc(209, 246, 17, 0, Math.PI);
  ctx.fill();
  // The vendor's hat: present on the left picture, gone on the right.
  if (!right) {
    ctx.fillStyle = '#e8c96a';
    ctx.beginPath();
    ctx.ellipse(209, 232, 30, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(209, 228, 16, 10, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = '#3f7d5c';
  roundRect(ctx, 188, 264, 42, 70, 8);
  ctx.fill();
  disc(ctx, 203, 250, 1.8, '#1d2b3a');
  disc(ctx, 215, 250, 1.8, '#1d2b3a');
  ctx.strokeStyle = '#1d2b3a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(209, 256, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Fruit stall: striped awning, counter, oranges, and its sign.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(52, 336, 216, 96);
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(52, 336, 216, 10);
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#e2574c' : '#fdf3d8';
    ctx.fillRect(52 + i * 36, 288, 36, 48);
  }
  ctx.fillStyle = '#fdf3d8';
  ctx.fillRect(52, 288, 216, 6);
  // The sign: red on the left picture, teal on the right.
  ctx.fillStyle = right ? '#2a9d8f' : '#c0392b';
  roundRect(ctx, 103, 278, 90, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BUAH', 148, 297);
  // Oranges piled on the counter.
  for (const [x, y] of [[84, 322], [112, 322], [140, 322], [98, 306], [126, 306], [168, 322], [196, 322], [182, 306], [224, 322], [240, 322]]) {
    disc(ctx, x, y, 11, '#f39c2c');
    disc(ctx, x - 3, y - 4, 3, '#f7b95c');
  }

  // Fish stall: striped awning, counter, fish on ice.
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(318, 336, 208, 96);
  ctx.fillStyle = '#46351f';
  ctx.fillRect(318, 336, 208, 10);
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#2a9d8f' : '#fdf3d8';
    ctx.fillRect(318 + i * 35, 288, 35, 48);
  }
  ctx.fillStyle = '#fdf3d8';
  ctx.fillRect(318, 288, 208, 6);
  ctx.fillStyle = '#dceef5';
  roundRect(ctx, 330, 344, 184, 44, 10);
  ctx.fill();
  // Three fish on the left picture, two on the right (the middle one is gone).
  fishShape(ctx, 392, 366, 1, '#7fb3c8');
  if (!right) fishShape(ctx, 428, 384, 1, '#7fb3c8');
  fishShape(ctx, 464, 366, 1, '#7fb3c8');
  ctx.fillStyle = '#5a4632';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText('IKAN', 422, 416);

  // A closed paper umbrella leans on the fish stall: red, or blue on the right.
  ctx.save();
  ctx.translate(498, 468);
  ctx.rotate(0.35);
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(0, 34);
  ctx.stroke();
  ctx.fillStyle = right ? '#3a6fd8' : '#e2574c';
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(-16, 6);
  ctx.lineTo(16, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // A crate with a sleeping cat — the cat only naps on the left picture.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(58, 516, 68, 42);
  ctx.strokeStyle = '#6e4520';
  ctx.lineWidth = 2;
  ctx.strokeRect(58, 516, 68, 42);
  ctx.beginPath();
  ctx.moveTo(58, 530);
  ctx.lineTo(126, 530);
  ctx.moveTo(58, 544);
  ctx.lineTo(126, 544);
  ctx.stroke();
  if (!right) {
    ctx.fillStyle = '#f0a35e';
    ellipse(ctx, 92, 512, 26, 12, '#f0a35e');
    disc(ctx, 114, 504, 9, '#f0a35e');
    ctx.beginPath();
    ctx.moveTo(108, 496);
    ctx.lineTo(110, 488);
    ctx.lineTo(114, 495);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(116, 496);
    ctx.lineTo(119, 488);
    ctx.lineTo(121, 496);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f0a35e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(70, 510, 10, Math.PI * 0.9, Math.PI * 1.9);
    ctx.stroke();
  }

  // Baskets on the ground; the right picture has one more.
  drawBasket(ctx, 250, 556);
  if (right) drawBasket(ctx, DIFFERENCES.market[5].x, DIFFERENCES.market[5].y);
  drawBasket(ctx, 356, 566);
}

function drawBasket(ctx, x, y) {
  ctx.fillStyle = '#a4713a';
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(x, y - 4, 26, 10, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#6e4520';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 4, 26, Math.PI, 0);
  ctx.stroke();
  disc(ctx, x - 10, y - 8, 6, '#e2574c');
  disc(ctx, x + 6, y - 10, 6, '#f39c2c');
}

// ---------------------------------------------------------------------------
// Scene 2 — Harbour at Dawn
// ---------------------------------------------------------------------------
function paintHarbour(ctx, right, rng, time) {
  sky(ctx, [[0, '#7fb2e5'], [0.45, '#ffd9a0'], [0.62, '#ff9e7d'], [1, '#e88a6a']]);
  // The sun: rays on the left picture, a plain disc on the right.
  const sunX = 468;
  const sunY = 112;
  if (!right) {
    ctx.strokeStyle = 'rgba(255, 236, 160, 0.9)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * 34, sunY + Math.sin(angle) * 34);
      ctx.lineTo(sunX + Math.cos(angle) * 46, sunY + Math.sin(angle) * 46);
      ctx.stroke();
    }
  }
  disc(ctx, sunX, sunY, 28, '#ffec9e');
  disc(ctx, sunX, sunY, 20, '#fff3c4');

  // Clouds.
  ctx.fillStyle = 'rgba(255, 250, 240, 0.85)';
  for (const [x, y, s] of [[120, 90, 1], [300, 60, 0.8], [200, 150, 0.7]]) {
    ellipse(ctx, x, y, 42 * s, 14 * s, 'rgba(255, 250, 240, 0.85)');
    ellipse(ctx, x + 24 * s, y + 4, 30 * s, 11 * s, 'rgba(255, 250, 240, 0.85)');
  }

  // Gulls: two on the left picture, three on the right.
  gull(ctx, 340, 108, 1);
  gull(ctx, 384, 78, 0.85);
  if (right) gull(ctx, DIFFERENCES.harbour[0].x, DIFFERENCES.harbour[0].y, 0.9);

  // The sea.
  const sea = ctx.createLinearGradient(0, 380, 0, 600);
  sea.addColorStop(0, '#3d8fa8');
  sea.addColorStop(1, '#1d5f7a');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 380, 556, 220);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 4; row += 1) {
    const y = 410 + row * 42;
    ctx.beginPath();
    for (let x = 0; x <= 556; x += 14) {
      const wave = Math.sin(x / 34 + row * 2 + time * 1.2) * 3;
      if (x === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255, 236, 160, 0.35)';
  for (let i = 0; i < 7; i += 1) {
    const wobble = Math.sin(time * 1.5 + i) * 6;
    ctx.fillRect(448 + wobble - 18 + i * 2, 396 + i * 26, 36 - i * 2, 4);
  }

  // The lighthouse, striped, with its gallery.
  ctx.fillStyle = '#e2574c';
  ctx.beginPath();
  ctx.moveTo(62, 380);
  ctx.lineTo(72, 170);
  ctx.lineTo(102, 170);
  ctx.lineTo(112, 380);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fdf3d8';
  ctx.beginPath();
  ctx.moveTo(66, 320);
  ctx.lineTo(69, 260);
  ctx.lineTo(105, 260);
  ctx.lineTo(108, 320);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e2574c';
  ctx.beginPath();
  ctx.moveTo(69, 230);
  ctx.lineTo(72, 170);
  ctx.lineTo(102, 170);
  ctx.lineTo(105, 230);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(66, 152, 42, 20);
  disc(ctx, 87, 162, 9, '#ffe98a');
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.moveTo(62, 152);
  ctx.lineTo(112, 152);
  ctx.lineTo(104, 138);
  ctx.lineTo(70, 138);
  ctx.closePath();
  ctx.fill();
  // The beam only shines on the right picture.
  if (right) {
    const beam = ctx.createLinearGradient(96, 162, 300, 210);
    beam.addColorStop(0, 'rgba(255, 233, 138, 0.75)');
    beam.addColorStop(1, 'rgba(255, 233, 138, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(96, 152);
    ctx.lineTo(300, 128);
    ctx.lineTo(300, 216);
    ctx.lineTo(96, 172);
    ctx.closePath();
    ctx.fill();
  }

  // The pier and its crates.
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(0, 470, 360, 16);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, 470, 360, 8);
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 2;
  for (let x = 20; x < 360; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 470);
    ctx.lineTo(x, 486);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(96, 452, 34, 34);
  ctx.fillRect(130, 452, 34, 34);
  ctx.strokeStyle = '#6e4520';
  ctx.strokeRect(96, 452, 34, 34);
  ctx.strokeRect(130, 452, 34, 34);
  if (right) {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(105, 418, 34, 34);
    ctx.strokeStyle = '#6e4520';
    ctx.strokeRect(105, 418, 34, 34);
  }
  // The anchor only rests on the pier on the left picture.
  if (!right) {
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(252, 522, 12, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(252, 510);
    ctx.lineTo(252, 484);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(240, 492);
    ctx.lineTo(264, 492);
    ctx.stroke();
  }

  // The sailboat with its flag: red on the left, yellow on the right.
  ctx.fillStyle = '#7a4a2b';
  ctx.beginPath();
  ctx.moveTo(238, 420);
  ctx.lineTo(372, 420);
  ctx.lineTo(352, 448);
  ctx.lineTo(258, 448);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(305, 420);
  ctx.lineTo(305, 168);
  ctx.stroke();
  ctx.fillStyle = '#fdf3d8';
  ctx.beginPath();
  ctx.moveTo(305, 180);
  ctx.lineTo(305, 330);
  ctx.lineTo(378, 330);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e2574c';
  ctx.beginPath();
  ctx.moveTo(305, 200);
  ctx.lineTo(305, 318);
  ctx.lineTo(258, 318);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = right ? '#f7c948' : '#e2574c';
  ctx.beginPath();
  ctx.moveTo(305, 168);
  ctx.lineTo(332, 176);
  ctx.lineTo(305, 184);
  ctx.closePath();
  ctx.fill();

  // A little rowing boat, far right.
  ctx.fillStyle = '#3f7d5c';
  ctx.beginPath();
  ctx.moveTo(452, 452);
  ctx.lineTo(528, 452);
  ctx.lineTo(514, 470);
  ctx.lineTo(466, 470);
  ctx.closePath();
  ctx.fill();
  disc(ctx, 490, 440, 8, '#f2c79b');

  // The little buoy bobs in open water on the right picture only.
  if (right) {
    const bob = Math.sin(time * 2) * 3;
    ctx.fillStyle = '#e2574c';
    ctx.beginPath();
    ctx.moveTo(500, 496 + bob);
    ctx.lineTo(514, 520 + bob);
    ctx.lineTo(486, 520 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fdf3d8';
    ctx.fillRect(490, 504 + bob, 20, 6);
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(500, 496 + bob);
    ctx.lineTo(500, 484 + bob);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Scene 3 — Tea Garden
// ---------------------------------------------------------------------------
function paintGarden(ctx, right, rng, time) {
  sky(ctx, [[0, '#bfe3f5'], [0.5, '#e8f5d8'], [1, '#f7efc8']]);
  // Soft clouds.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ellipse(ctx, 120, 70, 46, 13, 'rgba(255, 255, 255, 0.8)');
  ellipse(ctx, 300, 46, 36, 11, 'rgba(255, 255, 255, 0.8)');

  // Grass.
  ctx.fillStyle = '#7cb35a';
  ctx.fillRect(0, 380, 556, 220);
  ctx.fillStyle = '#8fc468';
  ctx.fillRect(0, 380, 556, 26);
  for (let i = 0; i < 26; i += 1) {
    const x = range(rng, 10, 546);
    const y = range(rng, 560, 596);
    ctx.strokeStyle = '#5d9b42';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3, y - 10);
    ctx.stroke();
  }

  // The cherry tree, top right: pink blossom on the left, white on the right.
  ctx.strokeStyle = '#6e4520';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(520, 200);
  ctx.quadraticCurveTo(500, 130, 448, 118);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(480, 150);
  ctx.quadraticCurveTo(460, 110, 420, 96);
  ctx.stroke();
  const petal = right ? '#fdf6f0' : '#f7a8c4';
  for (let i = 0; i < 16; i += 1) {
    const x = range(rng, 380, 540);
    const y = range(rng, 60, 170);
    blossom(ctx, x, y, range(rng, 9, 15), petal);
  }
  for (let i = 0; i < 6; i += 1) {
    const x = range(rng, 380, 540);
    const y = range(rng, 180, 230);
    disc(ctx, x, y, 3, petal);
  }

  // The tea house.
  ctx.fillStyle = '#fdf3d8';
  ctx.fillRect(64, 220, 176, 160);
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(44, 224);
  ctx.lineTo(152, 158);
  ctx.lineTo(260, 224);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8e2a20';
  for (let x = 60; x < 250; x += 22) {
    ctx.fillRect(x, 208, 8, 16);
  }
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(132, 300, 40, 80);
  ctx.fillStyle = '#f7c948';
  disc(ctx, 164, 340, 4, '#f7c948');
  // The window: warm and lit on the right picture, dark on the left.
  ctx.fillStyle = right ? '#ffe98a' : '#3a4a5a';
  ctx.fillRect(84, 240, 48, 44);
  ctx.strokeStyle = '#7a4a2b';
  ctx.lineWidth = 3;
  ctx.strokeRect(84, 240, 48, 44);
  ctx.beginPath();
  ctx.moveTo(108, 240);
  ctx.lineTo(108, 284);
  ctx.moveTo(84, 262);
  ctx.lineTo(132, 262);
  ctx.stroke();
  if (right) {
    ctx.fillStyle = 'rgba(255, 233, 138, 0.25)';
    ctx.fillRect(78, 234, 60, 56);
  }

  // The stone lantern: its flame only burns on the right picture.
  ctx.fillStyle = '#9aa5a0';
  ctx.fillRect(72, 356, 40, 14);
  ctx.fillRect(80, 330, 24, 26);
  ctx.fillStyle = '#7d8a84';
  ctx.fillRect(76, 318, 32, 12);
  ctx.fillStyle = '#9aa5a0';
  ctx.beginPath();
  ctx.moveTo(68, 318);
  ctx.lineTo(92, 296);
  ctx.lineTo(116, 318);
  ctx.closePath();
  ctx.fill();
  if (right) {
    const flicker = 1 + Math.sin(time * 6) * 0.12;
    ctx.fillStyle = 'rgba(255, 170, 60, 0.35)';
    ctx.beginPath();
    ctx.arc(92, 308, 16 * flicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9d2e';
    ctx.beginPath();
    ctx.moveTo(92, 296);
    ctx.quadraticCurveTo(100, 306, 92, 314);
    ctx.quadraticCurveTo(84, 306, 92, 296);
    ctx.fill();
  }

  // The pond with koi: two on the left picture, three on the right.
  const pond = ctx.createLinearGradient(0, 430, 0, 560);
  pond.addColorStop(0, '#7cc4d8');
  pond.addColorStop(1, '#3d8fa8');
  ctx.fillStyle = pond;
  ctx.beginPath();
  ctx.ellipse(380, 496, 150, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2f7d95';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(380, 496, 150, 62, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(380, 496, 120, 44, 0, 0.3, Math.PI * 0.9);
  ctx.stroke();
  fishShape(ctx, 330, 486, 0.9, '#f39c2c');
  fishShape(ctx, 420, 516, -0.9, '#fdf3d8');
  if (right) fishShape(ctx, DIFFERENCES.garden[0].x, DIFFERENCES.garden[0].y, 0.8, '#e2574c');

  // The little table with the teapot; its steam only rises on the left.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(246, 396, 84, 8);
  ctx.fillRect(254, 404, 8, 34);
  ctx.fillRect(314, 404, 8, 34);
  ctx.fillStyle = '#3a6fd8';
  ctx.beginPath();
  ctx.ellipse(288, 386, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(284, 368, 8, 8);
  ctx.beginPath();
  ctx.moveTo(306, 380);
  ctx.quadraticCurveTo(318, 378, 314, 392);
  ctx.strokeStyle = '#3a6fd8';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (!right) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (const dx of [-6, 4]) {
      ctx.beginPath();
      ctx.moveTo(288 + dx, 364);
      ctx.bezierCurveTo(284 + dx, 352, 294 + dx, 346, 288 + dx, 334);
      ctx.stroke();
    }
  }
  disc(ctx, 322, 392, 6, '#fdf3d8');

  // A butterfly flutters on the right picture only.
  if (right) {
    const flutter = Math.sin(time * 5) * 3;
    ctx.fillStyle = '#f39c2c';
    ctx.beginPath();
    ctx.ellipse(194, 196 + flutter, 10, 14, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(210, 196 + flutter, 10, 14, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(200, 190 + flutter, 4, 16);
  }

  // Stepping stones across the grass.
  ctx.fillStyle = '#b8b0a0';
  for (const [x, y] of [[60, 560], [120, 576], [180, 560], [240, 576]]) {
    ellipse(ctx, x, y, 26, 10, '#b8b0a0');
  }

  // Foreground flowers: red on the left picture, purple on the right.
  const flowerColour = right ? '#9b59b6' : '#e2574c';
  for (const [x, y] of [[470, 548], [500, 560], [448, 566]]) {
    ctx.strokeStyle = '#5d9b42';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 26);
    ctx.stroke();
    blossom(ctx, x, y, 11, flowerColour);
  }
}

/**
 * Paint one scene into the current panel (the caller translates to the panel
 * origin and clips). `right` picks the altered picture. A fresh seeded
 * generator per call keeps the decoration identical on both panels.
 */
export function paintScene(scene, ctx, right, time) {
  const rng = createRandom(SCENE_SEEDS[scene] ?? 11);
  if (scene === 'harbour') paintHarbour(ctx, right, rng, time);
  else if (scene === 'garden') paintGarden(ctx, right, rng, time);
  else paintMarket(ctx, right, rng, time);
}
