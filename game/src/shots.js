// The screenshot scenes behind ?shot=start|play|end. Each one stages a real
// game state — the title screen, a mid-game hunt with three differences found
// and four still hiding, or the victory screen — so the frame a screenshot
// takes is exactly what a player sees, with the same seed every time.

import { createGame, startRound } from './state.js';
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './state.js';

/** The three differences the play scene shows as already found. */
const PLAY_FOUND = ['lantern', 'cat', 'fish'];

/**
 * Set `game` to the named scene (start, play or end; any other name is start)
 * and return the screen to paint over it.
 */
export function stageShot(name, game) {
  if (name === 'play') {
    startRound(game, 0);
    game.timeLeft = 72;
    game.score = 340;
    for (const id of PLAY_FOUND) game.found.add(id);
    game.totalFound = PLAY_FOUND.length;
    game.message = 'Found: Missing fish! +112';
    game.time = 78;
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    startRound(game, 2);
    game.roundIndex = 2;
    game.timeLeft = 41;
    game.score = 2450;
    game.roundScore = 890;
    game.totalFound = 21;
    for (const diff of ['koi', 'flame', 'blossom', 'butterfly', 'steam', 'window', 'flower']) {
      game.found.add(diff);
    }
    game.screen = SCREEN_WIN;
    game.message = 'You found all 21 differences!';
    game.time = 200;
    return SCREEN_WIN;
  }
  const fresh = createGame();
  Object.assign(game, fresh);
  game.message = 'Find 7 differences!';
  game.time = 0;
  return SCREEN_TITLE;
}
