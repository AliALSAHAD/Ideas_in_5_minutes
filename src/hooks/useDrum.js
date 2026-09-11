import { useRef, useEffect, useCallback, useState } from 'react';

const ITEM_H = 76; // px per drum slot on desktop
const VISIBLE = 3;
const SPIN_DURATION = 3400; // ms — dynamic, suspenseful, responsive

/* ─── Helper to get true unscaled item height ─────────── */
function getItemHeight(reelEl) {
  const item = reelEl?.querySelector('.drum__item');
  if (item && typeof window !== 'undefined') {
    const computed = parseFloat(window.getComputedStyle(item).height);
    if (!isNaN(computed) && computed > 0) return computed;
  }
  if (typeof window !== 'undefined' && window.innerWidth <= 480) {
    return 65;
  }
  return ITEM_H;
}

/* ─── C1-Continuous Physics Easing: Smooth ramp-up + prolonged gradual deceleration ─ */
const TA = 0.13;     // Acceleration ramp-up takes 13% of duration (~440ms)
const ALPHA = 1.75;  // Deceleration curve power for organic mechanical crawl
const K1 = TA / 3;
const K2 = (1 - TA) / (ALPHA + 1);
const TOTAL_A = K1 + K2;
const W1 = K1 / TOTAL_A;
const W2 = K2 / TOTAL_A;

function physicsEase(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  if (t <= TA) {
    const p = t / TA;
    return W1 * p * p * p;
  } else {
    const u = (t - TA) / (1 - TA);
    return W1 + W2 * (1 - Math.pow(1 - u, ALPHA + 1));
  }
}

/* ─── Tick sound via Web Audio API ────────────────────── */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) { return null; }
  }
  return audioCtx;
}

function playTick(speed = 1) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // High-pitched click — pitch varies slightly with speed for naturalness
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + speed * 120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch (_) { /* ignore */ }
}

/* ─── Smart Random: avoid last pick, weight toward less-used ── */
const pickHistory = { last: null, counts: {} };

function smartRandom(topics) {
  if (topics.length === 0) return null;
  if (topics.length === 1) return topics[0];

  // Exclude last picked if possible
  const pool = topics.filter(t => t !== pickHistory.last);
  const candidates = pool.length > 0 ? pool : topics;

  // Weight inversely by pick count
  const weights = candidates.map(t => {
    const count = pickHistory.counts[t] ?? 0;
    return 1 / (count + 1);
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      const picked = candidates[i];
      pickHistory.last = picked;
      pickHistory.counts[picked] = (pickHistory.counts[picked] ?? 0) + 1;
      return picked;
    }
  }
  return candidates[candidates.length - 1];
}

/* ─── Particle burst ─────────────────────────────────── */
function spawnParticles(containerEl) {
  if (!containerEl) return;
  const rect = containerEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      left: ${cx}px;
      top: ${cy}px;
      width: ${3 + Math.random() * 4}px;
      height: ${3 + Math.random() * 4}px;
      border-radius: 50%;
      background: ${Math.random() > 0.5 ? '#ffffff' : '#a1a1aa'};
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(el);

    const angle = (Math.random() * 360 * Math.PI) / 180;
    const dist = 40 + Math.random() * 80;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const duration = 500 + Math.random() * 400;

    el.animate([
      { opacity: 1, transform: `translate(-50%, -50%) scale(1)` },
      { opacity: 0, transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.2)` },
    ], {
      duration,
      easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      fill: 'forwards',
    }).onfinish = () => el.remove();
  }
}

/* ─── useDrum hook ───────────────────────────────────── */
export function useDrum(topics) {
  const reelRef = useRef(null);
  const drumWrapRef = useRef(null);
  const rafRef = useRef(null);
  const [spinPhase, setSpinPhase] = useState('idle'); // 'idle' | 'countdown' | 'spinning' | 'landed'

  // Apply blur+scale CSS variable based on distance from center
  function applyDepthEffect(items, centeredIdx) {
    items.forEach((el, i) => {
      const dist = Math.abs(i - centeredIdx);
      const blur = Math.min(dist * 0.8, 2.5);
      const scale = Math.max(1 - dist * 0.06, 0.84);
      const opacity = Math.max(1 - dist * 0.22, 0.42);
      el.style.filter = dist === 0 ? 'none' : `blur(${blur}px)`;
      el.style.transform = `scale(${scale})`;
      el.style.opacity = dist === 0 ? '1' : opacity;
    });
  }

  // Build reel items
  const buildReel = useCallback(() => {
    const reel = reelRef.current;
    if (!reel || topics.length === 0) return;

    reel.innerHTML = '';
    const repeats = Math.max(8, Math.ceil(120 / topics.length));
    const pool = [];
    for (let i = 0; i < repeats; i++) pool.push(...topics);

    pool.forEach((t) => {
      const div = document.createElement('div');
      div.className = 'drum__item';
      div.textContent = t;
      reel.appendChild(div);
    });

    // Apply initial depth to center item
    const items = reel.querySelectorAll('.drum__item');
    const centerOffset = Math.floor(VISIBLE / 2);
    applyDepthEffect(items, centerOffset);
  }, [topics]);

  useEffect(() => { buildReel(); }, [buildReel]);

  /* ── Countdown → Spin ────────────────────────────── */
  const spin = useCallback((finalTopic, onDone) => {
    const reel = reelRef.current;
    if (!reel || topics.length === 0) { onDone?.(); return; }

    // Rebuild reel cleanly
    cancelAnimationFrame(rafRef.current);
    reel.style.transform = 'translateY(0)';
    buildReel();

    const items = reel.querySelectorAll('.drum__item');
    if (items.length === 0) { onDone?.(); return; }

    const itemH = getItemHeight(reel);
    const topicIndex = topics.indexOf(finalTopic);
    const repeatBlock = Math.max(4, Math.floor(items.length / (topics.length * 2)));
    const landingIndex = repeatBlock * topics.length + (topicIndex >= 0 ? topicIndex : 0);
    const centerOffset = Math.floor(VISIBLE / 2);
    const targetY = -(landingIndex - centerOffset) * itemH;

    items.forEach(el => {
      el.classList.remove('drum__item--selected');
      el.style.filter = '';
      el.style.transform = '';
      el.style.opacity = '';
    });

    setSpinPhase('spinning');

    const startTime = performance.now();
    let lastTickIndex = -1;
    let lastTickTime = 0;

    function tick(now) {
      const t = Math.min((now - startTime) / SPIN_DURATION, 1);
      const easedT = physicsEase(t);
      const currentY = targetY * easedT;

      reel.style.transform = `translateY(${currentY}px)`;

      // Depth effect
      const centeredIdx = Math.round((-currentY) / itemH) + centerOffset;
      applyDepthEffect(items, centeredIdx);

      // Highlight selected
      items.forEach((el, i) =>
        el.classList.toggle('drum__item--selected', i === centeredIdx)
      );

      // Tick sound — rate proportional to speed
      const velocity = Math.abs(targetY * (physicsEase(Math.min(t + 0.005, 1)) - easedT) / 0.005);
      const minTickInterval = Math.max(35, 220 - velocity * 0.28);
      if (centeredIdx !== lastTickIndex && (now - lastTickTime) > minTickInterval) {
        const speedNorm = Math.min(velocity / 320, 1);
        playTick(speedNorm);
        lastTickIndex = centeredIdx;
        lastTickTime = now;
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Landed cleanly
        reel.style.transform = `translateY(${targetY}px)`;
        const finalItems = reel.querySelectorAll('.drum__item');
        applyDepthEffect(finalItems, landingIndex);
        finalItems[landingIndex]?.classList.add('drum__item--selected');
        setSpinPhase('landed');

        // Particle burst at drum wrap
        spawnParticles(drumWrapRef.current);

        // Final tick — satisfying "click" landing sound
        playTick(0);
        setTimeout(() => {
          setSpinPhase('idle');
          onDone?.();
        }, 650);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [topics, buildReel]);

  return { reelRef, drumWrapRef, spin, buildReel, spinPhase, smartRandom: () => smartRandom(topics) };
}
