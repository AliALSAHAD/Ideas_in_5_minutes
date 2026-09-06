// Web Audio API Ambient Soundscapes Engine (Zero external assets, 100% synthesized)

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.currentType = 'off'; // 'off' | 'rain' | 'drone' | 'chrono'
    this.masterGain = null;
    this.nodes = [];
    this.chronoTimer = null;
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  stop() {
    if (this.chronoTimer) {
      clearInterval(this.chronoTimer);
      this.chronoTimer = null;
    }

    if (this.masterGain && this.ctx) {
      // Gentle fade-out
      this.masterGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.08);
      setTimeout(() => {
        this.nodes.forEach((n) => {
          try { n.stop?.(); n.disconnect?.(); } catch (_) {}
        });
        this.nodes = [];
        this.currentType = 'off';
      }, 120);
    } else {
      this.nodes = [];
      this.currentType = 'off';
    }
  }

  start(type) {
    this.init();
    if (type === this.currentType) return;
    this.stop();

    if (type === 'off') {
      this.currentType = 'off';
      return;
    }

    setTimeout(() => {
      this.currentType = type;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.15);
      this.masterGain.connect(this.ctx.destination);

      if (type === 'rain') {
        this.createRain();
      } else if (type === 'drone') {
        this.createDrone();
      } else if (type === 'chrono') {
        this.createChrono();
      }
    }, 150);
  }

  /* ── 1. Soft Rain: Pink noise through multi-pole low-pass filters ── */
  createRain() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise generator (Paul Kellet's filtered method)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Low-pass filter to give that deep, cozy rain feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    // High-pass filter to remove rumble
    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(80, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(hpFilter);
    hpFilter.connect(this.masterGain);

    whiteNoise.start();
    this.nodes.push(whiteNoise, filter, hpFilter);
  }

  /* ── 2. 432Hz Drone: Warm calming harmonic pad ── */
  createDrone() {
    const baseFreq = 432 / 2; // 216Hz warm foundation

    // Fundamental oscillator
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    // Overtone oscillator (432Hz)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2, this.ctx.currentTime);

    // Sub oscillator (108Hz)
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(baseFreq / 2, this.ctx.currentTime);

    // Gains for subtle balance
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.35, this.ctx.currentTime);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.18, this.ctx.currentTime);
    const g3 = this.ctx.createGain();
    g3.gain.setValueAtTime(0.12, this.ctx.currentTime);

    // Slow LFO for gentle breathing swell
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    lfo.connect(lfoGain.gain);

    // Warm low-pass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);

    g1.connect(filter);
    g2.connect(filter);
    g3.connect(filter);
    filter.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    this.nodes.push(osc1, osc2, osc3, lfo, filter, g1, g2, g3);
  }

  /* ── 3. Mechanical Chrono: Soft analog watch tick-tock ── */
  createChrono() {
    let tickAlt = false;

    const playClick = () => {
      if (!this.ctx || this.currentType !== 'chrono') return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(tickAlt ? 1400 : 1800, this.ctx.currentTime);
        filter.Q.setValueAtTime(4, this.ctx.currentTime);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(tickAlt ? 950 : 1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.025);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.04);
        tickAlt = !tickAlt;
      } catch (_) {}
    };

    playClick();
    this.chronoTimer = setInterval(playClick, 1000);
  }
}

export const ambientAudio = new AudioEngine();
