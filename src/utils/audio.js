/**
 * Plays a gentle two-tone done sound using Web Audio API.
 * No external assets required.
 */
export function playDoneSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [440, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.22);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.22);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.22 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.22 + 0.6);
      osc.start(ctx.currentTime + i * 0.22);
      osc.stop(ctx.currentTime + i * 0.22 + 0.65);
    });
  } catch (_) { /* audio context unavailable */ }
}

/** Format seconds as M:SS */
export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
