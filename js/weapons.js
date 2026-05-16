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

class WeaponManager {
  /**
   * @param {object} player - the Player entity this weapon manager is attached to
   */
  constructor(player) {
    this.player = player;
    /** @type {string} current weapon config ID */
    this.currentWeapon = 'normal';
    /** @type {number} time accumulator in ms */
    this.fireTimer = 0;
    /** @type {OrbitalDrone[]} active orbital drone entities */
    this.orbitals = [];
  }

  // ============================================================
  //  WEAPON SWITCHING
  // ============================================================

  /**
   * Switch to a different weapon by its config ID.
   * Cleans up previous weapon state (e.g. orbital drones).
   * @param {string} weaponId - key in GAME_CONFIG.WEAPONS
   */
  setWeapon(weaponId) {
    var cfg = GAME_CONFIG.WEAPONS[weaponId];
    if (!cfg) return;

    // Teardown previous weapon state
    if (this.currentWeapon === 'orbital') {
      this._cleanupOrbitals();
    }

    this.currentWeapon = weaponId;
    this.fireTimer = 0;

    // Setup new weapon state
    if (weaponId === 'orbital') {
      this._initOrbitals();
    }
  }

  // ============================================================
  //  MAIN UPDATE LOOP
  // ============================================================

  /**
   * Called every frame from player.update().
   * Accumulates fire timer and dispatches fire() when ready.
   * Also updates orbital drone positions and independent fire timers.
   * @param {number} dt - delta time in seconds
   */
  update(dt) {
    var cfg = GAME_CONFIG.WEAPONS[this.currentWeapon];
    if (!cfg) return;

    var stats = this._getStats();
    var dtMs = dt * 1000;

    // Orbital drones fire independently (their own timers)
    if (this.currentWeapon === 'orbital') {
      this._updateOrbitals(dt, stats);
      return;
    }

    // Standard weapons: accumulate timer and fire when ready
    var effectiveFireRate = cfg.fireRate * (stats.attackSpeed || 1);
    // Clamp to minimum 30ms to avoid degenerate fire loops
    if (effectiveFireRate < 30) effectiveFireRate = 30;

    this.fireTimer += dtMs;

    while (this.fireTimer >= effectiveFireRate) {
      this.fireTimer -= effectiveFireRate;
      this.fire();
    }
  }

  // ============================================================
  //  FIRE — pattern dispatch
  // ============================================================

  /**
   * Read current weapon config, apply stat modifiers, dispatch to pattern.
   */
  fire() {
    var cfg = GAME_CONFIG.WEAPONS[this.currentWeapon];
    if (!cfg) return;

    var x = this.player ? this.player.x : 0;
    var y = this.player ? this.player.y : 0;
    var stats = this._getStats();

    // Stat-modified values
    var dmg = (cfg.damage || 1) * (stats.attack || 1);
    var spd = (cfg.bulletSpeed || 400) * (stats.bulletSpeed || 1);
    var size = (cfg.bulletSize || 3) * (stats.bulletSize || 1);
    var color = cfg.bulletColor || '#ffffff';
    var trail = cfg.trailColor || color;

    var B = window.BulletPatterns;
    var angleUp = -Math.PI / 2; // -90 degrees = straight up

    switch (cfg.pattern) {

      case 'normal':
        if (B) B.normal(x, y, angleUp, spd, dmg, color, trail);
        break;

      case 'spread':
        if (B) B.spread(x, y, cfg.bulletCount || 5, cfg.spreadAngle || 25, spd, dmg, color, trail);
        break;

      case 'homing':
        if (B) {
          var nearest = this._findNearestEnemy(x, y, cfg.homingRange || 300);
          B.homing(x, y, spd, dmg, color, trail, nearest, cfg.homingStrength || 0.05);
        }
        break;

      case 'laser':
        if (B) B.laser(x, y, spd, dmg, color, trail);
        break;

      case 'orbital':
        // Orbital drones fire on their own independent timers — handled in _updateOrbitals
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
    }

    // Extra bullets from stats (dual-wield style spread)
    var extra = (stats.extraBullets || 0) + (stats.bulletCount || 0);
    if (extra > 0) {
      this._fireExtraBullets(x, y, extra, spd, dmg, color, trail);
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

  /** Spawn orbital drone entities. Called on setWeapon('orbital'). */
  _initOrbitals() {
    var cfg = GAME_CONFIG.WEAPONS.orbital;
    if (!cfg) return;

    var count = cfg.orbitCount || 4;
    this.orbitals = [];

    for (var i = 0; i < count; i++) {
      var drone = new OrbitalDrone(this, i, count, cfg);
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
function OrbitalDrone(wm, index, total, cfg) {
  this.wm = wm;                 // parent WeaponManager
  this.cfg = cfg;               // orbital weapon config

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

    var dmg = (this.cfg.damage || 5) * (stats.attack || 1);
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
      B.normal(this.x, this.y, angle, spd, dmg, color, trail);
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
