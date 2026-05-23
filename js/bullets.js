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
    this._trailInterval  = 0.05;

    // Age
    this._age = 0;

    // IDs for hit tracking (prevent multi-hit on same frame)
    this._hitTargets = null;
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

    // --- Per-frame hit tracking reset ---
    if (this.pierceCount > 0 && !this._hitTargets) {
      this._hitTargets = new Set();
    }

    // --- Homing ---
    if (this.homingTarget && this.homingTarget.active && this.homingStrength > 0) {
      const dx = this.homingTarget.x - this.x;
      const dy = this.homingTarget.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const tx = (dx / dist) * this.speed;
      const ty = (dy / dist) * this.speed;
      this.vx += (tx - this.vx) * this.homingStrength;
      this.vy += (ty - this.vy) * this.homingStrength;
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
    if (this._trailTimer >= this._trailInterval) {
      this._trailTimer -= this._trailInterval;
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

    // Player bullets use additive blending for glow
    if (this.category === 'playerBullet') {
      ctx.globalCompositeOperation = 'lighter';
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

    // Ice shard: apply slow debuff
    if (this.slowAmount && this.slowDuration) {
      if (target && !target._slowTimer) {
        target._slowMult = 1 - (this.slowAmount || 0.4);
        target._slowTimer = this.slowDuration || 2000;
      }
    }

    // Flame: apply burn damage over time
    if (this.size >= 7 && this.lifetime <= 0.6 && this.pierceCount >= 1) {
      if (target && !target._burnTimer) {
        target._burnDamage = this.damage * 0.3;
        target._burnTimer = 2000;
        target._burnTick = 0;
      }
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

    // Explosion particles
    var particleCount = 14;
    for (var j = 0; j < particleCount; j++) {
      if (game.particles.length >= GAME_CONFIG.BALANCE.MAX_PARTICLES) break;
      var angle = (Math.PI * 2 * j) / particleCount;
      var spd = 60 + Math.random() * 160;
      var self = this;
      game.addEntity({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2 + Math.random() * 4,
        color: this.color,
        lifetime: 0.3 + Math.random() * 0.4,
        active: true,
        category: 'particle',
        drawLayer: 6,
        _age: 0,

        update: function(dt) {
          this._age += dt;
          if (this._age >= this.lifetime || this.size <= 0.1) {
            self._cleanupParticle(this);
            return;
          }
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.vx *= 0.94;
          this.vy *= 0.94;
          this.size *= 0.91;
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
  spread: function(x, y, count, spreadAngle, speed, damage, color, trailColor) {
    var bullets = [];

    if (count <= 0) return bullets;

    // Distribute evenly across the spread arc, centered on angle 0 (rightward)
    var startAngle = -spreadAngle / 2;
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
  circle: function(x, y, count, speed, damage, color) {
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
        drawLayer: 2
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  12. aimed — N bullets aimed at target position with spread
  // ----------------------------------------------------------
  aimed: function(x, y, count, targetX, targetY, speed, damage, color, spreadAngle) {
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
        drawLayer: 2
      });
      bullets.push(bullet);
    }
    return bullets;
  },

  // ----------------------------------------------------------
  //  13. spiralOut — Bullets in expanding spiral pattern
  // ----------------------------------------------------------
  spiralOut: function(x, y, count, speed, damage, color, spreadAngle) {
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
        drawLayer: 2
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
      chainRange: chainRange || 150
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
      slowDuration: slowDuration || 2000
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
  smartSpread: function(x, y, count, spreadAngle, speed, damage, color, trailColor, homingStrength, homingRange) {
    var bullets = [];
    if (count <= 0) return bullets;
    var startAngle = -spreadAngle / 2;
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
  plagueFlame: function(x, y, angle, speed, damage, flameLength, pierceCount, burnDamage, color, trailColor) {
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
        burnDamage: burnDamage || 8
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
      slowDuration: slowDuration || 2500
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
      slowDuration: isFire ? 0 : (slowDuration || 2000)
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
  }

};

// Expose
window.BulletPatterns = BulletPatterns;
