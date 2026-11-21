// Lantern Night Market — Spot the Difference.
// A canvas spot-the-difference game: two near-identical pictures side by side,
// 7 hidden differences per round, 3 original hand-drawn scenes. Click (or move
// the crosshair with the arrow keys and press Enter) to mark a difference.
// This file holds the numbers every other module shares: the frame, the panels,
// the clock, the scoring and the round list.

export const FRAME = { width: 1280, height: 800 };

// The two picture panels, in frame coordinates.
export const PANELS = {
  width: 556,
  height: 600,
  y: 120,
  leftX: 40,
  rightX: 684,
  gap: 88,
};

export const HEADER = { height: 104 };
export const FOOTER = { y: 728, height: 56 };

// One round per scene; the clock tightens as the scenes get busier.
export const ROUNDS = [
  { scene: 'market', name: 'Lantern Night Market', seconds: 150, blurb: 'Round 1 · 7 differences' },
  { scene: 'harbour', name: 'Harbour at Dawn', seconds: 135, blurb: 'Round 2 · 7 differences' },
  { scene: 'garden', name: 'Tea Garden', seconds: 120, blurb: 'Round 3 · 7 differences' },
];

export const DIFFERENCES_PER_ROUND = 7;
export const HINTS_PER_ROUND = 3;
export const WRONG_CLICK_SECONDS = 5;
export const POINTS_PER_FIND = 100;
export const HINT_PENALTY = 25;
export const TIME_BONUS_PER_SECOND = 10;
export const CLICK_RADIUS = 34;

export const BEST_KEY = 'lantern-night-market-best';
export const STEP = 1 / 60;
