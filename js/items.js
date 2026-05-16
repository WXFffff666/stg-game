/**
 * STG Game Items System
 * Item drops, pickup collision, buff/debuff effect system.
 *
 * Global: window.Item, window.BuffManager, window.ItemSpawner
 * Dependencies: game = window.game, config = window.GAME_CONFIG
 *
 * Loading order: config.js → core.js → ... → player.js → ... → items.js
 * At runtime, game.player exists and has: heal(), x, y, active, hitRadius
 */

// ==================== SHAPE DRAWING HELPERS ====================

function _drawCross(ctx, x, y, size, color, isDebuff) {
  var hw = size * 0.3;
  var hh = size * 0.5;
  // Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillRect(x - hw, y - hh, hw * 2, hh * 2);
  ctx.fillRect(x - hh, y - hw, hh * 2, hw * 2);
  // Debuff: red warning ring
  if (isDebuff) {
    ctx.shadowColor = 'rgba(255,0,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255,40,40,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function _drawStar(ctx, x, y, size, color, isDebuff) {
  var outerR = size * 0.5;
  var innerR = size * 0.2;
  var points = 5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  for (var i = 0; i < points * 2; i++) {
    var r = i % 2 === 0 ? outerR : innerR;
    var angle = (i * Math.PI) / points - Math.PI / 2;
    var px = x + Math.cos(angle) * r;
    var py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  // Inner highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  for (i = 0; i < points * 2; i++) {
    r = i % 2 === 0 ? innerR : innerR * 0.5;
    angle = (i * Math.PI) / points - Math.PI / 2;
    px = x + Math.cos(angle) * r;
    py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  if (isDebuff) {
    ctx.shadowColor = 'rgba(255,0,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255,40,40,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function _drawDiamond(ctx, x, y, size, color, isDebuff) {
  var half = size * 0.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x, y - half);
  ctx.lineTo(x + half, y);
  ctx.lineTo(x, y + half);
  ctx.lineTo(x - half, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  // Inner glow
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  var inner = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(x, y - inner);
  ctx.lineTo(x + inner, y);
  ctx.lineTo(x, y + inner);
  ctx.lineTo(x - inner, y);
  ctx.closePath();
  ctx.fill();
  if (isDebuff) {
    ctx.shadowColor = 'rgba(255,0,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255,40,40,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function _drawCircle(ctx, x, y, size, color, isDebuff) {
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  // Inner
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  if (isDebuff) {
    ctx.shadowColor = 'rgba(255,0,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255,40,40,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

var _SHAPE_DRAWERS = {
  cross: _drawCross,
  star: _drawStar,
  diamond: _drawDiamond,
  circle: _drawCircle,
};

// ==================== BuffManager ====================

/**
 * Manages active buffs/debuffs on the player.
 * Attached as player.buffManager.
 */
var BuffManager = function (player) {
  this.player = player;

  /** Map<effectType, {remaining: float(seconds), duration: float(seconds), config: object}> */
  this.activeBuffs = new Map();

  /** Timer for pulsing debuff overlay (shared across debuffs) */
  this._pulseTimer = 0;
};

BuffManager.prototype = {

  // ---------- apply / remove ----------

  /**
   * Apply or refresh a buff/debuff.
   * @param {string} type - effect type (e.g. 'damageUp', 'poison')
   * @param {object} config - buff configuration (multiplier, range, damage, etc.)
   *                          Must include `duration` in milliseconds.
   */
  applyBuff: function (type, config) {
    var durSec = (config.duration || 0) / 1000;

    // On re-apply, refresh duration to the longer of remaining vs new
    var existing = this.activeBuffs.get(type);
    if (existing) {
      if (existing.remaining < durSec) {
        existing.remaining = durSec;
      }
      // Merge/replace config fields
      for (var k in config) {
        if (config.hasOwnProperty(k)) {
          existing.config[k] = config[k];
        }
      }
      existing.duration = durSec;
      existing.config.duration = config.duration;
    } else {
      this.activeBuffs.set(type, {
        remaining: durSec,
        duration: durSec,
        config: Object.assign({}, config),
      });
    }

    // On-apply callback
    this._onBuffApplied(type, config);
  },

  /**
   * Force-remove a buff immediately (triggers on-remove callback).
   * @param {string} type
   */
  removeBuff: function (type) {
    if (!this.activeBuffs.has(type)) return;
    this.activeBuffs.delete(type);
    this._onBuffRemoved(type);
  },

  /** Remove all active buffs (e.g. on death / scene change). */
  clearAll: function () {
    var self = this;
    this.activeBuffs.forEach(function (_, type) {
      self._onBuffRemoved(type);
    });
    this.activeBuffs.clear();
    this._pulseTimer = 0;
  },

  // ---------- update ----------

  /**
   * Called each frame by the player or game loop.
   * @param {number} dt - delta time in seconds
   */
  update: function (dt) {
    if (this.activeBuffs.size === 0) return;

    var expired = [];
    var self = this;

    this.activeBuffs.forEach(function (buff, type) {
      buff.remaining -= dt;

      // Poison damage-over-time
      if (type === 'poison' && self.player && self.player.active) {
        var poisonDmg = (buff.config.damage || 0) * dt;
        if (poisonDmg > 0) {
          self.player.heal(-poisonDmg);
        }
      }

      if (buff.remaining <= 0) {
        expired.push(type);
      }
    });

    // Process expirations
    for (var i = 0; i < expired.length; i++) {
      this.removeBuff(expired[i]);
    }

    // Debuff pulse
    if (this.hasAnyDebuff()) {
      this._pulseTimer += dt;
    } else {
      this._pulseTimer = 0;
    }
  },

  // ---------- queries ----------

  /** @returns {boolean} */
  hasBuff: function (type) {
    return this.activeBuffs.has(type);
  },

  /**
   * Get remaining time in seconds, or 0.
   * @param {string} type
   * @returns {number}
   */
  getRemaining: function (type) {
    var buff = this.activeBuffs.get(type);
    return buff ? buff.remaining : 0;
  },

  /**
   * Get the config object for a buff, or null.
   * @param {string} type
   * @returns {object|null}
   */
  getBuffConfig: function (type) {
    var buff = this.activeBuffs.get(type);
    return buff ? buff.config : null;
  },

  /** @returns {boolean} */
  hasAnyDebuff: function () {
    var debuffTypes = [
      'poison', 'speedDown', 'damageDown', 'blind', 'curse', 'reverseControl',
    ];
    for (var i = 0; i < debuffTypes.length; i++) {
      if (this.activeBuffs.has(debuffTypes[i])) return true;
    }
    return false;
  },

  /**
   * Get the combined modifier for a numeric stat.
   * - Multiplicative stats: returns product of all active buff multipliers
   * - critRate: returns base (0) + sum of critBoost values
   * - shield: returns remaining shield HP (0 if none)
   * - magnet: returns pull range (0 if none)
   * - invincible: returns 1 if active, else 0
   * - slowField: returns enemy speed multiplier (1 if none)
   * - reverseControl: returns 1 if active, else 0
   * - blind: returns 1 if active, else 0
   *
   * @param {string} stat - 'damage', 'speed', 'fireRate', 'critRate',
   *        'xpMultiplier', 'scoreMultiplier', 'curse', 'shield', 'magnet',
   *        'invincible', 'slowField', 'reverseControl', 'blind'
   * @returns {number}
   */
  getModifier: function (stat) {
    switch (stat) {
      case 'damage':
        return this._multiplyBuffs(['damageUp', 'damageDown']);
      case 'speed':
        return this._multiplyBuffs(['speedUp', 'speedDown']);
      case 'fireRate':
        return this._multiplyBuffs(['fireRateUp']);
      case 'xpMultiplier':
        return this._multiplyBuffs(['xpBoost']);
      case 'scoreMultiplier':
        return this._multiplyBuffs(['scoreBoost']);
      case 'curse':
        return this._multiplyBuffs(['curse']);
      case 'slowField':
        return this._multiplyBuffs(['slowField']);
      case 'critRate':
        // Additive
        return this._sumBuffs(['critBoost']);
      case 'shield':
        var sb = this.activeBuffs.get('shield');
        return sb ? sb.config.amount : 0;
      case 'magnet':
        var mb = this.activeBuffs.get('magnet');
        return mb ? mb.config.range : 0;
      case 'invincible':
        return this.activeBuffs.has('invincible') ? 1 : 0;
      case 'reverseControl':
        return this.activeBuffs.has('reverseControl') ? 1 : 0;
      case 'blind':
        return this.activeBuffs.has('blind') ? 1 : 0;
      default:
        return 1;
    }
  },

  /**
   * Absorb damage using active shield. Returns remaining damage after shield.
   * @param {number} amount - incoming damage
   * @returns {number} remaining damage (0 = fully absorbed)
   */
  absorbDamage: function (amount) {
    var shieldBuff = this.activeBuffs.get('shield');
    if (!shieldBuff) return amount;

    if (shieldBuff.config.amount >= amount) {
      shieldBuff.config.amount -= amount;
      return 0;
    } else {
      var remaining = amount - shieldBuff.config.amount;
      this.removeBuff('shield');
      return remaining;
    }
  },

  /**
   * Get the debuff overlay alpha (0-1, pulsing).
   * @returns {number}
   */
  getDebuffAlpha: function () {
    if (!this.hasAnyDebuff()) return 0;
    // Pulse between 0.05 and 0.2
    return 0.05 + Math.abs(Math.sin(this._pulseTimer * 3)) * 0.15;
  },

  // ---------- internals ----------

  _multiplyBuffs: function (types) {
    var result = 1;
    for (var i = 0; i < types.length; i++) {
      var buff = this.activeBuffs.get(types[i]);
      if (buff) {
        result *= (buff.config.multiplier != null ? buff.config.multiplier : 1);
      }
    }
    return result;
  },

  _sumBuffs: function (types) {
    var result = 0;
    for (var i = 0; i < types.length; i++) {
      var buff = this.activeBuffs.get(types[i]);
      if (buff) {
        result += (buff.config.value != null ? buff.config.value : 0);
      }
    }
    return result;
  },

  /**
   * Called when a buff is applied (handles visual/state side-effects on player).
   * @param {string} type
   * @param {object} config
   */
  _onBuffApplied: function (type, config) {
    var p = this.player;
    if (!p) return;

    switch (type) {
      case 'invincible':
        // Player invincibility is handled by the player module;
        // Flag set so player knows it's invincible from buff
        if (p.setInvincible) p.setInvincible(true);
        break;
      case 'blind':
        // Blind flag for UI overlay
        break;
      case 'reverseControl':
        // Reverse flag for input handling
        break;
      case 'magnet':
        // Magnet active — item.update checks this
        break;
      case 'shield':
        // Shield visual handled by player
        break;
      default:
        break;
    }
  },

  /**
   * Called when a buff expires or is removed.
   * @param {string} type
   */
  _onBuffRemoved: function (type) {
    var p = this.player;
    if (!p) return;

    switch (type) {
      case 'invincible':
        if (p.setInvincible) p.setInvincible(false);
        break;
      case 'reverseControl':
        // Input returns to normal
        break;
      case 'blind':
        // Blind overlay removed
        break;
      case 'magnet':
        // Magnet deactivated
        break;
      case 'shield':
        // Shield visual removed
        break;
      default:
        break;
    }
  },

};

// ==================== Item ====================

/**
 * Represents a single dropped item on the battlefield.
 *
 * Properties:
 *   x, y          — world position
 *   config        — reference to GAME_CONFIG.ITEMS entry
 *   lifetime      — remaining life in milliseconds
 *   active        — false when dead
 *   category      — 'item'
 *   hitRadius     — collision radius (config.size)
 *   drawLayer     — 1 (drawn behind enemies, above background)
 *   color         — config.color
 *   shape         — config.shape
 *   size          — config.size
 *   collected     — true after player picks it up
 */
var Item = function (x, y, config) {
  this.x = x;
  this.y = y;
  this.config = config;

  this.lifetime = GAME_CONFIG.BALANCE.ITEM_LIFETIME; // ms
  this.active = true;

  this.category = 'item';
  this.hitRadius = (config && config.size) ? config.size : 12;
  this.drawLayer = 1;

  this.color = config ? config.color : '#ffffff';
  this.shape = config ? config.shape : 'circle';
  this.size = config ? config.size : 12;
  this.isDebuff = config ? config.type === 'debuff' : false;

  this.collected = false;

  // Blink warning when near expiration
  this._blinkTimer = 0;
  this._pulsePhase = Math.random() * Math.PI * 2;
};

Item.prototype = {

  /**
   * Called each frame by the game loop.
   * @param {number} dt - delta time in seconds
   */
  update: function (dt) {
    if (!this.active) return;

    var game = window.game;
    if (!game) return;

    // Fall downward
    this.y += 60 * dt;

    // Decrement lifetime
    this.lifetime -= dt * 1000;

    // Blink warning when < 3s remaining
    if (this.lifetime < 3000) {
      this._blinkTimer += dt;
    }

    // Magnet pull toward player
    var player = game.player;
    if (player && player.active && player.buffManager && player.buffManager.hasBuff('magnet')) {
      var magnetRange = player.buffManager.getModifier('magnet');
      if (magnetRange > 0) {
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < magnetRange && dist > 0.5) {
          var pullSpeed = 350; // pixels per second
          var factor = Math.min(pullSpeed * dt / dist, 1);
          this.x += dx * factor;
          this.y += dy * factor;
        }
      }
    }

    // Collision check with player
    if (player && player.active) {
      var pdx = player.x - this.x;
      var pdy = player.y - this.y;
      var pDist = Math.sqrt(pdx * pdx + pdy * pdy);
      var pHitRadius = player.hitRadius || GAME_CONFIG.BALANCE.PLAYER_HITBOX_RADIUS;
      var collisionDist = this.hitRadius + pHitRadius;

      if (pDist < collisionDist) {
        this.collected = true;
        this._applyEffect(player);
        this._deactivate();
        return;
      }
    }

    // Off-screen expiry (well below canvas)
    var h = GAME_CONFIG.BALANCE.CANVAS_HEIGHT;
    if (this.y > h + 60 || this.lifetime <= 0) {
      this._deactivate();
    }
  },

  /**
   * Draw the item on canvas.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw: function (ctx) {
    if (!this.active) return;

    // Blink effect near expiration
    if (this.lifetime < 3000 && this.lifetime > 0) {
      var blink = Math.sin(this._blinkTimer * 8) > 0;
      if (!blink && this.lifetime < 1500) {
        // Below 1.5s: faster blink, but always show at least some frames
        if (Math.random() < 0.4) return;
      } else if (!blink) {
        return;
      }
    }

    var drawFn = _SHAPE_DRAWERS[this.shape];
    if (!drawFn) drawFn = _drawCircle;

    // Subtle pulse
    var pulse = 1 + Math.sin(this._pulsePhase + this.lifetime * 0.005) * 0.08;
    var drawSize = this.size * pulse;

    drawFn(ctx, this.x, this.y, drawSize, this.color, this.isDebuff);

    // Draw drop text above item (subtle)
    if (this.config && this.config.dropText) {
      ctx.save();
      ctx.font = 'bold 10px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 4;
      ctx.fillText(this.config.dropText, this.x, this.y - this.size * 0.65);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  },

  // ---------- internals ----------

  /**
   * Apply the item's effect to the player on collection.
   * @param {object} player
   */
  _applyEffect: function (player) {
    var cfg = this.config;
    if (!cfg) return;

    var bm = player.buffManager;
    var effect = cfg.effect;
    var val = cfg.value;
    var dur = cfg.duration;

    switch (effect) {
      // ---- buffs (positive) ----
      case 'heal':
        player.heal(val);
        break;

      case 'damageUp':
        if (bm) bm.applyBuff('damageUp', { multiplier: val, duration: dur });
        break;

      case 'speedUp':
        if (bm) bm.applyBuff('speedUp', { multiplier: val, duration: dur });
        break;

      case 'fireRateUp':
        if (bm) bm.applyBuff('fireRateUp', { multiplier: val, duration: dur });
        break;

      case 'shield':
        if (bm) bm.applyBuff('shield', { amount: val, duration: dur });
        break;

      case 'magnet':
        if (bm) bm.applyBuff('magnet', { range: val, duration: dur });
        break;

      case 'invincible':
        if (bm) bm.applyBuff('invincible', { duration: dur });
        break;

      case 'xpBoost':
        if (bm) bm.applyBuff('xpBoost', { multiplier: val, duration: dur });
        break;

      case 'slowField':
        if (bm) bm.applyBuff('slowField', { multiplier: val, duration: dur });
        break;

      case 'critBoost':
        if (bm) bm.applyBuff('critBoost', { value: val, duration: dur });
        break;

      case 'scoreBoost':
        if (bm) bm.applyBuff('scoreBoost', { multiplier: val, duration: dur });
        break;

      // ---- debuffs (negative) ----
      case 'poison':
        if (bm) bm.applyBuff('poison', { damage: val, duration: dur });
        break;

      case 'speedDown':
        if (bm) bm.applyBuff('speedDown', { multiplier: val, duration: dur });
        break;

      case 'damageDown':
        if (bm) bm.applyBuff('damageDown', { multiplier: val, duration: dur });
        break;

      case 'blind':
        if (bm) bm.applyBuff('blind', { duration: dur });
        break;

      case 'curse':
        if (bm) bm.applyBuff('curse', { multiplier: val, duration: dur });
        break;

      case 'reverseControl':
        if (bm) bm.applyBuff('reverseControl', { duration: dur });
        break;

      case 'explode':
        // Instant damage
        player.heal(-val);
        break;

      default:
        break;
    }

    // Spawn collection particles if particle system exists
    if (window.game && typeof window.game.addEntity === 'function') {
      this._spawnCollectParticles();
    }
  },

  /** Spawn small particles on collection for visual feedback. */
  _spawnCollectParticles: function () {
    // Lightweight particle burst — will be replaced by proper particle system if available
    // The main particle system in particles.js handles actual particles;
    // this is a no-op fallback in case particles aren't initialized.
  },

  /** Mark item as dead and remove from game. */
  _deactivate: function () {
    this.active = false;
    if (window.game && typeof window.game.removeEntity === 'function') {
      window.game.removeEntity(this);
    }
  },

};

// ==================== ItemSpawner ====================

/**
 * Handles random item spawning based on the GAME_CONFIG.ITEMS weight table.
 * Used by the enemy system when enemies die.
 */
var ItemSpawner = function () {
  /** Precomputed cumulative weight array and matching item configs */
  this._buildWeightTable();
};

ItemSpawner.prototype = {

  // ---------- spawning ----------

  /**
   * Spawn a random item at (x, y) based on the weight system.
   * If the result would be off-screen, it's clamped.
   * @param {number} x
   * @param {number} y
   * @returns {Item|null} the spawned item, or null if spawn is skipped
   */
  spawnAt: function (x, y) {
    var itemCfg = this._randomItem();
    if (!itemCfg) return null;

    // Clamp to canvas bounds
    var margin = 30;
    var cx = Math.max(margin, Math.min(GAME_CONFIG.BALANCE.CANVAS_WIDTH - margin, x));
    var cy = Math.max(margin, Math.min(GAME_CONFIG.BALANCE.CANVAS_HEIGHT - margin, y));

    var item = new Item(cx, cy, itemCfg);

    if (window.game && typeof window.game.addEntity === 'function') {
      window.game.addEntity(item);
    }

    return item;
  },

  /**
   * Determine whether an item should drop.
   * @returns {boolean}
   */
  shouldDrop: function () {
    return Math.random() < GAME_CONFIG.BALANCE.ITEM_DROP_CHANCE;
  },

  /**
   * Get a specific item config by id (for scripted drops, e.g. boss).
   * @param {string} id
   * @returns {object|null}
   */
  getConfigById: function (id) {
    var items = GAME_CONFIG.ITEMS;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  },

  /**
   * Spawn a specific item by config id at (x, y).
   * @param {string} id
   * @param {number} x
   * @param {number} y
   * @returns {Item|null}
   */
  spawnById: function (id, x, y) {
    var cfg = this.getConfigById(id);
    if (!cfg) return null;
    var item = new Item(x, y, cfg);
    if (window.game && typeof window.game.addEntity === 'function') {
      window.game.addEntity(item);
    }
    return item;
  },

  // ---------- internals ----------

  /**
   * Build weighted random pick table from GAME_CONFIG.ITEMS.
   */
  _buildWeightTable: function () {
    this._cumWeights = [];
    this._itemCfgs = [];
    var items = GAME_CONFIG.ITEMS;
    var total = 0;

    for (var i = 0; i < items.length; i++) {
      var w = items[i].weight || 1;
      total += w;
      this._cumWeights.push(total);
      this._itemCfgs.push(items[i]);
    }

    this._totalWeight = total;
  },

  /**
   * Pick a random item config weighted by config.weight.
   * @returns {object}
   */
  _randomItem: function () {
    if (this._totalWeight <= 0) return null;
    var roll = Math.random() * this._totalWeight;
    for (var i = 0; i < this._cumWeights.length; i++) {
      if (roll < this._cumWeights[i]) {
        return this._itemCfgs[i];
      }
    }
    // Fallback
    return this._itemCfgs[this._itemCfgs.length - 1];
  },

};

// ==================== Export to Global ====================

window.BuffManager = BuffManager;
window.Item = Item;
window.ItemSpawner = ItemSpawner;
