// The game's state: which screen is up, which round is being played, what has
// been found, how much time is left and what the hunt has scored. The state
// knows nothing about drawing or keys; render.js paints it and main.js drives it.

import {
  DIFFERENCES_PER_ROUND,
  HINTS_PER_ROUND,
  HINT_PENALTY,
  POINTS_PER_FIND,
  ROUNDS,
  TIME_BONUS_PER_SECOND,
  WRONG_CLICK_SECONDS,
} from './config.js';
import { differenceAt, differencesFor } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND = 'round';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

/** A fresh game, sitting on the title screen of round 1. */
export function createGame() {
  return {
    screen: SCREEN_TITLE,
    roundIndex: 0,
    found: new Set(),
    score: 0,
    roundScore: 0,
    timeLeft: ROUNDS[0].seconds,
    hintsLeft: HINTS_PER_ROUND,
    strikes: 0,
    hint: null, // { diff, until } while a hint ring is showing
    wrong: null, // { x, y, panel, until } while a red X is showing
    flash: null, // { diff, until } while a fresh find pops
    foundOrder: [],
    totalFound: 0,
    message: '',
    time: 0,
    muted: false,
  };
}

/** The round being played, with its scene and difference table. */
export function currentRound(game) {
  const round = ROUNDS[game.roundIndex];
  return { ...round, differences: differencesFor(round.scene) };
}

/** Start (or restart) the current round from scratch. */
export function startRound(game, roundIndex) {
  game.roundIndex = roundIndex;
  game.found = new Set();
  game.roundScore = 0;
  game.timeLeft = ROUNDS[roundIndex].seconds;
  game.hintsLeft = HINTS_PER_ROUND;
  game.strikes = 0;
  game.hint = null;
  game.wrong = null;
  game.flash = null;
  game.screen = SCREEN_PLAY;
  game.message = `Find ${DIFFERENCES_PER_ROUND} differences!`;
}

/** How many differences of this round are still unfound. */
export function remaining(game) {
  return DIFFERENCES_PER_ROUND - game.found.size;
}

/**
 * Mark the spot a click landed on. Returns 'found', 'wrong' or 'none'
 * (a click outside both panels, or on an already-found difference).
 */
export function markAt(game, panel, x, y) {
  if (game.screen !== SCREEN_PLAY) return 'none';
  const { differences } = currentRound(game);
  const diff = differenceAt(differences, game.found, x, y);
  if (diff === null) {
    game.strikes += 1;
    game.timeLeft = Math.max(0, game.timeLeft - WRONG_CLICK_SECONDS);
    game.wrong = { x, y, panel, until: game.time + 0.7 };
    game.message = `Not there! −${WRONG_CLICK_SECONDS}s`;
    return 'wrong';
  }
  game.found.add(diff.id);
  game.foundOrder.push(diff.id);
  game.totalFound += 1;
  const gained = POINTS_PER_FIND + Math.max(0, Math.floor(game.timeLeft / 10));
  game.score += gained;
  game.roundScore += gained;
  game.flash = { diff, until: game.time + 0.9 };
  game.message = `Found: ${diff.name}! +${gained}`;
  if (game.found.size === DIFFERENCES_PER_ROUND) {
    const bonus = Math.floor(game.timeLeft) * TIME_BONUS_PER_SECOND;
    game.score += bonus;
    game.roundScore += bonus;
    game.screen = SCREEN_ROUND;
    game.message = `Round complete! Time bonus +${bonus}`;
  }
  return 'found';
}

/** Spend a hint: briefly ring one difference that is still hidden. */
export function useHint(game) {
  if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return null;
  const { differences } = currentRound(game);
  const hidden = differences.filter((diff) => !game.found.has(diff.id));
  if (hidden.length === 0) return null;
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_PENALTY);
  const diff = hidden[Math.floor(Math.random() * hidden.length)];
  game.hint = { diff, until: game.time + 2.2 };
  game.message = `Hint: look near the ${diff.name.toLowerCase()}… −${HINT_PENALTY} pts`;
  return diff;
}

/** Advance the clock; returns 'timeout' when the round's time runs out. */
export function tick(game, dt) {
  game.time += dt;
  if (game.screen !== SCREEN_PLAY) return null;
  game.timeLeft -= dt;
  if (game.hint && game.time > game.hint.until) game.hint = null;
  if (game.wrong && game.time > game.wrong.until) game.wrong = null;
  if (game.flash && game.time > game.flash.until) game.flash = null;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREEN_OVER;
    game.message = 'Time ran out!';
    return 'timeout';
  }
  return null;
}

/** Move on after a finished round: next round, or the victory screen. */
export function advance(game) {
  if (game.roundIndex + 1 < ROUNDS.length) {
    startRound(game, game.roundIndex + 1);
  } else {
    game.screen = SCREEN_WIN;
    game.message = `You found all ${game.totalFound} differences!`;
  }
}

/** Stars for a finished round: 3 when half the clock is left, else 2, else 1. */
export function roundStars(game) {
  const fraction = game.timeLeft / ROUNDS[game.roundIndex].seconds;
  if (fraction >= 0.5) return 3;
  if (fraction >= 0.25) return 2;
  return 1;
}
