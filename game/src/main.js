// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps (several in a slow frame, none in a fast one), and the
// renderer paints what is there. The game moves between six screens: title,
// play, paused, round complete, game over and victory.
//
// ?seed=N fixes the decorative random seed. ?shot=start|play|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import {
  advance,
  createGame,
  currentRound,
  markAt,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_ROUND,
  SCREEN_TITLE,
  SCREEN_WIN,
  startRound,
  tick,
  useHint,
} from './state.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
  moveCrosshair,
  takeActions,
  takeClicks,
} from './input.js';
import { paint } from './render.js';
import { stageShot } from './shots.js';
import { playSound } from './audio.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
void seed; // The scenes seed their own decoration, so a shot is the same every run.

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
const game = createGame();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const screen = stageShot(name, game);
  let painted = 0;
  function paintFrame() {
    paint(ctx, game, screen, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paintFrame);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paintFrame);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;

  // Screen readers (and anyone watching the page's text) hear the screen
  // changes and each find.
  function announce(message) {
    status.textContent = message;
  }

  function beginRound(index) {
    startRound(game, index);
    screen = SCREEN_PLAY;
    announce(`Round ${index + 1}: ${currentRound(game).name}. Find 7 differences.`);
  }

  /** Start a brand-new game from round 1, clearing the score. */
  function restartGame() {
    game.score = 0;
    game.totalFound = 0;
    beginRound(0);
  }

  /** Move on after a finished round, announcing the next one (or victory). */
  function advanceRound() {
    advance(game);
    screen = game.screen;
    if (screen === SCREEN_PLAY) {
      announce(`Round ${game.roundIndex + 1}: ${currentRound(game).name}. Find 7 differences.`);
    } else if (screen === SCREEN_WIN) {
      finishGame();
    }
  }

  function finishGame() {
    screen = SCREEN_WIN;
    if (game.score > best) {
      best = game.score;
      saveBest(best);
    }
    playSound('win', game.muted);
    announce(`Victory! You found all the differences. Final score ${game.score}.`);
  }

  function endRound() {
    screen = SCREEN_OVER;
    playSound('wrong', game.muted);
    announce(`Time ran out. Score ${game.score}. Press R to retry.`);
  }

  function handleClicks() {
    for (const click of takeClicks(input)) {
      if (screen === SCREEN_TITLE) {
        beginRound(0);
        continue;
      }
      if (screen === SCREEN_ROUND) {
        advanceRound();
        continue;
      }
      if (screen === SCREEN_OVER || screen === SCREEN_WIN) {
        if (screen === SCREEN_WIN) restartGame();
        else beginRound(game.roundIndex);
        continue;
      }
      if (screen !== SCREEN_PLAY || click.panel === null) continue;
      const result = markAt(game, click.panel, click.x, click.y);
      if (result === 'found') {
        playSound('found', game.muted);
        announce(game.message);
        if (game.screen === SCREEN_ROUND) {
          screen = SCREEN_ROUND;
          playSound('round', game.muted);
        }
      } else if (result === 'wrong') {
        playSound('wrong', game.muted);
        announce(game.message);
      }
    }
  }

  function handleActions() {
    const actions = takeActions(input);
    if (actions & ACTION_MUTE) {
      game.muted = !game.muted;
      announce(game.muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_RESTART) {
      if (screen === SCREEN_WIN) restartGame();
      else if (screen === SCREEN_PLAY || screen === SCREEN_OVER || screen === SCREEN_ROUND) beginRound(game.roundIndex);
      return;
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE) {
        beginRound(0);
      } else if (screen === SCREEN_ROUND) {
        advanceRound();
      } else if (screen === SCREEN_OVER) {
        beginRound(game.roundIndex);
      } else if (screen === SCREEN_WIN) {
        restartGame();
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (screen === SCREEN_PLAY) {
        const crosshair = input.crosshair;
        if (crosshair.visible) {
          const result = markAt(game, 'left', crosshair.x, crosshair.y);
          if (result === 'found') {
            playSound('found', game.muted);
            announce(game.message);
            if (game.screen === SCREEN_ROUND) {
              screen = SCREEN_ROUND;
              playSound('round', game.muted);
            }
          } else if (result === 'wrong') {
            playSound('wrong', game.muted);
            announce(game.message);
          }
        }
      }
      return;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const diff = useHint(game);
      if (diff !== null) {
        playSound('hint', game.muted);
        announce(game.message);
      }
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      game.time += STEP;
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    moveCrosshair(input, STEP);
    const event = tick(game, STEP);
    if (event === 'timeout') endRound();
    const second = Math.floor(game.timeLeft);
    if (game.timeLeft <= 10 && second !== lastTickSecond) {
      lastTickSecond = second;
      playSound('tick', game.muted);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleClicks();
    handleActions();
    while (accumulator >= STEP) {
      step();
      accumulator -= STEP;
    }
    paint(ctx, game, screen, input.crosshair);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Lantern Night Market, spot the difference. Press Space or click to play.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
