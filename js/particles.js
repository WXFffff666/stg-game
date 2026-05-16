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

    init: function(x, y, value, color, vx) {
      this.x = x;
      this.y = y;
      this.value = String(value);
      this.color = color || '#ffffff';
      this.life = 800;
      this.maxLife = 800;
      this.active = true;
      this._vx = vx || ((Math.random() - 0.5) * 40);
      this._vy = -(40 + Math.random() * 60);
      this._scale = 1.2;
    },

    update: function(dt) {
      this.life -= dt * 1000;
      var t = 1 - this.life / this.maxLife;
      this.x += this._vx * dt;
      this.y += this._vy * dt;
      this._vy *= (1 - 2 * dt); // decelerate upward
      this._scale = 1.2 - t * 0.4;
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
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.value, 0, 0);
      // Bright outline
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeText(this.value, 0, 0);
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
    var count = config.count || 1;
    var g = window.game;
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
  damageNumber: function(x, y, value, color) {
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
    dn.init(x + offX, y + offY, value, color);
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
  }
};

// ============ Export ============
window.ParticleSystem = ParticleSystem;
