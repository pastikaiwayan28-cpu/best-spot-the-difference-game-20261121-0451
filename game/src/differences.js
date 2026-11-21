// Where the differences hide: one table per scene, in panel coordinates
// (the panel is 556 by 600). Each entry names the spot, its centre and the
// radius a click must land inside. The scene painters in scenes.js read the
// same table, so a drawn difference and its clickable spot always agree.
// `side` says which panel carries the change: 'right' means the right picture
// has the extra/changed thing, 'left' means the left picture has it.

export const DIFFERENCES = {
  market: [
    { id: 'lantern', name: 'Extra lantern', x: 468, y: 74, r: 30, side: 'right' },
    { id: 'cat', name: 'Sleeping cat', x: 92, y: 516, r: 34, side: 'left' },
    { id: 'sign', name: 'Stall sign colour', x: 148, y: 296, r: 32, side: 'right' },
    { id: 'fish', name: 'Missing fish', x: 428, y: 384, r: 30, side: 'left' },
    { id: 'umbrella', name: 'Umbrella colour', x: 498, y: 452, r: 32, side: 'right' },
    { id: 'basket', name: 'Extra basket', x: 302, y: 542, r: 30, side: 'right' },
    { id: 'hat', name: "Vendor's hat", x: 209, y: 228, r: 30, side: 'left' },
  ],
  harbour: [
    { id: 'gull', name: 'Extra gull', x: 428, y: 92, r: 26, side: 'right' },
    { id: 'beam', name: 'Lighthouse beam', x: 180, y: 172, r: 34, side: 'right' },
    { id: 'flag', name: 'Boat flag colour', x: 314, y: 176, r: 28, side: 'right' },
    { id: 'buoy', name: 'Little buoy', x: 500, y: 520, r: 28, side: 'right' },
    { id: 'crate', name: 'Extra crate', x: 122, y: 435, r: 30, side: 'right' },
    { id: 'sun', name: 'Sun rays', x: 468, y: 112, r: 32, side: 'left' },
    { id: 'anchor', name: 'Anchor', x: 252, y: 505, r: 30, side: 'left' },
  ],
  garden: [
    { id: 'koi', name: 'Extra koi', x: 332, y: 472, r: 30, side: 'right' },
    { id: 'flame', name: 'Lantern flame', x: 92, y: 308, r: 28, side: 'right' },
    { id: 'blossom', name: 'Blossom colour', x: 448, y: 118, r: 32, side: 'right' },
    { id: 'butterfly', name: 'Butterfly', x: 202, y: 202, r: 26, side: 'right' },
    { id: 'steam', name: 'Teapot steam', x: 288, y: 350, r: 30, side: 'left' },
    { id: 'window', name: 'Lit window', x: 108, y: 262, r: 30, side: 'right' },
    { id: 'flower', name: 'Flower colour', x: 470, y: 548, r: 28, side: 'right' },
  ],
};

/** The difference table for a scene name, or the market's when unknown. */
export function differencesFor(scene) {
  return DIFFERENCES[scene] ?? DIFFERENCES.market;
}

/**
 * The difference a click at panel coordinates (x, y) lands on, among the ones
 * not found yet — the nearest within its radius, or null.
 */
export function differenceAt(differences, found, x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const diff of differences) {
    if (found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= diff.r && distance < bestDistance) {
      best = diff;
      bestDistance = distance;
    }
  }
  return best;
}
