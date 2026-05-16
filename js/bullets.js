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
  //  DRAW
  // ============================================================
  draw(ctx) {
    if (!this.active) return;

    ctx.save();

    // Player bullets use additive blending for glow
    if (this.category === 'playerBullet') {
      ctx.globalCompositeOperation = 'lighter';
    }

    // Outer glow
    ctx.shadowBlur = this.size * 2;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Inner bright core
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  // ============================================================
  //  TRAIL PARTICLES
  // ============================================================
  _emitTrail() {
    var game = window.game;
    if (game.particles.length >= GAME_CONFIG.BALANCE.MAX_PARTICLES) return;

    var self = this;
    game.addEntity({
      x: this.x,
      y: this.y,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      size: this.size * 0.45,
      color: this.trailColor,
      lifetime: 0.25 + Math.random() * 0.15,
      active: true,
      category: 'particle',
      drawLayer: this.drawLayer,
      _age: 0,

      update: function(dt) {
        this._age += dt;
        if (this._age >= this.lifetime || this.size <= 0.1) {
          self._cleanupParticle(this);
          return;
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.size *= 0.94;
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

  _cleanupParticle(particle) {
    particle.active = false;
    window.game.removeEntity(particle);
    // Trail particles are plain objects, don't pool them
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
  }

};

// Expose
window.BulletPatterns = BulletPatterns;
