/**
 * STG Game Particle System
 * Particle class with physics, preset effects, object pooling, background starfield.
 * Enhanced with nova, implosion, lightning, damage numbers, screen flash, shield break,
 * layered explosions, improved trails, and weapon-specific bullet effects.
 *
 * Global: window.ParticleSystem
 * Dependencies: game (window.game), GAME_CONFIG (window.GAME_CONFIG)
 */

// ============ Particle Class ============
class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.size = 0;
    this.color = '#ffffff';
    this.alpha = 1;
    this.gravity = 0;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.active = false;
    this.category = 'particle';
    this.drawLayer = 6;
    this.hitRadius = 0;
    this.isSquare = false;
    // Extended properties for enhanced effects
    this._customDraw = null;    // override draw function
    this._customUpdate = null;  // override update function
    this._data = null;          // arbitrary extra data
    this._tailWidth = 0;        // for trailImproved
    this._angle = 0;            // stored movement angle
    this._seed = 0;             // random seed for per-particle variation
  }

  /**
   * (Re)initialize particle from pool or creation.
   * @param {number} x
   * @param {number} y
   * @param {object} config - { speed, life, size, colors|color, gravity?, angle?, drawLayer?, isSquare?, rotationSpeed? }
   */
  init(x, y, config) {
    this.x = x;
    this.y = y;

    // Velocity from speed + random angle
    var angle = config.angle !== undefined ? config.angle : Math.random() * Math.PI * 2;
    var speed = (config.speed || 0) * (0.5 + Math.random() * 0.5);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this._angle = angle;

    // Life with random variation so particles don't fade in lockstep
    var baseLife = config.life || 500;
    this.life = baseLife * (0.5 + Math.random() * 0.5);
    this.maxLife = this.life;

    // Size with random variation
    this.size = (config.size || 2) * (0.5 + Math.random() * 0.5);

    // Color: single string or random from array
    if (config.color) {
      this.color = config.color;
    } else if (config.colors && config.colors.length) {
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
    } else {
      this.color = '#ffffff';
    }

    this.alpha = 1;
    this.gravity = config.gravity || 0;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * (config.rotationSpeed || 10);
    this.active = true;
    this.drawLayer = config.drawLayer !== undefined ? config.drawLayer : 6;
    this.hitRadius = 0;
    // Small particles have 30% chance to render as squares for visual variety
    this.isSquare = config.isSquare !== undefined
      ? config.isSquare
      : (Math.random() < 0.3 && this.size < 3);
    // Reset extended properties
    this._customDraw = null;
    this._customUpdate = null;
    this._data = config.data || null;
    this._tailWidth = config.tailWidth || 0;
    this._seed = Math.random();
  }

  update(dt) {
    if (this._customUpdate) {
      this._customUpdate.call(this, dt);
      return;
    }

    // Apply gravity
    this.vy += this.gravity * dt;

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Fade
    this.life -= dt * 1000;
    this.alpha = this.maxLife > 0 ? Math.max(0, this.life / this.maxLife) : 0;

    // Rotate
    this.rotation += this.rotationSpeed * dt;

    // Deactivate and return to pool when life expired
    if (this.life <= 0) {
      this.active = false;
      var g = window.game;
      g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
      g.removeEntity(this);
    }
  }

  draw(ctx) {
    if (!this.active) return;

    if (this._customDraw) {
      this._customDraw.call(this, ctx);
      return;
    }

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    if (this.isSquare) {
      var half = this.size * 0.5;
      ctx.fillRect(-half, -half, this.size, this.size);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ============ Damage Number System ============
var _damageNumberPool = [];

function _createDamageNumber() {
  return {
    x: 0, y: 0,
    value: '',
    color: '#ffffff',
    life: 0,
    maxLife: 0,
    active: false,
    category: 'particle',
    drawLayer: 7,
    _vx: 0,
    _vy: 0,
    _scale: 1,
    _isCrit: false,
    _isReact: false,

    init: function(x, y, value, color, vx, isCrit, isReact) {
      this.x = x;
      this.y = y;
      this.value = String(value);
      this.color = color || '#ffffff';
      this.life = isCrit ? 1000 : 800;
      this.maxLife = this.life;
      this.active = true;
      this._vx = vx || ((Math.random() - 0.5) * 40);
      this._vy = -(40 + Math.random() * 60);
      this._isCrit = !!isCrit;
      this._isReact = !!isReact;
      this._scale = isCrit ? 1.6 : (isReact ? 1.3 : 1.0);
    },

    update: function(dt) {
      this.life -= dt * 1000;
      var t = 1 - this.life / this.maxLife;
      this.x += this._vx * dt;
      this.y += this._vy * dt;
      this._vy *= (1 - 2 * dt); // decelerate upward
      var baseScale = this._isCrit ? 1.6 : (this._isReact ? 1.3 : 1.0);
      this._scale = baseScale - t * 0.4;
      if (this.life <= 0) {
        this.active = false;
        _damageNumberPool.push(this);
      }
    },

    draw: function(ctx) {
      if (!this.active) return;
      var t = this.life / this.maxLife;
      var alpha = t < 0.2 ? t / 0.2 : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.x, this.y);
      ctx.scale(this._scale, this._scale);
      ctx.fillStyle = this.color;
      var fontSize = this._isCrit ? 20 : (this._isReact ? 16 : 14);
      var fontStyle = this._isCrit ? 'bold ' + fontSize + 'px monospace' : 'bold ' + fontSize + 'px monospace';
      ctx.font = fontStyle;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Outline for readability
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = this._isCrit ? 3 : 2;
      ctx.strokeText(this.value, 0, 0);
      ctx.fillText(this.value, 0, 0);
      ctx.restore();
    }
  };
}

// ============ Screen Flash System ============
// Screen flash state is stored on the game object
function _ensureScreenFlashState() {
  var g = window.game;
  if (g._screenFlashColor === undefined) g._screenFlashColor = null;
  if (g._screenFlashAlpha === undefined) g._screenFlashAlpha = 0;
  if (g._screenFlashLife === undefined) g._screenFlashLife = 0;
}

function _createFlashOverlay() {
  return {
    x: 0, y: 0,
    active: true,
    category: 'particle',
    drawLayer: 7,
    _added: false,

    update: function(dt) {
      var g = window.game;
      if (g._screenFlashLife > 0) {
        g._screenFlashLife -= dt * 1000;
        if (g._screenFlashLife <= 0) {
          g._screenFlashLife = 0;
        }
        g._screenFlashAlpha = Math.min(
          g._screenFlashAlpha,
          Math.max(0, g._screenFlashLife / Math.max(g._screenFlashMaxLife || 1, 1))
        );
      }
    },

    draw: function(ctx) {
      var g = window.game;
      if (!g._screenFlashColor || g._screenFlashAlpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = g._screenFlashAlpha;
      ctx.fillStyle = g._screenFlashColor;
      ctx.fillRect(0, 0, g.width, g.height);
      ctx.restore();
    }
  };
}

// Weather/flash overlay singleton
var _flashOverlay = null;

// ============ Particle System ============
var ParticleSystem = {

  // Shared factory for pool creation/retrieval
  // NOTE: pool may contain plain objects from bullet trails, so we always create fresh
  _factory: function() {
    return new Particle();
  },

  /**
   * Spawn particles at position using preset config.
   * @param {number} x
   * @param {number} y
   * @param {object} config - { count, speed, life, size, colors, gravity?, ... }
   */
  spawn: function(x, y, config) {
    // Entity cap: skip non-essential particles when scene is overloaded
    var g = window.game;
    if (g && g.entities && g.entities.length > 800) return;

    var count = config.count || 1;
    for (var i = 0; i < count; i++) {
      var p = g.getFromPool(g.particlePool, this._factory);
      p.init(x, y, config);
      g.addEntity(p);
    }
  },

  // ================================================================
  //  EXPLOSION EFFECTS
  // ================================================================

  /**
   * Explosion effect. size='small' uses smallExplosion preset.
   */
  explosion: function(x, y, size) {
    var preset = size === 'small'
      ? GAME_CONFIG.PARTICLE_PRESETS.smallExplosion
      : GAME_CONFIG.PARTICLE_PRESETS.explosion;
    this.spawn(x, y, preset);
    window.game.addShake(size === 'small' ? 2 : 6);
  },

  /**
   * Large dramatic boss explosion with double wave.
   */
  bossExplosion: function(x, y) {
    this.spawn(x, y, GAME_CONFIG.PARTICLE_PRESETS.bossExplosion);
    // Second wave after a short delay for dramatic effect
    var self = this;
    setTimeout(function() {
      var g = window.game;
      if (g && g.scene === GAME_CONFIG.SCENES.GAMEPLAY) {
        self.spawn(x, y, {
          count: 20,
          speed: 150,
          life: 500,
          colors: ['#ff4400', '#ff8800', '#ffff00'],
          size: 3
        });
      }
    }, 250);
    window.game.addShake(15);
  },

  /**
   * Layered explosion: inner bright core + outer smoke ring.
   * @param {number} x
   * @param {number} y
   * @param {string} [size='normal'] - 'small', 'normal', 'big'
   */
  layeredExplosion: function(x, y, size) {
    size = size || 'normal';
    var counts = { small: [4, 6], normal: [8, 12], big: [15, 25] };
    var speeds = { small: [80, 50], normal: [200, 100], big: [300, 180] };
    var lifeSpan = { small: [300, 500], normal: [500, 800], big: [700, 1100] };
    var sizes = { small: [3, 2], normal: [5, 3], big: [7, 5] };

    var c = counts[size] || counts.normal;
    var sp = speeds[size] || speeds.normal;
    var l = lifeSpan[size] || lifeSpan.normal;
    var sz = sizes[size] || sizes.normal;

    // Inner bright core: fast, bright, short-lived
    this.spawn(x, y, {
      count: c[0],
      speed: sp[0],
      life: l[0],
      colors: ['#ffffff', '#ffffee', '#ffffaa'],
      size: sz[0],
      gravity: -20
    });
    // Outer smoke ring: slower, darker, longer-lived
    this.spawn(x, y, {
      count: c[1],
      speed: sp[1],
      life: l[1],
      colors: ['#aa4400', '#663300', '#442200', '#222222'],
      size: sz[1],
      gravity: 30,
      rotationSpeed: 15
    });
    window.game.addShake(size === 'big' ? 10 : (size === 'small' ? 2 : 5));
  },

  // ================================================================
  //  NOVA: Expanding ring particle effect
  // ================================================================
  /**
   * Expanding ring nova effect - particles burst outward in a ring.
   * @param {number} x
   * @param {number} y
   * @param {string} [color] - optional color override
   */
  nova: function(x, y, color) {
    var colors = color ? [color, '#ffffff'] : ['#44ddff', '#88eeff', '#ffffff'];
    var g = window.game;
    var ringCount = 24;
    for (var i = 0; i < ringCount; i++) {
      var angle = (i / ringCount) * Math.PI * 2;
      var p = g.getFromPool(g.particlePool, this._factory);
      p.init(x, y, {
        speed: 250,
        life: 600,
        color: colors[i % colors.length],
        size: 2.5,
        angle: angle
      });
      // Override: particles maintain their exact angle (no random spread)
      p.vx = Math.cos(angle) * 250;
      p.vy = Math.sin(angle) * 250;
      g.addEntity(p);
    }
    // Inner flash particles
    this.spawn(x, y, {
      count: 8,
      speed: 80,
      life: 300,
      colors: colors,
      size: 3,
      gravity: -40
    });
    window.game.addShake(3);
  },

  // ================================================================
  //  IMPLOSION: Particles spiral inward then explode outward
  // ================================================================
  /**
   * Particles drawn inward in a spiral, then burst outward.
   * @param {number} x
   * @param {number} y
   */
  implosion: function(x, y) {
    var g = window.game;
    var colors = ['#aa44ff', '#6644cc', '#ff44aa'];
    var self = this;

    // Phase 1: Inward spiral — particles start far and spiral toward center
    for (var i = 0; i < 16; i++) {
      var angle = (i / 16) * Math.PI * 2;
      var dist = 60 + Math.random() * 40;
      var px = x + Math.cos(angle) * dist;
      var py = y + Math.sin(angle) * dist;
      var p = g.getFromPool(g.particlePool, self._factory);
      p.init(px, py, {
        speed: 0,
        life: 500,
        color: colors[i % colors.length],
        size: 2.5
      });
      // Custom update: spiral inward
      p._startX = px;
      p._startY = py;
      p._targetX = x;
      p._targetY = y;
      p._phase = 0; // 0 = inward, 1 = outward
      p._customUpdate = function(dt) {
        var t = 1 - this.life / this.maxLife;
        if (t < 0.6 && this._phase === 0) {
          // Spiral inward
          var progress = t / 0.6;
          var dx = this._targetX - this._startX;
          var dy = this._targetY - this._startY;
          this.x = this._startX + dx * progress + Math.cos(progress * Math.PI * 6 + this._seed * 10) * (1 - progress) * 15;
          this.y = this._startY + dy * progress + Math.sin(progress * Math.PI * 6 + this._seed * 10) * (1 - progress) * 15;
          this.size = 2.5 * (1 + progress);
        } else if (t >= 0.6 && this._phase === 0) {
          // Snap to center and switch to outward burst
          this._phase = 1;
          this.x = this._targetX;
          this.y = this._targetY;
          var outAngle = Math.random() * Math.PI * 2;
          this.vx = Math.cos(outAngle) * 350;
          this.vy = Math.sin(outAngle) * 350;
          this.size = 4;
          this._customUpdate = null; // revert to normal update
        } else {
          // Normal physics for outward burst
          this.life -= dt * 1000;
          this.vy += this.gravity * dt;
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.alpha = Math.max(0, this.life / this.maxLife);
          this.size *= 0.98;
          if (this.life <= 0) {
            this.active = false;
            g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
            g.removeEntity(this);
          }
        }
      };
      g.addEntity(p);
    }
    window.game.addShake(5);
  },

  // ================================================================
  //  LIGHTNING: Zigzag line between two points
  // ================================================================
  /**
   * Generate zigzag lightning effect between two points.
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {string} [color] - lightning color
   */
  lightning: function(x1, y1, x2, y2, color) {
    var g = window.game;
    color = color || '#44ccff';

    // Generate zigzag segment points
    var segments = this._generateLightningSegments(x1, y1, x2, y2, 5);

    // Main bolt: bright thin line
    var bolt = g.getFromPool(g.particlePool, this._factory);
    bolt.init(x1, y1, {
      speed: 0, life: 200, color: color, size: 2, drawLayer: 6
    });
    bolt._segments = segments;
    bolt._glowColor = color;
    bolt._customDraw = function(ctx) {
      var alpha = this.life / this.maxLife;
      if (alpha <= 0) return;
      var segs = this._segments;
      if (!segs || segs.length < 2) return;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(segs[0].x, segs[0].y);
      for (var i = 1; i < segs.length; i++) {
        ctx.lineTo(segs[i].x, segs[i].y);
      }
      ctx.stroke();

      // Thin inner white core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Thin inner white core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    };
    g.addEntity(bolt);

    // Glow particles along the bolt path
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      // Spawn small spark particles at segment points
      for (var j = 0; j < 2; j++) {
        var spark = g.getFromPool(g.particlePool, this._factory);
        spark.init(seg.x + (Math.random() - 0.5) * 6, seg.y + (Math.random() - 0.5) * 6, {
          speed: 30 + Math.random() * 60,
          life: 150 + Math.random() * 100,
          color: j === 0 ? '#ffffff' : color,
          size: 1.5 + Math.random(),
          gravity: -20,
          drawLayer: 6
        });
        g.addEntity(spark);
      }
    }
  },

  /**
   * Recursively subdivide a line segment to create zigzag lightning points.
   */
  _generateLightningSegments: function(x1, y1, x2, y2, depth) {
    var points = [{ x: x1, y: y1 }];
    this._subdivideLightning(points, x1, y1, x2, y2, depth);
    points.push({ x: x2, y: y2 });
    return points;
  },

  _subdivideLightning: function(points, x1, y1, x2, y2, depth) {
    if (depth <= 0) return;
    var mx = (x1 + x2) / 2;
    var my = (y1 + y2) / 2;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var offset = (Math.random() - 0.5) * dist * 0.4;
    var perpX = -dy / Math.max(dist, 1);
    var perpY = dx / Math.max(dist, 1);
    mx += perpX * offset;
    my += perpY * offset;
    this._subdivideLightning(points, x1, y1, mx, my, depth - 1);
    points.push({ x: mx, y: my });
    this._subdivideLightning(points, mx, my, x2, y2, depth - 1);
  },

  // ================================================================
  //  DAMAGE NUMBER: Floating damage text
  // ================================================================
  /**
   * Spawn floating damage number that rises and fades.
   * @param {number} x
   * @param {number} y
   * @param {number|string} value - damage amount to display
   * @param {string} [color] - text color (default: red for damage)
   */
  damageNumber: function(x, y, value, color, isCrit, isReact) {
    var dn;
    if (_damageNumberPool.length > 0) {
      dn = _damageNumberPool.pop();
    } else {
      dn = _createDamageNumber();
    }
    color = color || '#ff4444';
    // Add slight random x offset so overlapping numbers don't stack exactly
    var offX = (Math.random() - 0.5) * 30;
    var offY = (Math.random() - 0.5) * 10;
    dn.init(x + offX, y + offY, value, color, undefined, isCrit, isReact);
    window.game.addEntity(dn);
  },

  // ================================================================
  //  SCREEN FLASH: Full-screen color overlay
  // ================================================================
  /**
   * Brief full-screen color overlay flash.
   * @param {string} color - CSS color (e.g. '#ffffff', 'rgba(255,0,0,0.3)')
   * @param {number} duration - in milliseconds
   */
  screenFlash: function(color, duration) {
    var g = window.game;
    _ensureScreenFlashState();

    // Ensure flash overlay entity exists in the game
    if (!_flashOverlay || !_flashOverlay._added) {
      _flashOverlay = _createFlashOverlay();
      g.addEntity(_flashOverlay);
      _flashOverlay._added = true;
    }

    g._screenFlashColor = color || '#ffffff';
    g._screenFlashLife = duration || 150;
    g._screenFlashMaxLife = g._screenFlashLife;
    g._screenFlashAlpha = Math.min(1, (color && color.indexOf('rgba') >= 0)
      ? parseFloat((color.match(/[\d.]+\)$/) || ['0.3'])[0]) || 0.3
      : 0.5);
  },

  // ================================================================
  //  SHIELD BREAK: Radial burst when shield destroyed
  // ================================================================
  /**
   * Radial energy burst effect for shield break.
   * @param {number} x
   * @param {number} y
   * @param {string} [color] - shield color
   */
  shieldBreak: function(x, y, color) {
    color = color || '#44aaff';
    var g = window.game;

    // Expanding ring
    for (var i = 0; i < 20; i++) {
      var angle = (i / 20) * Math.PI * 2;
      var p = g.getFromPool(g.particlePool, this._factory);
      p.init(x, y, {
        speed: 200 + Math.random() * 150,
        life: 400,
        color: color,
        size: 3,
        angle: angle
      });
      p.vx = Math.cos(angle) * (200 + Math.random() * 150);
      p.vy = Math.sin(angle) * (200 + Math.random() * 150);
      g.addEntity(p);
    }

    // Inner flash
    this.spawn(x, y, {
      count: 8,
      speed: 80,
      life: 300,
      colors: [color, '#ffffff', '#aaddff'],
      size: 3.5,
      gravity: -30
    });

    // Hexagonal crack lines (6 lines radiating out)
    var hexLines = 6;
    for (var j = 0; j < hexLines; j++) {
      var hexAngle = (j / hexLines) * Math.PI * 2;
      var endX = x + Math.cos(hexAngle) * 50;
      var endY = y + Math.sin(hexAngle) * 50;
      // Spawn particles along each crack line
      for (var k = 0; k < 4; k++) {
        var t = k / 4;
        var cx = x + (endX - x) * t;
        var cy = y + (endY - y) * t;
        var spark = g.getFromPool(g.particlePool, this._factory);
        spark.init(cx + (Math.random() - 0.5) * 6, cy + (Math.random() - 0.5) * 6, {
          speed: 40,
          life: 250,
          color: t < 0.5 ? '#ffffff' : color,
          size: 2,
          gravity: -30
        });
        g.addEntity(spark);
      }
    }

    window.game.addShake(4);
  },

  // ================================================================
  //  SPARK / HIT EFFECTS
  // ================================================================

  /**
   * Quick spark effect (bullet impacts, small hits).
   */
  spark: function(x, y) {
    this.spawn(x, y, GAME_CONFIG.PARTICLE_PRESETS.spark);
  },

  /**
   * Green rising particles for heal pickups.
   */
  healEffect: function(x, y) {
    this.spawn(x, y, {
      count: 8,
      speed: 60,
      life: 500,
      colors: ['#44ff44', '#88ff88', '#ffffff'],
      size: 2,
      gravity: -60
    });
  },

  /**
   * Golden burst for level-up celebration.
   */
  levelUpEffect: function(x, y) {
    this.spawn(x, y, {
      count: 30,
      speed: 180,
      life: 700,
      colors: ['#ffdd00', '#ffaa00', '#ffffff', '#ff66ff'],
      size: 3.5,
      gravity: -40,
      rotationSpeed: 18
    });
    window.game.addShake(4);
  },

  /**
   * White flash particles for enemy hit feedback.
   */
  hitEffect: function(x, y) {
    this.spawn(x, y, GAME_CONFIG.PARTICLE_PRESETS.hit);
  },

  // ================================================================
  //  BULLET IMPACT: Weapon-specific impact particles
  // ================================================================
  /**
   * Bullet impact effect with weapon-specific visuals.
   * @param {number} x
   * @param {number} y
   * @param {string} weaponId - weapon config ID
   * @param {string} [color] - bullet color
   */
  bulletImpact: function(x, y, weaponId, color) {
    var cfg = GAME_CONFIG.WEAPONS[weaponId];
    if (!cfg) {
      this.spark(x, y);
      return;
    }
    color = color || cfg.bulletColor || '#ffff00';

    switch (weaponId) {
      case 'laser':
        // Laser: concentrated flash
        this.spawn(x, y, {
          count: 5, speed: 40, life: 200, color: '#ffffff', size: 2.5, gravity: -20, isSquare: true
        });
        break;
      case 'explosive':
        // Small secondary explosion
        this.spawn(x, y, {
          count: 8, speed: 100, life: 350, colors: ['#ff4400', '#ff8800', '#ffcc00'], size: 3, gravity: 10
        });
        window.game.addShake(2);
        break;
      case 'spread':
        // Wide burst of small sparks
        this.spawn(x, y, {
          count: 10, speed: 60, life: 250, color: color, size: 1.5, gravity: 0
        });
        break;
      case 'homing':
        // Spiral magic burst
        this.spawn(x, y, {
          count: 6, speed: 70, life: 300, color: color, size: 2, gravity: -30, rotationSpeed: 20
        });
        break;
      case 'pierce':
        // Clean white punch
        this.spawn(x, y, {
          count: 4, speed: 50, life: 200, color: '#ffffff', size: 3, gravity: 0, isSquare: true
        });
        break;
      case 'arc':
        // Electric sparks
        this.spawn(x, y, {
          count: 8, speed: 90, life: 250, colors: ['#88ffff', '#ffffff', '#44aaff'], size: 2, gravity: -20, isSquare: true
        });
        break;
      case 'boomerang':
        // Spinning particles
        this.spawn(x, y, {
          count: 6, speed: 80, life: 300, color: color, size: 2.5, gravity: 0, rotationSpeed: 25
        });
        break;
      case 'wave':
        // Flowing energy particles
        this.spawn(x, y, {
          count: 5, speed: 50, life: 280, color: color, size: 2, gravity: -15
        });
        break;
      case 'orbital':
        // Blue energy fragments
        this.spawn(x, y, {
          count: 4, speed: 60, life: 250, color: color, size: 2, gravity: -25, rotationSpeed: 15
        });
        break;
      default:
        // Normal: basic sparks
        this.spark(x, y);
        break;
    }
  },

  // ================================================================
  //  WEAPON TRAIL: Weapon-specific trail particles
  // ================================================================
  /**
   * Spawn a single trail particle with weapon-specific appearance.
   * @param {number} x
   * @param {number} y
   * @param {string} weaponId - weapon config ID
   * @param {string} [color] - trail color override
   * @param {number} [size] - particle size override
   */
  weaponTrail: function(x, y, weaponId, color, size) {
    var cfg = GAME_CONFIG.WEAPONS[weaponId];
    var trailColor = color || (cfg ? cfg.trailColor : '#88aaff');
    var particleSize = size || (cfg ? cfg.bulletSize * 0.45 : 1.5);
    var drawLayer = 1;
    var life = 120;
    var isSq = false;

    // Weapon-specific modifications
    if (cfg) {
      switch (weaponId) {
        case 'laser':
          life = 80;
          particleSize *= 0.8;
          drawLayer = 4;
          break;
        case 'explosive':
          life = 180;
          particleSize *= 1.5;
          trailColor = '#ff6600';
          break;
        case 'homing':
          life = 150;
          particleSize *= 1.2;
          break;
        case 'arc':
          life = 90;
          isSq = true;
          break;
        case 'boomerang':
          life = 160;
          break;
        case 'pierce':
          life = 90;
          isSq = true;
          break;
        case 'spread':
          life = 140;
          break;
        case 'wave':
          life = 130;
          break;
        case 'orbital':
          life = 140;
          break;
      }
    }

    this.spawn(x, y, {
      count: 1,
      speed: 0,
      life: life,
      color: trailColor,
      size: particleSize,
      gravity: 0,
      rotationSpeed: 0,
      drawLayer: drawLayer,
      isSquare: isSq
    });
  },

  // ================================================================
  //  TRAILS: Standard and improved
  // ================================================================

  /**
   * Single short-lived particle for bullet/projectile trails.
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {number} size
   */
  trail: function(x, y, color, size) {
    this.spawn(x, y, {
      count: 1,
      speed: 0,
      life: 120,
      color: color,
      size: size || 1.5,
      gravity: 0,
      rotationSpeed: 0,
      drawLayer: 1
    });
  },

  /**
   * Improved variable-width fading trail.
   * Trail is wider at spawn, narrows as it fades.
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {number} size
   * @param {number} [width=2] - initial width of trail
   */
  trailImproved: function(x, y, color, size, width) {
    var g = window.game;
    var p = g.getFromPool(g.particlePool, this._factory);
    var baseSize = size || 2;
    var tailWidth = width || baseSize * 3;
    p.init(x, y, {
      speed: 0,
      life: 180,
      color: color,
      size: baseSize,
      gravity: 0,
      rotationSpeed: 0,
      drawLayer: 1
    });
    p._tailWidth = tailWidth;
    p._customDraw = function(ctx) {
      var alpha = this.alpha;
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha * 0.7;
      var w = this._tailWidth * alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, w, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
      // Bright core
      ctx.globalAlpha = alpha;
      var coreW = w * 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, coreW, this.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    g.addEntity(p);
  },

  // ================================================================
  //  ENGINE TRAIL: Ship engine exhaust particles
  // ================================================================
  /**
   * Engine trail particle behind the player ship.
   * @param {number} x
   * @param {number} y
   * @param {string} [color] - exhaust color
   */
  engineTrail: function(x, y, color) {
    this.spawn(x, y, {
      count: 1,
      speed: 20 + Math.random() * 40,
      life: 200 + Math.random() * 150,
      color: color || '#44ccff',
      size: 1.5 + Math.random() * 1.5,
      gravity: 30 + Math.random() * 40,
      rotationSpeed: 5,
      drawLayer: 1
    });
  },

  // ================================================================
  //  BACKGROUND STARS
  // ================================================================

  /**
   * Create persistent background starfield (100+ slow-moving dots).
   * Call once during gameplay scene init.
   */
  initBackgroundStars: function() {
    var colors = GAME_CONFIG.COLORS.backgroundStars;
    var w = GAME_CONFIG.BALANCE.CANVAS_WIDTH;
    var h = GAME_CONFIG.BALANCE.CANVAS_HEIGHT;
    var starCount = 120;
    var g = window.game;

    for (var i = 0; i < starCount; i++) {
      var star = new Particle();
      star.x = Math.random() * w;
      star.y = Math.random() * h;
      star.size = 0.3 + Math.random() * 1.0;
      star.color = colors[Math.floor(Math.random() * colors.length)];
      star.alpha = 0.2 + Math.random() * 0.5;
      star.maxLife = Infinity;
      star.life = Infinity;
      star.gravity = 0;
      star.vx = 0;
      star.vy = 15 + Math.random() * 35;
      star.rotation = 0;
      star.rotationSpeed = 0;
      star.drawLayer = 0;
      star.active = true;
      star.isSquare = false;
      star.category = 'particle';
      star.hitRadius = 0;

      // Override update for background stars: scroll down and wrap
      star.update = function(dt) {
        this.y += this.vy * dt;
        if (this.y > h + 5) {
          this.y = -5;
          this.x = Math.random() * w;
          this.alpha = 0.2 + Math.random() * 0.5;
          this.vy = 15 + Math.random() * 35;
        }
      };

      g.addEntity(star);
    }
  },

  // ================================================================
  //  ELEMENTAL REACTION EFFECTS
  // ================================================================

  /**
   * Dispatcher for elemental reaction visuals.
   * @param {number} x
   * @param {number} y
   * @param {string} reactionName - 'steam', 'explosion', 'shatter', 'paralyze'
   */
  reactionEffect: function(x, y, reactionName) {
    switch (reactionName) {
      case 'steam':     this.steamEffect(x, y); break;
      case 'melt':      this.meltEffect(x, y); break;
      case 'explosion': this.explosionReaction(x, y); break;
      case 'shatter':   this.shatterEffect(x, y); break;
      case 'paralyze':  this.paralyzeEffect(x, y); break;
    }
  },

  /**
   * C4: Melt (fire+ice): steam/water burst with bright flash.
   */
  meltEffect: function(x, y) {
    // Large steam cloud
    this.spawn(x, y, {
      count: 20,
      speed: 60,
      life: 800,
      colors: ['#ffffff', '#ffdddd', '#ffaaaa', '#ddddee'],
      size: 4.5,
      gravity: -25
    });
    // Bright inner flash
    this.spawn(x, y, {
      count: 8,
      speed: 30,
      life: 350,
      color: '#ffffff',
      size: 4,
      gravity: -40
    });
    // Expanding heat ring
    this._spawnReactionRing(x, y, '#ff6666', 90);
    window.game.addShake(4);
    this.screenFlash('#ffffff', 120);
  },

  /**
   * Steam (fire+ice): expanding white/blue cloud.
   */
  steamEffect: function(x, y) {
    // Large white cloud
    this.spawn(x, y, {
      count: 18,
      speed: 55,
      life: 900,
      colors: ['#ffffff', '#ddddff', '#eeeeff', '#ccccee'],
      size: 5,
      gravity: -30
    });
    // Inner bright core
    this.spawn(x, y, {
      count: 6,
      speed: 20,
      life: 400,
      color: '#ffffff',
      size: 3,
      gravity: -50
    });
    window.game.addShake(3);
  },

  /**
   * Explosion (fire+poison): fiery green-orange burst + shockwave ring.
   */
  explosionReaction: function(x, y) {
    // Outer burst
    this.spawn(x, y, {
      count: 25,
      speed: 180,
      life: 500,
      colors: ['#ff4400', '#ff8800', '#ffcc00', '#55cc44', '#88ff44'],
      size: 4,
      gravity: 10
    });
    // Central white flash
    this.spawn(x, y, {
      count: 8,
      speed: 30,
      life: 250,
      color: '#ffffff',
      size: 5,
      gravity: 0
    });
    // Expanding shockwave ring
    this._spawnReactionRing(x, y, '#ff6600', 110);
    window.game.addShake(8);
    this.screenFlash('#ff6600', 150);
  },

  /**
   * Shatter (ice+lightning): ice shards fly outward with electric sparks.
   */
  shatterEffect: function(x, y) {
    // Ice shards (square particles)
    this.spawn(x, y, {
      count: 15,
      speed: 140,
      life: 600,
      colors: ['#66ddff', '#88ffff', '#aaddff', '#ffffff'],
      size: 3,
      gravity: 40,
      isSquare: true
    });
    // Lightning sparks
    this.spawn(x, y, {
      count: 10,
      speed: 100,
      life: 350,
      colors: ['#ffff00', '#ffff88', '#88ffff'],
      size: 2,
      gravity: 0,
      isSquare: true
    });
    // Frost ring
    this._spawnReactionRing(x, y, '#88ffff', 80);
    window.game.addShake(5);
  },

  /**
   * Paralyze (poison+lightning): green-yellow electric immobilize.
   */
  paralyzeEffect: function(x, y) {
    // Toxic sparks
    this.spawn(x, y, {
      count: 12,
      speed: 80,
      life: 600,
      colors: ['#55cc44', '#88ff44', '#aaff00', '#ffff00'],
      size: 2.5,
      gravity: -15,
      isSquare: true
    });
    // Electric arcs around center
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2;
      var dist = 15 + Math.random() * 20;
      var px = x + Math.cos(angle) * dist;
      var py = y + Math.sin(angle) * dist;
      this.trail(px, py, '#aaff00', 2);
    }
    // Central glow
    this.spawn(x, y, {
      count: 4,
      speed: 10,
      life: 400,
      color: '#ffff88',
      size: 6,
      gravity: 0
    });
    window.game.addShake(3);
  },

  // ================================================================
  //  流派专属粒子特效
  // ================================================================

  /**
   * 播放流派专属终极技能粒子特效
   * @param {string} factionId - 流派ID
   * @param {number} x
   * @param {number} y
   */
  factionUltimateEffect: function(factionId, x, y) {
    var g = window.game;
    switch (factionId) {
      case 'gravity':
        // 重力流：引力场扭曲环 + 向心收缩粒子
        for (var gi = 0; gi < 20; gi++) {
          var gAngle = (gi / 20) * Math.PI * 2;
          var gDist = 80 + Math.random() * 40;
          var gx = x + Math.cos(gAngle) * gDist;
          var gy = y + Math.sin(gAngle) * gDist;
          var gp = g.getFromPool(g.particlePool, this._factory);
          gp.init(gx, gy, {
            speed: 0, life: 800, color: '#8866cc', size: 3
          });
          gp._customUpdate = function(dt) {
            var t = 1 - this.life / this.maxLife;
            var pullX = x - this.x;
            var pullY = y - this.y;
            var dist = Math.sqrt(pullX * pullX + pullY * pullY);
            if (dist > 2) {
              this.x += (pullX / dist) * 120 * dt;
              this.y += (pullY / dist) * 120 * dt;
            }
            this.life -= dt * 1000;
            this.alpha = Math.max(0, this.life / this.maxLife);
            if (this.life <= 0) {
              this.active = false;
              g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
              g.removeEntity(this);
            }
          };
          g.addEntity(gp);
        }
        this.spawn(x, y, { count: 12, speed: 40, life: 500, colors: ['#8866cc', '#aa88ee', '#ffffff'], size: 4, gravity: -30 });
        g.addShake(5);
        break;

      case 'void':
        // 虚空流：黑洞吞噬环 + 虚空裂隙
        for (var vi = 0; vi < 16; vi++) {
          var vAngle = (vi / 16) * Math.PI * 2;
          var vx = x + Math.cos(vAngle) * 60;
          var vy = y + Math.sin(vAngle) * 60;
          var vp = g.getFromPool(g.particlePool, this._factory);
          vp.init(vx, vy, {
            speed: 0, life: 600, color: '#220044', size: 4
          });
          vp._customUpdate = function(dt) {
            var t = 1 - this.life / this.maxLife;
            var angle = Math.atan2(this.y - y, this.x - x) + 3 * dt;
            var radius = 60 * (1 - t);
            this.x = x + Math.cos(angle) * radius;
            this.y = y + Math.sin(angle) * radius;
            this.life -= dt * 1000;
            this.alpha = Math.max(0, this.life / this.maxLife);
            if (this.life <= 0) {
              this.active = false;
              g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
              g.removeEntity(this);
            }
          };
          g.addEntity(vp);
        }
        this.spawn(x, y, { count: 15, speed: 100, life: 400, colors: ['#440088', '#6600aa', '#220044'], size: 3, gravity: 0 });
        g.addShake(6);
        break;

      case 'thunder':
        // 雷电流：闪电链 + 电弧爆发
        this.lightning(x - 80, y - 80, x + 80, y + 80, '#ffff00');
        this.lightning(x + 80, y - 80, x - 80, y + 80, '#ffff44');
        this.lightning(x, y - 100, x, y + 100, '#ffff88');
        this.spawn(x, y, { count: 20, speed: 150, life: 300, colors: ['#ffff00', '#ffff88', '#ffffff'], size: 2.5, isSquare: true });
        g.addShake(8);
        this.screenFlash('#ffff00', 100);
        break;

      case 'wind':
        // 风之流：旋风环 + 风刃粒子
        for (var wi = 0; wi < 24; wi++) {
          var wAngle = (wi / 24) * Math.PI * 2;
          var wDist = 30 + Math.random() * 60;
          var wx = x + Math.cos(wAngle) * wDist;
          var wy = y + Math.sin(wAngle) * wDist;
          var wp = g.getFromPool(g.particlePool, this._factory);
          wp.init(wx, wy, {
            speed: 0, life: 500, color: '#88ff88', size: 2
          });
          wp._customUpdate = function(dt) {
            var t = 1 - this.life / this.maxLife;
            var angle = Math.atan2(this.y - y, this.x - x) + 5 * dt;
            var radius = 30 + t * 80;
            this.x = x + Math.cos(angle) * radius;
            this.y = y + Math.sin(angle) * radius;
            this.life -= dt * 1000;
            this.alpha = Math.max(0, this.life / this.maxLife);
            if (this.life <= 0) {
              this.active = false;
              g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
              g.removeEntity(this);
            }
          };
          g.addEntity(wp);
        }
        this.spawn(x, y, { count: 10, speed: 80, life: 400, colors: ['#88ff88', '#aaffaa', '#ffffff'], size: 2, gravity: -20 });
        g.addShake(4);
        break;

      case 'shadow':
        // 暗影流：暗影波纹 + 残影拖尾
        for (var si = 0; si < 8; si++) {
          var sAngle = Math.random() * Math.PI * 2;
          var sDist = 40 + Math.random() * 40;
          var sx = x + Math.cos(sAngle) * sDist;
          var sy = y + Math.sin(sAngle) * sDist;
          this.spawn(sx, sy, {
            count: 3, speed: 60, life: 600, colors: ['#111166', '#2222aa', '#3333cc'], size: 4, gravity: -10
          });
        }
        this.spawn(x, y, { count: 15, speed: 120, life: 500, colors: ['#111166', '#000033', '#222288'], size: 3, gravity: 0 });
        g.addShake(3);
        break;

      case 'holy':
        // 圣光流：圣光射线 + 治愈光环
        for (var hi = 0; hi < 12; hi++) {
          var hAngle = (hi / 12) * Math.PI * 2;
          var hx = x + Math.cos(hAngle) * 10;
          var hy = y + Math.sin(hAngle) * 10;
          var hp = g.getFromPool(g.particlePool, this._factory);
          hp.init(hx, hy, {
            speed: 0, life: 700, color: '#ffffcc', size: 2
          });
          hp._customUpdate = function(dt) {
            var t = 1 - this.life / this.maxLife;
            var angle = Math.atan2(this.y - y, this.x - x);
            var radius = t * 120;
            this.x = x + Math.cos(angle) * radius;
            this.y = y + Math.sin(angle) * radius;
            this.size = 2 + t * 3;
            this.life -= dt * 1000;
            this.alpha = Math.max(0, this.life / this.maxLife);
            if (this.life <= 0) {
              this.active = false;
              g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
              g.removeEntity(this);
            }
          };
          g.addEntity(hp);
        }
        this.spawn(x, y, { count: 20, speed: 60, life: 600, colors: ['#ffffcc', '#ffff88', '#ffffff'], size: 3, gravity: -40 });
        g.addShake(3);
        this.screenFlash('#ffffcc', 200);
        break;

      case 'blood':
        // 血祭流：血红脉冲环 + 鲜血飞溅
        for (var bi = 0; bi < 16; bi++) {
          var bAngle = (bi / 16) * Math.PI * 2;
          this.spawn(x, y, {
            count: 2, speed: 200, life: 500, colors: ['#cc0000', '#ff0000', '#ff3333'], size: 3, angle: bAngle, gravity: 30
          });
        }
        this.spawn(x, y, { count: 10, speed: 40, life: 600, colors: ['#cc0000', '#990000'], size: 5, gravity: 50 });
        g.addShake(6);
        this.screenFlash('#cc0000', 150);
        break;

      case 'magnet':
        // 磁力流：磁力线环 + 吸引粒子
        for (var mi = 0; mi < 12; mi++) {
          var mAngle = (mi / 12) * Math.PI * 2;
          var mDist = 70 + Math.random() * 30;
          var mx = x + Math.cos(mAngle) * mDist;
          var my = y + Math.sin(mAngle) * mDist;
          var mp = g.getFromPool(g.particlePool, this._factory);
          mp.init(mx, my, {
            speed: 0, life: 600, color: '#cc44cc', size: 2.5
          });
          mp._customUpdate = function(dt) {
            var t = 1 - this.life / this.maxLife;
            var angle = Math.atan2(this.y - y, this.x - x) + 4 * dt;
            var radius = 70 * (1 - t * 0.5);
            this.x = x + Math.cos(angle) * radius;
            this.y = y + Math.sin(angle) * radius;
            this.life -= dt * 1000;
            this.alpha = Math.max(0, this.life / this.maxLife);
            if (this.life <= 0) {
              this.active = false;
              g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
              g.removeEntity(this);
            }
          };
          g.addEntity(mp);
        }
        this.spawn(x, y, { count: 8, speed: 30, life: 400, colors: ['#cc44cc', '#ff66ff', '#ffffff'], size: 3, gravity: 0 });
        g.addShake(4);
        break;

      case 'mirror':
        // 镜之流：镜面反射碎片 + 光折射
        for (var mri = 0; mri < 8; mri++) {
          var mrAngle = (mri / 8) * Math.PI * 2;
          var mrDist = 50 + Math.random() * 30;
          var mrx = x + Math.cos(mrAngle) * mrDist;
          var mry = y + Math.sin(mrAngle) * mrDist;
          this.spawn(mrx, mry, {
            count: 3, speed: 80, life: 500, colors: ['#aaccee', '#ccddff', '#ffffff'], size: 3, isSquare: true, gravity: -15
          });
        }
        this.spawn(x, y, { count: 12, speed: 100, life: 400, colors: ['#aaccee', '#ffffff', '#ddeeff'], size: 2.5, gravity: 0 });
        g.addShake(4);
        break;

      case 'time':
        // 时之流：时空扭曲环 + 时钟粒子
        for (var ti = 0; ti < 24; ti++) {
          var tAngle = (ti / 24) * Math.PI * 2;
          var tDist = 60;
          var tx = x + Math.cos(tAngle) * tDist;
          var ty = y + Math.sin(tAngle) * tDist;
          var tp = g.getFromPool(g.particlePool, this._factory);
          tp.init(tx, ty, {
            speed: 0, life: 800, color: '#ccbb88', size: 2
          });
          tp._customUpdate = function(dt) {
            var t = 1 - this.life / this.maxLife;
            var angle = Math.atan2(this.y - y, this.x - x) + 2 * dt;
            var radius = 60 + Math.sin(t * Math.PI * 4) * 20;
            this.x = x + Math.cos(angle) * radius;
            this.y = y + Math.sin(angle) * radius;
            this.life -= dt * 1000;
            this.alpha = Math.max(0, this.life / this.maxLife);
            if (this.life <= 0) {
              this.active = false;
              g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
              g.removeEntity(this);
            }
          };
          g.addEntity(tp);
        }
        this.spawn(x, y, { count: 10, speed: 40, life: 500, colors: ['#ccbb88', '#eedd99', '#ffffff'], size: 3, gravity: -20 });
        g.addShake(3);
        break;

      case 'fury':
        // 狂怒流：怒火爆发 + 火焰旋涡
        for (var fi = 0; fi < 16; fi++) {
          var fAngle = (fi / 16) * Math.PI * 2;
          this.spawn(x, y, {
            count: 2, speed: 180, life: 400, colors: ['#ff0044', '#ff4400', '#ff8800'], size: 3.5, angle: fAngle, gravity: -20
          });
        }
        this.spawn(x, y, { count: 15, speed: 60, life: 500, colors: ['#ff0044', '#cc0033', '#ff4400'], size: 5, gravity: -40 });
        g.addShake(7);
        this.screenFlash('#ff0044', 120);
        break;

      case 'luck':
        // 幸运流：四叶草粒子 + 金币爆发
        for (var li = 0; li < 4; li++) {
          var lAngle = (li / 4) * Math.PI * 2 + Math.PI / 4;
          var lx = x + Math.cos(lAngle) * 30;
          var ly = y + Math.sin(lAngle) * 30;
          this.spawn(lx, ly, {
            count: 5, speed: 80, life: 600, colors: ['#44ff44', '#88ff88', '#ffff00'], size: 3, gravity: -25
          });
        }
        this.spawn(x, y, { count: 20, speed: 120, life: 500, colors: ['#44ff44', '#ffff00', '#ffffff'], size: 2.5, gravity: -30 });
        g.addShake(4);
        break;

      case 'sonic':
        // 音波流：音波冲击环 + 震荡波
        this._spawnReactionRing(x, y, '#ff88ff', 150);
        this._spawnReactionRing(x, y, '#ff88ff', 120);
        this.spawn(x, y, { count: 25, speed: 200, life: 400, colors: ['#ff88ff', '#ffaaff', '#ffffff'], size: 2.5, gravity: 0 });
        g.addShake(10);
        this.screenFlash('#ff88ff', 100);
        break;

      case 'minion':
        // 魔仆流：魔仆召唤阵 + 鲜血之球
        for (var moi = 0; moi < 6; moi++) {
          var moAngle = (moi / 6) * Math.PI * 2;
          var moDist = 50;
          var mox = x + Math.cos(moAngle) * moDist;
          var moy = y + Math.sin(moAngle) * moDist;
          this.spawn(mox, moy, {
            count: 4, speed: 50, life: 600, colors: ['#ff4488', '#cc3366', '#ff6699'], size: 3, gravity: -20
          });
        }
        this.spawn(x, y, { count: 10, speed: 30, life: 500, colors: ['#ff4488', '#cc0066'], size: 4, gravity: 40 });
        g.addShake(5);
        break;

      case 'data':
        // 数据流：数据流矩阵 + 扫描线
        for (var dai = 0; dai < 20; dai++) {
          var daAngle = Math.random() * Math.PI * 2;
          var daDist = 40 + Math.random() * 60;
          var dax = x + Math.cos(daAngle) * daDist;
          var day = y + Math.sin(daAngle) * daDist;
          var dap = g.getFromPool(g.particlePool, this._factory);
          dap.init(dax, day, {
            speed: 0, life: 500, color: '#00ffcc', size: 2, isSquare: true
          });
          dap._customUpdate = function(dt) {
            var t = 1 - this.life / this.maxLife;
            this.y -= 60 * dt;
            this.x += Math.sin(t * Math.PI * 6) * 2;
            this.life -= dt * 1000;
            this.alpha = Math.max(0, this.life / this.maxLife);
            if (this.life <= 0) {
              this.active = false;
              g.returnToPool(g.particlePool, this, GAME_CONFIG.BALANCE.MAX_PARTICLES);
              g.removeEntity(this);
            }
          };
          g.addEntity(dap);
        }
        this.spawn(x, y, { count: 8, speed: 40, life: 400, colors: ['#00ffcc', '#00ff88', '#ffffff'], size: 2, gravity: -30, isSquare: true });
        g.addShake(3);
        break;
    }
  },

  /**
   * Expanding ring entity for reaction visuals.
   * @param {number} x
   * @param {number} y
   * @param {string} color
   * @param {number} maxRadius
   */
  _spawnReactionRing: function(x, y, color, maxRadius) {
    var g = window.game;
    g.addEntity({
      x: x, y: y,
      radius: 10,
      maxRadius: maxRadius,
      active: true,
      category: 'particle',
      drawLayer: 6,
      lifetime: 0.5,
      _age: 0,
      _color: color,

      update: function(dt) {
        this._age += dt;
        this.radius += (this.maxRadius * 2) * dt;
        if (this._age >= this.lifetime) {
          this.active = false;
          g.removeEntity(this);
        }
      },

      draw: function(ctx) {
        var alpha = 1 - (this._age / this.lifetime);
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = this._color;
        ctx.lineWidth = 2 * alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }
};

// ============ Export ============
window.ParticleSystem = ParticleSystem;
