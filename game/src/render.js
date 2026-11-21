// The renderer: it paints the whole frame from the game state — the header
// with its timer and "found of 7" counter, the two picture panels with their
// markers, the footer hints and the overlays for title, pause, round end,
// game over and victory. It never changes the state.

import { DIFFERENCES_PER_ROUND, FOOTER, FRAME, HEADER, PANELS, ROUNDS } from './config.js';
import { currentRound, remaining, roundStars } from './state.js';
import { paintScene } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND = 'round';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const GOLD = '#f7c948';
const CREAM = '#fdf3d8';
const INK = '#241a33';
const GREEN = '#37b24d';
const RED = '#e03131';

function panelFrame(ctx, x) {
  ctx.save();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 4, PANELS.y - 4, PANELS.width + 8, PANELS.height + 8);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 6, PANELS.y - 6, PANELS.width + 12, PANELS.height + 12);
  ctx.restore();
}

function paintPanel(ctx, game, panel) {
  const x = panel === 'left' ? PANELS.leftX : PANELS.rightX;
  const { scene } = currentRound(game);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, PANELS.y, PANELS.width, PANELS.height);
  ctx.clip();
  ctx.translate(x, PANELS.y);
  paintScene(scene, ctx, panel === 'right', game.time);
  ctx.restore();
  panelFrame(ctx, x);
  // Panel label.
  ctx.fillStyle = 'rgba(20, 12, 36, 0.85)';
  ctx.fillRect(x + 10, PANELS.y + 10, 116, 30);
  ctx.fillStyle = CREAM;
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(panel === 'left' ? 'PICTURE A' : 'PICTURE B', x + 20, PANELS.y + 26);
}

/** A green ring with a check, drawn on both panels over a found difference. */
function foundMarker(ctx, panelX, diff, pop) {
  const cx = panelX + diff.x;
  const cy = PANELS.y + diff.y;
  const radius = diff.r + 4 + pop * 6;
  ctx.save();
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(55, 178, 77, 0.18)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy);
  ctx.lineTo(cx - 3, cy + 8);
  ctx.lineTo(cx + 12, cy - 8);
  ctx.stroke();
  ctx.restore();
}

/** A pulsing gold ring that shows where a hint points. */
function hintRing(ctx, panelX, diff, time) {
  const pulse = 1 + Math.sin(time * 6) * 0.12;
  const cx = panelX + diff.x;
  const cy = PANELS.y + diff.y;
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.arc(cx, cy, (diff.r + 6) * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function wrongMark(ctx, wrong) {
  const panelX = wrong.panel === 'left' ? PANELS.leftX : PANELS.rightX;
  const cx = panelX + wrong.x;
  const cy = PANELS.y + wrong.y;
  ctx.save();
  ctx.strokeStyle = RED;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - 12);
  ctx.lineTo(cx + 12, cy + 12);
  ctx.moveTo(cx + 12, cy - 12);
  ctx.lineTo(cx - 12, cy + 12);
  ctx.stroke();
  ctx.restore();
}

function drawCrosshair(ctx, crosshair, panelX) {
  const cx = panelX + crosshair.x;
  const cy = PANELS.y + crosshair.y;
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy);
  ctx.lineTo(cx - 6, cy);
  ctx.moveTo(cx + 6, cy);
  ctx.lineTo(cx + 16, cy);
  ctx.moveTo(cx, cy - 16);
  ctx.lineTo(cx, cy - 6);
  ctx.moveTo(cx, cy + 6);
  ctx.lineTo(cx, cy + 16);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function paintHeader(ctx, game) {
  const round = currentRound(game);
  const totalSeconds = ROUNDS[game.roundIndex].seconds;
  const fraction = Math.max(0, game.timeLeft / totalSeconds);
  const lowTime = game.timeLeft <= 15 && game.screen === SCREEN_PLAY;

  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, 0, FRAME.width, HEADER.height);
  ctx.fillStyle = '#2a1f45';
  ctx.fillRect(0, HEADER.height - 6, FRAME.width, 6);

  ctx.fillStyle = GOLD;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('✦ Lantern Night Market', 40, 44);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Spot the Difference', 40, 70);

  ctx.textAlign = 'center';
  ctx.fillStyle = CREAM;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`${round.name}  ·  Round ${game.roundIndex + 1} of ${ROUNDS.length}`, FRAME.width / 2, 34);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '15px Georgia, serif';
  ctx.fillText(game.message || round.blurb, FRAME.width / 2, 60);

  // The counter of how many remain — the heart of the hunt.
  const found = DIFFERENCES_PER_ROUND - remaining(game);
  ctx.textAlign = 'right';
  ctx.fillStyle = found === DIFFERENCES_PER_ROUND ? GREEN : GOLD;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`Found ${found} / ${DIFFERENCES_PER_ROUND}  ·  ${remaining(game)} remain`, FRAME.width - 40, 42);
  ctx.fillStyle = CREAM;
  ctx.font = '17px Georgia, serif';
  ctx.fillText(`Score ${game.score}   ·   Hints ${game.hintsLeft} (H)`, FRAME.width - 40, 68);

  // The timer bar, with the seconds beside it.
  const barX = 40;
  const barY = HEADER.height - 8;
  const barWidth = FRAME.width - 80;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.fillRect(barX, barY, barWidth, 6);
  ctx.fillStyle = lowTime ? RED : fraction > 0.5 ? GREEN : GOLD;
  ctx.fillRect(barX, barY, barWidth * fraction, 6);
  ctx.fillStyle = lowTime ? RED : CREAM;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Time ${formatTime(game.timeLeft)}`, barX, barY - 6);
}

function paintFooter(ctx, game) {
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, FOOTER.y, FRAME.width, FOOTER.height);
  ctx.fillStyle = '#c9b8e8';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Click a difference on either picture  ·  Arrows move the crosshair, Enter marks it  ·  H hint  ·  P pause  ·  R restart  ·  M sound', 40, FOOTER.y + 28);
  ctx.textAlign = 'right';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(`●`.repeat(game.roundIndex + 1) + `○`.repeat(ROUNDS.length - game.roundIndex - 1), FRAME.width - 40, FOOTER.y + 28);
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(16, 10, 30, 0.78)';
  ctx.fillRect(0, 0, FRAME.width, FRAME.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText(title, FRAME.width / 2, 300);
  ctx.fillStyle = CREAM;
  ctx.font = '21px Georgia, serif';
  lines.forEach((line, index) => {
    ctx.fillText(line, FRAME.width / 2, 352 + index * 34);
  });
}

function paintTitle(ctx, game) {
  paintPanel(ctx, game, 'left');
  paintPanel(ctx, game, 'right');
  overlay(ctx, '✦ Lantern Night Market ✦', [
    'Spot the Difference — two pictures, seven hidden changes.',
    'Find them all before the lanterns burn down!',
    '',
    'Click a difference on either picture, or move the crosshair',
    'with the arrow keys and press Enter. H asks for a hint.',
    '',
    'Press SPACE or click anywhere to play',
  ], GOLD);
}

function paintPaused(ctx) {
  overlay(ctx, 'Paused', ['Take a breath — the lanterns wait for you.', '', 'Press P or SPACE to carry on'], CREAM);
}

function paintRoundDone(ctx, game) {
  const stars = '★'.repeat(roundStars(game)) + '☆'.repeat(3 - roundStars(game));
  overlay(ctx, 'Round Complete!', [
    stars,
    `You found all ${DIFFERENCES_PER_ROUND} differences in ${currentRound(game).name}.`,
    `Round score ${game.roundScore}  ·  Total score ${game.score}`,
    '',
    game.roundIndex + 1 < ROUNDS.length ? 'Press SPACE for the next round' : 'Press SPACE to see your victory',
  ], GREEN);
}

function paintOver(ctx, game) {
  const found = DIFFERENCES_PER_ROUND - remaining(game);
  overlay(ctx, "Time's Up!", [
    `The lanterns burned down with ${found} of ${DIFFERENCES_PER_ROUND} differences found.`,
    `Score ${game.score}  ·  Round ${game.roundIndex + 1} of ${ROUNDS.length}`,
    '',
    'Press R to try this round again',
  ], RED);
}

function paintWin(ctx, game) {
  overlay(ctx, 'You Found Them All!', [
    '★★★',
    `All ${game.totalFound} differences across three scenes — the market,`,
    'the harbour and the tea garden hold no more secrets from you.',
    `Final score ${game.score}`,
    '',
    'Press R to play again',
  ], GOLD);
}

/** Paint one frame. `crosshair` is the input crosshair, or null to hide it. */
export function paint(ctx, game, screen, crosshair) {
  ctx.clearRect(0, 0, FRAME.width, FRAME.height);
  ctx.fillStyle = '#14102a';
  ctx.fillRect(0, 0, FRAME.width, FRAME.height);

  if (screen === SCREEN_TITLE) {
    paintHeader(ctx, game);
    paintTitle(ctx, game);
    paintFooter(ctx, game);
    return;
  }

  paintHeader(ctx, game);
  paintPanel(ctx, game, 'left');
  paintPanel(ctx, game, 'right');

  // The divider between the pictures carries the round's progress.
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(FRAME.width / 2 - 2, PANELS.y + 40, 4, PANELS.height - 80);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', FRAME.width / 2, PANELS.y + 28);

  // Markers for what has been found, on both pictures at once.
  const { differences } = currentRound(game);
  for (const diff of differences) {
    if (!game.found.has(diff.id)) continue;
    const pop = game.flash && game.flash.diff.id === diff.id
      ? Math.max(0, (game.flash.until - game.time) / 0.9)
      : 0;
    foundMarker(ctx, PANELS.leftX, diff, pop);
    foundMarker(ctx, PANELS.rightX, diff, pop);
  }
  if (game.hint) {
    hintRing(ctx, PANELS.leftX, game.hint.diff, game.time);
    hintRing(ctx, PANELS.rightX, game.hint.diff, game.time);
  }
  if (game.wrong) wrongMark(ctx, game.wrong);
  if (crosshair && crosshair.visible && screen === SCREEN_PLAY) {
    drawCrosshair(ctx, crosshair, PANELS.leftX);
    drawCrosshair(ctx, crosshair, PANELS.rightX);
  }

  paintFooter(ctx, game);

  if (screen === SCREEN_PAUSED) paintPaused(ctx);
  else if (screen === SCREEN_ROUND) paintRoundDone(ctx, game);
  else if (screen === SCREEN_OVER) paintOver(ctx, game);
  else if (screen === SCREEN_WIN) paintWin(ctx, game);
}
