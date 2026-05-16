/**
 * STG Game - Procedural Audio System
 * No external audio files. All sounds generated via Web Audio API.
 * 
 * Global: window.audio = new AudioManager()
 * (AudioContext created on first user interaction for autoplay policy)
 */

class AudioManager {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._muted = false;
    this._volume = 0.3;
    this._bgmNodes = [];
    this._bgmRunning = false;
    this._bgmVolume = 0.15;
    this._initialized = false;
  }

  // ─── LAZY INIT ───────────────────────────────────────────────
  _ensureContext() {
    if (this._ctx) return;
    this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._masterGain = this._ctx.createGain();
    this._masterGain.gain.value = this._volume;
    this._masterGain.connect(this._ctx.destination);
    this._initialized = true;
  }

  // ─── VOLUME CONTROL ─────────────────────────────────────────
  get masterVolume() { return this._volume; }
  set masterVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._masterGain) {
      this._masterGain.gain.value = this._muted ? 0 : this._volume;
    }
  }

  get muted() { return this._muted; }

  mute() {
    this._muted = true;
    if (this._masterGain) this._masterGain.gain.value = 0;
  }

  unmute() {
    this._muted = false;
    if (this._masterGain) this._masterGain.gain.value = this._volume;
  }

  // ─── SOUND HELPERS ──────────────────────────────────────────
  /** Simple oscillator-based sound with frequency sweep */
  _playTone(type, startFreq, endFreq, duration, vol) {
    this._ensureContext();
    if (this._muted) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(startFreq, 0.01), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 0.01), now + duration);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  /** Noise burst (uses buffer source with random data) */
  _playNoise(duration, vol, filterCutoff) {
    this._ensureContext();
    if (this._muted) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    if (filterCutoff !== undefined) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, now);
      filter.frequency.exponentialRampToValueAtTime(filterCutoff * 0.1, now + duration);
      filter.Q.value = 1;
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.connect(gain);
    }

    gain.connect(this._masterGain);
    source.start(now);
    source.stop(now + duration + 0.01);
  }

  // ─── SFX: COMBAT ────────────────────────────────────────────
  playShoot() {
    this._playTone('square', 800, 400, 0.05, 0.08);
  }

  playExplosion() {
    this._playNoise(0.2, 0.12, 1000);
  }

  playBigExplosion() {
    this._ensureContext();
    if (this._muted) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const duration = 0.4;

    // Layer 1: noise burst with filter sweep
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + duration);
    filter.Q.value = 0.5;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this._masterGain);

    // Layer 2: sub-bass thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + duration);
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(oscGain);
    oscGain.connect(this._masterGain);

    source.start(now);
    source.stop(now + duration + 0.01);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  playHit() {
    this._playTone('sine', 1000, 200, 0.03, 0.1);
  }

  playPickup() {
    this._playTone('sine', 400, 800, 0.1, 0.1);
  }

  playLevelUp() {
    this._ensureContext();
    if (this._muted) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const noteDuration = 0.1;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * noteDuration;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(t);
      osc.stop(t + noteDuration + 0.01);
    });
  }

  playGameOver() {
    this._playTone('sawtooth', 400, 100, 0.6, 0.12);
  }

  playBossWarning() {
    this._ensureContext();
    if (this._muted) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const beeps = 4;
    const beepDuration = 0.08;
    const gap = 0.12;

    for (let i = 0; i < beeps; i++) {
      const freq = i % 2 === 0 ? 800 : 600;
      const t = now + i * (beepDuration + gap);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + beepDuration);
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(t);
      osc.stop(t + beepDuration + 0.01);
    }
  }

  playSelect() {
    this._playTone('sine', 600, 600, 0.02, 0.06);
  }

  playDamage() {
    this._playNoise(0.1, 0.1, 3000);
  }

  // ─── BACKGROUND MUSIC ───────────────────────────────────────
  startBGM() {
    this._ensureContext();
    if (this._bgmRunning) return;
    this._bgmRunning = true;

    const ctx = this._ctx;
    const now = ctx.currentTime;
    const patternLength = 2.0; // seconds per loop

    // Bass drone - sustained low note
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = 60; // Low B
    bassGain.gain.value = this._bgmVolume * 0.3;
    bassOsc.connect(bassGain);
    bassGain.connect(this._masterGain);
    bassOsc.start(now);
    this._bgmNodes.push(bassOsc, bassGain);

    // Subtle bass pulse
    const pulseGain = ctx.createGain();
    pulseGain.gain.value = 0;
    bassOsc.connect(pulseGain);
    pulseGain.connect(this._masterGain);
    this._bgmNodes.push(pulseGain);
    this._scheduleBassPulse(pulseGain, now);

    // Arpeggiated pattern (E3, G3, B3, D4) - E minor 7
    const arpFreqs = [164.81, 196.00, 246.94, 293.66];
    this._scheduleArp(arpFreqs, patternLength, now);
  }

  _scheduleBassPulse(pulseGain, startTime) {
    if (!this._bgmRunning) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const beatDuration = 2.0; // quarter note at 30bpm

    pulseGain.gain.cancelScheduledValues(now);
    pulseGain.gain.setValueAtTime(0, now);
    pulseGain.gain.linearRampToValueAtTime(this._bgmVolume * 0.15, now + 0.02);
    pulseGain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration);

    setTimeout(() => this._scheduleBassPulse(pulseGain, startTime), beatDuration * 1000);
  }

  _scheduleArp(freqs, patternLength, startTime) {
    if (!this._bgmRunning) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const noteDuration = patternLength / freqs.length;

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + i * noteDuration;
      gain.gain.setValueAtTime(this._bgmVolume * 0.12, t);
      gain.gain.setValueAtTime(this._bgmVolume * 0.12, t + noteDuration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);
      osc.connect(gain);
      gain.connect(this._masterGain);
      osc.start(t);
      osc.stop(t + noteDuration + 0.01);
    });

    setTimeout(() => this._scheduleArp(freqs, patternLength, startTime), patternLength * 1000);
  }

  stopBGM() {
    this._bgmRunning = false;
    const ctx = this._ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    // Fade out bass gain
    const bassGain = this._bgmNodes[1]; // second node is bassGain
    if (bassGain) {
      bassGain.gain.cancelScheduledValues(now);
      bassGain.gain.setValueAtTime(bassGain.gain.value, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    }

    // Stop all oscillators after fade
    setTimeout(() => {
      this._bgmNodes.forEach(node => {
        try { node.stop(); } catch (e) { /* already stopped or gain node */ }
      });
      this._bgmNodes = [];
    }, 400);
  }

  setBGMVolume(v) {
    this._bgmVolume = Math.max(0, Math.min(1, v));
    // Update bass gain if running
    if (this._bgmRunning && this._bgmNodes.length >= 2) {
      const bassGain = this._bgmNodes[1];
      bassGain.gain.value = this._bgmVolume * 0.3;
    }
  }

  // ─── RESUME (user gesture recovery) ─────────────────────────
  resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }
}

// Export singleton
window.audio = new AudioManager();
