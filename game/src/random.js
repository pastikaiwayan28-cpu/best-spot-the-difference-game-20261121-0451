// A tiny seeded random number generator (mulberry32) so a scene's decorative
// details — stars, twinkles, ripples — are the same for the same seed, which
// keeps the screenshot scenes deterministic.

export function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A number in [min, max) from a seeded generator. */
export function range(random, min, max) {
  return min + random() * (max - min);
}

/** Pick one item from a list with a seeded generator. */
export function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}
