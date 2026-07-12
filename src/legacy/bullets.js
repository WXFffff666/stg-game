/**
 * STG Game - Bullet Entity & Pattern Generators
 * 
 * Provides:
 *   window.Bullet          - Bullet entity class (poolable)
 *   window.BulletPatterns  - 10 bullet pattern generator functions
 * 
 * Bullet lifecycle:
 *   1. Created via pool (game.getFromPool) with setup() re-init
 *   2. Added to game via game.addEntity()
 *   3. Updated each frame: movement, homing, wave, boomerang, trails
 *   4. Drawn each frame per drawLayer (2=enemy, 4=player)
 *   5. Deactivated on: bounds exit, lifetime expiry, hit
 *   6. Returned to pool on deactivation (max 600 pooled)
 */

// ============================================================
//  BULLET CLASS
// ============================================================

class Bullet {
  constructor(props) {
    this.setup(props || {});
  }

  /**
   * Reset/reinitialize bullet for pool reuse.
   * Called both from constructor and from pool factory.
   */
  setup(props) {
    this.x              = props.x              || 0;
    this.y              = props.y              || 0;
    this.vx             = props.vx             || 0;
    this.vy             = props.vy             || 0;
    this.damage         = props.damage         || 10;
    this.speed          = props.speed          || 300;
    this.size           = props.size           || 4;
    this.color          = props.color          || '#ffffff';
    this.trailColor     = props.trailColor     || '#88aaff';
    this.lifetime       = props.lifetime       || 5;
    this.active         = true;
    this.category       = props.category       || 'playerBullet';
    this.hitRadius      = props.hitRadius      || this.size * 0.8;
    this.pierceCount    = typeof props.pierceCount === 'number' ? props.pierceCount : 0;
    this.homingTarget   = props.homingTarget   || null;
    this.homingStrength = props.homingStrength || 0;
    this.drawLayer      = typeof props.drawLayer === 'number'
      ? props.drawLayer
      : (this.category === 'playerBullet' ? 4 : 2);

    // Boomerang support
    this.originX         = typeof props.originX === 'number' ? props.originX : this.x;
    this.originY         = typeof props.originY === 'number' ? props.originY : this.y;
    this.range           = props.range           || -1;
    this.reversed        = false;
    this._traveledDist   = 0;

    // Wave support
    this.amplitude       = props.amplitude || 0;
    this.frequency       = props.frequency || 0;
    this._waveTime       = 0;

    // Explosive support
    this.explosionRadius = props.explosionRadius || 0;
    this._exploded       = false;

    // Gravity well support
    this.wellRadius      = props.wellRadius      || 0;
    this.pullForce       = props.pullForce        || 0;

    // Void rift / execute support
    this.executeThreshold = props.executeThreshold || 0;

    // Trail timing
    this._trailTimer     = 0;
    this._trailInterval  = 0.09;

    // Age
    this._age = 0;

    // IDs for hit tracking (prevent multi-hit on same frame)
    this._hitTargets = null;

    // Weapon / element effect props (must reset on pool reuse)
    this.slowAmount       = props.slowAmount       || 0;
    this.slowDuration     = props.slowDuration     || 0;
    this.freezeChance     = props.freezeChance     || 0;
    this.freezeDuration   = props.freezeDuration   || 0;
    this.burnDamage       = props.burnDamage       || 0;
    this.burnDuration     = props.burnDuration     || 0;
    this.chainCount       = props.chainCount       || 0;
    this.chainRange       = props.chainRange       || 0;
    this.chainDamage      = props.chainDamage      || 0;
    this.factionId        = props.factionId        || null;
    this.weaponId         = props.weaponId         || null;
    this.element          = props.element          || null;
    this._chainHit        = false;
    this._keepAliveAfterHit = false;
  }

  // ============================================================
  //  UPDATE
  // ============================================================
  update(dt) {
    if (!this.active) return;

    this._age += dt;

    // --- Lifetime expiry ---
    if (this.lifetime > 0 && this._age >= this.lifetime) {
      this._onExpire();
      this._deactivate();
      return;
    }

    // --- Per-frame hit tracking (reuse Set, no per-frame allocation) ---
    if (this.pierceCount > 0) {
      if (!this._hitTargets) this._hitTargets = new Set();
      else this._hitTargets.clear();
    }

    // --- Homing: shared global target + grid fallback (no per-bullet enemy scan) ---
    if (this.homingStrength > 0) {
      if (!this.homingTarget || !this.homingTarget.active) {
        var htm = window.homingTargets;
        if (htm) {
          this.homingTarget = htm.getTarget() || htm.findNearestTo(this.x, this.y, 400);
        }
      }
      if (this.homingTarget && this.homingTarget.active) {
        const dx = this.homingTarget.x - this.x;
        const dy = this.homingTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const tx = (dx / dist) * this.speed;
        const ty = (dy / dist) * this.speed;
        this.vx += (tx - this.vx) * this.homingStrength;
        this.vy += (ty - this.vy) * this.homingStrength;
      }
    }

    // Store previous position for distance tracking
    const prevX = this.x;
    const prevY = this.y;

    // --- Wave movement ---
    if (this.amplitude > 0 && this.frequency > 0) {
      this._waveTime += dt;

      // Use stored base angle; if none, derive from current vx/vy
      const baseAngle = this._waveBaseAngle !== undefined
        ? this._waveBaseAngle
        : Math.atan2(this.vy, this.vx);
      if (this._waveBaseAngle === undefined) {
        this._waveBaseAngle = baseAngle;
      }

      // Advect along base direction at constant speed
      const baseDist = this.speed * this._waveTime;
      // Perpendicular offset
      const perpAngle = baseAngle + Math.PI / 2;
      const offset = Math.sin(this._waveTime * this.frequency) * this.amplitude;

      this.x = this.originX + Math.cos(baseAngle) * baseDist + Math.cos(perpAngle) * offset;
      this.y = this.originY + Math.sin(baseAngle) * baseDist + Math.sin(perpAngle) * offset;
    } else {
      // Standard velocity movement
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    // --- Traveled distance (for boomerang / general tracking) ---
    const dxMoved = this.x - prevX;
    const dyMoved = this.y - prevY;
    this._traveledDist += Math.sqrt(dxMoved * dxMoved + dyMoved * dyMoved);

    // --- Gravity well: pull enemies toward this bullet ---
    if (this.wellRadius && this.pullForce) {
      var enemies = window.game.enemies;
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.active) continue;
        var dx = this.x - e.x;
        var dy = this.y - e.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.wellRadius && dist > 5) {
          var pull = this.pullForce * (1 - dist / this.wellRadius);
          e.x += (dx / dist) * pull * dt;
          e.y += (dy / dist) * pull * dt;
        }
      }
    }

    // --- Boomerang forward -> reverse ---
    if (this.range > 0 && !this.reversed && this._traveledDist >= this.range) {
      this.reversed = true;
      this.vx = -this.vx;
      this.vy = -this.vy;

      // If wave, flip the wave base angle and reset origin/time
      if (this._waveBaseAngle !== undefined) {
        this._waveBaseAngle += Math.PI;
        this._waveTime = 0;
        this.originX = this.x;
        this.originY = this.y;
      }
    }

    // --- Boomerang return -> deactivate ---
    if (this.range > 0 && this.reversed && this._traveledDist >= this.range * 2) {
      this._deactivate();
      return;
    }

    // --- Trail particles ---
    this._trailTimer += dt;
    var trailInterval = this._trailInterval;
    if (this.homingStrength > 0) {
      var gq = window.game && window.game.effectsQuality;
      if (window.game && window.game.lowPerfMode) trailInterval = 0.18;
      else if (gq === 'low') trailInterval = 0.14;
      else if (gq === 'high') trailInterval = 0.07;
    }
    if (this._trailTimer >= trailInterval) {
      this._trailTimer -= trailInterval;
      this._emitTrail();
    }

    // --- Out of bounds ---
    if (
      this.x < -50 || this.x > window.game.width + 50 ||
      this.y < -50 || this.y > window.game.height + 50
    ) {
      this._deactivate();
    }
  }

  // ============================================================
  //  DRAW — unique visuals per weapon type
  // ============================================================
  draw(ctx) {
    if (!this.active) return;

    ctx.save();

    // Player bullets use additive blending for glow (skip on low quality)
    if (this.category === 'playerBullet') {
      var g = window.game;
      if (!g || g.effectsQuality !== 'low') {
        ctx.globalCompositeOperation = 'lighter';
      }
    }

    // --- Shuriken: spinning star ---
    if (this.rotationSpeed) {
      this._drawShuriken(ctx);
      ctx.restore();
      return;
    }

    // --- Flame: flickering fireball ---
    if (this.pierceCount >= 1 && this.size >= 7 && this.lifetime <= 0.6) {
      this._drawFlame(ctx);
      ctx.restore();
      return;
    }

    // --- Ice shard: crystal shape ---
    if (this.slowAmount) {
      this._drawIceShard(ctx);
      ctx.restore();
      return;
    }

    // --- Lightning bolt: electric arc ---
    if (this.chainCount && this.chainRange) {
      this._drawLightningBolt(ctx);
      ctx.restore();
      return;
    }

    // --- Photon beam: wide glowing beam ---
    if (this.hitRadius >= 7 && this.pierceCount >= 10) {
      this._drawPhotonBeam(ctx);
      ctx.restore();
      return;
    }

    // --- Void rift: dark swirling vortex ---
    if (this.executeThreshold) {
      this._drawVoidRift(ctx);
      ctx.restore();
      return;
    }

    // --- Gravity well: gravitational rings ---
    if (this.wellRadius && this.pullForce) {
      this._drawGravityWell(ctx);
      ctx.restore();
      return;
    }

    // --- Explosive: pulsing bomb ---
    if (this.explosionRadius > 0 && !this.homingStrength) {
      this._drawExplosive(ctx);
      ctx.restore();
      return;
    }

    // --- Homing missile: tracking with smoke ---
    if (this.homingStrength > 0 && this.explosionRadius > 0) {
      this._drawMissile(ctx);
      ctx.restore();
      return;
    }

    // --- Homing bullet: glowing tracker ---
    if (this.homingStrength > 0) {
      this._drawHoming(ctx);
      ctx.restore();
      return;
    }

    // --- Boomerang: spinning return ---
    if (this.range > 0) {
      this._drawBoomerang(ctx);
      ctx.restore();
      return;
    }

    // --- Laser: thin fast beam ---
    if (this.speed >= 1000 && this.size <= 2.5) {
      this._drawLaser(ctx);
      ctx.restore();
      return;
    }

    // --- Needle: tiny piercing dart ---
    if (this.pierceCount > 0 && this.size <= 2) {
      this._drawNeedle(ctx);
      ctx.restore();
      return;
    }

    // --- Pierce / plasma: piercing bolt ---
    if (this.pierceCount > 0) {
      this._drawPierce(ctx);
      ctx.restore();
      return;
    }

    // --- Wave: sinusoidal glow ---
    if (this.amplitude > 0 && this.frequency > 0) {
      this._drawWave(ctx);
      ctx.restore();
      return;
    }

    // --- Default: standard circle bullet ---
    this._drawDefault(ctx);

    ctx.restore();
  }

  // ============================================================
  //  DRAW HELPERS — unique weapon visuals
  // ============================================================

  _drawDefault(ctx) {
    // Outer glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Inner bright core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  _drawShuriken(ctx) {
    var r = this.size;
    var points = 4;
    var inner = r * 0.4;
    ctx.translate(this.x, this.y);
    ctx.rotate((this._age || 0) * (this.rotationSpeed || 8));
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var radius = i % 2 === 0 ? r : inner;
      var angle = (i * Math.PI) / points;
      var px = Math.cos(angle) * radius;
      var py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    // Center glow
    ctx.beginPath();
    ctx.arc(0, 0, inner * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  _drawFlame(ctx) {
    var flicker = 0.8 + Math.random() * 0.4;
    var r = this.size * flicker;
    // Outer flame (orange/red)
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // Mid flame (yellow)
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    // Core (white)
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  _drawIceShard(ctx) {
    var r = this.size;
    ctx.translate(this.x, this.y);
    var angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(angle);
    // Diamond/crystal shape
    ctx.beginPath();
    ctx.moveTo(r * 1.5, 0);
    ctx.lineTo(0, r * 0.6);
    ctx.lineTo(-r * 0.8, 0);
    ctx.lineTo(0, -r * 0.6);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    // Inner shine
    ctx.beginPath();
    ctx.moveTo(r * 0.8, 0);
    ctx.lineTo(0, r * 0.25);
    ctx.lineTo(-r * 0.3, 0);
    ctx.lineTo(0, -r * 0.25);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  _drawLightningBolt(ctx) {
    var r = this.size;
    // Electric glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 100, 0.2)';
    ctx.fill();
    // Core bolt
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // Bright center
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // Random spark offsets
    for (var i = 0; i < 3; i++) {
      var sx = this.x + (Math.random() - 0.5) * r * 4;
      var sy = this.y + (Math.random() - 0.5) * r * 4;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fillStyle = '#ffff88';
      ctx.fill();
    }
  }

  _drawPhotonBeam(ctx) {
    var w = this.hitRadius || 8;
    ctx.translate(this.x, this.y);
    var angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(angle);
    // Wide beam rectangle
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-w, -w * 0.5, w * 2, w);
    // Bright core line
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w, -w * 0.15, w * 2, w * 0.3);
  }

  _drawVoidRift(ctx) {
    var r = this.size;
    var pulse = 0.85 + Math.sin((this._age || 0) * 12) * 0.15;
    // Dark outer ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * pulse * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(68, 0, 136, 0.4)';
    ctx.fill();
    // Purple core
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * pulse, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // Bright center dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#cc88ff';
    ctx.fill();
  }

  _drawGravityWell(ctx) {
    var r = this.size;
    var t = (this._age || 0) * 3;
    // Concentric gravitational rings
    for (var i = 0; i < 3; i++) {
      var ringR = r * (1.5 + i * 0.8) + Math.sin(t + i) * 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = 0.3 - i * 0.08;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  _drawExplosive(ctx) {
    var r = this.size;
    var pulse = 1 + Math.sin((this._age || 0) * 10) * 0.15;
    // Outer warning glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * pulse * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
    ctx.fill();
    // Main body
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * pulse, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // Fuse spark
    ctx.beginPath();
    ctx.arc(this.x, this.y - r * 0.8, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.fill();
  }

  _drawMissile(ctx) {
    var r = this.size;
    ctx.translate(this.x, this.y);
    var angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(angle);
    // Missile body (elongated)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.3, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nose cone
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(r * 1.3, 0);
    ctx.lineTo(r * 0.8, -r * 0.3);
    ctx.lineTo(r * 0.8, r * 0.3);
    ctx.closePath();
    ctx.fill();
    // Exhaust
    ctx.fillStyle = '#ff4400';
    ctx.beginPath();
    ctx.arc(-r * 1.2, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawHoming(ctx) {
    var r = this.size;
    // Tracking glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.2;
    ctx.fill();
    ctx.globalAlpha = 1;
    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // Center
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  _drawBoomerang(ctx) {
    var r = this.size;
    ctx.translate(this.x, this.y);
    ctx.rotate((this._age || 0) * 10);
    // V-shaped boomerang
    ctx.strokeStyle = this.color;
    ctx.lineWidth = r * 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r, -r * 0.6);
    ctx.lineTo(0, 0);
    ctx.lineTo(-r, r * 0.6);
    ctx.stroke();
    // Center glow
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  _drawLaser(ctx) {
    // Thin elongated beam
    ctx.translate(this.x, this.y);
    var angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(angle);
    // Glow
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(-2, -this.size * 2, 4, this.size * 4);
    // Core line
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -this.size * 3, 2, this.size * 6);
  }

  _drawNeedle(ctx) {
    // Tiny fast dart
    ctx.translate(this.x, this.y);
    var angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(angle);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.size * 3, 0);
    ctx.lineTo(-this.size, -this.size * 0.4);
    ctx.lineTo(-this.size, this.size * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  _drawPierce(ctx) {
    var r = this.size;
    // Elongated piercing bolt
    ctx.translate(this.x, this.y);
    var angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(angle);
    // Outer glow
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.5, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawWave(ctx) {
    var r = this.size;
    var pulse = 1 + Math.sin((this._age || 0) * 8) * 0.2;
    // Oscillating glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * pulse * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    // Core
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * pulse, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // ============================================================
  //  TRAIL PARTICLES
  // ============================================================
  _emitTrail() {
    var game = window.game;
    if (game.particles.length >= GAME_CONFIG.BALANCE.MAX_PARTICLES) return;

    // Use particle pool instead of creating new objects (prevents GC pressure)
    var p = game.getFromPool(game.particlePool, function() { return new Particle(); });
    if (!p) return;

    p.x = this.x;
    p.y = this.y;
    p.vx = (Math.random() - 0.5) * 30;
    p.vy = (Math.random() - 0.5) * 30;
    p.size = this.size * 0.45;
    p.color = this.trailColor;
    p.life = 250; // ms
    p.maxLife = 250;
    p.alpha = 1;
    p.gravity = 0;
    p.rotation = 0;
    p.rotationSpeed = 0;
    p.active = true;
    p.category = 'particle';
    p.drawLayer = this.drawLayer;
    p.hitRadius = 0;
    p.isSquare = false;
    p._customDraw = null;
    p._customUpdate = null;
    p._data = null;
    game.addEntity(p);
  }

  // ============================================================
  //  HIT HANDLING
  // ============================================================

  /**
   * Called by collision system when this bullet hits a target.
   * @param {Object} target - The entity that was hit
   * @returns {boolean} true if bullet is destroyed, false if it continues
   */
  onHit(target) {
    // Void rift execute: instant kill enemies below HP threshold
    if (this.executeThreshold && target.hp && target.maxHp &&
        target.hp / target.maxHp < this.executeThreshold) {
      target.takeDamage(9999);
    }

    // Ice / frost: slow + chance to freeze
    if (this.slowAmount && this.slowDuration && target) {
      target.slowAmount = Math.max(target.slowAmount || 0, this.slowAmount);
      target.slowTimer = Math.max(target.slowTimer || 0, this.slowDuration);
      var fChance = this.freezeChance || (this.slowAmount >= 0.45 ? 0.22 : 0);
      if (this.element === 'ice' || this.weaponId === 'frostMine' || this.weaponId === 'thunderIce') {
        fChance = Math.max(fChance, 0.18);
      }
      if (fChance > 0 && Math.random() < fChance) {
        target.frozenTimer = Math.max(target.frozenTimer || 0, this.freezeDuration || 1500);
      }
      if (window.ParticleSystem && window.ParticleSystem.spawn) {
        window.ParticleSystem.spawn(target.x, target.y, {
          count: 2, speed: 20, life: 500, size: 2,
          colors: ['#88ddff', '#aaeeff']
        });
      }
    }

    // Burn DoT
    if (this.burnDamage && this.burnDuration && target) {
      target.burnDamage = this.burnDamage;
      target.burnTimer = this.burnDuration;
      target.burnDuration = this.burnDuration;
    } else if (this.size >= 7 && this.lifetime <= 0.6 && this.pierceCount >= 1 && target) {
      target.burnDamage = this.damage * 0.3;
      target.burnTimer = 2000;
      target.burnDuration = 2000;
    }

    // Poison DoT
    if (this.poisonDamage && target) {
      target.poisonDamage = Math.max(target.poisonDamage || 0, this.poisonDamage);
      var pDur = this.poisonDuration || 3000;
      target.poisonTimer = Math.max(target.poisonTimer || 0, pDur);
      target.poisonDuration = pDur;
      if (window.ParticleSystem && window.ParticleSystem.spawn) {
        window.ParticleSystem.spawn(target.x, target.y, {
          count: 3, speed: 25, life: 400, size: 2, colors: ['#55cc44', '#88ff66']
        });
      }
    }

    // Status: blind / sleep from bullet or faction mods
    if (target && this.blindChance && Math.random() < this.blindChance) {
      target._blindTimer = Math.max(target._blindTimer || 0, 2000);
    }
    if (target && this.sleepChance && Math.random() < this.sleepChance) {
      target._sleepTimer = Math.max(target._sleepTimer || 0, 2500);
      target._sleeping = true;
    }

    // Lightning bolt: chain to nearby enemies
    if (this.chainCount && this.chainRange && !this._chainHit) {
      this._chainHit = true;
      this._doChainLightning(target);
    }

    // Pierce: track per-target to avoid multi-hits on same frame
    if (this.pierceCount > 0) {
      if (this._hitTargets && this._hitTargets.has(target)) {
        return false; // already hit this target
      }
      this._hitTargets.add(target);
      this.pierceCount--;
      if (this.pierceCount <= 0) {
        // Explosive on pierce depleted? Apply explosion on last hit
        if (this.explosionRadius > 0 && !this._exploded) {
          this._exploded = true;
          this._doExplosion();
        }
        this._deactivate();
        return true;
      }
      return false; // continues piercing
    }

    // Explosive: explode on first hit
    if (this.explosionRadius > 0 && !this._exploded) {
      this._exploded = true;
      this._doExplosion();
    }

    this._deactivate();
    return true;
  }

  /**
   * Chain lightning: hit nearby enemies after hitting primary target.
   * @param {Object} primaryTarget - The first enemy hit
   */
  _doChainLightning(primaryTarget) {
    var game = window.game;
    var enemies = game.enemies;
    if (!enemies) return;

    var chainCount = this.chainCount || 4;
    var chainRange = this.chainRange || 150;
    var falloff = 0.25;
    var hit = [primaryTarget];
    var current = primaryTarget;
    var chainDmg = this.damage * (1 - falloff);

    for (var i = 0; i < chainCount; i++) {
      if (!current) break;
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

      if (next) {
        hit.push(next);
        if (typeof next.takeDamage === 'function') {
          next.takeDamage(chainDmg);
        }
        // Spawn chain visual
        this._spawnChainVisual(current.x, current.y, next.x, next.y);
        chainDmg *= (1 - falloff);
      }
      current = next;
    }
  }

  /**
   * Spawn lightning visual between two points.
   */
  _spawnChainVisual(x1, y1, x2, y2) {
    var game = window.game;
    var segments = 4;
    for (var i = 0; i < segments; i++) {
      var t = (i + 0.5) / segments;
      var jitter = 6;
      var mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
      var my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter;
      if (game.particles.length >= GAME_CONFIG.BALANCE.MAX_PARTICLES) break;
      var p = game.getFromPool(game.particlePool, function() { return new Particle(); });
      if (!p) return;
      p.x = mx;
      p.y = my;
      p.vx = (Math.random() - 0.5) * 20;
      p.vy = (Math.random() - 0.5) * 20;
      p.size = 2 + Math.random() * 2;
      p.color = this.color || '#ffff44';
      p.life = 200;
      p.maxLife = 200;
      p.alpha = 1;
      p.gravity = 0;
      p.rotation = 0;
      p.rotationSpeed = 0;
      p.active = true;
      p.category = 'particle';
      p.drawLayer = 6;
      p.hitRadius = 0;
      p.isSquare = true;
      p._customDraw = null;
      p._customUpdate = null;
      p._data = null;
      game.addEntity(p);
    }
  }

  // ============================================================
  //  EXPLOSION
  // ============================================================
  _onExpire() {
    if (this.explosionRadius > 0 && !this._exploded) {
      this._exploded = true;
      this._doExplosion();
    }
  }

  _doExplosion() {
    var game = window.game;
    var targets = (this.category === 'playerBullet')
      ? game.enemies
      : game.players;

    for (var i = targets.length - 1; i >= 0; i--) {
      var t = targets[i];
      if (!t.active) continue;
      var dx = t.x - this.x;
      var dy = t.y - this.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var hitR = t.hitRadius !== undefined ? t.hitRadius : (t.size || 16);
      if (dist < this.explosionRadius + hitR) {
        if (t.takeDamage) {
          t.takeDamage(this.damage);
        }
      }
    }

    // Explosion particles — 走对象池，避免 GC 尖峰
    if (window.ParticleSystem && game.particles.length < GAME_CONFIG.BALANCE.MAX_PARTICLES) {
      window.ParticleSystem.spawn(this.x, this.y, GAME_CONFIG.PARTICLE_PRESETS.smallExplosion);
    }
  }

  // ============================================================
  //  DEACTIVATION & POOL RETURN
  // ============================================================
  _deactivate() {
    if (!this.active) return;
    this.active = false;

    // Clear references to prevent leaks
    this.homingTarget = null;
    this._hitTargets = null;

    window.game.removeEntity(this);
    window.game.returnToPool(window.game.bulletPool, this, 600);
  }
}

// Expose
window.Bullet = Bullet;


// ============================================================
//  BULLET PATTERNS
// ============================================================

var BulletPatterns = {

  // ----------------------------------------------------------
  //  HELPERS
  // ----------------------------------------------------------

  /**
   * Internal: create a bullet from pool with given props, add to game.
   * Returns the bullet (already active and registered).
   */
  _create: function(props) {
    // Inject pending faction modifiers (set by WeaponManager._fireWeapon)
    if (window._pendingFactionMods) {
      var fm = window._pendingFactionMods;
      // Only apply to player bullets; skip if props already has these set explicitly
      if (props.category === 'playerBullet') {
        if (fm.chainCount !== undefined   && props.chainCount === undefined)   props.chainCount   = fm.chainCount;
        if (fm.chainRange !== undefined   && props.chainRange === undefined)   props.chainRange   = fm.chainRange;
        if (fm.chainDamage !== undefined  && props.chainDamage === undefined)  props.chainDamage  = fm.chainDamage;
        if (fm.slowAmount !== undefined   && props.slowAmount === undefined)   props.slowAmount   = fm.slowAmount;
        if (fm.slowDuration !== undefined && props.slowDuration === undefined) props.slowDuration = fm.slowDuration;
        if (fm.burnDamage !== undefined   && props.burnDamage === undefined)   props.burnDamage   = fm.burnDamage;
        if (fm.burnDuration !== undefined && props.burnDuration === undefined) props.burnDuration = fm.burnDuration;
        if (fm.poisonDamage !== undefined && props.poisonDamage === undefined) props.poisonDamage = fm.poisonDamage;
        if (fm.poisonDuration !== undefined && props.poisonDuration === undefined) props.poisonDuration = fm.poisonDuration;
        if (fm.executeThreshold !== undefined && props.executeThreshold === undefined) props.executeThreshold = fm.executeThreshold;
        if (fm.knockbackForce !== undefined  && props.knockbackForce === undefined)  props.knockbackForce  = fm.knockbackForce;
        if (fm.gravityPull !== undefined   && props.pullForce === undefined && props.wellRadius === undefined) {
          props.pullForce = fm.gravityPull;
          props.wellRadius = 100;
        }
        if (fm.lifesteal !== undefined     && props.lifesteal === undefined)     props.lifesteal     = fm.lifesteal;
        if (fm.blindChance !== undefined   && props.blindChance === undefined)   props.blindChance   = fm.blindChance;
        if (fm.sleepChance !== undefined   && props.sleepChance === undefined)   props.sleepChance   = fm.sleepChance;
        if (fm.tornadoChance !== undefined && props.tornadoChance === undefined) props.tornadoChance = fm.tornadoChance;
        if (fm.healOnHit !== undefined    && props.healOnHit === undefined)     props.healOnHit     = fm.healOnHit;
        if (fm.freezeChance !== undefined && props.freezeChance === undefined) props.freezeChance = fm.freezeChance;
        if (fm.bounceCount !== undefined && props.bounceCount === undefined) props.bounceCount = fm.bounceCount;
        if (fm.bounceRetention !== undefined && props.bounceRetention === undefined) props.bounceRetention = fm.bounceRetention;
        if (fm.pierceCount !== undefined && props.pierceCount === undefined) props.pierceCount = fm.pierceCount;
        if (fm.factionCritBonus !== undefined && props.factionCritBonus === undefined) props.factionCritBonus = fm.factionCritBonus;
        if (fm.critRate !== undefined && props.factionCritBonus === undefined) props.factionCritBonus = fm.critRate;
        // Attach faction ID for on-hit effects
        props.factionId = window._pendingFactionId || null;
      }
    }
    // Inject per-weapon config status (slow/burn/poison/chain etc. from WEAPONS entry)
    if (window._pendingWeaponCfg && props.category === 'playerBullet') {
      var wc = window._pendingWeaponCfg;
      if (wc.slowAmount !== undefined && props.slowAmount === undefined) props.slowAmount = wc.slowAmount;
      if (wc.slowDuration !== undefined && props.slowDuration === undefined) props.slowDuration = wc.slowDuration;
      if (wc.burnDamage !== undefined && props.burnDamage === undefined) props.burnDamage = wc.burnDamage;
      if (wc.burnDuration !== undefined && props.burnDuration === undefined) props.burnDuration = wc.burnDuration;
      if (wc.poisonDamage !== undefined && props.poisonDamage === undefined) props.poisonDamage = wc.poisonDamage;
      if (wc.poisonDuration !== undefined && props.poisonDuration === undefined) props.poisonDuration = wc.poisonDuration;
      if (wc.executeThreshold !== undefined && props.executeThreshold === undefined) props.executeThreshold = wc.executeThreshold;
      if (wc.lifestealOnHit !== undefined && props.lifesteal === undefined) props.lifesteal = wc.lifestealOnHit;
      if (wc.lifestealPercent !== undefined && props.lifesteal === undefined) props.lifesteal = wc.lifestealPercent;
      if (wc.chainCount !== undefined && props.chainCount === undefined) props.chainCount = wc.chainCount;
      if (wc.chainRange !== undefined && props.chainRange === undefined) props.chainRange = wc.chainRange;
      if (wc.shatterDamage !== undefined && props.shatterDamage === undefined) props.shatterDamage = wc.shatterDamage;
      if (wc.shatterRadius !== undefined && props.shatterRadius === undefined) props.shatterRadius = wc.shatterRadius;
      if (wc.explosionRadius !== undefined && props.explosionRadius === undefined) props.explosionRadius = wc.explosionRadius;
    }
    if (props.category === 'playerBullet') {
      if (window._pendingWeaponId && !props.weaponId) props.weaponId = window._pendingWeaponId;
      if (window._pendingWeaponElement && !props.element) props.element = window._pendingWeaponElement;
    }
    var game = window.game;
    var b = game.getFromPool(game.bulletPool, function(existing) {
      var bullet = existing || new Bullet();
      bullet.setup(props);
      return bullet;
    });
    b.active = true;
    game.addEntity(b);
    return b;
  },

  // ----------------------------------------------------------
  //  1. normal — Single bullet at given angle
  // ----------------------------------------------------------
  normal: function(x, y, angle, speed, damage, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 4,
      hitRadius: 3.2,
      lifetime: 3
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  2. spread — N bullets in an arc
  // ----------------------------------------------------------
  spread: function(x, y, count, spreadAngleDeg, speed, damage, color, trailColor, baseAngle) {
    var bullets = [];
    if (count <= 0) return bullets;

    var base = (typeof baseAngle === 'number') ? baseAngle : -Math.PI / 2;
    var spreadRad = (spreadAngleDeg || 25) * (Math.PI / 180);
    var startAngle = base - spreadRad / 2;
    var step = count > 1 ? spreadRad / (count - 1) : 0;

    for (var i = 0; i < count; i++) {
      var angle = startAngle + step * i;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 3.5,
        hitRadius: 2.8,
        lifetime: 2.5
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  2b. spreadAimed — N bullets in an arc toward a specific direction
  // ----------------------------------------------------------
  spreadAimed: function(x, y, count, spreadAngle, speed, damage, baseAngle, color, trailColor) {
    var bullets = [];
    var startAngle = baseAngle - spreadAngle / 2;
    var step = count > 1 ? spreadAngle / (count - 1) : 0;
    for (var i = 0; i < count; i++) {
      var angle = startAngle + step * i;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor || color,
        category: 'enemyBullet',
        size: 5,
        hitRadius: 4,
        lifetime: 4,
        drawLayer: 2
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  3. homing — Bullet that curves toward target
  // ----------------------------------------------------------
  homing: function(x, y, speed, damage, color, trailColor, target, homingStrength) {
    var str = typeof homingStrength === 'number' ? homingStrength : 0.05;
    var baseAngle = target
      ? Math.atan2(target.y - y, target.x - x)
      : -Math.PI / 2;

    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(baseAngle) * speed,
      vy: Math.sin(baseAngle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 4,
      homingTarget: target || null,
      homingStrength: str
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  4. laser — Fast, thin bullet
  // ----------------------------------------------------------
  laser: function(x, y, speed, damage, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: 0,
      vy: -speed,                // upward by default
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 2,
      hitRadius: 1.6,
      lifetime: 0.8
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  5. orbital — Bullet spawned from an orbital position
  // ----------------------------------------------------------
  orbital: function(x, y, angle, radius, speed, damage, color, trailColor) {
    var spawnX = x + Math.cos(angle) * radius;
    var spawnY = y + Math.sin(angle) * radius;
    // Direction: radial outward from center (x,y) through spawn point
    var dirAngle = Math.atan2(spawnY - y, spawnX - x);

    var bullet = this._create({
      x: spawnX, y: spawnY,
      vx: Math.cos(dirAngle) * speed,
      vy: Math.sin(dirAngle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 4,
      hitRadius: 3.2,
      lifetime: 3
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  6. arc — Instant line damage (returns hit target array)
  // ----------------------------------------------------------
  arc: function(x, y, target, damage, color, trailColor) {
    var game = window.game;
    var hits = [];

    var lineDx = target.x - x;
    var lineDy = target.y - y;
    var lineLen = Math.sqrt(lineDx * lineDx + lineDy * lineDy);
    if (lineLen === 0) return hits;

    var lineThickness = 6; // half-width of the hit zone

    // Check all enemies against the line segment
    for (var i = game.enemies.length - 1; i >= 0; i--) {
      var enemy = game.enemies[i];
      if (!enemy.active) continue;

      // Closest point on segment to enemy center
      var ex = enemy.x - x;
      var ey = enemy.y - y;
      var t = Math.max(0, Math.min(1, (ex * lineDx + ey * lineDy) / (lineLen * lineLen)));
      var closestX = x + t * lineDx;
      var closestY = y + t * lineDy;

      var distX = enemy.x - closestX;
      var distY = enemy.y - closestY;
      var dist = Math.sqrt(distX * distX + distY * distY);

      var hitR = (enemy.hitRadius !== undefined ? enemy.hitRadius : (enemy.size || 16)) + lineThickness;
      if (dist < hitR) {
        if (enemy.takeDamage) {
          enemy.takeDamage(damage);
        }
        hits.push(enemy);
      }
    }

    // Visual: particles along the line
    var steps = 14;
    for (var j = 0; j <= steps; j++) {
      if (game.particles.length >= GAME_CONFIG.BALANCE.MAX_PARTICLES) break;
      var t2 = j / steps;
      game.addEntity({
        x: x + lineDx * t2,
        y: y + lineDy * t2,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        size: 2 + Math.random() * 4,
        color: color || '#ffffff',
        lifetime: 0.15 + Math.random() * 0.2,
        active: true,
        category: 'particle',
        drawLayer: 4,
        _age: 0,

        update: function(dt) {
          this._age += dt;
          if (this._age >= this.lifetime || this.size <= 0.1) {
             this.active = false;
             window.game.removeEntity(this);
             return;
          }
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.size *= 0.88;
        },

        draw: function(ctx) {
          if (!this.active) return;
          var alpha = 1 - this._age / this.lifetime;
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    }

    return hits;
  },

  // ----------------------------------------------------------
  //  7. boomerang — Bullet reverses after traveling range
  // ----------------------------------------------------------
  boomerang: function(x, y, angle, speed, range, damage, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 5,
      range: range,
      originX: x,
      originY: y
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  8. pierce — Bullet that passes through N enemies
  // ----------------------------------------------------------
  pierce: function(x, y, angle, speed, damage, pierceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 3,
      pierceCount: typeof pierceCount === 'number' ? pierceCount : 3
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  9. explosive — Slow bullet, explodes on hit or death
  // ----------------------------------------------------------
  explosive: function(x, y, angle, speed, damage, radius, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 6,
      hitRadius: 5,
      lifetime: 4,
      explosionRadius: radius || 80
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  10. wave — Sinusoidal bullet
  // ----------------------------------------------------------
  wave: function(x, y, angle, speed, damage, amplitude, frequency, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 4,
      hitRadius: 3.2,
      lifetime: 4,
      amplitude: amplitude || 50,
      frequency: frequency || 6,
      originX: x,
      originY: y
    });

    // Store wave base angle for the update logic
    bullet._waveBaseAngle = angle;

    return [bullet];
  },

  // ----------------------------------------------------------
  //  11. circle — N bullets in a full 360° circle
  // ----------------------------------------------------------
  circle: function(x, y, count, speed, damage, color, opts) {
    var bullets = [];
    if (count <= 0) return bullets;

    var angleStep = (Math.PI * 2) / count;
    for (var i = 0; i < count; i++) {
      var angle = angleStep * i;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: color,
        category: 'enemyBullet',
        size: 5,
        hitRadius: 4,
        lifetime: 4,
        drawLayer: 2,
        sourceCategory: opts && opts.sourceCategory || 'normal'
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  12. aimed — N bullets aimed at target position with spread
  // ----------------------------------------------------------
  aimed: function(x, y, count, targetX, targetY, speed, damage, color, spreadAngle, opts) {
    var bullets = [];
    if (count <= 0) return bullets;

    var baseAngle = Math.atan2(targetY - y, targetX - x);
    var spread = typeof spreadAngle === 'number' ? spreadAngle : 0;
    var spreadRad = spread * (Math.PI / 180);
    var startAngle = baseAngle - spreadRad / 2;
    var step = count > 1 ? spreadRad / (count - 1) : 0;

    for (var i = 0; i < count; i++) {
      var angle = startAngle + step * i;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: color,
        category: 'enemyBullet',
        size: 5,
        hitRadius: 4,
        lifetime: 4,
        drawLayer: 2,
        sourceCategory: opts && opts.sourceCategory || 'normal'
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  12b. down — straight downward shot(s) (STG default)
  // ----------------------------------------------------------
  down: function(x, y, count, speed, damage, color, spreadAngle, opts) {
    var targetY = y + 800;
    return this.aimed(x, y, count || 1, x, targetY, speed, damage, color, spreadAngle || 0, opts);
  },

  // ----------------------------------------------------------
  //  12c. downSpread — fan of bullets firing downward
  // ----------------------------------------------------------
  downSpread: function(x, y, count, speed, damage, color, spreadAngle, opts) {
    return this.aimed(x, y, count || 3, x, y + 800, speed, damage, color, spreadAngle || 30, opts);
  },

  // ----------------------------------------------------------
  //  13. spiralOut — Bullets in expanding spiral pattern
  // ----------------------------------------------------------
  spiralOut: function(x, y, count, speed, damage, color, spreadAngle, opts) {
    var bullets = [];
    if (count <= 0) return bullets;

    // Each bullet fires at an increasing angle offset, creating a spiral
    var offsetDeg = typeof spreadAngle === 'number' ? spreadAngle : 30;
    var offsetRad = offsetDeg * (Math.PI / 180);

    for (var i = 0; i < count; i++) {
      var angle = offsetRad * i;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: color,
        category: 'enemyBullet',
        size: 5,
        hitRadius: 4,
        lifetime: 4,
        drawLayer: 2,
        sourceCategory: opts && opts.sourceCategory || 'normal'
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  14. gravityWell — Bullet that pulls enemies toward it
  // ----------------------------------------------------------
  gravityWell: function(x, y, angle, speed, damage, wellRadius, pullForce, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 3,
      wellRadius: wellRadius || 100,
      pullForce: pullForce || 80
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  15. voidRift — Bullet with execute threshold
  // ----------------------------------------------------------
  voidRift: function(x, y, angle, speed, damage, executeThreshold, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 6,
      hitRadius: 5,
      lifetime: 3.5,
      pierceCount: 2,
      executeThreshold: executeThreshold || 0.1
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  16. missile — Homing missile with explosion
  // ----------------------------------------------------------
  missile: function(x, y, angle, speed, damage, homingStrength, explosionRadius, color, trailColor) {
    // 复用全局寻敌管理器，避免每枚导弹 O(n) 扫描
    var nearest = null;
    var htm = window.homingTargets;
    if (htm) {
      nearest = htm.getTarget() || htm.findNearestTo(x, y, 400);
    }
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 7,
      hitRadius: 6,
      lifetime: 4,
      homingStrength: homingStrength || 0.04,
      homingTarget: nearest || null,
      explosionRadius: explosionRadius || 80
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  17. needle — Fast, small, piercing bullet
  // ----------------------------------------------------------
  needle: function(x, y, angle, speed, damage, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 1.5,
      hitRadius: 1.2,
      lifetime: 2,
      pierceCount: 2
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  18. flame — Short range area damage
  // ----------------------------------------------------------
  flame: function(x, y, angle, speed, damage, flameLength, color, trailColor) {
    var bullets = [];
    for (var i = 0; i < 3; i++) {
      var spread = (Math.random() - 0.5) * 0.4;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 8,
        hitRadius: 6,
        lifetime: 0.5,
        pierceCount: 1
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  19. shuriken — Spinning projectile
  // ----------------------------------------------------------
  shuriken: function(x, y, angle, speed, damage, spinSpeed, pierceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 3,
      pierceCount: pierceCount || 5,
      rotationSpeed: spinSpeed || 8
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  20. lightningBolt — Chain lightning
  // ----------------------------------------------------------
  lightningBolt: function(x, y, angle, speed, damage, chainCount, chainRange, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 2,
      hitRadius: 1.5,
      lifetime: 1.5,
      chainCount: chainCount || 4,
      chainRange: chainRange || 150,
      element: 'lightning'
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  21. iceShard — Slows enemies
  // ----------------------------------------------------------
  iceShard: function(x, y, angle, speed, damage, slowAmount, slowDuration, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 3,
      slowAmount: slowAmount || 0.4,
      slowDuration: slowDuration || 2000,
      element: 'ice'
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  22. rocketBarrage — Multiple rockets
  // ----------------------------------------------------------
  rocketBarrage: function(x, y, angle, speed, damage, rocketCount, explosionRadius, spreadAngle, color, trailColor) {
    var bullets = [];
    var halfSpread = (spreadAngle || 30) * Math.PI / 180 / 2;
    for (var i = 0; i < (rocketCount || 5); i++) {
      var offset = -halfSpread + (i / ((rocketCount || 5) - 1)) * (halfSpread * 2);
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle + offset) * speed,
        vy: Math.sin(angle + offset) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 9,
        hitRadius: 7,
        lifetime: 4,
        explosionRadius: explosionRadius || 90
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  23. photonBeam — Continuous beam
  // ----------------------------------------------------------
  photonBeam: function(x, y, angle, speed, damage, beamWidth, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: beamWidth || 8,
      lifetime: 0.8,
      pierceCount: 10
    });
    return [bullet];
  },

  // ============================================================
  //  FUSION WEAPON PATTERNS
  // ============================================================

  // ----------------------------------------------------------
  //  F1. plasmaGun — Fast piercing plasma bolts
  // ----------------------------------------------------------
  plasmaGun: function(x, y, angle, speed, damage, pierceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 2.5,
      pierceCount: pierceCount || 2
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F2. smartSpread — Homing fan bullets
  // ----------------------------------------------------------
  smartSpread: function(x, y, count, spreadAngleDeg, speed, damage, color, trailColor, homingStrength, homingRange, baseAngle) {
    var bullets = [];
    if (count <= 0) return bullets;
    var base = (typeof baseAngle === 'number') ? baseAngle : -Math.PI / 2;
    var spreadRad = (spreadAngleDeg || 30) * (Math.PI / 180);
    var startAngle = base - spreadRad / 2;
    var step = count > 1 ? spreadRad / (count - 1) : 0;

    for (var i = 0; i < count; i++) {
      var angle = startAngle + step * i;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 3.5,
        hitRadius: 2.8,
        lifetime: 3,
        homingStrength: homingStrength || 0.04,
        homingRange: homingRange || 350
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F3. phantomBlade — Piercing boomerang
  // ----------------------------------------------------------
  phantomBlade: function(x, y, angle, speed, range, damage, pierceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 4,
      originX: x,
      originY: y,
      range: range || 380,
      pierceCount: pierceCount || 4
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F4. shockwaveWep — Wave + explosion
  // ----------------------------------------------------------
  shockwaveWep: function(x, y, angle, speed, damage, waveAmplitude, waveFrequency, explosionRadius, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 3,
      amplitude: waveAmplitude || 4,
      frequency: waveFrequency || 0.05,
      explosionRadius: explosionRadius || 55
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F5. plagueFlame — Penetrating burning flame
  // ----------------------------------------------------------
  plagueFlame: function(x, y, angle, speed, damage, flameLength, pierceCount, burnDamage, poisonDamage, poisonDuration, color, trailColor) {
    var bullets = [];
    // Fire 3 flames in a tight spread for plague effect
    for (var i = -1; i <= 1; i++) {
      var a = angle + i * 0.08;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 6,
        hitRadius: 5,
        lifetime: (flameLength || 200) / speed + 0.3,
        pierceCount: pierceCount || 3,
        burnDamage: burnDamage || 8,
        burnDuration: 3000,
        poisonDamage: poisonDamage || 6,
        poisonDuration: poisonDuration || 3500,
        element: 'poison'
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F6. thunderIce — Freezing chain lightning bolt
  // ----------------------------------------------------------
  thunderIce: function(x, y, angle, speed, damage, chainCount, chainRange, slowAmount, slowDuration, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 2,
      chainCount: chainCount || 4,
      chainRange: chainRange || 160,
      slowAmount: slowAmount || 0.5,
      slowDuration: slowDuration || 2500,
      freezeChance: 0.25,
      freezeDuration: 1800,
      element: 'ice'
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F7. deathStorm — Homing spinning blade swarm
  // ----------------------------------------------------------
  deathStorm: function(x, y, angle, speed, damage, missileCount, homingStrength, homingRange, spinSpeed, pierceCount, color, trailColor) {
    var bullets = [];
    for (var i = 0; i < (missileCount || 4); i++) {
      var spreadAngle = (i - (missileCount - 1) / 2) * 0.25;
      var a = angle + spreadAngle;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 5,
        hitRadius: 4,
        lifetime: 3.5,
        homingStrength: homingStrength || 0.06,
        homingRange: homingRange || 400,
        spinSpeed: spinSpeed || 6,
        pierceCount: pierceCount || 3
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F8. singularityBeam — Gravity well + void rift
  // ----------------------------------------------------------
  singularityBeam: function(x, y, angle, speed, damage, wellRadius, pullForce, wellDamage, executeThreshold, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 3,
      wellRadius: wellRadius || 120,
      pullForce: pullForce || 100,
      wellDamage: wellDamage || 12,
      executeThreshold: executeThreshold || 0.12
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F9. clusterBomb — Homing missiles that create gravity wells
  // ----------------------------------------------------------
  clusterBomb: function(x, y, angle, speed, damage, missileCount, explosionRadius, homingStrength, wellRadius, pullForce, color, trailColor) {
    var bullets = [];
    for (var i = 0; i < (missileCount || 3); i++) {
      var spreadAngle = (i - (missileCount - 1) / 2) * 0.3;
      var a = angle + spreadAngle;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 7,
        hitRadius: 5.5,
        lifetime: 3.5,
        homingStrength: homingStrength || 0.04,
        homingRange: 350,
        explosionRadius: explosionRadius || 85,
        wellRadius: wellRadius || 90,
        pullForce: pullForce || 70
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F10. elementCannon — Alternating fire/ice element shots
  // ----------------------------------------------------------
  _elementCannonToggle: false,
  elementCannon: function(x, y, angle, speed, damage, burnDamage, burnDuration, slowAmount, slowDuration, color, trailColor) {
    // Toggle between fire and ice shots
    this._elementCannonToggle = !this._elementCannonToggle;
    var isFire = this._elementCannonToggle;
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: isFire ? '#ff6600' : '#88ddff',
      trailColor: isFire ? '#ff3300' : '#4499cc',
      category: 'playerBullet',
      size: 4,
      hitRadius: 3.5,
      lifetime: 2.5,
      burnDamage: isFire ? (burnDamage || 7) : 0,
      burnDuration: isFire ? (burnDuration || 2000) : 0,
      slowAmount: isFire ? 0 : (slowAmount || 0.4),
      slowDuration: isFire ? 0 : (slowDuration || 2000),
      element: isFire ? 'fire' : 'ice',
      freezeChance: isFire ? 0 : 0.15
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F11. thunderMissile — Lightning chain homing missiles
  // ----------------------------------------------------------
  thunderMissile: function(x, y, angle, speed, damage, missileCount, homingStrength, explosionRadius, chainCount, chainRange, color, trailColor) {
    var bullets = [];
    for (var i = 0; i < (missileCount || 3); i++) {
      var spreadAngle = (i - (missileCount - 1) / 2) * 0.35;
      var a = angle + spreadAngle;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 6,
        hitRadius: 5,
        lifetime: 3.5,
        homingStrength: homingStrength || 0.05,
        homingRange: 380,
        explosionRadius: explosionRadius || 75,
        chainCount: chainCount || 3,
        chainRange: chainRange || 140
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F12. gravityBlade — Gravity-pulling boomerang blades
  // ----------------------------------------------------------
  gravityBlade: function(x, y, angle, speed, range, damage, spinSpeed, pierceCount, wellRadius, pullForce, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 4,
      originX: x,
      originY: y,
      range: range || 360,
      pierceCount: pierceCount || 4,
      spinSpeed: spinSpeed || 7,
      wellRadius: wellRadius || 80,
      pullForce: pullForce || 60
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F13. voidRocket — Void explosion homing rockets
  // ----------------------------------------------------------
  voidRocket: function(x, y, angle, speed, damage, missileCount, homingStrength, explosionRadius, executeThreshold, color, trailColor) {
    var bullets = [];
    for (var i = 0; i < (missileCount || 3); i++) {
      var spreadAngle = (i - (missileCount - 1) / 2) * 0.3;
      var a = angle + spreadAngle;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 7,
        hitRadius: 5.5,
        lifetime: 3.5,
        homingStrength: homingStrength || 0.04,
        homingRange: 350,
        explosionRadius: explosionRadius || 80,
        executeThreshold: executeThreshold || 0.1
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F14. photonNeedle — Ultra-fast photon piercing needles
  // ----------------------------------------------------------
  photonNeedle: function(x, y, angle, speed, damage, bulletCount, pierceCount, color, trailColor) {
    var bullets = [];
    for (var i = 0; i < (bulletCount || 3); i++) {
      var offset = (i - (bulletCount - 1) / 2) * 0.06;
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 1.5,
        hitRadius: 1.2,
        lifetime: 1.5,
        pierceCount: pierceCount || 4
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N1. flameThrower — Wide cone flame burst with burn
  // ----------------------------------------------------------
  flameThrower: function(x, y, angle, speed, damage, flameAngle, flameCount, burnDamage, burnDuration, color, trailColor) {
    var bullets = [];
    var halfAngle = (flameAngle || 50) * Math.PI / 180 / 2;
    var count = flameCount || 5;
    for (var i = 0; i < count; i++) {
      var spread = -halfAngle + (i / (count - 1)) * (halfAngle * 2);
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 10,
        hitRadius: 8,
        lifetime: 0.45,
        pierceCount: 1,
        burnDamage: burnDamage || 6,
        burnDuration: burnDuration || 2000
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N2. frostCannon — Single large frost bullet with slow
  // ----------------------------------------------------------
  frostCannon: function(x, y, angle, speed, damage, slowAmount, slowDuration, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 3,
      slowAmount: slowAmount || 0.5,
      slowDuration: slowDuration || 3000
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N3. lightningGun — Chain lightning bolt
  // ----------------------------------------------------------
  lightningGun: function(x, y, angle, speed, damage, chainCount, chainRange, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 1.5,
      chainCount: chainCount || 5,
      chainRange: chainRange || 200
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N4. rocketLauncher — Single heavy rocket with big explosion
  // ----------------------------------------------------------
  rocketLauncher: function(x, y, angle, speed, damage, explosionRadius, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 8,
      hitRadius: 6,
      lifetime: 4,
      explosionRadius: explosionRadius || 100
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N5. mineLayer — Drops stationary mines that explode
  // ----------------------------------------------------------
  mineLayer: function(x, y, angle, speed, damage, explosionRadius, mineCount, color, trailColor) {
    var bullets = [];
    var count = mineCount || 3;
    for (var i = 0; i < count; i++) {
      var spread = (i - (count - 1) / 2) * 0.5;
      var a = angle + spread;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 4,
        hitRadius: 3,
        lifetime: 5,
        explosionRadius: explosionRadius || 80
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N6. energyWhip — 360° radial burst (short range)
  // ----------------------------------------------------------
  energyWhip: function(x, y, angle, speed, damage, whipCount, color, trailColor) {
    var bullets = [];
    var count = whipCount || 8;
    for (var i = 0; i < count; i++) {
      var a = (Math.PI * 2 * i) / count;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 3,
        hitRadius: 2.5,
        lifetime: 0.5,
        pierceCount: 2
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N7. sawBlade — Spinning saw with high pierce
  // ----------------------------------------------------------
  sawBlade: function(x, y, angle, speed, damage, spinSpeed, pierceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 6,
      hitRadius: 5,
      lifetime: 3,
      pierceCount: pierceCount || 6,
      rotationSpeed: spinSpeed || 12
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N8. venomGun — Large toxic bullet with poison DOT
  // ----------------------------------------------------------
  venomGun: function(x, y, angle, speed, damage, pierceCount, poisonDamage, poisonDuration, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 8,
      hitRadius: 6,
      lifetime: 1.5,
      pierceCount: pierceCount || 2,
      poisonDamage: poisonDamage || 8,
      poisonDuration: poisonDuration || 3500,
      element: 'poison'
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N9. magnetGun — Gravity well bullet that pulls enemies
  // ----------------------------------------------------------
  magnetGun: function(x, y, angle, speed, damage, wellRadius, pullForce, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 6,
      hitRadius: 5,
      lifetime: 3,
      wellRadius: wellRadius || 150,
      pullForce: pullForce || 120
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N10. blackHoleGen — Slow singularity with gravity + execute
  // ----------------------------------------------------------
  blackHoleGen: function(x, y, angle, speed, damage, wellRadius, pullForce, wellDamage, executeThreshold, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 8,
      hitRadius: 6,
      lifetime: 4,
      wellRadius: wellRadius || 200,
      pullForce: pullForce || 150,
      wellDamage: wellDamage || 15,
      executeThreshold: executeThreshold || 0.15
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F15. venomFlame — Short-range burning flame (orange/green)
  // ----------------------------------------------------------
  venomFlame: function(x, y, angle, speed, damage, flameLength, pierceCount, burnDamage, color, trailColor) {
    var bullets = [];
    for (var i = -1; i <= 1; i++) {
      var a = angle + i * 0.1;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 7,
        hitRadius: 5.5,
        lifetime: (flameLength || 200) / speed + 0.3,
        pierceCount: pierceCount || 3,
        burnDamage: burnDamage || 8
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F16. frostStorm — Rotating ice shard storm
  // ----------------------------------------------------------
  frostStorm: function(x, y, angle, speed, damage, spinSpeed, pierceCount, slowAmount, slowDuration, color, trailColor) {
    var bullets = [];
    var count = 5;
    for (var i = 0; i < count; i++) {
      var spreadAngle = (i - (count - 1) / 2) * 0.2;
      var a = angle + spreadAngle;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 5,
        hitRadius: 4,
        lifetime: 3.5,
        pierceCount: pierceCount || 3,
        spinSpeed: spinSpeed || 7,
        slowAmount: slowAmount || 0.45,
        slowDuration: slowDuration || 2500,
        freezeChance: 0.2,
        freezeDuration: 1800,
        element: 'ice'
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F17. thunderShock — Chain lightning wave
  // ----------------------------------------------------------
  thunderShock: function(x, y, angle, speed, damage, chainCount, chainRange, waveAmplitude, waveFrequency, stunDuration, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 4,
      hitRadius: 3,
      lifetime: 2.5,
      chainCount: chainCount || 3,
      chainRange: chainRange || 140,
      amplitude: waveAmplitude || 3,
      frequency: waveFrequency || 0.05,
      stunDuration: stunDuration || 500
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F18. holyLight — Homing piercing light beams
  // ----------------------------------------------------------
  holyLight: function(x, y, angle, speed, damage, homingStrength, homingRange, pierceCount, color, trailColor) {
    var bullets = [];
    var count = 3;
    for (var i = 0; i < count; i++) {
      var offset = (i - (count - 1) / 2) * 0.08;
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 4,
        hitRadius: 3,
        lifetime: 2.5,
        homingStrength: homingStrength || 0.06,
        homingRange: homingRange || 400,
        pierceCount: pierceCount || 3
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F19. shadowNeedle — Fast dark piercing needles
  // ----------------------------------------------------------
  shadowNeedle: function(x, y, angle, speed, damage, bulletCount, pierceCount, spinSpeed, color, trailColor) {
    var bullets = [];
    var count = bulletCount || 4;
    for (var i = 0; i < count; i++) {
      var offset = (i - (count - 1) / 2) * 0.05;
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 2,
        hitRadius: 1.5,
        lifetime: 2,
        pierceCount: pierceCount || 3,
        rotationSpeed: spinSpeed || 6
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F20. electricWave — Wave motion with chain lightning
  // ----------------------------------------------------------
  electricWave: function(x, y, angle, speed, damage, waveAmplitude, waveFrequency, chainCount, chainRange, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 4,
      hitRadius: 3,
      lifetime: 2.5,
      amplitude: waveAmplitude || 4,
      frequency: waveFrequency || 0.06,
      chainCount: chainCount || 2,
      chainRange: chainRange || 120
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F21. napalm — Explosive flame pool bomb
  // ----------------------------------------------------------
  napalm: function(x, y, angle, speed, damage, explosionRadius, burnDamage, burnDuration, flamePoolRadius, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 7,
      hitRadius: 5.5,
      lifetime: 3,
      explosionRadius: explosionRadius || 80,
      burnDamage: burnDamage || 10,
      burnDuration: burnDuration || 3000,
      flamePoolRadius: flamePoolRadius || 50
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F22. photonTracker — Homing laser beam
  // ----------------------------------------------------------
  photonTracker: function(x, y, angle, speed, damage, homingStrength, homingRange, beamWidth, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 2.5,
      homingStrength: homingStrength || 0.07,
      homingRange: homingRange || 450,
      beamWidth: beamWidth || 4
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  F23. scatterSatellite — Orbital scatter shot
  // ----------------------------------------------------------
  scatterSatellite: function(x, y, angle, speed, damage, orbitRadius, orbitSpeed, orbitCount, bulletCount, spreadAngle, color, trailColor) {
    var bullets = [];
    var count = bulletCount || 3;
    var halfAngle = (spreadAngle || 20) * Math.PI / 180 / 2;
    for (var i = 0; i < count; i++) {
      var offset = -halfAngle + (i / (count - 1 || 1)) * (halfAngle * 2);
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 3,
        hitRadius: 2.5,
        lifetime: 3.5,
        orbitRadius: orbitRadius || 75,
        orbitSpeed: orbitSpeed || 2.5
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  F24. piercingExplosive — Piercing rounds that explode
  // ----------------------------------------------------------
  piercingExplosive: function(x, y, angle, speed, damage, pierceCount, explosionRadius, explosionDamage, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 3,
      pierceCount: pierceCount || 2,
      explosionRadius: explosionRadius || 70,
      explosionDamage: explosionDamage || 20
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N11. beamRifle — Focused piercing beam
  // ----------------------------------------------------------
  beamRifle: function(x, y, angle, speed, damage, pierceCount, beamWidth, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 2,
      hitRadius: beamWidth || 3,
      lifetime: 2,
      pierceCount: pierceCount || 3
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N12. spreadBeam — Wide cone beam burst
  // ----------------------------------------------------------
  spreadBeam: function(x, y, angle, speed, damage, bulletCount, spreadAngle, color, trailColor) {
    var bullets = [];
    var count = bulletCount || 5;
    var halfAngle = (spreadAngle || 20) * Math.PI / 180 / 2;
    for (var i = 0; i < count; i++) {
      var offset = -halfAngle + (i / (count - 1 || 1)) * (halfAngle * 2);
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 2.5,
        hitRadius: 2,
        lifetime: 1.8,
        pierceCount: 1
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N13. pulseBeam — Rapid multi-pulse beam
  // ----------------------------------------------------------
  pulseBeam: function(x, y, angle, speed, damage, pulseCount, pulseInterval, color, trailColor) {
    var bullets = [];
    var count = pulseCount || 3;
    for (var i = 0; i < count; i++) {
      var offset = (i - (count - 1) / 2) * 0.04;
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 4,
        hitRadius: 3.2,
        lifetime: 2,
        pierceCount: 1
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N14. sniperBeam — Ultra-long range precision beam
  // ----------------------------------------------------------
  sniperBeam: function(x, y, angle, speed, damage, beamWidth, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 2,
      hitRadius: beamWidth || 2,
      lifetime: 3,
      pierceCount: 1
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N15. crossBeam — Five-direction cross beam
  // ----------------------------------------------------------
  crossBeam: function(x, y, angle, speed, damage, beamCount, color, trailColor) {
    var bullets = [];
    var count = beamCount || 5;
    var angles = [-Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4, Math.PI / 2];
    for (var i = 0; i < count && i < angles.length; i++) {
      var a = angle + angles[i];
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 3,
        hitRadius: 2.5,
        lifetime: 1.5,
        pierceCount: 2
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N16. buckshot — Wide shotgun spread
  // ----------------------------------------------------------
  buckshot: function(x, y, angle, speed, damage, pelletCount, spreadAngle, color, trailColor) {
    var bullets = [];
    var count = pelletCount || 8;
    var halfAngle = (spreadAngle || 40) * Math.PI / 180 / 2;
    for (var i = 0; i < count; i++) {
      var offset = -halfAngle + (i / (count - 1 || 1)) * (halfAngle * 2);
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 2.5,
        hitRadius: 2,
        lifetime: 1.5,
        pierceCount: 0
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N17. railgun — Ultra-fast penetrating round
  // ----------------------------------------------------------
  railgun: function(x, y, angle, speed, damage, pierceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 2,
      hitRadius: 1.5,
      lifetime: 1.2,
      pierceCount: pierceCount || 10
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N18. slugRound — Heavy slow projectile
  // ----------------------------------------------------------
  slugRound: function(x, y, angle, speed, damage, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 7,
      hitRadius: 5.5,
      lifetime: 4,
      pierceCount: 0
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N19. plasmaCutter — Short-range plasma cutting beams
  // ----------------------------------------------------------
  plasmaCutter: function(x, y, angle, speed, damage, cutCount, cutAngle, color, trailColor) {
    var bullets = [];
    var count = cutCount || 3;
    var halfAngle = (cutAngle || 15) * Math.PI / 180 / 2;
    for (var i = 0; i < count; i++) {
      var offset = -halfAngle + (i / (count - 1 || 1)) * (halfAngle * 2);
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 6,
        hitRadius: 5,
        lifetime: 0.5,
        pierceCount: 2
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N20. chainSaw — Rapid close-range rotating saw blades
  // ----------------------------------------------------------
  chainSaw: function(x, y, angle, speed, damage, sawCount, sawAngle, pierceCount, spinSpeed, color, trailColor) {
    var bullets = [];
    var count = sawCount || 5;
    var halfAngle = (sawAngle || 60) * Math.PI / 180 / 2;
    for (var i = 0; i < count; i++) {
      var offset = -halfAngle + (i / (count - 1 || 1)) * (halfAngle * 2);
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 8,
        hitRadius: 6,
        lifetime: 0.4,
        pierceCount: pierceCount || 3,
        rotationSpeed: spinSpeed || 15
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N21. teslaField — Deployable electric chain field
  // ----------------------------------------------------------
  teslaField: function(x, y, angle, speed, damage, chainCount, chainRange, fieldDuration, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: (fieldDuration || 3000) / 1000,
      chainCount: chainCount || 3,
      chainRange: chainRange || 130
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N22. flamePuddle — Dropped fire puddle
  // ----------------------------------------------------------
  flamePuddle: function(x, y, angle, speed, damage, puddleDuration, burnDamage, burnDuration, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 10,
      hitRadius: 8,
      lifetime: (puddleDuration || 2000) / 1000,
      pierceCount: 1,
      burnDamage: burnDamage || 6,
      burnDuration: burnDuration || 2000
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N23. frostMine — Freezing mine
  // ----------------------------------------------------------
  frostMine: function(x, y, angle, speed, damage, mineCount, explosionRadius, slowAmount, slowDuration, color, trailColor) {
    var bullets = [];
    var count = mineCount || 3;
    for (var i = 0; i < count; i++) {
      var offset = (i - (count - 1) / 2) * 0.4;
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 5,
        hitRadius: 4,
        lifetime: 5,
        explosionRadius: explosionRadius || 70,
        slowAmount: slowAmount || 0.5,
        slowDuration: slowDuration || 2500,
        freezeChance: 0.35,
        freezeDuration: 2000,
        element: 'ice'
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N24. acidSplash — Acid pool
  // ----------------------------------------------------------
  acidSplash: function(x, y, angle, speed, damage, pierceCount, poisonDamage, poisonDuration, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 8,
      hitRadius: 6,
      lifetime: 2,
      pierceCount: pierceCount || 1,
      poisonDamage: poisonDamage || 6,
      poisonDuration: poisonDuration || 3500,
      element: 'poison'
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N25. droneSwarm — Homing drone swarm
  // ----------------------------------------------------------
  droneSwarm: function(x, y, angle, speed, damage, droneCount, homingStrength, homingRange, color, trailColor) {
    var bullets = [];
    var count = droneCount || 4;
    for (var i = 0; i < count; i++) {
      var offset = (i - (count - 1) / 2) * 0.3;
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 3,
        hitRadius: 2.5,
        lifetime: 4,
        homingStrength: homingStrength || 0.06,
        homingRange: homingRange || 350
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N26. bouncingBullet — Standard bullet (bounce flavor)
  // ----------------------------------------------------------
  bouncingBullet: function(x, y, angle, speed, damage, bounceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 2.5,
      pierceCount: 1
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N27. sonicWave — Wide sonic wave
  // ----------------------------------------------------------
  sonicWave: function(x, y, angle, speed, damage, waveCount, spreadAngle, color, trailColor) {
    var bullets = [];
    var count = waveCount || 7;
    var halfAngle = (spreadAngle || 60) * Math.PI / 180 / 2;
    for (var i = 0; i < count; i++) {
      var offset = -halfAngle + (i / (count - 1 || 1)) * (halfAngle * 2);
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 6,
        hitRadius: 5,
        lifetime: 1.2,
        pierceCount: 1
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N28. phaseBlade — Wave motion piercing blade
  // ----------------------------------------------------------
  phaseBlade: function(x, y, angle, speed, damage, pierceCount, waveAmplitude, waveFrequency, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 4,
      hitRadius: 3,
      lifetime: 3,
      pierceCount: pierceCount || 5,
      amplitude: waveAmplitude || 2,
      frequency: waveFrequency || 0.08,
      originX: x,
      originY: y
    });
    bullet._waveBaseAngle = angle;
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N29. lifestealBlade — Standard projectile (lifesteal from stats)
  // ----------------------------------------------------------
  lifestealBlade: function(x, y, angle, speed, damage, lifestealPercent, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 4,
      hitRadius: 3,
      lifetime: 2.5,
      pierceCount: 0
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N30. delayedBomb — Delayed explosion bomb
  // ----------------------------------------------------------
  delayedBomb: function(x, y, angle, speed, damage, delayTime, explosionRadius, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 8,
      hitRadius: 6,
      lifetime: delayTime || 1.5,
      explosionRadius: explosionRadius || 120
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N31. iceFlame — Alternating ice/fire hybrid
  // ----------------------------------------------------------
  _iceFlameToggle: false,
  iceFlame: function(x, y, angle, speed, damage, burnDamage, burnDuration, slowAmount, slowDuration, color, trailColor) {
    this._iceFlameToggle = !this._iceFlameToggle;
    var isFire = this._iceFlameToggle;
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: isFire ? '#ff6600' : '#88ddff',
      trailColor: isFire ? '#ff3300' : '#4499cc',
      category: 'playerBullet',
      size: 4,
      hitRadius: 3.5,
      lifetime: 2.5,
      burnDamage: isFire ? (burnDamage || 8) : 0,
      burnDuration: isFire ? (burnDuration || 2000) : 0,
      slowAmount: isFire ? 0 : (slowAmount || 0.4),
      slowDuration: isFire ? 0 : (slowDuration || 2000)
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N32. plasmaStorm — Plasma chain explosion storm
  // ----------------------------------------------------------
  plasmaStorm: function(x, y, angle, speed, damage, chainCount, chainRange, explosionRadius, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 2.5,
      chainCount: chainCount || 4,
      chainRange: chainRange || 160,
      explosionRadius: explosionRadius || 50
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N33. voidBeam — Piercing void beam with execute
  // ----------------------------------------------------------
  voidBeam: function(x, y, angle, speed, damage, pierceCount, executeThreshold, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 2.5,
      pierceCount: pierceCount || 5,
      executeThreshold: executeThreshold || 0.12
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N34. gravityMissile — Homing missile with gravity well
  // ----------------------------------------------------------
  gravityMissile: function(x, y, angle, speed, damage, homingStrength, explosionRadius, wellRadius, pullForce, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 7,
      hitRadius: 5.5,
      lifetime: 3.5,
      homingStrength: homingStrength || 0.05,
      homingRange: 350,
      explosionRadius: explosionRadius || 70,
      wellRadius: wellRadius || 100,
      pullForce: pullForce || 80
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N35. thunderBoomerang — Boomerang with chain lightning
  // ----------------------------------------------------------
  thunderBoomerang: function(x, y, angle, speed, damage, range, chainCount, chainRange, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 4,
      originX: x,
      originY: y,
      range: range || 350,
      pierceCount: 1,
      chainCount: chainCount || 3,
      chainRange: chainRange || 140
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N36. splitter — Piercing bullet that splits fragments on hit
  // ----------------------------------------------------------
  splitter: function(x, y, angle, speed, damage, pierceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 5,
      hitRadius: 4,
      lifetime: 3,
      pierceCount: pierceCount || 2
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N37. bouncer — Bouncing chain bullet, damage increases per bounce
  // ----------------------------------------------------------
  bouncer: function(x, y, angle, speed, damage, chainCount, chainRange, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 4,
      hitRadius: 3,
      lifetime: 3,
      chainCount: chainCount || 4,
      chainRange: chainRange || 150
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N38. shockRing — Expanding shock ring that pushes enemies
  // ----------------------------------------------------------
  shockRing: function(x, y, angle, speed, damage, ringCount, color, trailColor) {
    var bullets = [];
    var count = ringCount || 12;
    for (var i = 0; i < count; i++) {
      var a = (Math.PI * 2 * i) / count;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 3,
        hitRadius: 2.5,
        lifetime: 0.8,
        pierceCount: 2
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N39. growing — Bullet grows in size the further it travels
  // ----------------------------------------------------------
  growing: function(x, y, angle, speed, damage, growingScale, color, trailColor) {
    var scale = growingScale || 1.6;
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 3 * scale,
      lifetime: 4,
      pierceCount: 1
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N40. warp — High-speed piercing warp needle
  // ----------------------------------------------------------
  warp: function(x, y, angle, speed, damage, pierceCount, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 2,
      hitRadius: 1.5,
      lifetime: 2,
      pierceCount: pierceCount || 5
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N41. mirror — Fires symmetric bullets to both sides
  // ----------------------------------------------------------
  mirror: function(x, y, angle, speed, damage, spreadAngle, color, trailColor) {
    var bullets = [];
    var halfAngle = (spreadAngle || 90) * Math.PI / 180 / 2;
    // Left side
    var b1 = this._create({
      x: x, y: y,
      vx: Math.cos(angle - halfAngle) * speed,
      vy: Math.sin(angle - halfAngle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 2.5
    });
    bullets.push(b1);
    // Right side
    var b2 = this._create({
      x: x, y: y,
      vx: Math.cos(angle + halfAngle) * speed,
      vy: Math.sin(angle + halfAngle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 3,
      hitRadius: 2.5,
      lifetime: 2.5
    });
    bullets.push(b2);
    return bullets;
  },

  // ----------------------------------------------------------
  //  N42. ringNova — Expanding ring that shatters into homing fragments
  // ----------------------------------------------------------
  ringNova: function(x, y, angle, speed, damage, ringCount, homingStrength, homingRange, color, trailColor) {
    var bullets = [];
    var count = ringCount || 10;
    for (var i = 0; i < count; i++) {
      var a = (Math.PI * 2 * i) / count;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 4,
        hitRadius: 3,
        lifetime: 2.5,
        homingStrength: homingStrength || 0.05,
        homingRange: homingRange || 350
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N43. plasmaWeb — Bullets form chain lightning web between them
  // ----------------------------------------------------------
  plasmaWeb: function(x, y, angle, speed, damage, webCount, chainCount, chainRange, color, trailColor) {
    var bullets = [];
    var count = webCount || 5;
    var halfAngle = 35 * Math.PI / 180 / 2;
    for (var i = 0; i < count; i++) {
      var offset = -halfAngle + (i / (count - 1 || 1)) * (halfAngle * 2);
      var a = angle + offset;
      var bullet = this._create({
        x: x, y: y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        speed: speed,
        damage: damage,
        color: color,
        trailColor: trailColor,
        category: 'playerBullet',
        size: 3,
        hitRadius: 2.5,
        lifetime: 2.5,
        chainCount: chainCount || 3,
        chainRange: chainRange || 130
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  N44. implosion — Gravity well with execute, implosion explosion
  // ----------------------------------------------------------
  implosion: function(x, y, angle, speed, damage, wellRadius, pullForce, explosionRadius, executeThreshold, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 10,
      hitRadius: 8,
      lifetime: 3,
      wellRadius: wellRadius || 130,
      pullForce: pullForce || 100,
      explosionRadius: explosionRadius || 90,
      executeThreshold: executeThreshold || 0.1
    });
    return [bullet];
  },

  // ----------------------------------------------------------
  //  N45. vitalChain — Chain lightning with lifesteal per bounce
  // ----------------------------------------------------------
  vitalChain: function(x, y, angle, speed, damage, chainCount, chainRange, lifestealPercent, color, trailColor) {
    var bullet = this._create({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      damage: damage,
      color: color,
      trailColor: trailColor,
      category: 'playerBullet',
      size: 2,
      hitRadius: 1.5,
      lifetime: 2,
      chainCount: chainCount || 5,
      chainRange: chainRange || 160,
      lifestealPercent: lifestealPercent || 0.1
    });
    return [bullet];
  }

};

// Expose
window.BulletPatterns = BulletPatterns;
