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

    // Elite affix system
    this.affixes = [];
    this._applyAffixes(template);

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
  // ELITE AFFIX SYSTEM
  // ---------------------------------------------------------------------------
  _applyAffixes(template) {
    // Only apply affixes to elite enemies (wave 5, 15, 25, etc.)
    const game = window.game;
    if (!game) return;

    // Check if this is an elite wave (every 5 waves, not boss wave)
    const waveSpawner = game._waveSpawner;
    if (!waveSpawner) return;

    const waveNumber = waveSpawner.waveNumber || 0;
    if (waveNumber % 5 !== 0 || waveNumber % 10 === 0) return;

    // 30% chance to get an affix
    if (Math.random() > 0.3) return;

    // Available affixes
    const affixes = [
      { id: 'berserker', name: '狂暴', color: '#ff4444', effect: () => {
        this.fireRate *= 0.5; // Attack twice as fast
        this.bulletConfig.speed *= 1.3;
      }},
      { id: 'split', name: '分裂', color: '#44ff44', effect: () => {
        this.splitCount = 2;
        this.splitType = 'small';
      }},
      { id: 'shield', name: '护盾', color: '#4488ff', effect: () => {
        this.shieldHp = this.maxHp * 0.3;
        this.shieldMaxHp = this.shieldHp;
      }},
      { id: 'regen', name: '再生', color: '#44ff88', effect: () => {
        this._regenRate = this.maxHp * 0.02; // 2% HP per second
      }},
      { id: 'fast', name: '迅捷', color: '#ffff44', effect: () => {
        this.speed *= 1.5;
        this.baseSpeed = this.speed;
      }},
      { id: 'tank', name: '坚韧', color: '#8844ff', effect: () => {
        this.maxHp *= 2;
        this.hp = this.maxHp;
        this.size *= 1.2;
      }},
      { id: 'volatile', name: '易爆', color: '#ff8800', effect: () => {
        this._volatile = true;
        this._volatileRadius = 100;
        this._volatileDamage = 30;
      }},
      { id: 'ghost', name: '幽灵', color: '#88ffff', effect: () => {
        this._ghost = true;
        this.hitRadius *= 0.5; // Harder to hit
      }},
    ];

    // Pick 1-2 random affixes
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const affix = affixes[Math.floor(Math.random() * affixes.length)];
      if (!this.affixes.find(a => a.id === affix.id)) {
        this.affixes.push(affix);
        affix.effect();
      }
    }
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

    // Regeneration affix
    if (this._regenRate && this._regenRate > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this._regenRate * dt);
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
            // Complex boss movement patterns
            this._bossMoveTimer = (this._bossMoveTimer || 0) + dt * 1000;
            this._bossMovePattern = this._bossMovePattern || 0;
            this._bossChargeTimer = this._bossChargeTimer || 0;
            this._bossTeleportCooldown = this._bossTeleportCooldown || 0;
            this._bossMinionTimer = (this._bossMinionTimer || 0) + dt * 1000;

            // Change pattern every 3-5 seconds
            if (this._bossMoveTimer > 3000 + Math.random() * 2000) {
              this._bossMoveTimer = 0;
              this._bossMovePattern = (this._bossMovePattern + 1) % 4;
            }

            // Teleport cooldown
            this._bossTeleportCooldown -= dt * 1000;

            // Spawn minions every 4-6 seconds
            if (this._bossMinionTimer > 4000 + Math.random() * 2000) {
              this._bossMinionTimer = 0;
              this._spawnBossMinion(game, 'small');
            }

            switch (this._bossMovePattern) {
              case 0: // Sine wave movement
                this.y = targetY + Math.sin(this.moveTimer * 0.003) * 60;
                this.x = targetX + Math.sin(this.moveTimer * 0.002) * 180;
                break;

              case 1: // Charge toward player
                this._bossChargeTimer += dt * 1000;
                if (this._bossChargeTimer < 1000) {
                  // Windup - move to center
                  this.x += (targetX - this.x) * 0.05;
                  this.y += (targetY - this.y) * 0.05;
                } else if (this._bossChargeTimer < 1500) {
                  // Charge!
                  if (game.player) {
                    const dx = game.player.x - this.x;
                    const dy = game.player.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 1) {
                      this.x += (dx / dist) * this.speed * 3 * dt;
                      this.y += (dy / dist) * this.speed * 3 * dt;
                    }
                  }
                } else {
                  this._bossChargeTimer = 0;
                  // Return to position
                  this.x += (targetX - this.x) * 0.02;
                  this.y += (targetY - this.y) * 0.02;
                }
                break;

              case 2: // Arc movement (figure 8)
                const t = this.moveTimer * 0.002;
                this.x = targetX + Math.sin(t) * 200;
                this.y = targetY + Math.sin(t * 2) * 80;
                break;

              case 3: // Teleport
                if (this._bossTeleportCooldown <= 0) {
                  // Teleport to random position
                  this.x = 50 + Math.random() * (cfg.CANVAS_WIDTH - 100);
                  this.y = 50 + Math.random() * 150;
                  this._bossTeleportCooldown = 2000 + Math.random() * 1000;
                  // Flash effect
                  if (window.ParticleSystem) {
                    window.ParticleSystem.explosion(this.x, this.y, 'small');
                  }
                } else {
                  // Slow drift toward center
                  this.x += (targetX - this.x) * 0.01;
                  this.y += (targetY - this.y) * 0.01;
                }
                break;
            }

            // Keep boss in bounds
            this.x = Math.max(30, Math.min(cfg.CANVAS_WIDTH - 30, this.x));
            this.y = Math.max(30, Math.min(cfg.CANVAS_HEIGHT * 0.4, this.y));
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
          let swarmCount = 0, avgX = 0, avgY = 0;
          for (let i = 0; i < game.enemies.length; i++) {
            const e = game.enemies[i];
            if (e.active && e !== this && e.type === 'swarmer' && !e.isCharging) {
              avgX += e.x; avgY += e.y;
              swarmCount++;
            }
          }
          if (swarmCount > 0) {
            avgX /= swarmCount;
            avgY /= swarmCount;
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

      case 'boss_phantom':
        {
          // Phantom boss: teleport + area denial
          this._phantomTimer = (this._phantomTimer || 0) + dt * 1000;
          this._phantomTeleportCooldown = (this._phantomTeleportCooldown || 3000) - dt * 1000;
          this._phantomCloneTimer = (this._phantomCloneTimer || 0) + dt * 1000;

          // Enter from top
          const targetY = 100;
          if (this.y < targetY) {
            this.y += this.speed * dt;
          } else {
            // Teleport pattern
            if (this._phantomTeleportCooldown <= 0) {
              // Teleport to random position
              this.x = 50 + Math.random() * (cfg.CANVAS_WIDTH - 100);
              this.y = 50 + Math.random() * 150;
              this._phantomTeleportCooldown = this.bossPhase >= 1 ? 1500 : 3000;
              // Flash effect
              if (window.ParticleSystem) {
                window.ParticleSystem.explosion(this.x, this.y, 'small');
              }
              // Fire burst on teleport
              this._fireBurst(game);
            } else {
              // Slow drift
              const centerX = cfg.CANVAS_WIDTH / 2;
              const centerY = 120;
              this.x += (centerX + Math.sin(this.moveTimer * 0.002) * 150 - this.x) * 0.02;
              this.y += (centerY + Math.cos(this.moveTimer * 0.003) * 50 - this.y) * 0.02;
            }

            // Phase 2+: Create phantom clones
            if (this.bossPhase >= 1 && this._phantomCloneTimer >= 5000) {
              this._phantomCloneTimer = 0;
              this._spawnPhantomClone(game);
            }
          }
        }
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // PHANTOM BOSS SPECIAL ATTACKS
  // ---------------------------------------------------------------------------
  _fireBurst(game) {
    if (!game.player) return;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = this.bulletConfig.speed;
      if (window.BulletPatterns) {
        window.BulletPatterns.normal(
          this.x, this.y, angle, speed,
          this.bulletConfig.damage, this.bulletConfig.color, this.bulletConfig.color
        );
      }
    }
  }

  _spawnPhantomClone(game) {
    // Spawn a weaker clone that explodes after a few seconds
    const cloneTemplate = {
      hp: this.maxHp * 0.1,
      speed: 0,
      damage: this.damage * 0.5,
      score: 100,
      xp: 50,
      size: this.size * 0.7,
      color: '#88ffff',
      type: 'kamikaze',
      ai: 'straight',
      bulletSpeed: 0,
      fireRate: 99999,
      hitRadius: this.size * 0.7,
      explodeRadius: 120,
      explodeDamage: 30,
    };

    const clone = new Enemy({
      x: this.x + (Math.random() - 0.5) * 100,
      y: this.y + (Math.random() - 0.5) * 80,
    }, cloneTemplate, game.difficulty);

    // Clone explodes after 3 seconds
    clone._cloneTimer = 3000;
    clone._isClone = true;
    const originalUpdate = clone.update.bind(clone);
    clone.update = function(dt) {
      this._cloneTimer -= dt * 1000;
      if (this._cloneTimer <= 0) {
        this.hp = 0;
        this._onDeath();
        return;
      }
      originalUpdate(dt);
    };

    game.addEntity(clone);
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
      let myMinions = 0;
      for (let i = 0; i < game.enemies.length; i++) {
        if (game.enemies[i].active && game.enemies[i]._spawnedBy === this) myMinions++;
      }
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

    // Available bullet patterns for random selection
    const PATTERN_POOL = ['aimed', 'circle', 'spiralOut', 'spread', 'burst'];

    // Determine fire pattern based on AI type
    let pattern;
    if (this.isBoss) {
      // Boss: cycle through patterns based on phase
      const phaseIdx = this.bossPhase >= 0 ? this.bossPhase % 3 : 0;
      const bossPatterns = {
        'boss_dragon': ['spiralOut', 'circle', 'aimed'],
        'boss_summoner': ['circle', 'aimed', 'spiralOut'],
        'boss_guardian': ['circle', 'spiralOut', 'aimed'],
        'boss_phantom': ['aimed', 'burst', 'circle'],
      };
      const patterns = bossPatterns[this.ai] || ['circle', 'spiralOut', 'aimed'];
      pattern = patterns[phaseIdx] || 'aimed';
    } else {
      // Regular enemies: random pattern selection (weighted)
      // aimed: 40%, circle: 20%, spiralOut: 15%, spread: 15%, burst: 10%
      const roll = Math.random();
      if (roll < 0.40) pattern = 'aimed';
      else if (roll < 0.60) pattern = 'circle';
      else if (roll < 0.75) pattern = 'spiralOut';
      else if (roll < 0.90) pattern = 'spread';
      else pattern = 'burst';
    }

    const px = player ? player.x : GAME_CONFIG.BALANCE.CANVAS_WIDTH / 2;
    const py = player ? player.y : GAME_CONFIG.BALANCE.CANVAS_HEIGHT;
    const baseX = this.x;
    const baseY = this.y + this.size;

    // Fire based on pattern
    if (pattern === 'circle' && BulletPatterns.circle) {
      BulletPatterns.circle(baseX, baseY, cfg.count || 12, cfg.speed, cfg.damage, cfg.color);
    } else if (pattern === 'aimed' && BulletPatterns.aimed) {
      BulletPatterns.aimed(baseX, baseY, cfg.count || 1, px, py, cfg.speed, cfg.damage, cfg.color, cfg.spreadAngle || 0);
    } else if (pattern === 'spiralOut' && BulletPatterns.spiralOut) {
      BulletPatterns.spiralOut(baseX, baseY, cfg.count || 8, cfg.speed, cfg.damage, cfg.color, cfg.spreadAngle || 30);
    } else if (pattern === 'spread' && BulletPatterns.spread) {
      // Spread pattern: fan of bullets toward player
      const count = cfg.count || 5;
      const angle = Math.atan2(py - baseY, px - baseX);
      BulletPatterns.spread(baseX, baseY, count, cfg.spreadAngle || 45, cfg.speed, cfg.damage, cfg.color, angle);
    } else if (pattern === 'burst' && BulletPatterns.circle) {
      // Burst: rapid fire circle
      BulletPatterns.circle(baseX, baseY, (cfg.count || 8) + 4, cfg.speed * 1.2, cfg.damage * 0.7, cfg.color);
    } else {
      // Fallback to aimed
      if (BulletPatterns.aimed) {
        BulletPatterns.aimed(baseX, baseY, cfg.count || 1, px, py, cfg.speed, cfg.damage, cfg.color, cfg.spreadAngle || 0);
      }
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
      if (amount <= 0) return true; // All absorbed by shield, enemy still alive
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
        if (amount <= 0) return true; // All absorbed by shield, enemy still alive
      }
    }

    this.hp -= amount;
    this.flashTimer = 80;
    this.damaged = true;

    if (this.hp <= 0) {
      this.hp = 0;
      this._onDeath();
      return false; // Dead
    }
    return true; // Alive
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

    // Volatile affix: explode on death
    if (this._volatile && this._volatileRadius > 0) {
      if (game.player && game.player.active) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this._volatileRadius) {
          const dmgScale = 1 - (dist / this._volatileRadius);
          const dmg = Math.floor(this._volatileDamage * dmgScale);
          if (game.player.takeDamage) {
            game.player.takeDamage(dmg);
          }
        }
      }
      // Explosion visual
      if (window.ParticleSystem) {
        window.ParticleSystem.explosion(this.x, this.y, 'normal');
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
      case 'boss_phantom':  this._drawBattleshipPhantom(ctx, color); break;
      default:            this._drawFighter(ctx, color, false); break;
    }

    // Status effect visual overlays
    if (this.frozenTimer > 0) {
      ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200, 240, 255, 0.6)';
      ctx.lineWidth = 1;
      for (var ci = 0; ci < 4; ci++) {
        var ca = ci * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ca) * this.size * 0.8, Math.sin(ca) * this.size * 0.8);
        ctx.stroke();
      }
    }
    else if (this.slowTimer > 0) {
      ctx.fillStyle = 'rgba(100, 150, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.05, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.poisonTimer > 0) {
      ctx.fillStyle = 'rgba(80, 200, 60, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.05, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.burnTimer > 0) {
      ctx.fillStyle = 'rgba(255, 100, 20, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.05, 0, Math.PI * 2);
      ctx.fill();
    }

    // Elite affix visual indicators
    if (this.affixes.length > 0) {
      this._drawAffixIndicators(ctx);
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // ELITE AFFIX VISUAL INDICATORS
  // ---------------------------------------------------------------------------
  _drawAffixIndicators(ctx) {
    const time = Date.now() * 0.003;
    const radius = this.size * 1.3;

    for (let i = 0; i < this.affixes.length; i++) {
      const affix = this.affixes[i];
      const angle = (Math.PI * 2 / this.affixes.length) * i + time;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Draw affix icon
      ctx.fillStyle = affix.color;
      ctx.globalAlpha = 0.8 + Math.sin(time * 2) * 0.2;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw affix name (small text)
      if (this.size > 15) {
        ctx.fillStyle = affix.color;
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(affix.name, x, y - 6);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------------------
  // AIRCRAFT SHAPE DRAWING (飞机大战 - 飞机形状)
  // ---------------------------------------------------------------------------

  // Helper: draw a standard fuselage (nose pointing up)
  _drawFuselage(ctx, w, h, color, noseY, bodyW, bodyH) {
    ctx.beginPath();
    ctx.moveTo(0, noseY);                          // nose tip
    ctx.lineTo(bodyW * 0.4, noseY + h * 0.3);      // right shoulder
    ctx.lineTo(bodyW * 0.5, noseY + h * 0.85);     // right hip
    ctx.lineTo(-bodyW * 0.5, noseY + h * 0.85);     // left hip
    ctx.lineTo(-bodyW * 0.4, noseY + h * 0.3);      // left shoulder
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Helper: cockpit highlight
  _drawCockpit(ctx, x, y, r) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helper: engine glow
  _drawEngineGlow(ctx, x, y, r, glowColor) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, glowColor || '#ffaa00');
    grad.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helper: draw wing (left or right)
  _drawWing(ctx, side, attachX, attachY, tipOffsetX, tipOffsetY, sweepFactor, color) {
    const dir = side === 'left' ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(dir * attachX, attachY);
    ctx.lineTo(dir * tipOffsetX, attachY + tipOffsetY);
    ctx.lineTo(dir * (tipOffsetX - sweepFactor), attachY + tipOffsetY + 3);
    ctx.lineTo(dir * (attachX - 0.5 * sweepFactor), attachY + 5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // ===========================================================================
  // FIGHTERS
  // ===========================================================================

  // 'small': Tiny fighter plane - triangle body + small straight wings
  _drawFighter(ctx, color, sweptWings) {
    const r = this.size;
    const sweep = sweptWings ? r * 0.6 : 0;

    // Fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.4);
    ctx.lineTo(r * 0.35, -r * 0.1);
    ctx.lineTo(r * 0.2, r * 0.7);
    ctx.lineTo(-r * 0.2, r * 0.7);
    ctx.lineTo(-r * 0.35, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Wings
    const wingBaseY = r * 0.1 + sweep * 0.3;
    ctx.beginPath();
    ctx.moveTo(r * 0.2, wingBaseY);
    ctx.lineTo(r * 1.0, wingBaseY + sweep);
    ctx.lineTo(r * 0.6, wingBaseY + r * 0.35);
    ctx.lineTo(r * 0.15, wingBaseY + r * 0.25);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, wingBaseY);
    ctx.lineTo(-r * 1.0, wingBaseY + sweep);
    ctx.lineTo(-r * 0.6, wingBaseY + r * 0.35);
    ctx.lineTo(-r * 0.15, wingBaseY + r * 0.25);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Cockpit
    this._drawCockpit(ctx, 0, -r * 0.5, r * 0.22);
  }

  // 'fastSmall': Swept-wing interceptor - narrow body + swept-back wings
  _drawInterceptor(ctx, color) {
    const r = this.size;

    // Fuselage - narrow dart
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.6);
    ctx.lineTo(r * 0.22, -r * 0.2);
    ctx.lineTo(r * 0.12, r * 0.6);
    ctx.lineTo(-r * 0.12, r * 0.6);
    ctx.lineTo(-r * 0.22, -r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Swept-back wings (delta) - swept backward
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.1);
    ctx.lineTo(r * 1.1, r * 0.55);
    ctx.lineTo(r * 0.5, r * 0.35);
    ctx.lineTo(r * 0.05, r * 0.15);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.1);
    ctx.lineTo(-r * 1.1, r * 0.55);
    ctx.lineTo(-r * 0.5, r * 0.35);
    ctx.lineTo(-r * 0.05, r * 0.15);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Sharp cockpit
    this._drawCockpit(ctx, 0, -r * 0.65, r * 0.18);

    // Tail engine glow
    this._drawEngineGlow(ctx, 0, r * 0.55, r * 0.25, '#ff6600');
  }

  // 'medium': Standard fighter - triangle nose + wings + tail fins
  _drawStandardFighter(ctx, color) {
    const r = this.size;

    // Fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.3);
    ctx.lineTo(r * 0.4, -r * 0.15);
    ctx.lineTo(r * 0.35, r * 0.5);
    ctx.lineTo(r * 0.2, r * 0.8);
    ctx.lineTo(-r * 0.2, r * 0.8);
    ctx.lineTo(-r * 0.35, r * 0.5);
    ctx.lineTo(-r * 0.4, -r * 0.15);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Main wings
    ctx.beginPath();
    ctx.moveTo(r * 0.25, -r * 0.1);
    ctx.lineTo(r * 1.15, r * 0.25);
    ctx.lineTo(r * 0.8, r * 0.5);
    ctx.lineTo(r * 0.15, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, -r * 0.1);
    ctx.lineTo(-r * 1.15, r * 0.25);
    ctx.lineTo(-r * 0.8, r * 0.5);
    ctx.lineTo(-r * 0.15, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Tail fins
    ctx.beginPath();
    ctx.moveTo(r * 0.12, r * 0.65);
    ctx.lineTo(r * 0.45, r * 0.95);
    ctx.lineTo(r * 0.08, r * 0.9);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, r * 0.65);
    ctx.lineTo(-r * 0.45, r * 0.95);
    ctx.lineTo(-r * 0.08, r * 0.9);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Cockpit
    this._drawCockpit(ctx, 0, -r * 0.5, r * 0.25);

    // Engine glow
    this._drawEngineGlow(ctx, 0, r * 0.7, r * 0.2, '#ffaa00');
  }

  // 'elite': Heavy fighter - larger, twin tails, engine glow
  _drawHeavyFighter(ctx, color) {
    const r = this.size;

    // Fuselage - thicker
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.lineTo(r * 0.5, -r * 0.1);
    ctx.lineTo(r * 0.55, r * 0.4);
    ctx.lineTo(r * 0.3, r * 0.75);
    ctx.lineTo(-r * 0.3, r * 0.75);
    ctx.lineTo(-r * 0.55, r * 0.4);
    ctx.lineTo(-r * 0.5, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Main wings - larger
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.05);
    ctx.lineTo(r * 1.2, r * 0.25);
    ctx.lineTo(r * 0.7, r * 0.55);
    ctx.lineTo(r * 0.15, r * 0.25);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.05);
    ctx.lineTo(-r * 1.2, r * 0.25);
    ctx.lineTo(-r * 0.7, r * 0.55);
    ctx.lineTo(-r * 0.15, r * 0.25);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Twin tail fins (vertical stabilizers)
    ctx.beginPath();
    ctx.moveTo(r * 0.15, r * 0.55);
    ctx.lineTo(r * 0.6, r * 1.0);
    ctx.lineTo(r * 0.1, r * 0.9);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, r * 0.55);
    ctx.lineTo(-r * 0.6, r * 1.0);
    ctx.lineTo(-r * 0.1, r * 0.9);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Cockpit
    this._drawCockpit(ctx, 0, -r * 0.45, r * 0.28);

    // Glowing engines
    this._drawEngineGlow(ctx, r * 0.25, r * 0.7, r * 0.18, '#ff8800');
    this._drawEngineGlow(ctx, -r * 0.25, r * 0.7, r * 0.18, '#ff8800');
  }

  // 'weaver': Agile fighter - curved body, swept wings, flowing shape
  _drawAgileFighter(ctx, color) {
    const r = this.size;
    const sway = Math.sin(this.moveTimer * 0.01) * r * 0.25;

    // Curved fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.3);
    ctx.quadraticCurveTo(r * 0.45 + sway, -r * 0.2, r * 0.3, r * 0.5);
    ctx.lineTo(r * 0.15, r * 0.8);
    ctx.lineTo(-r * 0.15, r * 0.8);
    ctx.lineTo(-r * 0.3, r * 0.5);
    ctx.quadraticCurveTo(-r * 0.45 - sway, -r * 0.2, 0, -r * 1.3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Swept wings
    ctx.beginPath();
    ctx.moveTo(r * 0.2, -r * 0.05);
    ctx.lineTo(r * 1.05, r * 0.4);
    ctx.lineTo(r * 0.55, r * 0.55);
    ctx.lineTo(r * 0.1, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.05);
    ctx.lineTo(-r * 1.05, r * 0.4);
    ctx.lineTo(-r * 0.55, r * 0.55);
    ctx.lineTo(-r * 0.1, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Streamlined cockpit
    this._drawCockpit(ctx, 0, -r * 0.55, r * 0.22);
  }

  // ===========================================================================
  // BOMBERS
  // ===========================================================================

  // 'sniper': Long-range bomber - elongated body, wide wingspan
  _drawBomber(ctx, color) {
    const r = this.size;

    // Long fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.4);
    ctx.lineTo(r * 0.25, -r * 0.6);
    ctx.lineTo(r * 0.35, r * 0.3);
    ctx.lineTo(r * 0.15, r * 0.95);
    ctx.lineTo(-r * 0.15, r * 0.95);
    ctx.lineTo(-r * 0.35, r * 0.3);
    ctx.lineTo(-r * 0.25, -r * 0.6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Wide wingspan
    ctx.beginPath();
    ctx.moveTo(r * 0.2, -r * 0.1);
    ctx.lineTo(r * 1.4, r * 0.35);
    ctx.lineTo(r * 0.9, r * 0.55);
    ctx.lineTo(r * 0.1, r * 0.15);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.1);
    ctx.lineTo(-r * 1.4, r * 0.35);
    ctx.lineTo(-r * 0.9, r * 0.55);
    ctx.lineTo(-r * 0.1, r * 0.15);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Tail section
    ctx.beginPath();
    ctx.moveTo(r * 0.08, r * 0.7);
    ctx.lineTo(r * 0.55, r * 1.05);
    ctx.lineTo(-r * 0.55, r * 1.05);
    ctx.lineTo(-r * 0.08, r * 0.7);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();

    // Bomber cockpit (bubble style)
    this._drawCockpit(ctx, 0, -r * 0.7, r * 0.22);

    // Four engine glows
    this._drawEngineGlow(ctx, r * 0.3, r * 0.55, r * 0.12, '#ffaa00');
    this._drawEngineGlow(ctx, -r * 0.3, r * 0.55, r * 0.12, '#ffaa00');
  }

  // 'sniperElite': Precision bomber - thin long body, targeting sight
  _drawPrecisionBomber(ctx, color) {
    const r = this.size;
    const player = window.game ? window.game.player : null;

    // Thin elongated fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.5);
    ctx.lineTo(r * 0.2, -r * 0.4);
    ctx.lineTo(r * 0.25, r * 0.3);
    ctx.lineTo(r * 0.12, r * 1.0);
    ctx.lineTo(-r * 0.12, r * 1.0);
    ctx.lineTo(-r * 0.25, r * 0.3);
    ctx.lineTo(-r * 0.2, -r * 0.4);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Precision wings
    ctx.beginPath();
    ctx.moveTo(r * 0.15, -r * 0.05);
    ctx.lineTo(r * 1.2, r * 0.4);
    ctx.lineTo(r * 0.7, r * 0.6);
    ctx.lineTo(r * 0.08, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, -r * 0.05);
    ctx.lineTo(-r * 1.2, r * 0.4);
    ctx.lineTo(-r * 0.7, r * 0.6);
    ctx.lineTo(-r * 0.08, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Targeting line toward player (keep existing behavior)
    if (player && player.active) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const tLineLen = Math.min(dist * 0.8, 200);
        const endX = (dx / dist) * tLineLen;
        const endY = (dy / dist) * tLineLen;
        ctx.strokeStyle = 'rgba(255,50,50,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.5);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
        // Targeting crosshair at end
        ctx.strokeStyle = 'rgba(255,50,50,0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(endX, endY, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(endX - 6, endY);
        ctx.lineTo(endX + 6, endY);
        ctx.moveTo(endX, endY - 6);
        ctx.lineTo(endX, endY + 6);
        ctx.stroke();
      }
    }

    // Cockpit
    this._drawCockpit(ctx, 0, -r * 0.6, r * 0.18);
  }

  // 'tank': Heavy bomber - very wide, slow, bomb bay
  _drawHeavyBomber(ctx, color) {
    const r = this.size;

    // Very wide fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.0);
    ctx.lineTo(r * 0.7, -r * 0.1);
    ctx.lineTo(r * 0.75, r * 0.3);
    ctx.lineTo(r * 0.4, r * 0.8);
    ctx.lineTo(-r * 0.4, r * 0.8);
    ctx.lineTo(-r * 0.75, r * 0.3);
    ctx.lineTo(-r * 0.7, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Extra wide wings (squared off - bomber style)
    ctx.beginPath();
    ctx.moveTo(r * 0.35, -r * 0.05);
    ctx.lineTo(r * 1.5, r * 0.3);
    ctx.lineTo(r * 1.5, r * 0.5);
    ctx.lineTo(r * 0.3, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.05);
    ctx.lineTo(-r * 1.5, r * 0.3);
    ctx.lineTo(-r * 1.5, r * 0.5);
    ctx.lineTo(-r * 0.3, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    // Bomb bay markings (rectangles on belly)
    ctx.strokeStyle = 'rgba(255,200,50,0.4)';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      const bx = i * r * 0.35;
      ctx.strokeRect(bx - r * 0.15, r * 0.3, r * 0.3, r * 0.25);
    }

    // Four engines in wings
    for (let s = -1; s <= 1; s += 2) {
      this._drawEngineGlow(ctx, s * r * 0.9, r * 0.25, r * 0.14, '#ffaa00');
      this._drawEngineGlow(ctx, s * r * 1.2, r * 0.38, r * 0.14, '#ffaa00');
    }

    // Cockpit
    this._drawCockpit(ctx, 0, -r * 0.3, r * 0.22);
  }

  // 'shielder': Armored bomber - thick body, shield ring
  _drawArmoredBomber(ctx, color) {
    const r = this.size;

    // Shield ring (keep existing shield logic)
    if (this.shieldHp > 0 && !this.shieldDepleted) {
      const shieldAlpha = 0.3 + (this.shieldHp / this.shieldMaxHp) * 0.4;
      let shieldStroke = this.shieldColor;
      if (shieldStroke.startsWith('#')) {
        ctx.strokeStyle = shieldStroke;
        ctx.globalAlpha = shieldAlpha;
      } else {
        ctx.strokeStyle = shieldStroke.replace(')', `,${shieldAlpha})`).replace('rgb', 'rgba');
      }
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
      ctx.stroke();
      const pulse = 1 + Math.sin(this.moveTimer * 0.01) * 0.12;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.1 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (this.shieldDepleted && this.shieldRegenTimer < this.shieldRegenDelay) {
      const regenPercent = this.shieldRegenTimer / this.shieldRegenDelay;
      ctx.strokeStyle = 'rgba(255,100,100,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.05, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * regenPercent);
      ctx.stroke();
    }

    // Thick armored fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.1);
    ctx.lineTo(r * 0.55, -r * 0.1);
    ctx.lineTo(r * 0.6, r * 0.3);
    ctx.lineTo(r * 0.3, r * 0.75);
    ctx.lineTo(-r * 0.3, r * 0.75);
    ctx.lineTo(-r * 0.6, r * 0.3);
    ctx.lineTo(-r * 0.55, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Armored wings
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.05);
    ctx.lineTo(r * 1.1, r * 0.3);
    ctx.lineTo(r * 0.8, r * 0.5);
    ctx.lineTo(r * 0.2, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.05);
    ctx.lineTo(-r * 1.1, r * 0.3);
    ctx.lineTo(-r * 0.8, r * 0.5);
    ctx.lineTo(-r * 0.2, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Cockpit
    this._drawCockpit(ctx, 0, -r * 0.35, r * 0.24);
  }

  // ===========================================================================
  // SPECIAL AIRCRAFT
  // ===========================================================================

  // 'splitter': Drone carrier - boxy body with side drones
  _drawDroneCarrier(ctx, color) {
    const r = this.size;

    // Boxy fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(r * 0.5, -r * 0.15);
    ctx.lineTo(r * 0.5, r * 0.5);
    ctx.lineTo(-r * 0.5, r * 0.5);
    ctx.lineTo(-r * 0.5, -r * 0.15);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Deck markings
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;
    for (let sy = -r * 0.2; sy <= r * 0.3; sy += r * 0.25) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, sy);
      ctx.lineTo(r * 0.4, sy);
      ctx.stroke();
    }

    // Side drones (small attached planes)
    const wobble = Math.sin(this.moveTimer * 0.005) * r * 0.15;
    for (let side = -1; side <= 1; side += 2) {
      const dx = side * (r * 0.6 + wobble);
      const dy = r * 0.1 + wobble;
      ctx.beginPath();
      ctx.moveTo(dx, dy - r * 0.4);
      ctx.lineTo(dx + side * r * 0.2, dy + r * 0.15);
      ctx.lineTo(dx - side * r * 0.2, dy + r * 0.15);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Cockpit/bridge
    this._drawCockpit(ctx, 0, -r * 0.4, r * 0.2);
  }

  // 'spawner': Carrier - larger body, hangar deck shape, orbiting drones
  _drawCarrier(ctx, color) {
    const r = this.size;

    // Large carrier hull
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(r * 0.7, -r * 0.1);
    ctx.lineTo(r * 0.7, r * 0.4);
    ctx.lineTo(r * 0.3, r * 0.8);
    ctx.lineTo(-r * 0.3, r * 0.8);
    ctx.lineTo(-r * 0.7, r * 0.4);
    ctx.lineTo(-r * 0.7, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hangar deck (flat top with runway markings)
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.1);
    ctx.lineTo(r * 0.5, -r * 0.1);
    ctx.lineTo(r * 0.5, r * 0.2);
    ctx.lineTo(-r * 0.5, r * 0.2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Orbiting drones (small triangles)
    const count = 3;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + this.moveTimer * 0.003;
      const sx = Math.cos(angle) * r * 0.6;
      const sy = Math.sin(angle) * r * 0.6;
      const sr = r * 0.18;
      ctx.beginPath();
      ctx.moveTo(sx, sy - sr);
      ctx.lineTo(sx + sr * 0.6, sy + sr * 0.6);
      ctx.lineTo(sx - sr * 0.6, sy + sr * 0.6);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Bridge/superstructure
    this._drawCockpit(ctx, 0, -r * 0.3, r * 0.22);

    // Engine glow
    this._drawEngineGlow(ctx, -r * 0.35, r * 0.7, r * 0.15, '#ff8800');
    this._drawEngineGlow(ctx, r * 0.35, r * 0.7, r * 0.15, '#ff8800');
  }

  // 'charger': Ramming interceptor - arrowhead shape, engine trail
  _drawRammingInterceptor(ctx, color) {
    const r = this.size;
    let angle = 0;
    if (this.isCharging) {
      angle = this.chargeAngle - Math.PI / 2;
    }
    ctx.save();
    ctx.rotate(angle);

    // Arrowhead fuselage
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.4);
    ctx.lineTo(r * 0.55, -r * 0.3);
    ctx.lineTo(r * 0.3, r * 0.3);
    ctx.lineTo(r * 0.15, r * 0.7);
    ctx.lineTo(-r * 0.15, r * 0.7);
    ctx.lineTo(-r * 0.3, r * 0.3);
    ctx.lineTo(-r * 0.55, -r * 0.3);
    ctx.closePath();
    ctx.fillStyle = this.isCharging ? '#ffffff' : color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Forward-swept canards (small forward wings)
    ctx.beginPath();
    ctx.moveTo(r * 0.2, -r * 0.5);
    ctx.lineTo(r * 0.7, -r * 0.7);
    ctx.lineTo(r * 0.3, -r * 0.35);
    ctx.closePath();
    ctx.fillStyle = this.isCharging ? '#ffffff' : color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.5);
    ctx.lineTo(-r * 0.7, -r * 0.7);
    ctx.lineTo(-r * 0.3, -r * 0.35);
    ctx.closePath();
    ctx.fillStyle = this.isCharging ? '#ffffff' : color;
    ctx.fill();

    // Engine trail (when charging)
    if (this.isCharging) {
      const trailGrad = ctx.createLinearGradient(0, r * 0.5, 0, r * 2);
      trailGrad.addColorStop(0, 'rgba(255,200,50,0.8)');
      trailGrad.addColorStop(0.5, 'rgba(255,100,0,0.4)');
      trailGrad.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = trailGrad;
      ctx.beginPath();
      ctx.moveTo(-r * 0.1, r * 0.6);
      ctx.lineTo(r * 0.1, r * 0.6);
      ctx.lineTo(r * 0.25, r * 1.8);
      ctx.lineTo(-r * 0.25, r * 1.8);
      ctx.closePath();
      ctx.fill();
    }

    // Cockpit highlight
    this._drawCockpit(ctx, 0, -r * 0.5, r * 0.2);
    ctx.restore();
  }

  // 'teleporter': Stealth fighter - angular stealth-bomber shape
  _drawStealthFighter(ctx, color) {
    const r = this.size;

    // Teleport effect - dashed ring
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angular stealth fuselage (B-2 style from top down)
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.2);
    ctx.lineTo(r * 0.8, -r * 0.3);
    ctx.lineTo(r * 1.0, r * 0.4);
    ctx.lineTo(r * 0.5, r * 0.6);
    ctx.lineTo(r * 0.2, r * 0.3);
    ctx.lineTo(-r * 0.2, r * 0.3);
    ctx.lineTo(-r * 0.5, r * 0.6);
    ctx.lineTo(-r * 1.0, r * 0.4);
    ctx.lineTo(-r * 0.8, -r * 0.3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Cockpit (small, stealthy)
    ctx.fillStyle = 'rgba(100,200,255,0.5)';
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Core glow (teleport signature)
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.35);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // 'swarmer': Drone swarm - multiple small planes clustered
  _drawDroneSwarm(ctx, color) {
    const r = this.size;
    const wobble = Math.sin(this.moveTimer * 0.01 + this.swarmPhase) * 0.3;
    // 4 small drone planes arranged in cluster
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i + wobble;
      const cx = Math.cos(angle) * r * 0.55;
      const cy = Math.sin(angle) * r * 0.55;
      // Mini triangle plane
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.45);
      ctx.lineTo(cx + r * 0.2, cy + r * 0.15);
      ctx.lineTo(cx - r * 0.2, cy + r * 0.15);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.4;
      ctx.stroke();
      // Mini wing stubs
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.05, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.35, cy + r * 0.05);
      ctx.lineTo(cx + r * 0.2, cy + r * 0.12);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.05, cy - r * 0.1);
      ctx.lineTo(cx - r * 0.35, cy + r * 0.05);
      ctx.lineTo(cx - r * 0.2, cy + r * 0.12);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
    // Central core
    this._drawCockpit(ctx, 0, 0, r * 0.25);
  }

  // 'kamikaze': Suicide drone - arrow shape, pulsing red glow
  _drawSuicideDrone(ctx, color) {
    const r = this.size;
    const flash = 0.5 + Math.sin(this.moveTimer * 0.02) * 0.5;

    // Pulsing red outer glow
    const outerGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.6);
    outerGrad.addColorStop(0, `rgba(255,30,0,${0.7 + flash * 0.3})`);
    outerGrad.addColorStop(0.5, `rgba(255,0,0,${0.3})`);
    outerGrad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Arrow body
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.3);
    ctx.lineTo(r * 0.5, -r * 0.2);
    ctx.lineTo(r * 0.25, r * 0.3);
    ctx.lineTo(r * 0.1, r * 0.7);
    ctx.lineTo(-r * 0.1, r * 0.7);
    ctx.lineTo(-r * 0.25, r * 0.3);
    ctx.lineTo(-r * 0.5, -r * 0.2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,80,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Danger marks (X on body)
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, -r * 0.45);
    ctx.lineTo(r * 0.25, r * 0.15);
    ctx.moveTo(r * 0.25, -r * 0.45);
    ctx.lineTo(-r * 0.25, r * 0.15);
    ctx.stroke();

    // Cockpit (blood red glow)
    const cockpitGrad = ctx.createRadialGradient(0, -r * 0.3, 0, 0, -r * 0.3, r * 0.2);
    cockpitGrad.addColorStop(0, '#ffffff');
    cockpitGrad.addColorStop(0.5, `rgba(255,50,50,${0.6 + flash * 0.4})`);
    cockpitGrad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = cockpitGrad;
    ctx.beginPath();
    ctx.arc(0, -r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 'obstacle': Asteroid/debris - irregular rocky shape
  _drawAsteroid(ctx, color) {
    const r = this.size;
    // Irregular jagged asteroid shape
    const points = 10;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 / points) * i;
      const jitter = 0.65 + Math.random() * 0.35;
      const px = Math.cos(angle) * r * jitter;
      const py = Math.sin(angle) * r * jitter;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#666666';
    ctx.fill();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Rocky texture - craters
    ctx.fillStyle = 'rgba(80,80,80,0.5)';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.15, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.25, r * 0.1, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, r * 0.3, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Highlight edge
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, -Math.PI * 0.4, Math.PI * 0.2);
    ctx.stroke();
  }

  // ===========================================================================
  // BATTLESHIPS (BOSSES)
  // ===========================================================================

  // 'boss': Massive battleship - complex multi-part shape with turrets, bridge, engine
  _drawBattleship(ctx, color) {
    const r = this.size;

    // Outer glow (red)
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.4);
    glowGrad.addColorStop(0, 'rgba(255,30,0,0.5)');
    glowGrad.addColorStop(0.5, 'rgba(255,0,0,0.15)');
    glowGrad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Main hull - massive elongated shape
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.0);
    ctx.lineTo(r * 0.7, -r * 0.4);
    ctx.lineTo(r * 0.9, r * 0.15);
    ctx.lineTo(r * 0.5, r * 0.55);
    ctx.lineTo(r * 0.3, r * 0.9);
    ctx.lineTo(-r * 0.3, r * 0.9);
    ctx.lineTo(-r * 0.5, r * 0.55);
    ctx.lineTo(-r * 0.9, r * 0.15);
    ctx.lineTo(-r * 0.7, -r * 0.4);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Bridge/superstructure
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.35);
    ctx.lineTo(r * 0.25, r * 0.05);
    ctx.lineTo(r * 0.15, r * 0.3);
    ctx.lineTo(-r * 0.15, r * 0.3);
    ctx.lineTo(-r * 0.25, r * 0.05);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Turrets (side gun batteries)
    for (let side = -1; side <= 1; side += 2) {
      for (let ty = -0.1; ty <= 0.4; ty += 0.25) {
        ctx.beginPath();
        ctx.arc(side * r * 0.55, r * ty, r * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,200,100,0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Turret barrel
        ctx.beginPath();
        ctx.moveTo(side * r * 0.55, r * ty);
        ctx.lineTo(side * r * 0.65, r * (ty + 0.06));
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Engine glow (large afterburners)
    this._drawEngineGlow(ctx, -r * 0.35, r * 0.7, r * 0.22, '#ff3300');
    this._drawEngineGlow(ctx, 0, r * 0.75, r * 0.25, '#ff4400');
    this._drawEngineGlow(ctx, r * 0.35, r * 0.7, r * 0.22, '#ff3300');

    // Phase rings
    if (this.bossPhase >= 0) {
      ctx.strokeStyle = 'rgba(255,255,100,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.bossPhase >= 1) {
      ctx.strokeStyle = 'rgba(255,100,100,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
      ctx.stroke();
      // Spinning outer ring
      const rotAngle = (this.moveTimer * 0.004) % (Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = rotAngle + (Math.PI * 2 / 4) * i;
        ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
        ctx.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, r * 0.18, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
  }

  // 'boss_guardian': Battleship with shield turrets
  _drawBattleshipGuardian(ctx, color) {
    const r = this.size;

    // Outer glow (blue)
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.4);
    glowGrad.addColorStop(0, 'rgba(68,136,255,0.5)');
    glowGrad.addColorStop(0.5, 'rgba(68,136,255,0.15)');
    glowGrad.addColorStop(1, 'rgba(68,136,255,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Main hull
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(r * 0.65, -r * 0.3);
    ctx.lineTo(r * 0.85, r * 0.15);
    ctx.lineTo(r * 0.45, r * 0.6);
    ctx.lineTo(r * 0.25, r * 0.85);
    ctx.lineTo(-r * 0.25, r * 0.85);
    ctx.lineTo(-r * 0.45, r * 0.6);
    ctx.lineTo(-r * 0.85, r * 0.15);
    ctx.lineTo(-r * 0.65, -r * 0.3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.3);
    ctx.lineTo(r * 0.2, r * 0.05);
    ctx.lineTo(r * 0.1, r * 0.25);
    ctx.lineTo(-r * 0.1, r * 0.25);
    ctx.lineTo(-r * 0.2, r * 0.05);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();

    // Rotating shield orbs (keep existing logic)
    for (const shield of this.activeShields) {
      if (shield.hp <= 0) continue;
      const sx = Math.cos(shield.angle) * shield.radius;
      const sy = Math.sin(shield.angle) * shield.radius;
      const shieldHpPercent = shield.hp / shield.maxHp;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.2, 0, Math.PI * 2);
      const shieldGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.2);
      shieldGrad.addColorStop(0, 'rgba(200,220,255,0.8)');
      shieldGrad.addColorStop(0.6, 'rgba(100,150,255,0.5)');
      shieldGrad.addColorStop(1, 'rgba(50,100,255,0)');
      ctx.fillStyle = shieldGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (shieldHpPercent < 1) {
        ctx.strokeStyle = 'rgba(255,100,100,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * shieldHpPercent);
        ctx.stroke();
      }
    }

    // Turrets
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.arc(side * r * 0.5, r * 0.15, r * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,220,150,0.5)';
      ctx.fill();
      ctx.stroke();
    }

    // Engine glow
    this._drawEngineGlow(ctx, -r * 0.3, r * 0.65, r * 0.2, '#4488ff');
    this._drawEngineGlow(ctx, r * 0.3, r * 0.65, r * 0.2, '#4488ff');

    // Inner ring
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    // Phase indicators
    if (this.bossPhase >= 0) {
      ctx.strokeStyle = 'rgba(255,255,100,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.bossPhase >= 1) {
      ctx.strokeStyle = 'rgba(255,100,100,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 'boss_summoner': Carrier battleship with minions
  _drawBattleshipSummoner(ctx, color) {
    const r = this.size;

    // Outer glow (purple)
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.5);
    glowGrad.addColorStop(0, 'rgba(170,68,255,0.5)');
    glowGrad.addColorStop(0.5, 'rgba(170,68,255,0.15)');
    glowGrad.addColorStop(1, 'rgba(170,68,255,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Carrier hull (wide, flat top for launching)
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(r * 0.75, -r * 0.1);
    ctx.lineTo(r * 0.75, r * 0.35);
    ctx.lineTo(r * 0.4, r * 0.7);
    ctx.lineTo(-r * 0.4, r * 0.7);
    ctx.lineTo(-r * 0.75, r * 0.35);
    ctx.lineTo(-r * 0.75, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Flight deck markings
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, r * 0.0);
    ctx.lineTo(r * 0.6, r * 0.0);
    ctx.moveTo(-r * 0.5, r * 0.2);
    ctx.lineTo(r * 0.5, r * 0.2);
    ctx.stroke();

    // Bridge tower
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.25);
    ctx.lineTo(r * 0.18, r * 0.0);
    ctx.lineTo(r * 0.08, r * 0.15);
    ctx.lineTo(-r * 0.08, r * 0.15);
    ctx.lineTo(-r * 0.18, r * 0.0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();

    // Orbiting minion drones
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i + this.moveTimer * 0.002;
      const ox = Math.cos(angle) * r * 0.7;
      const oy = Math.sin(angle) * r * 0.7;
      // Mini plane shape
      ctx.beginPath();
      ctx.moveTo(ox, oy - r * 0.15);
      ctx.lineTo(ox + r * 0.1, oy + r * 0.08);
      ctx.lineTo(ox - r * 0.1, oy + r * 0.08);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,200,255,0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Engine glow
    this._drawEngineGlow(ctx, -r * 0.3, r * 0.6, r * 0.18, '#aa44ff');
    this._drawEngineGlow(ctx, r * 0.3, r * 0.6, r * 0.18, '#aa44ff');

    // Inner core
    const coreGrad = ctx.createRadialGradient(0, 0, r * 0.08, 0, 0, r * 0.45);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, 'rgba(200,100,255,0.6)');
    coreGrad.addColorStop(1, 'rgba(170,68,255,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
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

  // 'boss_dragon': Dragon battleship with wing/tail extensions and fire
  _drawBattleshipDragon(ctx, color) {
    const r = this.size;

    // Outer glow (orange/red)
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.6);
    glowGrad.addColorStop(0, 'rgba(255,100,0,0.6)');
    glowGrad.addColorStop(0.5, 'rgba(255,100,0,0.15)');
    glowGrad.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Main hull - jagged dragon-like shape
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.lineTo(r * 0.5, -r * 0.35);
    ctx.lineTo(r * 0.7, r * 0.1);
    ctx.lineTo(r * 0.35, r * 0.5);
    ctx.lineTo(r * 0.1, r * 0.8);
    ctx.lineTo(-r * 0.1, r * 0.8);
    ctx.lineTo(-r * 0.35, r * 0.5);
    ctx.lineTo(-r * 0.7, r * 0.1);
    ctx.lineTo(-r * 0.5, -r * 0.35);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,100,0.6)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Wings (side extensions - like dragon wings)
    const wingSpread = Math.sin(this.moveTimer * 0.003) * 0.2;
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.3, -r * 0.2);
      ctx.lineTo(side * (r * 0.95 + wingSpread * 18), -r * 0.35);
      ctx.lineTo(side * (r * 0.8 + wingSpread * 12), r * 0.1);
      ctx.lineTo(side * r * 0.2, r * 0.05);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,80,0,0.45)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,150,50,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Tail (bottom extension)
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, r * 0.55);
    ctx.lineTo(0, r * 1.15);
    ctx.lineTo(r * 0.15, r * 0.55);
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

    // Eyes (bridge viewports)
    const eyeY = -r * 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.18, eyeY, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.18, eyeY, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-r * 0.18, eyeY, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.18, eyeY, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Phase indicators
    if (this.bossPhase >= 0) {
      ctx.strokeStyle = 'rgba(255,255,100,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.bossPhase >= 1) {
      ctx.strokeStyle = 'rgba(255,100,100,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.0, 0, Math.PI * 2);
      ctx.stroke();
      // Tail swipe indicator
      ctx.strokeStyle = 'rgba(255,200,50,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, r * 0.8, r * 0.6, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
    }
  }

  _drawBattleshipPhantom(ctx, color) {
    const r = this.size;
    const time = this.moveTimer * 0.005;

    // Ghostly glow (cyan)
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.8);
    glowGrad.addColorStop(0, 'rgba(136,255,255,0.5)');
    glowGrad.addColorStop(0.5, 'rgba(136,255,255,0.1)');
    glowGrad.addColorStop(1, 'rgba(136,255,255,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Main body - ethereal shape
    ctx.globalAlpha = 0.7 + Math.sin(time * 3) * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.quadraticCurveTo(r * 0.8, -r * 0.5, r * 0.6, r * 0.2);
    ctx.quadraticCurveTo(r * 0.3, r * 0.7, 0, r * 0.9);
    ctx.quadraticCurveTo(-r * 0.3, r * 0.7, -r * 0.6, r * 0.2);
    ctx.quadraticCurveTo(-r * 0.8, -r * 0.5, 0, -r * 0.9);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ghostly tendrils
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i + time;
      const tendrilLength = r * (0.8 + Math.sin(time * 2 + i) * 0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.cos(angle + 0.5) * r * 0.5,
        Math.sin(angle + 0.5) * r * 0.5,
        Math.cos(angle) * tendrilLength,
        Math.sin(angle) * tendrilLength
      );
      ctx.strokeStyle = `rgba(136,255,255,${0.3 + Math.sin(time + i) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Core - pulsing eye
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.35);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#88ffff');
    coreGrad.addColorStop(0.7, 'rgba(136,255,255,0.3)');
    coreGrad.addColorStop(1, 'rgba(136,255,255,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Phase indicators
    if (this.bossPhase >= 0) {
      ctx.strokeStyle = 'rgba(136,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (this.bossPhase >= 1) {
      // Clone indicator
      ctx.strokeStyle = 'rgba(255,136,255,0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const angle = time * 2 + (Math.PI * 2 / 3) * i;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * r * 1.4, Math.sin(angle) * r * 1.4, r * 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
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
    this.waveBossTypes = ['boss', 'boss_guardian', 'boss_summoner', 'boss_dragon', 'boss_phantom'];
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
      let activeNonBoss = 0;
      for (let i = 0; i < game.enemies.length; i++) {
        if (game.enemies[i].active && !game.enemies[i].isBoss) activeNonBoss++;
      }
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
        game.addMessage(`⚠️ BOSS WAVE ${this.waveNumber} ⚠`, '#ff4444');
      } else if (this.waveNumber % 5 === 0) {
        game.addMessage(`⚡ Elite Wave ${this.waveNumber} ⚡`, '#ffaa00');
      } else {
        game.addMessage(`Wave ${this.waveNumber}`, '#ffffff');
      }
    }

    // Environment events every 5 waves (not boss waves)
    if (this.waveNumber % 5 === 0 && this.waveNumber % 10 !== 0) {
      this._triggerEnvironmentEvent(game);
    }
  }

  // ---------------------------------------------------------------------------
  // ENVIRONMENT EVENTS
  // ---------------------------------------------------------------------------
  _triggerEnvironmentEvent(game) {
    const events = [
      { name: '陨石雨', color: '#ff8844', duration: 8000 },
      { name: '电磁干扰', color: '#88ffff', duration: 10000 },
      { name: '重力场', color: '#aa66ff', duration: 8000 },
    ];
    const event = events[Math.floor(Math.random() * events.length)];

    if (game.addMessage) {
      game.addMessage(`🌍 ${event.name}！`, event.color);
    }

    // Apply event effect
    switch (event.name) {
      case '陨石雨':
        // Spawn meteors from top
        this._spawnMeteorShower(game, event.duration);
        break;
      case '电磁干扰':
        // Double skill cooldowns
        if (game.player && game.player.skillManager) {
          game.player.skillManager._cooldownMultiplier = 2.0;
          setTimeout(() => {
            if (game.player && game.player.skillManager) {
              game.player.skillManager._cooldownMultiplier = 1.0;
            }
          }, event.duration);
        }
        break;
      case '重力场':
        // Slow all enemies and player
        game.timeScale = 0.6;
        setTimeout(() => {
          game.timeScale = 1.0;
        }, event.duration);
        break;
    }
  }

  _spawnMeteorShower(game, duration) {
    const startTime = Date.now();
    const spawnInterval = 200; // Spawn meteor every 200ms

    const spawnMeteor = () => {
      if (Date.now() - startTime >= duration) return;

      const x = Math.random() * game.width;
      const y = -20;
      const speed = 200 + Math.random() * 150;
      const size = 8 + Math.random() * 12;

      // Create meteor enemy
      const meteorTemplate = {
        hp: 30,
        speed: speed,
        damage: 15,
        score: 10,
        xp: 5,
        size: size,
        color: '#ff6622',
        type: 'meteor',
        ai: 'straight',
        bulletSpeed: 0,
        fireRate: 99999,
        hitRadius: size,
      };

      const meteor = new Enemy({ x, y }, meteorTemplate, game.difficulty);
      meteor._isMeteor = true;
      game.addEntity(meteor);

      setTimeout(spawnMeteor, spawnInterval);
    };

    spawnMeteor();
  }

  // ---------------------------------------------------------------------------
  // COMPLETE WAVE
  // ---------------------------------------------------------------------------
  _completeWave(game) {
    this.waveState = 'pause';
    this.wavePauseTimer = 0;

    // Boss wave cooldown: 10 seconds after boss is defeated
    if (this.waveNumber % 10 === 0) {
      this.wavePauseDuration = 10000; // 10 seconds cooldown
      // Clear all remaining enemies (except those spawned by boss)
      for (const enemy of game.enemies) {
        if (enemy.active && !enemy.isBoss && !enemy._spawnedByBoss) {
          enemy.hp = 0;
          enemy._onDeath();
        }
      }
      if (game.addMessage) {
        game.addMessage('🎉 Boss 击败！10秒缓冲期...', '#ffdd00');
      }
    } else {
      this.wavePauseDuration = 3000; // Normal 3 second pause
      if (game.addMessage) {
        game.addMessage(`Wave ${this.waveNumber} cleared!`, '#44ff44');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // SPAWN WAVE GROUP (Random Pool System)
  // ---------------------------------------------------------------------------
  _spawnWaveGroup(game, difficulty, spawnRules) {
    let activeEnemies = 0;
    for (let i = 0; i < game.enemies.length; i++) {
      if (game.enemies[i].active && !game.enemies[i].isBoss) activeEnemies++;
    }
    if (activeEnemies >= spawnRules.maxEnemiesOnScreen) return;

    // Use enemy pool for random selection
    const pool = GAME_CONFIG.WAVES.enemyPool;
    if (!pool) {
      // Fallback to old system if pool not defined
      this._spawnWaveGroupLegacy(game, difficulty, spawnRules);
      return;
    }

    // Build list of available enemies for this wave
    const available = [];
    let totalWeight = 0;
    for (const [enemyId, config] of Object.entries(pool)) {
      if (this.waveNumber >= config.minWave) {
        available.push({ id: enemyId, weight: config.weight });
        totalWeight += config.weight;
      }
    }

    if (available.length === 0) return;

    // Randomly select an enemy type
    let roll = Math.random() * totalWeight;
    let selected = available[0];
    for (const entry of available) {
      roll -= entry.weight;
      if (roll <= 0) {
        selected = entry;
        break;
      }
    }

    // Determine spawn count with random variance
    const baseCount = Math.ceil(GAME_CONFIG.WAVES.spawnCountBase + this.waveNumber * GAME_CONFIG.WAVES.spawnCountPerWave);
    const variance = GAME_CONFIG.WAVES.spawnCountVariance || 0.3;
    const count = Math.max(1, Math.floor(baseCount * (1 + (Math.random() * 2 - 1) * variance)));

    // Create spawn template
    const template = {
      enemy: selected.id,
      count: Math.min(count, 5), // Cap at 5 per group
      spacing: 60 + Math.random() * 40, // Random spacing 60-100
      pattern: ['line', 'v', 'circle', 'random'][Math.floor(Math.random() * 4)], // Random pattern
    };

    const spawned = this._spawnGroup(game, template, difficulty);
    this.waveEnemiesSpawned += spawned;
  }

  // Legacy spawn system (fallback)
  _spawnWaveGroupLegacy(game, difficulty, spawnRules) {
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
    let activeEnemies = 0;
    for (let i = 0; i < game.enemies.length; i++) {
      if (game.enemies[i].active && !game.enemies[i].isBoss) activeEnemies++;
    }
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
    // Boss warning system
    this._bossWarningTimer = (this._bossWarningTimer || 0);

    // Show warning for 2 seconds before spawning
    if (!this._bossWarningShown) {
      this._bossWarningShown = true;
      this._bossWarningTimer = 0;

      // Play boss warning sound
      if (window.audio) window.audio.playBossWarning();

      // Show warning message
      if (game.addMessage) {
        game.addMessage('⚠️ BOSS 即将来袭！准备战斗！', '#ff4444');
      }

      // Screen flash effect
      if (game.addShake) game.addShake(5);
    }

    this._bossWarningTimer += 16; // ~60fps

    // Spawn boss after 2 second warning
    if (this._bossWarningTimer < 2000) return;
    this._bossWarningShown = false;

    // Cycle through boss types based on which wave number boss
    const bossIdx = (Math.floor(this.waveNumber / 10) - 1) % this.waveBossTypes.length;
    const bossType = this.waveBossTypes[bossIdx];
    const template = GAME_CONFIG.ENEMIES[bossType];
    if (!template) return;

    // Scale boss HP by wave number
    const scaledTemplate = Object.assign({}, template);
    scaledTemplate.hp = Math.floor(template.hp * (1 + this.waveNumber * 0.12));
    scaledTemplate.bossName = template.name;

    const opts = {
      x: GAME_CONFIG.BALANCE.CANVAS_WIDTH / 2,
      y: -100,
    };
    const enemy = new Enemy(opts, scaledTemplate, difficulty);
    enemy.bossName = template.name;
    game.addEntity(enemy);

    if (game.addMessage) {
      game.addMessage(`👹 ${template.name} 出现了！`, '#ff4444');
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
