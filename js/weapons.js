/**
 * STG Weapon System - WeaponManager
 * Manages weapon state, fire rate timing, stat modifiers, and bullet pattern dispatch.
 *
 * Depends on:
 *   config.js  → window.GAME_CONFIG (weapon configs)
 *   core.js    → window.game (game state, entity pools)
 *   bullets.js → window.BulletPatterns (bullet pattern functions)
 *
 * Expected usage:
 *   game.player.weaponManager = new WeaponManager(game.player);
 *   In player.update(dt): this.weaponManager.update(dt);
 */

// ============================================================
//  REGISTER MISSING FUSED WEAPON CONFIGS (10 weapons)
//  Called once at load time. Adds configs to GAME_CONFIG.WEAPONS
//  for fused weapons defined in FUSION_RECIPES but missing from WEAPONS.
// ============================================================
(function registerFusedWeapons() {
  var W = GAME_CONFIG.WEAPONS;
  if (!W) return;

  if (!W.plagueFlame) {
    W.plagueFlame = {
      id: 'plagueFlame', name: '瘟疫火焰', icon: '☣️', rarity: 'legendary', fused: true,
      description: '穿透毒焰，灼烧并持续中毒',
      pattern: 'plagueFlame', fireRate: 60, damage: 5, bulletSpeed: 400, bulletSize: 6,
      pierceCount: 3, burnDamage: 8, burnDuration: 3000, poisonDamage: 6, poisonDuration: 3500, flameLength: 200,
      bulletColor: '#ccff44', trailColor: '#88cc22',
    };
  }
  if (!W.thunderIce) {
    W.thunderIce = {
      id: 'thunderIce', name: '雷暴冰暴', icon: '🌨️', rarity: 'legendary', fused: true,
      description: '冰冻连锁闪电',
      pattern: 'thunderIce', fireRate: 500, damage: 16, bulletSpeed: 600, bulletSize: 3,
      chainCount: 4, chainRange: 160, slowAmount: 0.5, slowDuration: 2500, shatterDamage: 35, shatterRadius: 90,
      bulletColor: '#aaffff', trailColor: '#66ddff',
    };
  }
  if (!W.deathStorm) {
    W.deathStorm = {
      id: 'deathStorm', name: '死亡风暴', icon: '💀', rarity: 'legendary', fused: true,
      description: '旋转追踪飞刃群',
      pattern: 'deathStorm', fireRate: 600, damage: 15, bulletSpeed: 380, bulletSize: 5,
      missileCount: 4, homingStrength: 0.06, homingRange: 400, spinSpeed: 6, pierceCount: 3,
      bulletColor: '#ddaa44', trailColor: '#aa7722',
    };
  }
  if (!W.singularityBeam) {
    W.singularityBeam = {
      id: 'singularityBeam', name: '奇点投射', icon: '🕳️', rarity: 'legendary', fused: true,
      description: '黑洞光束',
      pattern: 'singularityBeam', fireRate: 500, damage: 10, bulletSpeed: 350, bulletSize: 5,
      wellRadius: 120, wellDuration: 3500, pullForce: 100, wellDamage: 12,
      riftDuration: 3500, riftDamage: 15, riftRadius: 80, executeThreshold: 0.12,
      bulletColor: '#6600aa', trailColor: '#440066',
    };
  }
  if (!W.clusterBomb) {
    W.clusterBomb = {
      id: 'clusterBomb', name: '集束炸弹', icon: '💣', rarity: 'legendary', fused: true,
      description: '引力聚爆火箭',
      pattern: 'clusterBomb', fireRate: 800, damage: 30, bulletSpeed: 300, bulletSize: 7,
      missileCount: 3, explosionRadius: 85, homingStrength: 0.04, homingRange: 350,
      wellRadius: 90, pullForce: 70,
      bulletColor: '#cc6644', trailColor: '#994422',
    };
  }
  if (!W.elementCannon) {
    W.elementCannon = {
      id: 'elementCannon', name: '元素炮', icon: '🌈', rarity: 'legendary', fused: true,
      description: '冰火交替元素弹',
      pattern: 'elementCannon', fireRate: 350, damage: 18, bulletSpeed: 500, bulletSize: 4,
      burnDamage: 7, burnDuration: 2000, slowAmount: 0.4, slowDuration: 2000,
      shatterDamage: 25, shatterRadius: 70,
      bulletColor: '#ff8844', trailColor: '#44aaff',
    };
  }
  if (!W.thunderMissile) {
    W.thunderMissile = {
      id: 'thunderMissile', name: '雷鸣导弹', icon: '⚡', rarity: 'legendary', fused: true,
      description: '闪电连锁追踪导弹',
      pattern: 'thunderMissile', fireRate: 700, damage: 28, bulletSpeed: 320, bulletSize: 6,
      missileCount: 3, homingStrength: 0.05, homingRange: 380, explosionRadius: 75,
      chainCount: 3, chainRange: 140,
      bulletColor: '#ffff66', trailColor: '#ffaa22',
    };
  }
  if (!W.gravityBlade) {
    W.gravityBlade = {
      id: 'gravityBlade', name: '重力飞刃', icon: '🌀', rarity: 'legendary', fused: true,
      description: '引力回旋飞刃',
      pattern: 'gravityBlade', fireRate: 550, damage: 24, bulletSpeed: 380, bulletSize: 5,
      spinSpeed: 7, pierceCount: 4, range: 360, wellRadius: 80, pullForce: 60,
      bulletColor: '#bbaaee', trailColor: '#8866cc',
    };
  }
  if (!W.voidRocket) {
    W.voidRocket = {
      id: 'voidRocket', name: '虚空火箭', icon: '🚀', rarity: 'legendary', fused: true,
      description: '虚空爆炸火箭',
      pattern: 'voidRocket', fireRate: 750, damage: 35, bulletSpeed: 300, bulletSize: 7,
      missileCount: 3, homingStrength: 0.04, homingRange: 350, explosionRadius: 80,
      riftDuration: 3000, riftDamage: 10, riftRadius: 70, executeThreshold: 0.1,
      bulletColor: '#8822cc', trailColor: '#5500aa',
    };
  }
  if (!W.photonNeedle) {
    W.photonNeedle = {
      id: 'photonNeedle', name: '光子针', icon: '💡', rarity: 'legendary', fused: true,
      description: '超高速光子穿透针',
      pattern: 'photonNeedle', fireRate: 90, damage: 5, bulletSpeed: 1400, bulletSize: 1.5,
      bulletCount: 3, pierceCount: 4, beamWidth: 4,
      bulletColor: '#ffffff', trailColor: '#ccccff',
    };
  }

  // ---- 新增融合武器配置 (10种) ----
  if (!W.venomFlame) {
    W.venomFlame = {
      id: 'venomFlame', name: '雷焰喷射', icon: '🔥', rarity: 'legendary', fused: true,
      description: '闪电灼烧火焰',
      pattern: 'venomFlame', fireRate: 55, damage: 6, bulletSpeed: 380, bulletSize: 7,
      flameLength: 200, flameAngle: 35, burnDamage: 8, burnDuration: 2500,
      chainCount: 2, chainRange: 100,
      bulletColor: '#ff8800', trailColor: '#ffaa44',
    };
  }
  if (!W.frostStorm) {
    W.frostStorm = {
      id: 'frostStorm', name: '冰霜风暴', icon: '❄️', rarity: 'legendary', fused: true,
      description: '冰冻旋转飞刃',
      pattern: 'frostStorm', fireRate: 500, damage: 14, bulletSpeed: 420, bulletSize: 5,
      spinSpeed: 7, pierceCount: 3, slowAmount: 0.45, slowDuration: 2500,
      shatterDamage: 30, shatterRadius: 80,
      bulletColor: '#aaddff', trailColor: '#88bbee',
    };
  }
  if (!W.thunderShock) {
    W.thunderShock = {
      id: 'thunderShock', name: '雷霆冲击', icon: '⚡', rarity: 'legendary', fused: true,
      description: '链式电弧波动',
      pattern: 'thunderShock', fireRate: 650, damage: 20, bulletSpeed: 500, bulletSize: 4,
      chainCount: 3, chainRange: 140, waveAmplitude: 3, waveFrequency: 0.05,
      stunDuration: 500,
      bulletColor: '#88ffaa', trailColor: '#44dd88',
    };
  }
  if (!W.holyLight) {
    W.holyLight = {
      id: 'holyLight', name: '圣光洗礼', icon: '✨', rarity: 'legendary', fused: true,
      description: '追踪穿透圣光',
      pattern: 'holyLight', fireRate: 400, damage: 18, bulletSpeed: 600, bulletSize: 4,
      homingStrength: 0.06, homingRange: 400, pierceCount: 3,
      bulletColor: '#ffffcc', trailColor: '#ffeeaa',
    };
  }
  if (!W.shadowNeedle) {
    W.shadowNeedle = {
      id: 'shadowNeedle', name: '暗影飞针', icon: '🌑', rarity: 'legendary', fused: true,
      description: '高速暗影飞针',
      pattern: 'shadowNeedle', fireRate: 100, damage: 6, bulletSpeed: 1000, bulletSize: 2,
      bulletCount: 4, pierceCount: 3, spinSpeed: 6,
      bulletColor: '#8888cc', trailColor: '#6666aa',
    };
  }
  if (!W.electricWave) {
    W.electricWave = {
      id: 'electricWave', name: '电磁波', icon: '🌊', rarity: 'legendary', fused: true,
      description: '电磁波动冲击',
      pattern: 'electricWave', fireRate: 550, damage: 16, bulletSpeed: 480, bulletSize: 4,
      waveAmplitude: 4, waveFrequency: 0.06, chainCount: 2, chainRange: 120,
      bulletColor: '#66ffaa', trailColor: '#44dd88',
    };
  }
  if (!W.napalm) {
    W.napalm = {
      id: 'napalm', name: '凝固汽油弹', icon: '💥', rarity: 'legendary', fused: true,
      description: '燃烧爆炸弹',
      pattern: 'napalm', fireRate: 800, damage: 32, bulletSpeed: 350, bulletSize: 7,
      explosionRadius: 80, burnDamage: 10, burnDuration: 3000, flamePoolRadius: 50,
      bulletColor: '#ff6644', trailColor: '#ff4400',
    };
  }
  if (!W.photonTracker) {
    W.photonTracker = {
      id: 'photonTracker', name: '光子追踪', icon: '🎯', rarity: 'legendary', fused: true,
      description: '自动追踪激光',
      pattern: 'photonTracker', fireRate: 350, damage: 12, bulletSpeed: 800, bulletSize: 3,
      homingStrength: 0.07, homingRange: 450, beamWidth: 4,
      bulletColor: '#ff88ff', trailColor: '#cc66cc',
    };
  }
  if (!W.scatterSatellite) {
    W.scatterSatellite = {
      id: 'scatterSatellite', name: '散射卫星', icon: '🛰️', rarity: 'legendary', fused: true,
      description: '散射浮游炮',
      pattern: 'scatterSatellite', fireRate: 500, damage: 7, bulletSpeed: 450, bulletSize: 3,
      orbitRadius: 75, orbitSpeed: 2.5, orbitCount: 3, bulletCount: 3, spreadAngle: 20,
      bulletColor: '#ddbb88', trailColor: '#bb9966',
    };
  }
  if (!W.piercingExplosive) {
    W.piercingExplosive = {
      id: 'piercingExplosive', name: '穿甲爆弹', icon: '🗡️', rarity: 'legendary', fused: true,
      description: '穿透后爆炸',
      pattern: 'piercingExplosive', fireRate: 750, damage: 25, bulletSpeed: 550, bulletSize: 5,
      pierceCount: 2, explosionRadius: 70, explosionDamage: 20,
      bulletColor: '#ffcccc', trailColor: '#ff8888',
    };
  }

  // ---- 新增常规武器配置 (10种) ----
  if (!W.splitter) {
    W.splitter = {
      id: 'splitter', name: '分裂弹', icon: '🔮', rarity: 'rare', fused: false,
      description: '命中后分裂出追踪碎片',
      pattern: 'splitter', fireRate: 600, damage: 16, bulletSpeed: 420, bulletSize: 5,
      pierceCount: 2,
      bulletColor: '#dd88ff', trailColor: '#9944cc',
    };
  }
  if (!W.bouncer) {
    W.bouncer = {
      id: 'bouncer', name: '弹射弹', icon: '🏓', rarity: 'uncommon', fused: false,
      description: '在敌人之间弹射，伤害递增',
      pattern: 'bouncer', fireRate: 500, damage: 10, bulletSpeed: 500, bulletSize: 4,
      chainCount: 4, chainRange: 150, chainDamageFalloff: -0.15,
      bulletColor: '#44ffcc', trailColor: '#22aa88',
    };
  }
  if (!W.shockRing) {
    W.shockRing = {
      id: 'shockRing', name: '冲击环', icon: '💫', rarity: 'rare', fused: false,
      description: '扩散冲击环推开敌人',
      pattern: 'shockRing', fireRate: 700, damage: 20, bulletSpeed: 300, bulletSize: 3,
      ringCount: 12,
      bulletColor: '#ffffff', trailColor: '#ccccff',
    };
  }
  if (!W.growing) {
    W.growing = {
      id: 'growing', name: '成长弹', icon: '🔴', rarity: 'uncommon', fused: false,
      description: '飞行越远体型越大伤害越高',
      pattern: 'growing', fireRate: 550, damage: 10, bulletSpeed: 350, bulletSize: 3,
      growingScale: 1.6,
      bulletColor: '#ff4444', trailColor: '#cc0000',
    };
  }
  if (!W.warpNeedle) {
    W.warpNeedle = {
      id: 'warpNeedle', name: '跃迁针', icon: '〰️', rarity: 'epic', fused: false,
      description: '跃迁瞬移穿透路径敌人',
      pattern: 'warp', fireRate: 400, damage: 12, bulletSpeed: 600, bulletSize: 2,
      pierceCount: 5,
      bulletColor: '#00ffcc', trailColor: '#008866',
    };
  }
  if (!W.mirrorCannon) {
    W.mirrorCannon = {
      id: 'mirrorCannon', name: '镜像炮', icon: '🪞', rarity: 'rare', fused: false,
      description: '向两侧对称发射弹幕',
      pattern: 'mirror', fireRate: 450, damage: 9, bulletSpeed: 480, bulletSize: 3,
      spreadAngle: 90,
      bulletColor: '#88ddff', trailColor: '#88ddff',
    };
  }
  if (!W.ringNova) {
    W.ringNova = {
      id: 'ringNova', name: '星环碎裂', icon: '💍', rarity: 'epic', fused: false,
      description: '光环扩散后碎裂为追踪碎片',
      pattern: 'ringNova', fireRate: 900, damage: 14, bulletSpeed: 250, bulletSize: 4,
      ringCount: 10, homingStrength: 0.05, homingRange: 350,
      bulletColor: '#ff88dd', trailColor: '#cc44aa',
    };
  }
  if (!W.plasmaWeb) {
    W.plasmaWeb = {
      id: 'plasmaWeb', name: '等离子网', icon: '🕸️', rarity: 'uncommon', fused: false,
      description: '子弹间形成链接构建等离子网',
      pattern: 'plasmaWeb', fireRate: 350, damage: 6, bulletSpeed: 380, bulletSize: 3,
      webCount: 5, chainCount: 3, chainRange: 130,
      bulletColor: '#44ff44', trailColor: '#22aa22',
    };
  }
  if (!W.implosion) {
    W.implosion = {
      id: 'implosion', name: '坍缩星', icon: '💥', rarity: 'legendary', fused: false,
      description: '引力井吸入后坍缩爆炸',
      pattern: 'implosion', fireRate: 1200, damage: 15, bulletSpeed: 200, bulletSize: 10,
      wellRadius: 130, pullForce: 100, explosionRadius: 90, executeThreshold: 0.1,
      bulletColor: '#ff6644', trailColor: '#cc3300',
    };
  }
  if (!W.vitalChain) {
    W.vitalChain = {
      id: 'vitalChain', name: '生命链', icon: '💚', rarity: 'rare', fused: false,
      description: '连锁闪电每次弹射回复生命',
      pattern: 'vitalChain', fireRate: 650, damage: 16, bulletSpeed: 1000, bulletSize: 2,
      chainCount: 5, chainRange: 160, lifestealPercent: 0.1,
      bulletColor: '#44ff88', trailColor: '#22cc44',
    };
  }
})();

// Repair corrupted weapon stats from old bug (chainDamage stacked on GAME_CONFIG each fire)
(function repairWeaponConfigDrift() {
  var W = GAME_CONFIG && GAME_CONFIG.WEAPONS;
  if (!W) return;
  var caps = { chainDamage: 2.5, pierceCount: 15, bounceCount: 8 };
  for (var id in W) {
    if (!W.hasOwnProperty(id)) continue;
    var w = W[id];
    if (w.chainDamage !== undefined && w.chainDamage > caps.chainDamage) {
      w.chainDamage = Math.min(w.chainDamage, caps.chainDamage);
      if (w.chainCount >= 4) w.chainDamage = 0.5;
    }
    if (w.pierceCount > caps.pierceCount) w.pierceCount = caps.pierceCount;
    if (w.bounceCount > caps.bounceCount) w.bounceCount = caps.bounceCount;
  }
})();

class WeaponManager {
  /**
   * @param {object} player - the Player entity this weapon manager is attached to
   */
  constructor(player) {
    this.player = player;

    var maxWeapon = GAME_CONFIG.BALANCE.MAX_WEAPON_SLOTS || 6;
    var maxPassive = GAME_CONFIG.BALANCE.MAX_PASSIVE_SLOTS || 6;
    this.maxWeaponSlots = maxWeapon;
    this.maxPassiveSlots = maxPassive;

    /** @type {Array<{weaponId:string, level:number, fireTimer:number}>} */
    this.weaponSlots = new Array(GAME_CONFIG.BALANCE.MAX_WEAPON_SLOT_TOTAL || 8).fill(null);
    /** @type {Array<{weaponId:string, level:number}>} */
    this.passiveSlots = new Array(GAME_CONFIG.BALANCE.MAX_PASSIVE_SLOT_TOTAL || 8).fill(null);
    /** @type {OrbitalDrone[]} active orbital drone entities */
    this.orbitals = [];

    // B6: Quick-switch focused weapon slot (-1 = none focused)
    this.focusedSlot = -1;

    // DPS tracking: weaponId -> totalDamage
    this._dpsData = {};
  }

  /**
   * Reset DPS tracking data (called on new game).
   */
  resetDpsData() {
    this._dpsData = {};
  }

  /**
   * Record damage dealt by a weapon for DPS stats panel.
   * @param {string} weaponId
   * @param {number} amount
   */
  recordDamage(weaponId, amount) {
    if (!this._dpsData[weaponId]) this._dpsData[weaponId] = 0;
    this._dpsData[weaponId] += amount;
  }

  // ============================================================
  //  BACKWARD-COMPATIBLE GETTER
  // ============================================================

  /**
   * Returns the first equipped weapon ID, or 'normal' if no weapons equipped.
   * @returns {string}
   */
  get currentWeapon() {
    for (var i = 0; i < this.weaponSlots.length; i++) {
      if (this.weaponSlots[i]) return this.weaponSlots[i].weaponId;
    }
    return 'normal';
  }

  // ============================================================
  //  WEAPON SLOT MANAGEMENT
  // ============================================================

  /**
   * Find the index of the first empty weapon slot.
   * @returns {number} -1 if all slots full
   */
  _findEmptySlot() {
    var limit = this.maxWeaponSlots || this.weaponSlots.length;
    for (var i = 0; i < Math.min(limit, this.weaponSlots.length); i++) {
      if (!this.weaponSlots[i]) return i;
    }
    return -1;
  }

  /**
   * Assign a weapon to the first empty slot.
   * If the weapon is already equipped in a slot, returns that slot index.
   * @param {string} weaponId - key in GAME_CONFIG.WEAPONS
   * @returns {number} slot index, or -1 if failed
   */
  setWeapon(weaponId) {
    var cfg = GAME_CONFIG.WEAPONS[weaponId];
    if (!cfg) return -1;

    // Check if already equipped
    for (var i = 0; i < this.weaponSlots.length; i++) {
      if (this.weaponSlots[i] && this.weaponSlots[i].weaponId === weaponId) {
        return i;
      }
    }

    var idx = this._findEmptySlot();
    if (idx === -1) return -1;

    this.weaponSlots[idx] = {
      weaponId: weaponId,
      level: 1,
      fireTimer: 0
    };

    // Setup orbital state for orbital-type weapons
    if (weaponId === 'orbital' || weaponId === 'teslaOrbital') {
      this._initOrbitals(weaponId);
    }

    return idx;
  }

  /**
   * Assign a weapon to a specific slot index.
   * When weaponId is null, simply marks the slot as usable (empty) — called by
   * SkillManager._assignSlot('weapon') for slot expansion.
   * @param {string|null} weaponId
   * @param {number} slotIndex
   * @returns {boolean} success
   */
  addWeaponToSlot(weaponId, slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.weaponSlots.length) return false;

    // null weaponId = just mark slot as unlocked (empty slot)
    if (weaponId === null) {
      this.weaponSlots[slotIndex] = null;
      return true;
    }

    var cfg = GAME_CONFIG.WEAPONS[weaponId];
    if (!cfg) return false;

    this.weaponSlots[slotIndex] = {
      weaponId: weaponId,
      level: 1,
      fireTimer: 0
    };

    if (weaponId === 'orbital' || weaponId === 'teslaOrbital') {
      this._initOrbitals(weaponId);
    }
    return true;
  }

  /**
   * Remove the weapon at the given slot index.
   * @param {number} slotIndex
   * @returns {boolean} success
   */
  removeWeaponFromSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.weaponSlots.length) return false;
    var slot = this.weaponSlots[slotIndex];
    if (!slot) return false;

    if (slot.weaponId === 'orbital' || slot.weaponId === 'teslaOrbital') {
      this._cleanupOrbitals();
    }

    this.weaponSlots[slotIndex] = null;
    return true;
  }

  /**
   * Check if a specific weapon is equipped in any slot.
   * @param {string} weaponId
   * @returns {boolean}
   */
  hasWeapon(weaponId) {
    for (var i = 0; i < this.weaponSlots.length; i++) {
      if (this.weaponSlots[i] && this.weaponSlots[i].weaponId === weaponId) return true;
    }
    return false;
  }

  /**
   * Get slot data for UI display.
   * Returns array of objects with index, weaponId, level, name, icon, description.
   * @returns {Array<object|null>}
   */
  getSlots() {
    return this.weaponSlots.map(function(slot, index) {
      if (!slot) return null;
      var cfg = GAME_CONFIG.WEAPONS[slot.weaponId];
      return {
        index: index,
        weaponId: slot.weaponId,
        level: slot.level,
        name: cfg ? cfg.name : slot.weaponId,
        icon: cfg ? (cfg.icon || '🔫') : '🔫',
        description: cfg ? cfg.description : ''
      };
    });
  }

  // B6: Quick-switch — set/clear focused weapon slot
  /**
   * Set the focused weapon slot (0-based index, -1 to clear).
   * @param {number} slotIndex - slot index to focus, or -1 to unfocus
   */
  setFocusedSlot(slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.weaponSlots.length && this.weaponSlots[slotIndex]) {
      this.focusedSlot = slotIndex;
    } else {
      this.focusedSlot = -1;
    }
  }

  /**
   * Get the currently focused slot index.
   * @returns {number} -1 if none focused
   */
  getFocusedSlot() {
    return this.focusedSlot;
  }

  /**
   * Toggle focus on a slot (press same number again to unfocus).
   * @param {number} slotIndex
   */
  toggleFocusedSlot(slotIndex) {
    if (this.focusedSlot === slotIndex) {
      this.focusedSlot = -1;
    } else {
      this.setFocusedSlot(slotIndex);
    }
  }

  // ============================================================
  //  MAIN UPDATE LOOP — iterates ALL weapon slots independently
  // ============================================================

  /**
   * Called every frame from player.update().
   * Accumulates fire timer for each weapon slot and fires independently.
   * @param {number} dt - delta time in seconds
   */
  update(dt) {
    var stats = this._getStats();
    var dtMs = dt * 1000;
    var hasOrbital = false;

    for (var i = 0; i < this.weaponSlots.length; i++) {
      var slot = this.weaponSlots[i];
      if (!slot) continue;

      var cfg = GAME_CONFIG.WEAPONS[slot.weaponId];
      if (!cfg) continue;

      // Orbital weapons fire via their own independent drone system
      if (slot.weaponId === 'orbital' || slot.weaponId === 'teslaOrbital') {
        hasOrbital = true;
        continue;
      }

      // Standard weapons: compute effective fire rate for THIS weapon
      var effectiveFireRate = cfg.fireRate * (stats.attackSpeed || 1);
      if (stats.cooldownReduction && stats.cooldownReduction > 0) {
        effectiveFireRate *= (1 - Math.min(stats.cooldownReduction, 0.9));
      }
      var skillMgr = this._getSkillManager();
      if (skillMgr) {
        effectiveFireRate *= skillMgr.getWeaponFireRateMult(slot.weaponId);
      }
      // B6: Quick-switch — focused weapon gets +30% fire rate bonus (multiply by ~0.769 for 30% faster)
      if (this.focusedSlot === i) {
        effectiveFireRate /= 1.3;
      }
      if (effectiveFireRate < 30) effectiveFireRate = 30;

      // Each slot has its own independent fire timer
      slot.fireTimer += dtMs;

      while (slot.fireTimer >= effectiveFireRate) {
        slot.fireTimer -= effectiveFireRate;
        this._fireWeapon(slot.weaponId, cfg, stats);
      }
    }

    // Update orbital drones once if any slot has an orbital weapon
    if (hasOrbital && this.orbitals.length > 0) {
      this._updateOrbitals(dt, stats);
    }
  }

  // ============================================================
  //  FACTION BULLET MODIFIERS
  // ============================================================

  /**
   * Get faction-specific modifiers to apply to every fired bullet.
   * Called by _fireWeapon to augment bullets based on player's faction.
   * @param {string} factionId
   * @returns {object|null} modifier properties, or null
   */
  _getFactionBulletModifiers(factionId) {
    if (window.FACTION_BULLET_MODS && window.FACTION_BULLET_MODS[factionId]) {
      return window.FACTION_BULLET_MODS[factionId];
    }
    return null;
  }

  // ============================================================
  //  CORE FIRE — per-weapon pattern dispatch (extracted from old fire())
  // ============================================================

  /**
   * Fire a specific weapon by its config ID.
   * @param {string} weaponId
   * @param {object} cfg - weapon config
   * @param {object} stats - player stats
   */
  _fireWeapon(weaponId, cfg, stats) {
    if (!cfg) {
      cfg = GAME_CONFIG.WEAPONS[weaponId];
      if (!cfg) return;
    }
    if (!stats) stats = this._getStats();

    // Fire-time copy — never mutate GAME_CONFIG.WEAPONS (chainDamage was stacking → freeze)
    var baseCfg = cfg;
    cfg = Object.assign({}, baseCfg);

    var x = this.player ? this.player.x : 0;
    var y = this.player ? this.player.y : 0;

    // Stat-modified values
    var dmg = (cfg.damage || 1) * (stats.attack || 1);
    var skillMgr = this._getSkillManager();
    if (skillMgr) {
      dmg *= skillMgr.getWeaponDamageMult(weaponId);
    }
    var spd = (cfg.bulletSpeed || 400) * (stats.bulletSpeed || 1);
    var size = (cfg.bulletSize || 3) * (stats.bulletSize || 1);
    // Faction-specific bullet color: weapon color tinted by faction color
    var factionColor = (this.player && this.player.factionColor) ? this.player.factionColor : null;
    var color = cfg.bulletColor || factionColor || '#ffffff';
    var trail = cfg.trailColor || color;

    // === FACTION BULLET MODIFIERS ===
    var playerFactionId = (this.player && this.player.factionId) ? this.player.factionId : null;
    var factionMods = this._getFactionBulletModifiers(playerFactionId);
    if (factionMods) {
      if (factionMods.chainCount !== undefined)    cfg.chainCount    = Math.max(cfg.chainCount    || 0, factionMods.chainCount);
      if (factionMods.chainRange !== undefined)    cfg.chainRange    = Math.max(cfg.chainRange    || 0, factionMods.chainRange);
      if (factionMods.chainDamage !== undefined)   cfg.chainDamage   = (baseCfg.chainDamage || 0.5) + (factionMods.chainDamage || 0);
      if (factionMods.slowAmount !== undefined)    cfg.slowAmount    = Math.max(cfg.slowAmount    || 0, factionMods.slowAmount);
      if (factionMods.slowDuration !== undefined)  cfg.slowDuration  = Math.max(cfg.slowDuration  || 0, factionMods.slowDuration);
      if (factionMods.freezeChance !== undefined)  cfg.freezeChance  = Math.max(cfg.freezeChance  || 0, factionMods.freezeChance);
      if (factionMods.burnDamage !== undefined)    cfg.burnDamage    = Math.max(cfg.burnDamage    || 0, factionMods.burnDamage);
      if (factionMods.burnDuration !== undefined)  cfg.burnDuration  = Math.max(cfg.burnDuration  || 0, factionMods.burnDuration);
      if (factionMods.poisonDamage !== undefined)  cfg.poisonDamage  = Math.max(cfg.poisonDamage  || 0, factionMods.poisonDamage);
      if (factionMods.poisonDuration !== undefined) cfg.poisonDuration = Math.max(cfg.poisonDuration || 0, factionMods.poisonDuration);
      if (factionMods.executeThreshold !== undefined) cfg.executeThreshold = factionMods.executeThreshold;
      if (factionMods.pierceCount !== undefined)   cfg.pierceCount   = Math.max(cfg.pierceCount   || 0, factionMods.pierceCount);
      if (factionMods.bounceCount !== undefined)   cfg.bounceCount   = Math.max(cfg.bounceCount   || 0, factionMods.bounceCount);
      if (factionMods.bounceRetention !== undefined) cfg.bounceRetention = factionMods.bounceRetention;
    }
    // Store pending faction data so BulletPatterns._create can inject them into each bullet
    window._pendingFactionMods = factionMods;
    window._pendingFactionId = playerFactionId;
    window._pendingWeaponId = weaponId;
    window._pendingWeaponCfg = cfg;
    var _patternElements = {
      iceShard: 'ice', frostCannon: 'ice', frostMine: 'ice', frostStorm: 'ice',
      frostMissile: 'ice', thunderIce: 'ice', stormBlade: 'ice',
      lightningBolt: 'lightning', chainLightningGun: 'lightning', electricWave: 'lightning',
      lightningGun: 'lightning', arc: 'lightning', teslaField: 'lightning', thunderShock: 'lightning',
      flame: 'fire', flameThrower: 'fire', flamePuddle: 'fire', rocketBarrage: 'fire',
      magmaCannon: 'fire', venomFlame: 'fire', iceFlame: 'fire',
      venomGun: 'poison', acidSplash: 'poison', plagueFlame: 'poison'
    };
    window._pendingWeaponElement = cfg.element || _patternElements[weaponId] || _patternElements[cfg.pattern] || null;

    // === RANDOM ELEMENTS ===
    var critChance = (stats.critRate || 0) + 0.10;
    var isCrit = Math.random() < critChance;
    if (isCrit) {
      dmg *= (stats.critMult || 2.0);
      size *= 1.5;
      color = '#ffff00';
      trail = '#ffaa00';
    }

    var bulletCount = cfg.bulletCount || 5;
    if (cfg.pattern === 'spread') {
      bulletCount = Math.max(3, bulletCount + Math.floor(Math.random() * 5) - 2);
    }

    // Track DPS stats: record this weapon's damage output
    var trackBullets = bulletCount;
    if (cfg.pattern === 'rocketBarrage') trackBullets = cfg.rocketCount || 5;
    this.recordDamage(weaponId, dmg * trackBullets);

    var homingStrength = cfg.homingStrength || 0.05;
    if (cfg.pattern === 'homing' && Math.random() < 0.05) {
      homingStrength *= 2;
      color = '#ff44ff';
      trail = '#cc22cc';
    }

    var B = window.BulletPatterns;
    var angleUp = -Math.PI / 2;

    if (this.player && this.player._autoShootTarget) {
      var tgt = this.player._autoShootTarget;
      if (tgt.active) {
        angleUp = Math.atan2(tgt.y - y, tgt.x - x);
      }
    }

    switch (cfg.pattern) {

      case 'normal':
        if (B) B.normal(x, y, angleUp, spd, dmg, color, trail);
        break;

      case 'spread':
        if (B) B.spread(x, y, bulletCount, cfg.spreadAngle || 25, spd, dmg, color, trail);
        break;

      case 'homing':
        if (B) {
          var nearest = this._findNearestEnemy(x, y, cfg.homingRange || 300);
          B.homing(x, y, spd, dmg, color, trail, nearest, homingStrength);
        }
        break;

      case 'laser':
        if (B) B.laser(x, y, spd, dmg, color, trail);
        break;

      case 'orbital':
        break;

      case 'arc':
        this._fireArc(cfg, x, y, dmg, color, trail);
        break;

      case 'boomerang':
        if (B) B.boomerang(x, y, angleUp, spd, cfg.range || 350, dmg, color, trail);
        break;

      case 'pierce':
        if (B) B.pierce(x, y, angleUp, spd, dmg, cfg.pierceCount || 3, color, trail);
        break;

      case 'explosive':
        if (B) B.explosive(x, y, angleUp, spd, dmg, cfg.explosionRadius || 70, color, trail);
        break;

      case 'wave':
        if (B) B.wave(x, y, angleUp, spd, dmg, cfg.waveAmplitude || 3, cfg.waveFrequency || 0.06, color, trail);
        break;

      case 'gravityWell':
        if (B) B.gravityWell(x, y, angleUp, spd, dmg, cfg.wellRadius || 100, cfg.pullForce || 80, color, trail);
        break;

      case 'voidRift':
        if (B) B.voidRift(x, y, angleUp, spd, dmg, cfg.executeThreshold || 0.1, color, trail);
        break;

      case 'missile':
        if (B) B.missile(x, y, angleUp, spd, dmg, cfg.homingStrength || 0.04, cfg.explosionRadius || 80, color, trail);
        break;

      case 'needle':
        if (B) B.needle(x, y, angleUp, spd, dmg, color, trail);
        break;

      case 'flame':
        if (B) B.flame(x, y, angleUp, spd, dmg, cfg.flameLength || 180, color, trail);
        break;

      case 'shuriken':
        if (B) B.shuriken(x, y, angleUp, spd, dmg, cfg.spinSpeed || 8, cfg.pierceCount || 5, color, trail);
        break;

      case 'lightningBolt':
        if (B) B.lightningBolt(x, y, angleUp, spd, dmg, cfg.chainCount || 4, cfg.chainRange || 150, color, trail);
        break;

      case 'iceShard':
        if (B) B.iceShard(x, y, angleUp, spd, dmg, cfg.slowAmount || 0.4, cfg.slowDuration || 2000, color, trail);
        break;

      case 'rocketBarrage':
        if (B) B.rocketBarrage(x, y, angleUp, spd, dmg, cfg.rocketCount || 5, cfg.explosionRadius || 90, cfg.spreadAngle || 30, color, trail);
        break;

      case 'photonBeam':
        if (B) B.photonBeam(x, y, angleUp, spd, dmg, cfg.beamWidth || 8, color, trail);
        break;

      case 'plasmaGun':
        if (B) B.plasmaGun(x, y, angleUp, spd, dmg, cfg.pierceCount || 2, color, trail);
        break;

      case 'smartSpread':
        if (B) B.smartSpread(x, y, cfg.bulletCount || 5, cfg.spreadAngle || 30, spd, dmg, color, trail, cfg.homingStrength || 0.04, cfg.homingRange || 350);
        break;

      case 'teslaOrbital':
        break;

      case 'phantomBlade':
        if (B) B.phantomBlade(x, y, angleUp, spd, cfg.range || 380, dmg, cfg.pierceCount || 4, color, trail);
        break;

      case 'shockwaveWep':
        if (B) B.shockwaveWep(x, y, angleUp, spd, dmg, cfg.waveAmplitude || 4, cfg.waveFrequency || 0.05, cfg.explosionRadius || 55, color, trail);
        break;

      case 'plagueFlame':
        if (B) B.plagueFlame(x, y, angleUp, spd, dmg, cfg.flameLength || 200, cfg.pierceCount || 3, cfg.burnDamage || 8, cfg.poisonDamage || 6, cfg.poisonDuration || 3500, color, trail);
        break;

      case 'thunderIce':
        if (B) B.thunderIce(x, y, angleUp, spd, dmg, cfg.chainCount || 4, cfg.chainRange || 160, cfg.slowAmount || 0.5, cfg.slowDuration || 2500, color, trail);
        break;

      case 'deathStorm':
        if (B) B.deathStorm(x, y, angleUp, spd, dmg, cfg.missileCount || 4, cfg.homingStrength || 0.06, cfg.homingRange || 400, cfg.spinSpeed || 6, cfg.pierceCount || 3, color, trail);
        break;

      case 'singularityBeam':
        if (B) B.singularityBeam(x, y, angleUp, spd, dmg, cfg.wellRadius || 120, cfg.pullForce || 100, cfg.wellDamage || 12, cfg.executeThreshold || 0.12, color, trail);
        break;

      case 'clusterBomb':
        if (B) B.clusterBomb(x, y, angleUp, spd, dmg, cfg.missileCount || 3, cfg.explosionRadius || 85, cfg.homingStrength || 0.04, cfg.wellRadius || 90, cfg.pullForce || 70, color, trail);
        break;

      case 'elementCannon':
        if (B) B.elementCannon(x, y, angleUp, spd, dmg, cfg.burnDamage || 7, cfg.burnDuration || 2000, cfg.slowAmount || 0.4, cfg.slowDuration || 2000, color, trail);
        break;

      case 'thunderMissile':
        if (B) B.thunderMissile(x, y, angleUp, spd, dmg, cfg.missileCount || 3, cfg.homingStrength || 0.05, cfg.explosionRadius || 75, cfg.chainCount || 3, cfg.chainRange || 140, color, trail);
        break;

      case 'gravityBlade':
        if (B) B.gravityBlade(x, y, angleUp, spd, cfg.range || 360, dmg, cfg.spinSpeed || 7, cfg.pierceCount || 4, cfg.wellRadius || 80, cfg.pullForce || 60, color, trail);
        break;

      case 'voidRocket':
        if (B) B.voidRocket(x, y, angleUp, spd, dmg, cfg.missileCount || 3, cfg.homingStrength || 0.04, cfg.explosionRadius || 80, cfg.executeThreshold || 0.1, color, trail);
        break;

      case 'photonNeedle':
        if (B) B.photonNeedle(x, y, angleUp, spd, dmg, cfg.bulletCount || 3, cfg.pierceCount || 4, color, trail);
        break;

      case 'flameThrower':
        if (B) B.flameThrower(x, y, angleUp, spd, dmg, cfg.flameAngle || 50, cfg.flameCount || 5, cfg.burnDamage || 6, cfg.burnDuration || 2000, color, trail);
        break;

      case 'frostCannon':
        if (B) B.frostCannon(x, y, angleUp, spd, dmg, cfg.slowAmount || 0.5, cfg.slowDuration || 3000, color, trail);
        break;

      case 'lightningGun':
        if (B) B.lightningGun(x, y, angleUp, spd, dmg, cfg.chainCount || 5, cfg.chainRange || 200, color, trail);
        break;

      case 'rocketLauncher':
        if (B) B.rocketLauncher(x, y, angleUp, spd, dmg, cfg.explosionRadius || 100, color, trail);
        break;

      case 'mineLayer':
        if (B) B.mineLayer(x, y, angleUp, spd, dmg, cfg.explosionRadius || 80, cfg.mineCount || 3, color, trail);
        break;

      case 'energyWhip':
        if (B) B.energyWhip(x, y, angleUp, spd, dmg, cfg.whipCount || 8, color, trail);
        break;

      case 'sawBlade':
        if (B) B.sawBlade(x, y, angleUp, spd, dmg, cfg.spinSpeed || 12, cfg.pierceCount || 6, color, trail);
        break;

      case 'venomGun':
        if (B) B.venomGun(x, y, angleUp, spd, dmg, cfg.pierceCount || 2, cfg.poisonDamage || 8, cfg.poisonDuration || 3500, color, trail);
        break;

      case 'magnetGun':
        if (B) B.magnetGun(x, y, angleUp, spd, dmg, cfg.wellRadius || 150, cfg.pullForce || 120, color, trail);
        break;

      case 'blackHoleGen':
        if (B) B.blackHoleGen(x, y, angleUp, spd, dmg, cfg.wellRadius || 200, cfg.pullForce || 150, cfg.wellDamage || 15, cfg.executeThreshold || 0.15, color, trail);
        break;

      case 'venomFlame':
        if (B) B.venomFlame(x, y, angleUp, spd, dmg, cfg.flameLength || 200, cfg.pierceCount || 3, cfg.burnDamage || 8, color, trail);
        break;

      case 'frostStorm':
        if (B) B.frostStorm(x, y, angleUp, spd, dmg, cfg.spinSpeed || 7, cfg.pierceCount || 3, cfg.slowAmount || 0.45, cfg.slowDuration || 2500, color, trail);
        break;

      case 'thunderShock':
        if (B) B.thunderShock(x, y, angleUp, spd, dmg, cfg.chainCount || 3, cfg.chainRange || 140, cfg.waveAmplitude || 3, cfg.waveFrequency || 0.05, cfg.stunDuration || 500, color, trail);
        break;

      case 'holyLight':
        if (B) B.holyLight(x, y, angleUp, spd, dmg, cfg.homingStrength || 0.06, cfg.homingRange || 400, cfg.pierceCount || 3, color, trail);
        break;

      case 'shadowNeedle':
        if (B) B.shadowNeedle(x, y, angleUp, spd, dmg, cfg.bulletCount || 4, cfg.pierceCount || 3, cfg.spinSpeed || 6, color, trail);
        break;

      case 'electricWave':
        if (B) B.electricWave(x, y, angleUp, spd, dmg, cfg.waveAmplitude || 4, cfg.waveFrequency || 0.06, cfg.chainCount || 2, cfg.chainRange || 120, color, trail);
        break;

      case 'napalm':
        if (B) B.napalm(x, y, angleUp, spd, dmg, cfg.explosionRadius || 80, cfg.burnDamage || 10, cfg.burnDuration || 3000, cfg.flamePoolRadius || 50, color, trail);
        break;

      case 'photonTracker':
        if (B) B.photonTracker(x, y, angleUp, spd, dmg, cfg.homingStrength || 0.07, cfg.homingRange || 450, cfg.beamWidth || 4, color, trail);
        break;

      case 'scatterSatellite':
        if (B) B.scatterSatellite(x, y, angleUp, spd, dmg, cfg.orbitRadius || 75, cfg.orbitSpeed || 2.5, cfg.orbitCount || 3, cfg.bulletCount || 3, cfg.spreadAngle || 20, color, trail);
        break;

      case 'piercingExplosive':
        if (B) B.piercingExplosive(x, y, angleUp, spd, dmg, cfg.pierceCount || 2, cfg.explosionRadius || 70, cfg.explosionDamage || 20, color, trail);
        break;

      // ============ Beam Weapons ============
      case 'beamRifle':
        if (B) B.beamRifle(x, y, angleUp, spd, dmg, cfg.pierceCount || 3, cfg.beamWidth || 3, color, trail);
        break;

      case 'spreadBeam':
        if (B) B.spreadBeam(x, y, angleUp, cfg.bulletCount || 5, cfg.spreadAngle || 20, spd, dmg, color, trail);
        break;

      case 'pulseBeam':
        if (B) B.pulseBeam(x, y, angleUp, spd, dmg, cfg.pulseCount || 3, cfg.pulseInterval || 0.15, color, trail);
        break;

      case 'sniperBeam':
        if (B) B.sniperBeam(x, y, angleUp, spd, dmg, cfg.beamWidth || 2, color, trail);
        break;

      case 'crossBeam':
        if (B) B.crossBeam(x, y, angleUp, spd, dmg, cfg.beamCount || 5, color, trail);
        break;

      // ============ Projectile/Melee Weapons ============
      case 'buckshot':
        if (B) B.buckshot(x, y, angleUp, spd, dmg, cfg.pelletCount || 8, cfg.spreadAngle || 40, color, trail);
        break;

      case 'railgun':
        if (B) B.railgun(x, y, angleUp, spd, dmg, cfg.pierceCount || 10, color, trail);
        break;

      case 'slugRound':
        if (B) B.slugRound(x, y, angleUp, spd, dmg, color, trail);
        break;

      case 'plasmaCutter':
        if (B) B.plasmaCutter(x, y, angleUp, spd, dmg, cfg.cutCount || 3, cfg.cutAngle || 15, color, trail);
        break;

      case 'chainSaw':
        if (B) B.chainSaw(x, y, angleUp, spd, dmg, cfg.sawCount || 5, cfg.sawAngle || 60, cfg.pierceCount || 3, cfg.spinSpeed || 15, color, trail);
        break;

      // ============ Area/Summon Weapons ============
      case 'teslaField':
        if (B) B.teslaField(x, y, angleUp, spd, dmg, cfg.chainCount || 3, cfg.chainRange || 130, cfg.fieldDuration || 3000, color, trail);
        break;

      case 'flamePuddle':
        if (B) B.flamePuddle(x, y, angleUp, spd, dmg, cfg.puddleDuration || 2000, cfg.burnDamage || 6, cfg.burnDuration || 2000, color, trail);
        break;

      case 'frostMine':
        if (B) B.frostMine(x, y, angleUp, spd, dmg, cfg.mineCount || 3, cfg.explosionRadius || 70, cfg.slowAmount || 0.5, cfg.slowDuration || 2500, color, trail);
        break;

      case 'acidSplash':
        if (B) B.acidSplash(x, y, angleUp, spd, dmg, cfg.pierceCount || 1, cfg.poisonDamage || 6, cfg.poisonDuration || 3500, color, trail);
        break;

      case 'droneSwarm':
        if (B) B.droneSwarm(x, y, angleUp, spd, dmg, cfg.droneCount || 4, cfg.homingStrength || 0.06, cfg.homingRange || 350, color, trail);
        break;

      // ============ Special/Unique Weapons ============
      case 'bouncingBullet':
        if (B) B.bouncingBullet(x, y, angleUp, spd, dmg, cfg.bounceCount || 3, color, trail);
        break;

      case 'sonicWave':
        if (B) B.sonicWave(x, y, angleUp, spd, dmg, cfg.waveCount || 7, cfg.spreadAngle || 60, color, trail);
        break;

      case 'phaseBlade':
        if (B) B.phaseBlade(x, y, angleUp, spd, dmg, cfg.pierceCount || 5, cfg.waveAmplitude || 2, cfg.waveFrequency || 0.08, color, trail);
        break;

      case 'lifestealBlade':
        if (B) B.lifestealBlade(x, y, angleUp, spd, dmg, cfg.lifestealPercent || 0.15, color, trail);
        break;

      case 'delayedBomb':
        if (B) B.delayedBomb(x, y, angleUp, spd, dmg, cfg.delayTime || 1.5, cfg.explosionRadius || 120, color, trail);
        break;

      // ============ Hybrid/Fusion Weapons ============
      case 'iceFlame':
        if (B) B.iceFlame(x, y, angleUp, spd, dmg, cfg.burnDamage || 8, cfg.burnDuration || 2000, cfg.slowAmount || 0.4, cfg.slowDuration || 2000, color, trail);
        break;

      case 'plasmaStorm':
        if (B) B.plasmaStorm(x, y, angleUp, spd, dmg, cfg.chainCount || 4, cfg.chainRange || 160, cfg.explosionRadius || 50, color, trail);
        break;

      case 'voidBeam':
        if (B) B.voidBeam(x, y, angleUp, spd, dmg, cfg.pierceCount || 5, cfg.executeThreshold || 0.12, color, trail);
        break;

      case 'gravityMissile':
        if (B) B.gravityMissile(x, y, angleUp, spd, dmg, cfg.homingStrength || 0.05, cfg.explosionRadius || 70, cfg.wellRadius || 100, cfg.pullForce || 80, color, trail);
        break;

      case 'thunderBoomerang':
        if (B) B.thunderBoomerang(x, y, angleUp, spd, dmg, cfg.range || 350, cfg.chainCount || 3, cfg.chainRange || 140, color, trail);
        break;

      // ============ New Weapon Patterns (10) ============
      case 'splitter':
        if (B) B.splitter(x, y, angleUp, spd, dmg, cfg.pierceCount || 2, color, trail);
        break;

      case 'bouncer':
        if (B) B.bouncer(x, y, angleUp, spd, dmg, cfg.chainCount || 4, cfg.chainRange || 150, color, trail);
        break;

      case 'shockRing':
        if (B) B.shockRing(x, y, angleUp, spd, dmg, cfg.ringCount || 12, color, trail);
        break;

      case 'growing':
        if (B) B.growing(x, y, angleUp, spd, dmg, cfg.growingScale || 1.6, color, trail);
        break;

      case 'warp':
        if (B) B.warp(x, y, angleUp, spd, dmg, cfg.pierceCount || 5, color, trail);
        break;

      case 'mirror':
        if (B) B.mirror(x, y, angleUp, spd, dmg, cfg.spreadAngle || 90, color, trail);
        break;

      case 'ringNova':
        if (B) B.ringNova(x, y, angleUp, spd, dmg, cfg.ringCount || 10, cfg.homingStrength || 0.05, cfg.homingRange || 350, color, trail);
        break;

      case 'plasmaWeb':
        if (B) B.plasmaWeb(x, y, angleUp, spd, dmg, cfg.webCount || 5, cfg.chainCount || 3, cfg.chainRange || 130, color, trail);
        break;

      case 'implosion':
        if (B) B.implosion(x, y, angleUp, spd, dmg, cfg.wellRadius || 130, cfg.pullForce || 100, cfg.explosionRadius || 90, cfg.executeThreshold || 0.1, color, trail);
        break;

      case 'vitalChain':
        if (B) B.vitalChain(x, y, angleUp, spd, dmg, cfg.chainCount || 5, cfg.chainRange || 160, cfg.lifestealPercent || 0.1, color, trail);
        break;
    }

    // Extra bullets from stats applied to EACH firing weapon
    var extra = (stats.extraBullets || 0) + (stats.bulletCount || 0);
    if (extra > 0) {
      this._fireExtraBullets(x, y, extra, spd, dmg, color, trail);
    }
  }

  /**
   * Legacy fire method — fires the first equipped weapon.
   * Kept for backward compatibility.
   */
  fire() {
    var firstSlot = null;
    for (var i = 0; i < this.weaponSlots.length; i++) {
      if (this.weaponSlots[i]) {
        firstSlot = this.weaponSlots[i];
        break;
      }
    }
    if (firstSlot) {
      this._fireWeapon(firstSlot.weaponId, null, null);
    }
  }

  // ============================================================
  //  HELPERS
  // ============================================================

  /**
   * Get player stats object (safe access).
   * @returns {object}
   */
  _getStats() {
    if (this.player && this.player.stats) {
      return this.player.stats;
    }
    return {};
  }

  /**
   * Get SkillManager reference (for weapon upgrade multipliers).
   * @returns {object|null}
   */
  _getSkillManager() {
    // SkillManager is accessible via game global
    return window._skillManagerRef || null;
  }

  /**
   * Find nearest active enemy within range.
   * @param {number} x
   * @param {number} y
   * @param {number} range
   * @returns {object|null}
   */
  _findNearestEnemy(x, y, range) {
    var enemies = game.enemies;
    if (!enemies) return null;

    var nearest = null;
    var nearestDistSq = Infinity;
    var rangeSq = range * range;

    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.active) continue;
      var dx = e.x - x;
      var dy = e.y - y;
      var distSq = dx * dx + dy * dy;
      if (distSq < nearestDistSq && distSq < rangeSq) {
        nearestDistSq = distSq;
        nearest = e;
      }
    }
    return nearest;
  }

  /**
   * Fire extra bullets with slight angle offset (dual-wield effect).
   * @param {number} x
   * @param {number} y
   * @param {number} count
   * @param {number} speed
   * @param {number} damage
   * @param {string} color
   * @param {string} trail
   */
  _fireExtraBullets(x, y, count, speed, damage, color, trail) {
    var B = window.BulletPatterns;
    if (!B) return;
    var baseAngle = -Math.PI / 2;
    var spreadDeg = 14;
    for (var i = 0; i < count; i++) {
      var offset = (i - (count - 1) / 2) * (spreadDeg * Math.PI / 180);
      B.normal(x, y, baseAngle + offset, speed, damage, color, trail);
    }
  }

  // ============================================================
  //  ORBITAL WEAPON (drones that circle player and auto-fire)
  // ============================================================

  /** Spawn orbital drone entities. Called when an orbital weapon is added to a slot. */
  _initOrbitals(weaponId) {
    var cfg = GAME_CONFIG.WEAPONS[weaponId];
    if (!cfg) return;

    var count = cfg.orbitCount || 4;
    this.orbitals = [];

    for (var i = 0; i < count; i++) {
      var drone = new OrbitalDrone(this, i, count, cfg, weaponId);
      game.addEntity(drone);
      this.orbitals.push(drone);
    }
  }

  /**
   * Update orbital drone positions and independent fire timers.
   * @param {number} dt - delta time in seconds
   * @param {object} stats - player stats
   */
  _updateOrbitals(dt, stats) {
    var dtMs = dt * 1000;
    for (var i = 0; i < this.orbitals.length; i++) {
      var drone = this.orbitals[i];
      if (!drone.active) continue;

      // Orbit position
      drone.angle += drone.orbitSpeed * dt;
      drone.x = this.player.x + Math.cos(drone.angle) * drone.orbitRadius;
      drone.y = this.player.y + Math.sin(drone.angle) * drone.orbitRadius;

      // Independent fire timer
      drone.fireTimer += dtMs;
      var droneFireRate = drone.cfg.fireRate * (stats.attackSpeed || 1);
      // Time faction: cooldown reduction
      if (stats.cooldownReduction && stats.cooldownReduction > 0) {
        droneFireRate *= (1 - Math.min(stats.cooldownReduction, 0.9));
      }
      // Apply weapon upgrade fire rate multiplier
      var skillMgr = this._getSkillManager();
      if (skillMgr) {
        droneFireRate *= skillMgr.getWeaponFireRateMult(drone.weaponId);
      }
      if (droneFireRate < 50) droneFireRate = 50;

      while (drone.fireTimer >= droneFireRate) {
        drone.fireTimer -= droneFireRate;
        drone._shoot(stats);
      }
    }
  }

  /** Clean up all orbital drone entities. */
  _cleanupOrbitals() {
    for (var i = 0; i < this.orbitals.length; i++) {
      this.orbitals[i].active = false;
      game.removeEntity(this.orbitals[i]);
    }
    this.orbitals.length = 0;
  }

  // ============================================================
  //  ARC WEAPON (instant chain lightning, no projectile)
  // ============================================================

  /**
   * Scan for nearest enemy and chain lightning to nearby enemies.
   * Deals damage directly via enemy.takeDamage().
   * @param {object} cfg - arc weapon config
   * @param {number} x - player x
   * @param {number} y - player y
   * @param {number} damage - base damage (already stat-modified)
   * @param {string} color - arc color
   * @param {string} _trail - unused for arc
   */
  _fireArc(cfg, x, y, damage, color, _trail) {
    var enemies = game.enemies;
    if (!enemies) return;

    var chainRange = cfg.chainRange || 180;
    var chainCount = cfg.chainCount || 3;
    var falloff = cfg.chainDamageFalloff || 0.3;

    // Find the first target (nearest enemy)
    var first = this._findNearestEnemy(x, y, chainRange);
    if (!first) return;

    var hit = [];
    var current = first;
    var chainDmg = damage;

    for (var i = 0; i < chainCount; i++) {
      if (!current) break;
      // Check if already hit
      var alreadyHit = false;
      for (var j = 0; j < hit.length; j++) {
        if (hit[j] === current) { alreadyHit = true; break; }
      }
      if (alreadyHit) break;

      hit.push(current);

      // Deal direct damage
      if (typeof current.takeDamage === 'function') {
        current.takeDamage(chainDmg);
      }

      // Find next chain target
      var next = null;
      var nextDistSq = Infinity;
      var rangeSq = chainRange * chainRange;

      for (var k = 0; k < enemies.length; k++) {
        var e = enemies[k];
        if (!e.active) continue;
        var isHit = false;
        for (var h = 0; h < hit.length; h++) {
          if (hit[h] === e) { isHit = true; break; }
        }
        if (isHit) continue;

        var dx = e.x - current.x;
        var dy = e.y - current.y;
        var distSq = dx * dx + dy * dy;
        if (distSq < nextDistSq && distSq < rangeSq) {
          nextDistSq = distSq;
          next = e;
        }
      }

      current = next;
      chainDmg *= (1 - falloff);
    }

    // Spawn visual particles for the chain
    this._spawnArcVisuals(x, y, hit, color);
  }

  /**
   * Spawn lightning particles between player and each chained enemy.
   * @param {number} px - player x
   * @param {number} py - player y
   * @param {object[]} hit - array of chained enemies
   * @param {string} color
   */
  _spawnArcVisuals(px, py, hit, color) {
    if (hit.length === 0) return;

    // Player → first enemy
    this._spawnLightningBolt(px, py, hit[0].x, hit[0].y, color);

    // Between chained enemies
    for (var i = 1; i < hit.length; i++) {
      this._spawnLightningBolt(hit[i - 1].x, hit[i - 1].y, hit[i].x, hit[i].y, color);
    }
  }

  /**
   * Spawn jagged lightning-bolt particles between two points.
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {string} color
   */
  _spawnLightningBolt(x1, y1, x2, y2, color) {
    var segments = 5;
    for (var i = 0; i < segments; i++) {
      var t = (i + 0.5) / segments;
      var jitter = 8;
      var mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
      var my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter;
      game.addEntity(new ArcParticle(mx, my, color));
    }
  }
}

// ================================================================
//  ORBITAL DRONE ENTITY
// ================================================================

/**
 * A drone that orbits the player and fires bullets independently.
 * Registered as a game entity with category 'playerBullet' for correct draw layering.
 */
function OrbitalDrone(wm, index, total, cfg, weaponId) {
  this.wm = wm;                 // parent WeaponManager
  this.cfg = cfg;               // orbital weapon config
  this.weaponId = weaponId || 'orbital'; // which weapon these orbitals belong to

  this.active = true;
  this.category = 'playerBullet'; // draw on player-bullet layer
  this.drawLayer = 4;
  this.hitRadius = 4;

  // Orbit state
  this.angle = (index / total) * Math.PI * 2;
  this.orbitRadius = cfg.orbitRadius || 70;
  this.orbitSpeed = cfg.orbitSpeed || 2.5;

  // Fire state
  this.fireTimer = 0;

  // Position (set by _updateOrbitals)
  this.x = 0;
  this.y = 0;
}

OrbitalDrone.prototype = {

  /** Engine update callback. Orbit + fire handled by WeaponManager._updateOrbitals. */
  update: function (dt) {
    // no-op: position and firing are driven by WeaponManager._updateOrbitals
  },

  /** Fire a bullet toward the nearest enemy, or upward if none. */
  _shoot: function (stats) {
    var B = window.BulletPatterns;
    if (!B) return;

    var weaponId = this.weaponId;
    var dmg = (this.cfg.damage || 5) * (stats.attack || 1);
    // Apply weapon upgrade damage multiplier
    var skillMgr = window._skillManagerRef;
    if (skillMgr) {
      dmg *= skillMgr.getWeaponDamageMult(weaponId);
    }
    var spd = (this.cfg.bulletSpeed || 500) * (stats.bulletSpeed || 1);
    var color = this.cfg.bulletColor || '#88ddff';
    var trail = this.cfg.trailColor || color;

    // Find nearest enemy within range
    var enemies = game.enemies;
    var nearest = null;
    var nearestDistSq = Infinity;
    var range = 400;
    var rangeSq = range * range;

    if (enemies) {
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.active) continue;
        var dx = e.x - this.x;
        var dy = e.y - this.y;
        var dSq = dx * dx + dy * dy;
        if (dSq < nearestDistSq && dSq < rangeSq) {
          nearestDistSq = dSq;
          nearest = e;
        }
      }
    }

    if (nearest) {
      var angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
      if (weaponId === 'teslaOrbital') {
        // Tesla orbital fires chain lightning bullets
        B.lightningBolt(this.x, this.y, angle, spd, dmg, this.cfg.chainCount || 2, this.cfg.chainRange || 120, color, trail);
      } else {
        B.normal(this.x, this.y, angle, spd, dmg, color, trail);
      }
    } else {
      B.normal(this.x, this.y, -Math.PI / 2, spd, dmg, color, trail);
    }
  },

  /** Draw the drone and its tether line to the player. */
  draw: function (ctx) {
    var r = this.cfg.bulletSize || 3;
    var color = this.cfg.bulletColor || '#88ddff';

    // Tether line to player
    var player = this.wm.player;
    if (player) {
      ctx.strokeStyle = 'rgba(136, 221, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }

    // Drone body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer glow
    ctx.fillStyle = 'rgba(136, 221, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ================================================================
//  ARC LIGHTNING VISUAL PARTICLE
// ================================================================

/**
 * Short-lived particle for chain lightning visuals.
 * Registered as category 'particle' for foreground draw layering.
 */
function ArcParticle(x, y, color) {
  this.x = x;
  this.y = y;
  this.color = color;

  this.active = true;
  this.life = 0.25;
  this.maxLife = 0.25;
  this.category = 'particle';
  this.drawLayer = 6;
  this.hitRadius = 0;
}

ArcParticle.prototype = {
  update: function (dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      game.removeEntity(this);
    }
  },

  draw: function (ctx) {
    var alpha = this.life / this.maxLife;
    var size = 2 + Math.random() * 3;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - size / 2, this.y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }
};

// ================================================================
//  EXPORT
// ================================================================
window.WeaponManager = WeaponManager;
