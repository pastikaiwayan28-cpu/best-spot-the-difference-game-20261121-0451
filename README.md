# 🔦 Lantern Night Market — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/pastikaiwayan28-cpu/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/pastikaiwayan28-cpu/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game, built for the
[make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
— two near-identical pictures side by side, seven hidden differences per
round, a counter of how many remain, and a clock that keeps the hunt honest.

## The game

Three hand-drawn scenes, painted fresh in canvas 2D (no images, no assets,
no network):

1. **Lantern Night Market** — fruit and fish stalls under paper lanterns,
   a sleeping cat, a vendor who may or may not be wearing his hat.
2. **Harbour at Dawn** — a striped lighthouse, a sailboat, gulls, and a
   pier full of crates and anchors.
3. **Tea Garden** — a tea house, a koi pond, a stone lantern, and a cherry
   tree in bloom.

Each round hides **7 differences**. Click one on either picture (or move
the crosshair with the arrow keys and press **Enter**) to ring it in green
on both pictures. A wrong click costs 5 seconds. **H** spends a hint,
**P** pauses, **R** restarts the round, **M** mutes the WebAudio chimes.
Find all 7 before the timer runs out to bank a time bonus and move on;
find all 21 to win.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

Static files only — `game/index.html` opens in desktop Chrome and plays
offline.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored `vendor/makefun-game.ts`.

## Layout

- `game/index.html` — the page, one canvas
- `game/src/config.js` — frame, panels, clock, scoring
- `game/src/scenes.js` — the three scenes, painted in canvas 2D
- `game/src/differences.js` — where each difference hides
- `game/src/state.js` — screens, rounds, scoring, timer
- `game/src/input.js` — mouse clicks and keyboard crosshair
- `game/src/audio.js` — WebAudio chimes, no audio files
- `game/src/render.js` — header, panels, markers, overlays
- `game/src/shots.js` — the deterministic `?shot=start|play|end` scenes
- `game/src/main.js` — boot and the game loop
- `main.ts` — the hand-in program (Node 22 stdlib only)
- `serve.ts` — a tiny static server for local play
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
