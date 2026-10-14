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

/* ─── useDrum hook ───────────────────────────────────── */
export function useDrum(topics) {
  const reelRef = useRef(null);
  const drumWrapRef = useRef(null);
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);
  const [spinPhase, setSpinPhase] = useState('idle'); // 'idle' | 'countdown' | 'spinning' | 'landed'

  // Place each visible face on a cylindrical surface.
  function applyDepthEffect(items, centeredIdx) {
    items.forEach((el, i) => {
      const distance = i - centeredIdx;
      const angle = distance * 30;
      const visible = Math.abs(angle) < 90;
      el.style.visibility = visible ? 'visible' : 'hidden';
      if (!visible) return;
      el.style.filter = 'none';
      el.style.transform = `rotateX(${-angle}deg) translateZ(var(--reel-radius))`;
      el.style.opacity = String(Math.max(0.15, Math.cos(angle * Math.PI / 180) ** 3));
      el.classList.toggle('drum__item--selected', Math.abs(distance) < 0.48);
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

  useEffect(() => { buildReel(); return () => { cancelAnimationFrame(rafRef.current); clearTimeout(timeoutRef.current); }; }, [buildReel]);

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
    drumWrapRef.current?.setAttribute('data-landed', 'false');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reducedMotion ? 120 : SPIN_DURATION;
    const startTime = performance.now();
    let lastTickIndex = -1;
    let lastTickTime = 0;

    function tick(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const easedT = physicsEase(t);
      const currentY = (targetY - (reducedMotion ? 0 : itemH * 0.10)) * easedT;

      // Depth effect
      const centeredIdx = (-currentY) / itemH + centerOffset;
      applyDepthEffect(items, centeredIdx);

      // Tick sound — rate proportional to speed
      const velocity = Math.abs(targetY * (physicsEase(Math.min(t + 0.005, 1)) - easedT) / 0.005);
      const minTickInterval = Math.max(35, 220 - velocity * 0.28);
      if (!reducedMotion && Math.round(centeredIdx) !== lastTickIndex && (now - lastTickTime) > minTickInterval) {
        const speedNorm = Math.min(velocity / 320, 1);
        playTick(speedNorm);
        lastTickIndex = Math.round(centeredIdx);
        lastTickTime = now;
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        const settleStart = performance.now();
        function settle(time) {
          const progress = reducedMotion ? 1 : Math.min((time - settleStart) / 300, 1);
          const offset = 0.10 * (1 - progress) ** 2 * Math.cos(progress * Math.PI * 2);
          applyDepthEffect(items, landingIndex + offset);
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(settle);
          } else {
            setSpinPhase('landed');
            drumWrapRef.current?.setAttribute('data-landed', 'true');
            if (!reducedMotion) playTick(0);
            timeoutRef.current = setTimeout(() => {
              setSpinPhase('idle');
              onDone?.();
            }, 650);
          }
        }
        rafRef.current = requestAnimationFrame(settle);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [topics, buildReel]);

  return { reelRef, drumWrapRef, spin, buildReel, spinPhase, smartRandom: () => smartRandom(topics) };
}
