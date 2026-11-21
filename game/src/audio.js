// Sound without assets: every effect is a small WebAudio oscillator phrase,
// built on the first user gesture so the browser allows it. Nothing is loaded
// over the network and there are no audio files.

let audioContext = null;

/** Create (or reuse) the shared AudioContext; null when audio is unavailable. */
export function ensureAudio() {
  if (audioContext !== null) return audioContext;
  try {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  } catch {
    return null;
  }
  return audioContext;
}

function tone(context, frequency, startAt, length, type, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + length);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + length + 0.05);
}

/** Play one named effect; silent when muted or when audio is unavailable. */
export function playSound(name, muted) {
  if (muted) return;
  const context = ensureAudio();
  if (context === null) return;
  if (context.state === 'suspended') void context.resume();
  const now = context.currentTime;
  if (name === 'found') {
    tone(context, 660, now, 0.12, 'sine', 0.18);
    tone(context, 880, now + 0.09, 0.16, 'sine', 0.18);
    tone(context, 1320, now + 0.18, 0.22, 'sine', 0.12);
  } else if (name === 'wrong') {
    tone(context, 180, now, 0.2, 'sawtooth', 0.08);
    tone(context, 140, now + 0.05, 0.22, 'sawtooth', 0.08);
  } else if (name === 'hint') {
    tone(context, 520, now, 0.1, 'triangle', 0.12);
    tone(context, 780, now + 0.08, 0.14, 'triangle', 0.12);
  } else if (name === 'round') {
    for (const [index, note] of [523, 659, 784, 1047].entries()) {
      tone(context, note, now + index * 0.11, 0.2, 'triangle', 0.16);
    }
  } else if (name === 'win') {
    for (const [index, note] of [523, 659, 784, 1047, 1319, 1568].entries()) {
      tone(context, note, now + index * 0.12, 0.26, 'triangle', 0.15);
    }
  } else if (name === 'tick') {
    tone(context, 980, now, 0.05, 'square', 0.05);
  } else if (name === 'click') {
    tone(context, 440, now, 0.06, 'sine', 0.1);
  }
}
