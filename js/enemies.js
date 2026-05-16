/**
 * STG Game - Enemy Entities & Wave Spawner
 * Enemy AI, wave system, boss fights
 * 
 * Global: window.Enemy, window.WaveSpawner
 * Dependencies: window.GAME_CONFIG, window.BulletPatterns, window.game
 */

// =============================================================================
// ENEMY CLASS
// =============================================================================
class Enemy {
  /**
   * @param {object} opts - Override properties from template
   * @param {object} template - Enemy template from GAME_CONFIG.ENEMIES
   * @param {number} difficulty - Current difficulty level for scaling
   */
  constructor(opts, template, difficulty) {
    const cfg = GAME_CONFIG.BALANCE;
    const diff = difficulty || 0;

    // Position & movement
    this.x = opts.x || Math.random() * cfg.CANVAS_WIDTH;
    this.y = opts.y || -30;
    this.startX = this.x;
    this.moveTimer = 0;

    // Stats (scaled by difficulty)
    this.maxHp = template.hp * (1 + diff * cfg.DIFFICULTY_ENEMY_HP);
    this.hp = this.maxHp;
    this.speed = template.speed;
    this.baseSpeed = template.speed;
    this.damage = template.damage;
    this.score = template.score;
    this.xp = template.xp;
    this.size = template.size;
    this.color = template.color;
    this.type = template.type;
    this.ai = template.ai;

    // Firing
    this.fireTimer = Math.random() * template.fireRate;
    this.fireRate = template.fireRate;
    this.bulletConfig = {
      speed: template.bulletSpeed * (1 + diff * cfg.DIFFICULTY_BULLET_SPEED),
      damage: template.bulletDamage || cfg.ENEMY_BULLET_DAMAGE,
      color: template.bulletColor || template.color,
      count: template.bulletCount || 1,
      spreadAngle: template.spreadAngle || 0,
    };

    // Entity system
    this.active = true;
    this.category = 'enemy';
    this.drawLayer = 3;

    // Collision
    this.hitRadius = template.hitRadius || template.size;

    // Boss
    this.isBoss = template.type === 'boss' || template.type.startsWith('boss_');
    this.bossPhase = -1;
    this.phaseThresholds = template.phases ? JSON.parse(JSON.stringify(template.phases)) : [];

    // Damage flash
    this.flashTimer = 0;
    this.damaged = false;

    // ---- New type-specific properties ----
    // Splitter
    this.splitCount = template.splitCount || 0;
    this.splitType = template.splitType || 'small';

    // Shielder
    this.shieldHp = template.shieldHp || 0;
    this.shieldMaxHp = template.shieldHp || 0;
    this.shieldRegenDelay = template.shieldRegenDelay || 5000;
    this.shieldRegenRate = template.shieldRegenRate || 20;
    this.shieldRegenTimer = 0;
    this.shieldDepleted = false;
    this.shieldColor = template.shieldColor || template.color;

    // Charger
    this.chargeTimer = 0;
    this.chargeInterval = template.chargeInterval || 4000;
    this.chargeSpeed = template.chargeSpeed || 500;
    this.isCharging = false;
    this.chargeAngle = 0;

    // Teleporter
    this.teleportTimer = Math.random() * (template.teleportInterval || 3000);
    this.teleportInterval = template.teleportInterval || 3000;

    // Spawner
    this.spawnTimer = 0;
    this.spawnInterval = template.spawnInterval || 4000;
    this.spawnType = template.spawnType || 'small';
    this.maxMinions = template.maxMinions || 4;

    // Swarmer
    this.groupSize = template.groupSize || 5;
    this.swarmPhase = Math.random() * Math.PI * 2;

    // Kamikaze
    this.explodeDamage = template.explodeDamage || 40;
    this.explodeRadius = template.explodeRadius || 80;

    // SniperElite
    this.targetY = template.targetY || 50;

    // Boss Guardian
    this.shieldCount = template.shieldCount || 0;
    this.activeShields = [];
    this.shieldHpEach = template.shieldHpEach || 150;
    if (this.shieldCount > 0) {
      for (let i = 0; i < this.shieldCount; i++) {
        this.activeShields.push({
          angle: (Math.PI * 2 / this.shieldCount) * i,
          hp: this.shieldHpEach,
          maxHp: this.shieldHpEach,
          radius: this.size * 1.3,
        });
      }
    }

    // Boss Summoner
    this.bossSpawnTimer = 0;
    this.bossSpawnInterval = template.spawnInterval || 3000;

    // Boss Dragon
    this.fireBreathTimer = 0;
    this.fireBreathCooldown = 4000;
    this.tailSwipeTimer = 0;
    this.tailSwipeCooldown = 0; // Phase 2 only
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------
  update(dt) {
    if (!this.active) return;

    const game = window.game;
    const cfg = GAME_CONFIG.BALANCE;

    this.moveTimer += dt * 1000;
    if (this.flashTimer > 0) this.flashTimer -= dt * 1000;

    // --- Status Effects (before AI so speed mods take effect) ---
    // Freeze: stop movement
    if (this.frozenTimer > 0) {
      this.speed = 0;
      this.frozenTimer -= dt * 1000;
      if (this.frozenTimer <= 0) {
        this.frozenTimer = 0;
        this.speed = this.baseSpeed;
      }
    }
    // Slow: reduce speed (only if not frozen)
    else if (this.slowTimer > 0) {
      this.speed = this.baseSpeed * (1 - (this.slowAmount || 0.4));
      this.slowTimer -= dt * 1000;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.speed = this.baseSpeed;
      }
    }

    // Poison DoT
    if (this.poisonTimer > 0) {
      this.takeDamage(this.poisonDamage * dt);
      this.poisonTimer -= dt * 1000;
      if (this.poisonTimer <= 0) {
        this.poisonTimer = 0;
      }
    }

    // Burn DoT
    if (this.burnTimer > 0) {
      this.takeDamage(this.burnDamage * dt);
      this.burnTimer -= dt * 1000;
      if (this.burnTimer <= 0) {
        this.burnTimer = 0;
      }
    }

    // --- AI Behavior ---
    this._executeAI(dt, game);

    // --- Out of bounds removal ---
    if (this.y > cfg.CANVAS_HEIGHT + 100) {
      this._remove();
      return;
    }
    // Also remove if far off sides
    if (this.x < -100 || this.x > cfg.CANVAS_WIDTH + 100) {
      // Only remove non-boss enemies that drift off
      if (this.type !== 'boss' && (this.ai !== 'cross' || this.x < -150 || this.x > cfg.CANVAS_WIDTH + 150)) {
        this._remove();
        return;
      }
    }

    // --- Firing ---
    this.fireTimer += dt * 1000;
    if (this.fireTimer >= this.fireRate && this.fireRate > 0) {
      this.fireTimer = 0;
      this._fire(game);
    }

    // --- Boss phase transitions ---
    if (this.isBoss && this.phaseThresholds.length > 0) {
      const hpPercent = this.hp / this.maxHp;
      for (let i = 0; i < this.phaseThresholds.length; i++) {
        const phase = this.phaseThresholds[i];
        if (hpPercent <= phase.hpThreshold && this.bossPhase < i) {
          this.bossPhase = i;
          this._applyBossPhase(phase);
          // Phase transition effect
          if (game.addShake) game.addShake(8);
          break;
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // AI BEHAVIORS
  // ---------------------------------------------------------------------------
  _executeAI(dt, game) {
    const player = game.player;
    const cfg = GAME_CONFIG.BALANCE;

    switch (this.ai) {
      case 'straight':
        this.y += this.speed * dt;
        break;

      case 'cross':
        this.y += this.speed * dt;
        this.x = this.startX + Math.sin(this.moveTimer * 0.003) * 80;
        break;

      case 'follow':
        this.y += this.speed * dt;
        if (player && player.active) {
          const dx = player.x - this.x;
          this.x += dx * 0.02;
        }
        break;

      case 'spiral':
        {
          const centerX = cfg.CANVAS_WIDTH / 2;
          const centerY = cfg.CANVAS_HEIGHT / 2;
          const angle = this.moveTimer * 0.002;
          const radius = 100 + this.moveTimer * 0.03;
          this.x = centerX + Math.cos(angle) * Math.min(radius, 300);
          this.y = centerY + Math.sin(angle * 0.7) * Math.min(radius * 0.7, 250);
          // Gradually move downward
          this.y += this.speed * dt * 0.3;
        }
        break;

      case 'aimed':
        this.y += this.speed * dt * 0.6;
        break;

      case 'boss':
        {
          // Phase 1: enter from top to center-top position
          const targetY = 80;
          const targetX = cfg.CANVAS_WIDTH / 2;
          if (this.y < targetY) {
            this.y += this.speed * dt;
          } else {
            // Sway left-right around center
            this.y = targetY;
            this.x = targetX + Math.sin(this.moveTimer * 0.002) * 150;
          }
        }
        break;

      default:
        // Default: straight down
        this.y += this.speed * dt;
        break;

      // ---- New Enemy AI Behaviors ----
      case 'splitter':
        // Moves similar to 'cross' but with smaller amplitude
        this.y += this.speed * dt;
        this.x = this.startX + Math.sin(this.moveTimer * 0.002) * 60;
        break;

      case 'shielder':
        // Slow, straight movement; shield handles defense
        this.y += this.speed * dt;
        // Shield regeneration
        if (this.shieldDepleted) {
          this.shieldRegenTimer += dt * 1000;
          if (this.shieldRegenTimer >= this.shieldRegenDelay) {
            this.shieldHp += this.shieldRegenRate * dt;
            if (this.shieldHp >= this.shieldMaxHp) {
              this.shieldHp = this.shieldMaxHp;
              this.shieldDepleted = false;
              this.shieldRegenTimer = 0;
            }
          }
        }
        break;

      case 'charger':
        this.chargeTimer += dt * 1000;
        if (this.isCharging) {
          // Charge toward player
          this.x += Math.cos(this.chargeAngle) * this.chargeSpeed * dt;
          this.y += Math.sin(this.chargeAngle) * this.chargeSpeed * dt;
          // End charge after a short duration or if went past player
          if (this.chargeTimer >= 800 || this.y > cfg.CANVAS_HEIGHT + 50) {
            this.isCharging = false;
            this.chargeTimer = 0;
            this.speed = this.baseSpeed;
          }
        } else {
          // Slow drift
          this.y += this.speed * dt;
          if (player && player.active && this.chargeTimer >= this.chargeInterval) {
            this.isCharging = true;
            this.chargeTimer = 0;
            this.chargeAngle = Math.atan2(player.y - this.y, player.x - this.x);
          }
        }
        break;

      case 'weaver':
        // Figure-8 pattern
        this.y += this.speed * dt * 0.7;
        this.x = this.startX + Math.sin(this.moveTimer * 0.003) * 120;
        if (player && player.active) {
          // Slight homing bias
          this.x += (player.x - this.x) * 0.005;
        }
        break;

      case 'teleporter':
        // Stay in place, teleport periodically
        this.teleportTimer += dt * 1000;
        if (this.teleportTimer >= this.teleportInterval) {
          this.teleportTimer = 0;
          // Teleport to random position in upper half
          this.x = 40 + Math.random() * (cfg.CANVAS_WIDTH - 80);
          this.y = 30 + Math.random() * (cfg.CANVAS_HEIGHT * 0.4);
          // Spawn particle effect
          if (window.spawnParticles) {
            window.spawnParticles(this.x, this.y, 'spark');
          }
        }
        break;

      case 'spawner':
        // Very slow, stays near top-middle, spawns minions
        this.y += this.speed * dt;
        if (this.y > cfg.CANVAS_HEIGHT * 0.2) {
          this.y = cfg.CANVAS_HEIGHT * 0.15;
        }
        this.x = this.startX + Math.sin(this.moveTimer * 0.001) * 100;
        // Spawn minions
        this.spawnTimer += dt * 1000;
        if (this.spawnTimer >= this.spawnInterval) {
          this.spawnTimer = 0;
          this._spawnMinion(game);
        }
        break;

      case 'tank':
        // Very slow, straight down, absorbs hits
        this.y += this.speed * dt;
        // Slight sway
        this.x = this.startX + Math.sin(this.moveTimer * 0.001) * 30;
        break;

      case 'sniperElite':
        // Stays at top, doesn't descend
        if (this.y < this.targetY) {
          this.y += this.speed * dt * 2;
        } else {
          this.y = this.targetY;
          // Sway slowly
          this.x = this.startX + Math.sin(this.moveTimer * 0.0015) * 80;
        }
        break;

      case 'swarmer':
        // Group movement - weave together
        this.y += this.speed * dt * 0.8;
        this.x = this.startX + Math.sin(this.moveTimer * 0.004 + this.swarmPhase) * 100;
        // Slight vertical bob
        this.y += Math.sin(this.moveTimer * 0.003 + this.swarmPhase * 1.5) * 15;
        // Drift toward other swarmers
        if (game && game.enemies) {
          const swarmBuddies = game.enemies.filter(e =>
            e.active && e !== this && e.type === 'swarmer' && !e.isCharging);
          if (swarmBuddies.length > 0) {
            let avgX = 0, avgY = 0;
            for (const s of swarmBuddies) {
              avgX += s.x; avgY += s.y;
            }
            avgX /= swarmBuddies.length;
            avgY /= swarmBuddies.length;
            this.x += (avgX - this.x) * 0.01;
            this.y += (avgY - this.y) * 0.005;
          }
        }
        break;

      case 'kamikaze':
        // Directly charge at player at high speed
        if (player && player.active) {
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt * 1.5;
            this.y += (dy / dist) * this.speed * dt * 1.5;
          }
        } else {
          this.y += this.speed * dt;
        }
        break;

      // ---- Boss AI Behaviors ----
      case 'boss_guardian':
        {
          // Phase 1: enter from top
          const targetY = 80;
          const targetX = cfg.CANVAS_WIDTH / 2;
          if (this.y < targetY) {
            this.y += this.speed * dt;
          } else {
            this.y = targetY;
            this.x = targetX + Math.sin(this.moveTimer * 0.0015) * 120;
          }
          // Rotate shields
          const shieldSpeed = 0.002 + this.bossPhase * 0.001;
          for (const shield of this.activeShields) {
            shield.angle = (shield.angle + shieldSpeed * dt * 1000) % (Math.PI * 2);
          }
          // Phase destruction: remove shields
          if (this.bossPhase >= 0 && this.activeShields.length > 3 - (this.bossPhase + 1)) {
            // Keep removing down to (3 - phaseIndex) shields
            while (this.activeShields.length > Math.max(0, this.shieldCount - this.bossPhase)) {
              const removed = this.activeShields.pop();
              if (window.spawnParticles) {
                const sx = this.x + Math.cos(removed.angle) * removed.radius;
                const sy = this.y + Math.sin(removed.angle) * removed.radius;
                window.spawnParticles(sx, sy, 'explosion');
              }
            }
          }
        }
        break;

      case 'boss_summoner':
        {
          const targetY = 60;
          const targetX = cfg.CANVAS_WIDTH / 2;
          if (this.y < targetY) {
            this.y += this.speed * dt;
          } else {
            this.y = targetY;
            this.x = targetX + Math.sin(this.moveTimer * 0.002) * 140;
          }
          // Spawn minions
          this.bossSpawnTimer += dt * 1000;
          const interval = this.bossSpawnInterval / (1 + this.bossPhase * 0.5);
          if (this.bossSpawnTimer >= interval) {
            this.bossSpawnTimer = 0;
            const minionType = this.bossPhase >= 1 ? 'elite' : 'medium';
            this._spawnBossMinion(game, minionType);
          }
        }
        break;

      case 'boss_dragon':
        {
          // Sine wave movement
          const targetY = 90;
          if (this.y < targetY) {
            this.y += this.speed * dt;
          } else {
            this.y = targetY + Math.sin(this.moveTimer * 0.003) * 100;
            this.x = cfg.CANVAS_WIDTH / 2 + Math.sin(this.moveTimer * 0.002 + 1) * 180;
          }
          // Fire breath
          this.fireBreathTimer += dt * 1000;
          if (this.fireBreathTimer >= this.fireBreathCooldown) {
            this.fireBreathTimer = 0;
            this._fireBreath(game);
          }
          // Tail swipe (phase 2+)
          if (this.bossPhase >= 1 && this.tailSwipeCooldown > 0) {
            this.tailSwipeTimer += dt * 1000;
            if (this.tailSwipeTimer >= this.tailSwipeCooldown) {
              this.tailSwipeTimer = 0;
              this._tailSwipe(game);
            }
          }
        }
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // APPLY BOSS PHASE
  // ---------------------------------------------------------------------------
  _applyBossPhase(phase) {
    if (phase.bulletCount !== undefined) this.bulletConfig.count = phase.bulletCount;
    if (phase.spreadAngle !== undefined) this.bulletConfig.spreadAngle = phase.spreadAngle;
    if (phase.fireRate !== undefined) this.fireRate = phase.fireRate;
    if (phase.bulletSpeed !== undefined) this.bulletConfig.speed = phase.bulletSpeed;
  }

  // ---------------------------------------------------------------------------
  // SPAWNER MINION
  // ---------------------------------------------------------------------------
  _spawnMinion(game) {
    if (!game || !game.addEntity) return;
    // Count existing minions from this spawner
    if (game.enemies) {
      const myMinions = game.enemies.filter(e => e.active && e._spawnedBy === this).length;
      if (myMinions >= this.maxMinions) return;
    }
    const template = GAME_CONFIG.ENEMIES[this.spawnType];
    if (!template) return;
    const opts = {
      x: this.x + (Math.random() - 0.5) * 60,
      y: this.y + this.size + 10,
    };
    const minion = new Enemy(opts, template, game.difficulty || 0);
    minion._spawnedBy = this;
    game.addEntity(minion);
  }

  // ---------------------------------------------------------------------------
  // BOSS SUMMONER MINION
  // ---------------------------------------------------------------------------
  _spawnBossMinion(game, minionType) {
    if (!game || !game.addEntity) return;
    const template = GAME_CONFIG.ENEMIES[minionType];
    if (!template) return;
    const opts = {
      x: this.x + (Math.random() - 0.5) * 100,
      y: this.y + this.size + 15,
    };
    const minion = new Enemy(opts, template, game.difficulty || 0);
    game.addEntity(minion);
  }

  // ---------------------------------------------------------------------------
  // BOSS DRAGON: FIRE BREATH
  // ---------------------------------------------------------------------------
  _fireBreath(game) {
    if (!game || !window.BulletPatterns) return;
    const player = game.player;
    if (!player || !player.active) return;
    // Fire cone toward player
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const coneCount = 7;
    const coneSpread = 40 * (Math.PI / 180);
    const BP = window.BulletPatterns;
    for (let i = 0; i < coneCount; i++) {
      const a = angle - coneSpread / 2 + (coneSpread / (coneCount - 1)) * i;
      BP._create({
        x: this.x,
        y: this.y + this.size,
        vx: Math.cos(a) * this.bulletConfig.speed * 0.8,
        vy: Math.sin(a) * this.bulletConfig.speed * 0.8,
        speed: this.bulletConfig.speed * 0.8,
        damage: this.bulletConfig.damage * 1.3,
        color: '#ff6600',
        trailColor: '#ff4400',
        category: 'enemyBullet',
        size: 6,
        hitRadius: 5,
        lifetime: 3,
        drawLayer: 2,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // BOSS DRAGON: TAIL SWIPE (phase 2)
  // ---------------------------------------------------------------------------
  _tailSwipe(game) {
    if (!game || !window.BulletPatterns) return;
    // Sweep bullets in an arc
    window.BulletPatterns.circle(
      this.x,
      this.y + this.size,
      16,
      this.bulletConfig.speed * 1.1,
      this.bulletConfig.damage * 0.8,
      '#ffaa00'
    );
  }
  _fire(game) {
    const BulletPatterns = window.BulletPatterns;
    if (!BulletPatterns) return;

    const player = game.player;
    const cfg = this.bulletConfig;

    // Determine fire pattern based on AI type
    let pattern;
    switch (this.ai) {
      case 'aimed':
      case 'sniperElite':
        pattern = 'aimed';
        break;
      case 'boss':
      case 'boss_guardian':
      case 'boss_summoner':
        pattern = this.bossPhase >= 0 ? 'circle' : 'aimed';
        break;
      case 'boss_dragon':
        pattern = this.bossPhase >= 0 ? 'spiralOut' : 'aimed';
        break;
      default:
        pattern = 'aimed';
        break;
    }

    // For boss: alternate patterns based on phase
    if (this.isBoss && this.bossPhase >= 0) {
      const phaseIdx = this.bossPhase % 3;
      if (this.ai === 'boss_dragon') {
        pattern = phaseIdx === 0 ? 'spiralOut' : (phaseIdx === 1 ? 'circle' : 'aimed');
      } else if (this.ai === 'boss_summoner') {
        pattern = phaseIdx === 0 ? 'circle' : (phaseIdx === 1 ? 'aimed' : 'spiralOut');
      } else {
        if (phaseIdx === 0) pattern = 'circle';
        else if (phaseIdx === 1) pattern = 'spiralOut';
        else pattern = 'aimed';
      }
    }

    const px = player ? player.x : GAME_CONFIG.BALANCE.CANVAS_WIDTH / 2;
    const py = player ? player.y : GAME_CONFIG.BALANCE.CANVAS_HEIGHT;
    const baseX = this.x;
    const baseY = this.y + this.size;

    if (pattern === 'circle' && BulletPatterns.circle) {
      BulletPatterns.circle(baseX, baseY, cfg.count || 12, cfg.speed, cfg.damage, cfg.color);
    } else if (pattern === 'aimed' && BulletPatterns.aimed) {
      BulletPatterns.aimed(baseX, baseY, cfg.count || 1, px, py, cfg.speed, cfg.damage, cfg.color, cfg.spreadAngle || 0);
    } else if (pattern === 'spiralOut' && BulletPatterns.spiralOut) {
      BulletPatterns.spiralOut(baseX, baseY, cfg.count || 8, cfg.speed, cfg.damage, cfg.color, cfg.spreadAngle || 30);
    }
  }

  // ---------------------------------------------------------------------------
  // TAKE DAMAGE
  // ---------------------------------------------------------------------------
  takeDamage(amount) {
    if (!this.active) return;

    // Shielder: damage goes to shield first
    if (this.shieldMaxHp > 0 && this.shieldHp > 0 && !this.shieldDepleted) {
      const shieldDmg = Math.min(amount, this.shieldHp);
      this.shieldHp -= shieldDmg;
      amount -= shieldDmg;
      if (this.shieldHp <= 0) {
        this.shieldHp = 0;
        this.shieldDepleted = true;
        this.shieldRegenTimer = 0;
      }
      if (amount <= 0) return; // All absorbed
    }

    // Boss Guardian: damage goes to active shields first
    if (this.activeShields.length > 0 && amount > 0) {
      // Damage closest shield to player (or first shield)
      const liveShields = this.activeShields.filter(s => s.hp > 0);
      if (liveShields.length > 0) {
        const shield = liveShields[0];
        const shieldDmg = Math.min(amount, shield.hp);
        shield.hp -= shieldDmg;
        amount -= shieldDmg;
        if (amount <= 0) return; // All absorbed
      }
    }

    this.hp -= amount;
    this.flashTimer = 80;
    this.damaged = true;

    if (this.hp <= 0) {
      this.hp = 0;
      this._onDeath();
    }
  }

  // ---------------------------------------------------------------------------
  // DEATH
  // ---------------------------------------------------------------------------
  _onDeath() {
    const game = window.game;
    if (!game) return;

    this.active = false;

    // Score, XP, Combo handled by main.js handleEnemyKilled - DO NOT duplicate

    // Screen shake for boss
    if (this.isBoss && game.addShake) {
      game.addShake(20);
    } else if (game.addShake) {
      game.addShake(3);
    }

    // Particles
    if (window.ParticleSystem) {
      if (this.isBoss) {
        window.ParticleSystem.explosion(this.x, this.y, 'normal');
      } else if (this.size > 20) {
        window.ParticleSystem.explosion(this.x, this.y, 'normal');
      } else {
        window.ParticleSystem.explosion(this.x, this.y, 'small');
      }
    }

    // Splitter: spawn small enemies on death
    if (this.type === 'splitter' && this.splitCount > 0 && this.splitType) {
      const splitTemplate = GAME_CONFIG.ENEMIES[this.splitType];
      if (splitTemplate) {
        for (let i = 0; i < this.splitCount; i++) {
          const angle = (Math.PI * 2 / this.splitCount) * i - Math.PI / 2;
          const opts = {
            x: this.x + Math.cos(angle) * 20,
            y: this.y + Math.sin(angle) * 10,
          };
          const splitEnemy = new Enemy(opts, splitTemplate, game.difficulty);
          game.addEntity(splitEnemy);
        }
      }
    }

    // Kamikaze: explode on death, damage player in radius
    if (this.type === 'kamikaze' && this.explodeRadius > 0) {
      if (game.player && game.player.active) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.explodeRadius) {
          const dmgScale = 1 - (dist / this.explodeRadius);
          const dmg = Math.floor(this.explodeDamage * dmgScale);
          if (game.player.takeDamage) {
            game.player.takeDamage(dmg);
          }
        }
      }
      // Explosion visual
      if (window.spawnParticles) {
        window.spawnParticles(this.x, this.y, 'explosion');
      }
    }

    // Item drop signal (items.js handles actual drops)
    if (window.onEnemyKilled) {
      window.onEnemyKilled(this);
    }

    this._remove();
  }

  // ---------------------------------------------------------------------------
  // REMOVE FROM GAME
  // ---------------------------------------------------------------------------
  _remove() {
    if (window.game && window.game.removeEntity) {
      window.game.removeEntity(this);
    }
  }

  // ---------------------------------------------------------------------------
  // DRAW
  // ---------------------------------------------------------------------------
  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Damage flash
    const flash = this.flashTimer > 0 ? (Math.sin(this.flashTimer * 0.5) > 0) : false;
    const color = flash ? '#ffffff' : this.color;

    // Draw HP bar when damaged (not at full HP)
    if (this.damaged && this.hp > 0 && this.hp < this.maxHp) {
      this._drawHpBar(ctx);
    }

    // Draw shape based on type - AIRCRAFT themed
    switch (this.type) {
      case 'small':       this._drawFighter(ctx, color, false); break;
      case 'fastSmall':   this._drawInterceptor(ctx, color); break;
      case 'medium':      this._drawStandardFighter(ctx, color); break;
      case 'elite':       this._drawHeavyFighter(ctx, color); break;
      case 'sniper':      this._drawBomber(ctx, color); break;
      case 'obstacle':    this._drawAsteroid(ctx, color); break;
      case 'boss':        this._drawBattleship(ctx, color); break;
      case 'splitter':    this._drawDroneCarrier(ctx, color); break;
      case 'shielder':    this._drawArmoredBomber(ctx, color); break;
      case 'charger':     this._drawRammingInterceptor(ctx, color); break;
      case 'weaver':      this._drawAgileFighter(ctx, color); break;
      case 'teleporter':  this._drawStealthFighter(ctx, color); break;
      case 'spawner':     this._drawCarrier(ctx, color); break;
      case 'tank':        this._drawHeavyBomber(ctx, color); break;
      case 'sniperElite': this._drawPrecisionBomber(ctx, color); break;
      case 'swarmer':     this._drawDroneSwarm(ctx, color); break;
      case 'kamikaze':    this._drawSuicideDrone(ctx, color); break;
      case 'boss_guardian': this._drawBattleshipGuardian(ctx, color); break;
      case 'boss_summoner': this._drawBattleshipSummoner(ctx, color); break;
      case 'boss_dragon':   this._drawBattleshipDragon(ctx, color); break;
      default:            this._drawFighter(ctx, color, false); break;
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // SHAPE DRAWING
  // ---------------------------------------------------------------------------
  _drawCircle(ctx, color, thick) {
    const r = this.size;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    if (thick) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
    // Core highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawDiamond(ctx, color) {
    const r = this.size;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.75, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.75, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Core
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawHexagon(ctx, color) {
    const r = this.size;
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Core
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawTriangle(ctx, color) {
    const r = this.size;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.8, r * 0.6);
    ctx.lineTo(-r * 0.8, r * 0.6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Core
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawBoss(ctx, color) {
    const r = this.size;

    // Outer glow
    const grad = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.3);
    grad.addColorStop(0, 'rgba(255,0,0,0.6)');
    grad.addColorStop(0.5, 'rgba(255,0,0,0.2)');
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Main body - complex geometric shape
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.65;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    // Center eye/core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.35);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#ffdd00');
    coreGrad.addColorStop(0.7, '#ff4400');
    coreGrad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Phase indicator rings (only in higher phases)
    if (this.bossPhase >= 0) {
      ctx.strokeStyle = 'rgba(255,255,100,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.bossPhase >= 1) {
      ctx.strokeStyle = 'rgba(255,100,100,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning outer ring
      const rotAngle = (this.moveTimer * 0.004) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = rotAngle + (Math.PI * 2 / 4) * i;
        ctx.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, r * 0.2, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
  }

  // ---------------------------------------------------------------------------
  // NEW ENEMY SHAPES
  // ---------------------------------------------------------------------------
  _drawSplitter(ctx, color) {
    // Diamond with inner cross
    const r = this.size;
    // Main diamond
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.75, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.75, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Inner cross
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, 0);
    ctx.lineTo(r * 0.5, 0);
    ctx.moveTo(0, -r * 0.5);
    ctx.lineTo(0, r * 0.5);
    ctx.stroke();
    // Core
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawShielder(ctx, color) {
    // Circle with shield ring
    const r = this.size;
    // Shield ring (outer glow)
    if (this.shieldHp > 0 && !this.shieldDepleted) {
      const shieldAlpha = 0.3 + (this.shieldHp / this.shieldMaxHp) * 0.4;
      ctx.strokeStyle = this.shieldColor.replace(')', `,${shieldAlpha})`).replace('rgb', 'rgba');
      if (this.shieldColor.startsWith('#')) {
        ctx.strokeStyle = this.shieldColor;
        ctx.globalAlpha = shieldAlpha;
      }
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
      ctx.stroke();
      // Pulse animation
      const pulse = 1 + Math.sin(this.moveTimer * 0.01) * 0.15;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.15 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Main body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Depleted shield indicator
    if (this.shieldDepleted && this.shieldRegenTimer < this.shieldRegenDelay) {
      const regenPercent = this.shieldRegenTimer / this.shieldRegenDelay;
      ctx.strokeStyle = 'rgba(255,100,100,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * regenPercent);
      ctx.stroke();
    }
    // Core
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawCharger(ctx, color) {
    // Arrow/chevron shape pointing movement direction
    const r = this.size;
    let angle = 0;
    if (this.isCharging) {
      angle = this.chargeAngle - Math.PI / 2;
    }
    ctx.save();
    ctx.rotate(angle);
    // Chevron body
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.lineTo(r * 0.7, r * 0.4);
    ctx.lineTo(r * 0.2, r * 0.1);
    ctx.lineTo(r * 0.2, r * 0.8);
    ctx.lineTo(-r * 0.2, r * 0.8);
    ctx.lineTo(-r * 0.2, r * 0.1);
    ctx.lineTo(-r * 0.7, r * 0.4);
    ctx.closePath();
    ctx.fillStyle = this.isCharging ? '#ffffff' : color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Core
    ctx.fillStyle = 'rgba(255,100,0,0.4)';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawWeaver(ctx, color) {
    // Wavy/sine shape
    const r = this.size;
    // Draw a wavy line through body
    ctx.beginPath();
    for (let ty = -r; ty <= r; ty += 2) {
      const wx = Math.sin(ty * 0.3 + this.moveTimer * 0.01) * r * 0.6;
      if (ty === -r) ctx.moveTo(wx, ty);
      else ctx.lineTo(wx, ty);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Elliptical body
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.7, r * 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Core
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawTeleporter(ctx, color) {
    // Dashed outline circle
    const r = this.size;
    // Dashed outer ring
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Inner filled circle
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Core glow
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.4);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSpawner(ctx, color) {
    // Larger diamond with smaller diamonds inside
    const r = this.size;
    // Main diamond
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.8, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.8, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Small orbiting diamonds
    const count = 3;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + this.moveTimer * 0.003;
      const sx = Math.cos(angle) * r * 0.55;
      const sy = Math.sin(angle) * r * 0.55;
      const sr = r * 0.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy - sr);
      ctx.lineTo(sx + sr * 0.6, sy);
      ctx.lineTo(sx, sy + sr);
      ctx.lineTo(sx - sr * 0.6, sy);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    }
    // Center eye
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawTank(ctx, color) {
    // Thick hexagon
    const r = this.size;
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Inner armor plate
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const px = Math.cos(angle) * r * 0.6;
      const py = Math.sin(angle) * r * 0.6;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,200,150,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Core
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSniperElite(ctx, color) {
    // Triangle with targeting line
    const r = this.size;
    const player = window.game ? window.game.player : null;
    // Triangle pointing down
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.9, r * 0.5);
    ctx.lineTo(-r * 0.9, r * 0.5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Targeting line toward player
    if (player && player.active) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const tLineLen = Math.min(dist * 0.8, 200);
        const endX = (dx / dist) * tLineLen;
        const endY = (dy / dist) * tLineLen;
        ctx.strokeStyle = 'rgba(255,50,50,0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(0, r * 0.5);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
        // Targeting dot at end
        ctx.fillStyle = 'rgba(255,50,50,0.7)';
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Core
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSwarmer(ctx, color) {
    // Small clustered triangles
    const r = this.size;
    const wobble = Math.sin(this.moveTimer * 0.01 + this.swarmPhase) * 0.3;
    // 3 tiny triangles
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 / 3) * i + wobble;
      const cx = Math.cos(angle) * r * 0.5;
      const cy = Math.sin(angle) * r * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.35, cy + r * 0.3);
      ctx.lineTo(cx - r * 0.35, cy + r * 0.3);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    // Central core
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawKamikaze(ctx, color) {
    // Flashing red circle
    const r = this.size;
    const flash = 0.5 + Math.sin(this.moveTimer * 0.02) * 0.5;
    // Outer glow (pulsing)
    const grad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.5);
    grad.addColorStop(0, `rgba(255,50,0,${0.7 + flash * 0.3})`);
    grad.addColorStop(0.5, `rgba(255,0,0,${0.3})`);
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Main body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,100,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Danger marks (X)
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.4);
    ctx.lineTo(r * 0.4, r * 0.4);
    ctx.moveTo(r * 0.4, -r * 0.4);
    ctx.lineTo(-r * 0.4, r * 0.4);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // BOSS SHAPES
  // ---------------------------------------------------------------------------
  _drawBossGuardian(ctx, color) {
    const r = this.size;
    // Outer glow
    const grad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.4);
    grad.addColorStop(0, 'rgba(68,136,255,0.5)');
    grad.addColorStop(0.5, 'rgba(68,136,255,0.15)');
    grad.addColorStop(1, 'rgba(68,136,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Main body - hexagon
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rotating shields
    for (const shield of this.activeShields) {
      if (shield.hp <= 0) continue;
      const sx = Math.cos(shield.angle) * shield.radius;
      const sy = Math.sin(shield.angle) * shield.radius;
      const shieldHpPercent = shield.hp / shield.maxHp;
      // Shield orb
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.22, 0, Math.PI * 2);
      const shieldGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.22);
      shieldGrad.addColorStop(0, 'rgba(200,220,255,0.8)');
      shieldGrad.addColorStop(0.6, 'rgba(100,150,255,0.5)');
      shieldGrad.addColorStop(1, 'rgba(50,100,255,0)');
      ctx.fillStyle = shieldGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Shield HP arc
      if (shieldHpPercent < 1) {
        ctx.strokeStyle = 'rgba(255,100,100,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * shieldHpPercent);
        ctx.stroke();
      }
    }

    // Inner ring
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Center core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.3);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, '#88bbff');
    coreGrad.addColorStop(1, 'rgba(68,136,255,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Phase indicators
    if (this.bossPhase >= 0) {
      ctx.strokeStyle = 'rgba(255,255,100,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.bossPhase >= 1) {
      ctx.strokeStyle = 'rgba(255,100,100,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  _drawBossSummoner(ctx, color) {
    const r = this.size;
    // Outer glow (purple)
    const grad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.5);
    grad.addColorStop(0, 'rgba(170,68,255,0.5)');
    grad.addColorStop(0.5, 'rgba(170,68,255,0.15)');
    grad.addColorStop(1, 'rgba(170,68,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Main body - diamond
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.85, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.85, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Orbiting minion dots
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i + this.moveTimer * 0.002;
      const ox = Math.cos(angle) * r * 0.7;
      const oy = Math.sin(angle) * r * 0.7;
      ctx.fillStyle = 'rgba(255,200,255,0.7)';
      ctx.beginPath();
      ctx.arc(ox, oy, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner glow
    const innerGrad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 0.5);
    innerGrad.addColorStop(0, '#ffffff');
    innerGrad.addColorStop(0.4, 'rgba(200,100,255,0.6)');
    innerGrad.addColorStop(1, 'rgba(170,68,255,0)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Phase indicators
    if (this.bossPhase >= 0) {
      ctx.strokeStyle = 'rgba(255,255,100,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  _drawBossDragon(ctx, color) {
    const r = this.size;
    // Outer glow (orange/red)
    const grad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.6);
    grad.addColorStop(0, 'rgba(255,100,0,0.6)');
    grad.addColorStop(0.5, 'rgba(255,100,0,0.15)');
    grad.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Main body - large jagged/star shape
    const points = 8;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 / points) * i - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.6;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,100,0.6)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Wings (side extensions)
    const wingSpread = Math.sin(this.moveTimer * 0.003) * 0.2;
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.3, -r * 0.2);
      ctx.lineTo(side * (r * 0.9 + wingSpread * 20), -r * 0.6);
      ctx.lineTo(side * (r * 0.7 + wingSpread * 15), r * 0.1);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,80,0,0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,150,50,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Tail (bottom extension)
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 0.5);
    ctx.lineTo(0, r * 1.1);
    ctx.lineTo(r * 0.2, r * 0.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,80,0,0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,150,50,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fire core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.4);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.2, '#ffdd00');
    coreGrad.addColorStop(0.6, '#ff6600');
    coreGrad.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeY = -r * 0.2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.2, eyeY, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.2, eyeY, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-r * 0.2, eyeY, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.2, eyeY, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Phase indicators
    if (this.bossPhase >= 0) {
      ctx.strokeStyle = 'rgba(255,255,100,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.bossPhase >= 1) {
      ctx.strokeStyle = 'rgba(255,100,100,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.0, 0, Math.PI * 2);
      ctx.stroke();
      // Tail swipe zone indicator (bottom arc)
      ctx.strokeStyle = 'rgba(255,200,50,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, r * 0.8, r * 0.6, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
    }
  }
  _drawHpBar(ctx) {
    const barWidth = this.size * 2.2;
    const barHeight = 4;
    const yOffset = -this.size - 10;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-barWidth / 2, yOffset, barWidth, barHeight);

    // HP fill
    const hpPercent = this.hp / this.maxHp;
    const fillWidth = barWidth * hpPercent;
    let fillColor;
    if (hpPercent > 0.5) fillColor = '#44ff44';
    else if (hpPercent > 0.25) fillColor = '#ffcc00';
    else fillColor = '#ff4444';

    ctx.fillStyle = fillColor;
    ctx.fillRect(-barWidth / 2, yOffset, fillWidth, barHeight);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-barWidth / 2, yOffset, barWidth, barHeight);
  }
}


// =============================================================================
// WAVE SPAWNER (Enhanced with true wave system)
// =============================================================================
class WaveSpawner {
  constructor() {
    this.timer = 0;
    this.spawnInterval = GAME_CONFIG.WAVES.spawnRules.baseInterval;
    this.bossesSpawned = 0;
    this.lastDifficulty = 0;

    // Wave system
    this.waveNumber = 0;
    this.waveState = 'pause'; // 'active' | 'pause'
    this.wavePauseTimer = 0;
    this.wavePauseDuration = 3000; // 3 seconds between waves
    this.waveEnemiesSpawned = 0;
    this.waveEnemiesTotal = 0;
    this.waveBossSpawned = false;
    this.waveBossTypes = ['boss', 'boss_guardian', 'boss_summoner', 'boss_dragon'];
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------
  update(dt) {
    const game = window.game;
    if (!game || game.scene !== GAME_CONFIG.SCENES.GAMEPLAY) return;

    const cfg = GAME_CONFIG.BALANCE;
    const spawnRules = GAME_CONFIG.WAVES.spawnRules;

    // Calculate current difficulty
    const difficulty = Math.floor(game.score / 5000) + Math.floor(game.gameTime / cfg.DIFFICULTY_INTERVAL);
    game.difficulty = difficulty;

    // Update spawn interval based on difficulty
    this.spawnInterval = spawnRules.baseInterval / (1 + difficulty * cfg.DIFFICULTY_SPAWN_RATE);
    if (this.spawnInterval < spawnRules.minInterval) {
      this.spawnInterval = spawnRules.minInterval;
    }

    // --- Wave State Machine ---
    if (this.waveState === 'pause') {
      // Start first wave if waveNumber is 0
      if (this.waveNumber === 0) {
        this._startNewWave(game, difficulty);
        return;
      }
      // Wait for pause timer
      this.wavePauseTimer += dt * 1000;
      if (this.wavePauseTimer >= this.wavePauseDuration) {
        this._startNewWave(game, difficulty);
      }
      return;
    }

    if (this.waveState === 'active') {
      // Check wave complete
      const activeNonBoss = game.enemies.filter(e => e.active && !e.isBoss).length;
      if (this.waveEnemiesSpawned >= this.waveEnemiesTotal && activeNonBoss === 0) {
        this._completeWave(game);
        return;
      }

      // Spawn enemies for current wave (limited by total)
      this.timer += dt * 1000;
      if (this.timer >= this.spawnInterval && this.waveEnemiesSpawned < this.waveEnemiesTotal) {
        this.timer = 0;

        // Elite wave: spawn elite-focused groups
        if (this.waveNumber % 5 === 0) {
          this._spawnEliteWaveGroup(game, difficulty, spawnRules);
        } else if (this.waveNumber % 10 !== 0) {
          // Normal wave: use existing spawn logic
          this._spawnWaveGroup(game, difficulty, spawnRules);
        }

        // Boss wave: spawn boss on first tick
        if (this.waveNumber % 10 === 0 && !this.waveBossSpawned) {
          this._spawnWaveBoss(game, difficulty);
          this.waveBossSpawned = true;
        }
      }
    }

    // --- Legacy boss spawn check (fallback for score triggers) ---
    this._checkBossSpawns(game);
  }

  // ---------------------------------------------------------------------------
  // START NEW WAVE
  // ---------------------------------------------------------------------------
  _startNewWave(game, difficulty) {
    const cfg = GAME_CONFIG.BALANCE;
    this.waveNumber++;
    this.waveState = 'active';
    this.wavePauseTimer = 0;
    this.waveEnemiesSpawned = 0;
    this.waveBossSpawned = false;

    // Calculate total enemies for this wave
    // Base: 10 + waveNumber * 2, scaled by difficulty
    const baseCount = 10 + this.waveNumber * 2;
    const diffScale = 1 + difficulty * 0.08;
    this.waveEnemiesTotal = Math.floor(baseCount * diffScale);

    // Elite waves have fewer but tougher enemies
    if (this.waveNumber % 5 === 0 && this.waveNumber % 10 !== 0) {
      this.waveEnemiesTotal = Math.floor(this.waveEnemiesTotal * 0.7);
    }
    // Boss waves have fewer normal enemies (boss is the main threat)
    if (this.waveNumber % 10 === 0) {
      this.waveEnemiesTotal = Math.floor(this.waveEnemiesTotal * 0.5);
    }

    // Cap at reasonable max
    if (this.waveEnemiesTotal > 60) this.waveEnemiesTotal = 60;
    if (this.waveEnemiesTotal < 5) this.waveEnemiesTotal = 5;

    // Adjust spawn interval: faster spawns in later waves
    const waveSpeedFactor = 1 + (this.waveNumber - 1) * 0.04;
    this.spawnInterval = Math.max(
      GAME_CONFIG.WAVES.spawnRules.minInterval * 1.5,
      GAME_CONFIG.WAVES.spawnRules.baseInterval / (1 + difficulty * cfg.DIFFICULTY_SPAWN_RATE) / waveSpeedFactor
    );

    // Wave notification
    if (game.addMessage) {
      if (this.waveNumber % 10 === 0) {
        game.addMessage(`⚠ BOSS WAVE ${this.waveNumber} ⚠`, '#ff4444');
      } else if (this.waveNumber % 5 === 0) {
        game.addMessage(`⚡ Elite Wave ${this.waveNumber} ⚡`, '#ffaa00');
      } else {
        game.addMessage(`Wave ${this.waveNumber}`, '#ffffff');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // COMPLETE WAVE
  // ---------------------------------------------------------------------------
  _completeWave(game) {
    this.waveState = 'pause';
    this.wavePauseTimer = 0;
    if (game.addMessage) {
      game.addMessage(`Wave ${this.waveNumber} cleared!`, '#44ff44');
    }
  }

  // ---------------------------------------------------------------------------
  // SPAWN WAVE GROUP (normal)
  // ---------------------------------------------------------------------------
  _spawnWaveGroup(game, difficulty, spawnRules) {
    // Existing logic but track spawned count
    const activeEnemies = game.enemies.filter(e => e.active && !e.isBoss).length;
    if (activeEnemies >= spawnRules.maxEnemiesOnScreen) return;

    const applicableGroups = [];
    for (const group of spawnRules.groups) {
      if (difficulty >= group.minDifficulty) {
        applicableGroups.push(group);
      }
    }
    if (applicableGroups.length === 0) return;

    const totalWeight = applicableGroups.reduce((sum, g, i) => sum + (i + 1), 0);
    let roll = Math.random() * totalWeight;
    let pickedGroup = applicableGroups[0];
    for (let i = 0; i < applicableGroups.length; i++) {
      roll -= (i + 1);
      if (roll <= 0) {
        pickedGroup = applicableGroups[i];
        break;
      }
    }

    const template = pickedGroup.templates[Math.floor(Math.random() * pickedGroup.templates.length)];
    const count = this._spawnGroup(game, template, difficulty);
    this.waveEnemiesSpawned += count;
  }

  // ---------------------------------------------------------------------------
  // SPAWN ELITE WAVE GROUP
  // ---------------------------------------------------------------------------
  _spawnEliteWaveGroup(game, difficulty, spawnRules) {
    const activeEnemies = game.enemies.filter(e => e.active && !e.isBoss).length;
    if (activeEnemies >= spawnRules.maxEnemiesOnScreen) return;

    // Elite wave compositions
    const eliteTemplates = [
      { enemy: 'elite', count: 2, spacing: 120, pattern: 'line' },
      { enemy: 'sniperElite', count: 2, spacing: 100, pattern: 'line' },
      { enemy: 'tank', count: 1, spacing: 0, pattern: 'single' },
      { enemy: 'spawner', count: 1, spacing: 0, pattern: 'single' },
      { enemy: 'shielder', count: 3, spacing: 70, pattern: 'v' },
      { enemy: 'charger', count: 3, spacing: 80, pattern: 'random' },
      { enemy: 'teleporter', count: 2, spacing: 100, pattern: 'random' },
      { enemy: 'kamikaze', count: 3, spacing: 50, pattern: 'random' },
    ];

    // Pick 1-2 random elite templates
    const numGroups = 1 + Math.floor(Math.random() * 2);
    for (let g = 0; g < numGroups; g++) {
      const template = eliteTemplates[Math.floor(Math.random() * eliteTemplates.length)];
      const count = this._spawnGroup(game, template, difficulty);
      this.waveEnemiesSpawned += count;
    }
  }

  // ---------------------------------------------------------------------------
  // SPAWN WAVE BOSS
  // ---------------------------------------------------------------------------
  _spawnWaveBoss(game, difficulty) {
    // Cycle through boss types based on which wave number boss
    const bossIdx = (Math.floor(this.waveNumber / 10) - 1) % this.waveBossTypes.length;
    const bossType = this.waveBossTypes[bossIdx];
    const template = GAME_CONFIG.ENEMIES[bossType];
    if (!template) return;

    // Scale boss HP by wave number
    const scaledTemplate = Object.assign({}, template);
    scaledTemplate.hp = Math.floor(template.hp * (1 + this.waveNumber * 0.12));

    const opts = {
      x: GAME_CONFIG.BALANCE.CANVAS_WIDTH / 2,
      y: -100,
    };
    const enemy = new Enemy(opts, scaledTemplate, difficulty);
    game.addEntity(enemy);

    if (game.addMessage) {
      game.addMessage(`⚠ ${template.name} appears!`, '#ff4444');
    }
  }

  // ---------------------------------------------------------------------------
  // CHECK BOSS SPAWNS (legacy score-based, keeps backward compat)
  // ---------------------------------------------------------------------------
  _checkBossSpawns(game) {
    const triggers = GAME_CONFIG.WAVES.bossTriggers;
    for (let i = 0; i < triggers.length; i++) {
      if (i >= this.bossesSpawned && game.score >= triggers[i]) {
        const hasActiveBoss = game.enemies.some(e => e.active && e.isBoss);
        if (!hasActiveBoss) {
          this._spawnBoss(game);
          this.bossesSpawned = Math.max(this.bossesSpawned, i + 1);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // SPAWN BOSS (legacy)
  // ---------------------------------------------------------------------------
  spawnBoss() { this._spawnBoss(window.game); }
  _spawnBoss(game) {
    const template = GAME_CONFIG.ENEMIES.boss;
    const opts = {
      x: GAME_CONFIG.BALANCE.CANVAS_WIDTH / 2,
      y: -80,
    };
    const enemy = new Enemy(opts, template, game.difficulty);
    game.addEntity(enemy);
  }

  // ---------------------------------------------------------------------------
  // SPAWN GROUP (returns count spawned)
  // ---------------------------------------------------------------------------
  _spawnGroup(game, template, difficulty) {
    const enemyConfig = GAME_CONFIG.ENEMIES[template.enemy];
    if (!enemyConfig) return 0;

    const count = template.count || 1;
    const spacing = template.spacing || 60;
    const pattern = template.pattern || 'line';
    const cfg = GAME_CONFIG.BALANCE;

    const positions = this._getSpawnPositions(count, spacing, pattern, cfg);

    // Scale HP by wave number
    const waveHpScale = 1 + this.waveNumber * 0.12;
    const scaledConfig = Object.assign({}, enemyConfig);
    scaledConfig.hp = Math.floor(enemyConfig.hp * waveHpScale);

    for (const pos of positions) {
      const opts = { x: pos.x, y: pos.y };
      const enemy = new Enemy(opts, scaledConfig, difficulty);
      window.game.addEntity(enemy);
    }
    return count;
  }

  // ---------------------------------------------------------------------------
  // GET SPAWN POSITIONS (formation patterns)
  // ---------------------------------------------------------------------------
  _getSpawnPositions(count, spacing, pattern, cfg) {
    const positions = [];
    const startY = -40;

    switch (pattern) {
      case 'line': {
        const totalWidth = (count - 1) * spacing;
        const startX = (cfg.CANVAS_WIDTH - totalWidth) / 2;
        for (let i = 0; i < count; i++) {
          positions.push({
            x: startX + i * spacing,
            y: startY - Math.random() * 40,
          });
        }
        break;
      }

      case 'v': {
        if (count === 1) {
          positions.push({ x: cfg.CANVAS_WIDTH / 2, y: startY });
        } else {
          const halfCount = Math.floor(count / 2);
          const isOdd = count % 2 === 1;
          let idx = 0;
          for (let i = halfCount; i > 0; i--) {
            positions.push({
              x: cfg.CANVAS_WIDTH / 2 - i * spacing,
              y: startY - Math.abs(halfCount - idx) * 15,
            });
            idx++;
          }
          if (isOdd) {
            positions.push({ x: cfg.CANVAS_WIDTH / 2, y: startY - 25 });
          }
          for (let i = 1; i <= halfCount; i++) {
            positions.push({
              x: cfg.CANVAS_WIDTH / 2 + i * spacing,
              y: startY - Math.abs(halfCount - idx) * 15,
            });
            idx++;
          }
        }
        break;
      }

      case 'circle': {
        const radius = Math.max(spacing, count * 8);
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
          positions.push({
            x: cfg.CANVAS_WIDTH / 2 + Math.cos(angle) * radius,
            y: startY + Math.sin(angle) * radius * 0.6,
          });
        }
        break;
      }

      case 'random': {
        for (let i = 0; i < count; i++) {
          positions.push({
            x: spacing + Math.random() * (cfg.CANVAS_WIDTH - spacing * 2),
            y: startY - Math.random() * 80,
          });
        }
        break;
      }

      case 'wave': {
        const totalWidth = (count - 1) * spacing;
        const startX = (cfg.CANVAS_WIDTH - totalWidth) / 2;
        for (let i = 0; i < count; i++) {
          const waveY = Math.sin(i * 0.8) * 20;
          positions.push({
            x: startX + i * spacing,
            y: startY + waveY,
          });
        }
        break;
      }

      case 'single':
      default: {
        positions.push({
          x: cfg.CANVAS_WIDTH / 2,
          y: startY,
        });
        break;
      }
    }

    return positions;
  }

  // ---------------------------------------------------------------------------
  // RESET
  // ---------------------------------------------------------------------------
  reset() {
    this.timer = 0;
    this.bossesSpawned = 0;
    this.lastDifficulty = 0;
    this.spawnInterval = GAME_CONFIG.WAVES.spawnRules.baseInterval;
    // Reset wave system
    this.waveNumber = 0;
    this.waveState = 'pause';
    this.wavePauseTimer = 0;
    this.waveEnemiesSpawned = 0;
    this.waveEnemiesTotal = 0;
    this.waveBossSpawned = false;
  }
}


// =============================================================================
// EXPORT TO WINDOW
// =============================================================================
if (typeof window !== 'undefined') {
  window.Enemy = Enemy;
  window.WaveSpawner = WaveSpawner;
}
