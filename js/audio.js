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

  // ─── SFX: 流派终极技能音效 ──────────────────────────────────
  /**
   * 播放流派专属终极技能音效
   * @param {string} factionId - 流派ID
   */
  playFactionUltimate(factionId) {
    switch (factionId) {
      case 'gravity':
        // 重力流：深沉低频轰鸣 + 下降音调
        this._playTone('sine', 120, 30, 0.8, 0.15);
        this._playTone('triangle', 80, 20, 0.6, 0.1);
        this._playNoise(0.3, 0.08, 200);
        break;
      case 'void':
        // 虚空流：空灵回响 + 诡异嗡鸣
        this._playTone('sine', 200, 180, 1.0, 0.12);
        this._playTone('sine', 300, 280, 0.8, 0.08);
        this._playNoise(0.5, 0.06, 400);
        break;
      case 'thunder':
        // 雷电流：雷电劈裂声
        this._playNoise(0.15, 0.18, 6000);
        this._playTone('sawtooth', 1500, 100, 0.2, 0.12);
        this._playTone('square', 800, 50, 0.15, 0.1);
        break;
      case 'wind':
        // 风之流：疾风呼啸
        this._playNoise(0.6, 0.1, 2000);
        this._playTone('sine', 600, 1200, 0.4, 0.06);
        break;
      case 'shadow':
        // 暗影流：暗影低语
        this._playTone('sine', 150, 100, 0.5, 0.1);
        this._playTone('triangle', 200, 150, 0.4, 0.08);
        this._playNoise(0.3, 0.04, 800);
        break;
      case 'holy':
        // 圣光流：圣洁钟声和弦
        this._playTone('sine', 523, 523, 0.6, 0.12); // C5
        this._playTone('sine', 659, 659, 0.5, 0.1);  // E5
        this._playTone('sine', 784, 784, 0.4, 0.08);  // G5
        break;
      case 'blood':
        // 血祭流：血红脉冲
        this._playTone('sawtooth', 100, 80, 0.4, 0.12);
        this._playTone('sine', 60, 40, 0.6, 0.15);
        this._playNoise(0.2, 0.08, 1500);
        break;
      case 'magnet':
        // 磁力流：电磁嗡鸣
        this._playTone('sine', 180, 220, 0.5, 0.1);
        this._playTone('triangle', 360, 440, 0.4, 0.08);
        this._playTone('square', 90, 110, 0.3, 0.06);
        break;
      case 'mirror':
        // 镜之流：玻璃碎裂 + 反射回音
        this._playNoise(0.15, 0.14, 8000);
        this._playTone('sine', 1200, 800, 0.3, 0.1);
        this._playTone('sine', 800, 1200, 0.25, 0.08);
        break;
      case 'time':
        // 时之流：时空扭曲
        this._playTone('sine', 400, 200, 0.7, 0.1);
        this._playTone('triangle', 600, 300, 0.5, 0.08);
        this._playTone('sine', 300, 600, 0.4, 0.06);
        break;
      case 'fury':
        // 狂怒流：怒吼爆发
        this._playTone('sawtooth', 200, 80, 0.4, 0.15);
        this._playNoise(0.3, 0.12, 3000);
        this._playTone('square', 150, 60, 0.3, 0.1);
        break;
      case 'luck':
        // 幸运流：幸运叮当声
        this._playTone('sine', 800, 1200, 0.15, 0.1);
        this._playTone('sine', 1000, 1500, 0.12, 0.08);
        this._playTone('sine', 1200, 1800, 0.1, 0.06);
        break;
      case 'sonic':
        // 音波流：音爆冲击
        this._playNoise(0.2, 0.15, 5000);
        this._playTone('sine', 1000, 200, 0.3, 0.12);
        this._playTone('square', 500, 100, 0.25, 0.1);
        break;
      case 'minion':
        // 魔仆流：魔仆召唤
        this._playTone('sawtooth', 150, 300, 0.4, 0.1);
        this._playTone('triangle', 200, 400, 0.35, 0.08);
        this._playNoise(0.2, 0.06, 2000);
        break;
      case 'data':
        // 数据流：数据流脉冲
        this._playTone('square', 800, 1200, 0.1, 0.08);
        this._playTone('square', 1000, 1500, 0.08, 0.06);
        this._playTone('sine', 600, 900, 0.15, 0.1);
        break;
    }
  },

  // ─── SFX: 新武器射击音效 ────────────────────────────────────
  /**
   * 播放武器专属射击音效
   * @param {string} weaponId - 武器ID
   */
  playWeaponShoot(weaponId) {
    switch (weaponId) {
      case 'missile':
        // 导弹：推进器点火
        this._playNoise(0.15, 0.1, 2000);
        this._playTone('sawtooth', 200, 100, 0.12, 0.08);
        break;
      case 'needle':
        // 针弹：极速穿刺
        this._playTone('sine', 2000, 1500, 0.04, 0.06);
        break;
      case 'gravityWell':
        // 重力井：引力波
        this._playTone('sine', 150, 80, 0.3, 0.1);
        this._playTone('triangle', 100, 50, 0.25, 0.08);
        break;
      case 'flame':
        // 火焰喷射：灼烧声
        this._playNoise(0.1, 0.08, 3000);
        this._playTone('sawtooth', 300, 200, 0.08, 0.06);
        break;
      case 'shuriken':
        // 手里剑：旋转飞出
        this._playTone('square', 600, 400, 0.08, 0.07);
        this._playNoise(0.05, 0.05, 4000);
        break;
      case 'voidRift':
        // 虚空裂隙：空间撕裂
        this._playTone('sine', 100, 200, 0.2, 0.1);
        this._playNoise(0.15, 0.08, 1000);
        this._playTone('triangle', 80, 160, 0.18, 0.06);
        break;
      case 'lightningBolt':
        // 雷电：电击声
        this._playNoise(0.08, 0.12, 7000);
        this._playTone('square', 1200, 400, 0.06, 0.1);
        break;
      case 'iceShard':
        // 冰晶：冰冻碎裂
        this._playTone('sine', 1500, 800, 0.1, 0.08);
        this._playNoise(0.06, 0.06, 6000);
        break;
      case 'rocketBarrage':
        // 火箭弹幕：多发火箭齐射
        this._playNoise(0.2, 0.12, 1500);
        this._playTone('sawtooth', 300, 100, 0.18, 0.1);
        this._playTone('square', 200, 80, 0.15, 0.08);
        break;
      case 'photonBeam':
        // 光子束：高频能量束
        this._playTone('sine', 1800, 2000, 0.08, 0.06);
        this._playTone('triangle', 1200, 1400, 0.06, 0.05);
        break;
      default:
        this.playShoot();
        break;
    }
  },

  // ─── SFX: Boss出场音效 ──────────────────────────────────────
  /**
   * 播放Boss出场音效
   * @param {string} bossId - Boss ID
   */
  playBossEntrance(bossId) {
    this._ensureContext();
    if (this._muted) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    switch (bossId) {
      case 'boss_tank':
        // 钢铁巨兽：沉重脚步 + 金属撞击
        this._playTone('sine', 60, 40, 0.8, 0.15);
        this._playNoise(0.4, 0.12, 500);
        this._playTone('triangle', 100, 60, 0.6, 0.1);
        break;
      case 'boss_summoner':
        // 召唤之主：魔法阵启动 + 召唤光环
        this._playTone('sine', 300, 600, 0.5, 0.1);
        this._playTone('triangle', 400, 800, 0.4, 0.08);
        this._playTone('sine', 500, 1000, 0.3, 0.06);
        this._playNoise(0.3, 0.06, 2000);
        break;
      case 'boss_dragon':
        // 龙王：龙啸 + 火焰呼吸
        this._playTone('sawtooth', 150, 80, 0.6, 0.15);
        this._playNoise(0.5, 0.12, 1500);
        this._playTone('sawtooth', 200, 100, 0.4, 0.1);
        break;
      case 'boss_phantom':
        // 幽灵领主：幽灵低语 + 空间扭曲
        this._playTone('sine', 200, 150, 0.7, 0.1);
        this._playTone('triangle', 150, 100, 0.6, 0.08);
        this._playNoise(0.4, 0.06, 800);
        break;
      case 'boss_void':
        // 虚空领主：虚空坍缩 + 次元撕裂
        this._playTone('sine', 80, 30, 1.0, 0.18);
        this._playTone('triangle', 120, 40, 0.8, 0.12);
        this._playNoise(0.6, 0.1, 600);
        this._playTone('sawtooth', 200, 50, 0.5, 0.1);
        break;
      default:
        // 通用Boss出场
        this.playBossWarning();
        break;
    }
  },

  // ─── RESUME (user gesture recovery) ─────────────────────────
  resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }
}

// Export singleton
window.audio = new AudioManager();
