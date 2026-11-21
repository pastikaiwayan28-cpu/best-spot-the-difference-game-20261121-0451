// Mouse and keyboard: clicks land on a panel and become panel coordinates, the
// arrow keys move a crosshair that mirrors across both panels, and single keys
// run the game's shortcuts. The module only reports what happened; main.js
// decides what it means.

import { FRAME, PANELS } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;

const CROSSHAIR_SPEED = 420;

/** The crosshair's panel coordinates, starting at the centre of the left panel. */
export function createCrosshair() {
  return { x: PANELS.width / 2, y: PANELS.height / 2, visible: false };
}

/**
 * Turn a pointer event into a panel hit: { panel: 'left' | 'right', x, y }
 * in panel coordinates, or null when the click missed both pictures.
 */
export function pointerToPanel(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = FRAME.width / rect.width;
  const scaleY = FRAME.height / rect.height;
  const frameX = (event.clientX - rect.left) * scaleX;
  const frameY = (event.clientY - rect.top) * scaleY;
  if (frameY < PANELS.y || frameY > PANELS.y + PANELS.height) return null;
  const y = frameY - PANELS.y;
  if (frameX >= PANELS.leftX && frameX <= PANELS.leftX + PANELS.width) {
    return { panel: 'left', x: frameX - PANELS.leftX, y };
  }
  if (frameX >= PANELS.rightX && frameX <= PANELS.rightX + PANELS.width) {
    return { panel: 'right', x: frameX - PANELS.rightX, y };
  }
  return null;
}

/** Wire the canvas and the keyboard up; returns the live input record. */
export function createInput(canvas) {
  const input = {
    clicks: [],
    actions: 0,
    keys: new Set(),
    crosshair: createCrosshair(),
  };

  canvas.addEventListener('pointerdown', (event) => {
    const hit = pointerToPanel(event, canvas);
    // Every click is queued (a click in the gutter still starts the game or
    // moves on from an overlay); only a click on a picture can mark a spot.
    input.clicks.push(hit ?? { panel: null, x: 0, y: 0 });
    if (hit !== null) {
      input.crosshair.x = hit.x;
      input.crosshair.y = hit.y;
      input.crosshair.visible = true;
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    input.keys.add(key);
    if (key === ' ' || key === 'enter') {
      input.actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (key === 'p' || key === 'escape') {
      input.actions |= ACTION_PAUSE;
    } else if (key === 'h') {
      input.actions |= ACTION_HINT;
    } else if (key === 'r') {
      input.actions |= ACTION_RESTART;
    } else if (key === 'm') {
      input.actions |= ACTION_MUTE;
    }
    if (key.startsWith('arrow')) event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.key.toLowerCase());
  });

  window.addEventListener('blur', () => {
    input.keys.clear();
  });

  return input;
}

/** Take and clear the queued clicks. */
export function takeClicks(input) {
  const clicks = input.clicks;
  input.clicks = [];
  return clicks;
}

/** Take and clear the queued one-shot actions. */
export function takeActions(input) {
  const actions = input.actions;
  input.actions = 0;
  return actions;
}

/** Move the crosshair with the held arrow keys; dt is seconds. */
export function moveCrosshair(input, dt) {
  const keys = input.keys;
  let dx = 0;
  let dy = 0;
  if (keys.has('arrowleft')) dx -= 1;
  if (keys.has('arrowright')) dx += 1;
  if (keys.has('arrowup')) dy -= 1;
  if (keys.has('arrowdown')) dy += 1;
  if (dx === 0 && dy === 0) return;
  const crosshair = input.crosshair;
  crosshair.visible = true;
  const length = Math.hypot(dx, dy);
  crosshair.x = Math.min(PANELS.width, Math.max(0, crosshair.x + (dx / length) * CROSSHAIR_SPEED * dt));
  crosshair.y = Math.min(PANELS.height, Math.max(0, crosshair.y + (dy / length) * CROSSHAIR_SPEED * dt));
}
