/**
 * STG Game - Main Entry Point
 * Bootstraps the game, connects all modules, manages scene transitions and game logic.
 * 
 * This is the orchestration layer that wires together:
 *   core.js (engine) + player.js + bullets.js + enemies.js + weapons.js
 *   + items.js + skills.js + particles.js + ui.js + storage.js + audio.js
 */

(function() {
  'use strict';

  const game = window.game;
  const cfg = window.GAME_CONFIG;
  
  // Module references (set during init or on first use)
  let ui, waveSpawner, weaponManager, skillManager, itemSpawner, buffManager;

  // Game state
  let selectedFaction = null;
  let playerEntity = null;
  let backgroundStars = [];
  let lastBossScore = 0;
  let gameOverShown = false;

  // ============ INITIALIZATION ============
  function init() {
    game.init('game-canvas');

    // Initialize UI
    ui = window.ui;
    setupUIHandlers();

    // Show main menu
    game.setScene(cfg.SCENES.MENU);
    ui.showScreen('menu-screen');

    // Create background starfield
    createStarfield();

    // Start render loop (always running for menus)
    game.start();

    // Override game's draw to include background
    const originalDraw = game._draw.bind(game);
    game._draw = function() {
      drawBackground(game.ctx);
      originalDraw();
      drawUIOverlay(game.ctx);
    };

    console.log('STG Game initialized. Ready.');
  }

  // ============ BACKGROUND STARFIELD ============
  function createStarfield() {
    backgroundStars = [];
    const colors = cfg.COLORS.backgroundStars;
    for (let i = 0; i < 120; i++) {
      backgroundStars.push({
        x: Math.random() * game.width,
        y: Math.random() * game.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 30 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 2 + 0.5,
      });
    }
  }

  function drawBackground(ctx) {
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, game.height);
    grad.addColorStop(0, '#050515');
    grad.addColorStop(0.5, '#0a0a2a');
    grad.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, game.width, game.height);

    // Stars
    for (const star of backgroundStars) {
      star.y += star.speed * 0.016;
      if (star.y > game.height + 5) {
        star.y = -5;
        star.x = Math.random() * game.width;
      }
      star.twinkle += star.twinkleSpeed * 0.016;
      const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(star.twinkle));
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawUIOverlay(ctx) {
    // Blind debuff effect
    if (buffManager && buffManager.hasBuff('blind')) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, game.width, game.height);
    }
  }

  // ============ UI HANDLERS ============
  function setupUIHandlers() {
    // Set ui callbacks (ui.js handles all DOM rendering)
    // Character select: ui generates cards, calls this callback on selection
    ui.onStartGame = function(factionId) {
      selectedFaction = factionId;
      startNewGame();
    };
    // Leaderboard button (handled by ui.js, but set data source)
    ui.getLeaderboardData = function() {
      return window.LeaderboardManager.getLeaderboard();
    };
    // Back buttons (handled by ui.js)
    document.getElementById('btn-restart').addEventListener('click', startNewGame);
    document.getElementById('btn-menu').addEventListener('click', backToMenu);
    
    // Leaderboard back
    document.getElementById('btn-back-from-lb').addEventListener('click', () => {
      ui.hideAllScreens();
      document.getElementById('menu-screen').style.display = 'flex';
    });
  }

  // ============ CHARACTER SELECT ============
  function showCharacterSelect() {
    ui.hideAllScreens();
    const container = document.getElementById('char-select');
    container.innerHTML = '';

    const factions = cfg.FACTIONS;
    for (const [id, faction] of Object.entries(factions)) {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.innerHTML = `
        <div class="icon">${faction.icon}</div>
        <div class="name" style="color:${faction.color}">${faction.name}</div>
        <div class="desc">${faction.description}</div>
      `;
      card.addEventListener('click', () => {
        selectedFaction = id;
        startNewGame();
      });
      container.appendChild(card);
    }

    document.getElementById('char-select-screen').style.display = 'flex';
  }

  // ============ GAME START ============
  function startNewGame() {
    if (!selectedFaction) {
      selectedFaction = 'attackSpeed'; // Default
    }

    // Reset game state
    game.score = 0;
    game.kills = 0;
    game.combo = 0;
    game.comboTimer = 0;
    game.maxCombo = 0;
    game.difficulty = 0;
    game.timeScale = 1.0;
    game.shakeIntensity = 0;
    gameOverShown = false;
    lastBossScore = 0;

    // Clear all entities
    game.clearAllEntities();
    game.entities.length = 0;

    // Create player
    playerEntity = new window.Player(game.width / 2, game.height * 0.8);
    playerEntity.applyFaction(selectedFaction);
    game.addEntity(playerEntity);
    game.player = playerEntity;

    // Initialize systems
    skillManager = new window.SkillManager(playerEntity);
    skillManager._pendingLevelUps = 0;
    skillManager._isChoosing = false;
    weaponManager = new window.WeaponManager(playerEntity);
    weaponManager.setWeapon('normal');
    itemSpawner = new window.ItemSpawner();
    buffManager = new window.BuffManager(playerEntity);
    playerEntity.buffManager = buffManager;
    waveSpawner = new window.WaveSpawner();
    waveSpawner.reset(0);

    // Connect skill level-up to UI
    skillManager.onLevelUp = function(skills) {
      game.pause();
      ui.showLevelUp(skills, function(skillId) {
        skillManager.learnSkill(skillId);
        ui.hideLevelUp();
        // game.resume() handled by learnSkill in skills.js
      });
    };

    // Connect event triggers
    playerEntity.onKill = function() {
      skillManager.onKill();
    };
    playerEntity.onHit = function() {
      skillManager.onHit();
    };
    playerEntity.onDodge = function() {
      skillManager.onDodge();
    };
    playerEntity.onCrit = function() {
      skillManager.onCrit();
    };

    // Hide all screens, show HUD
    ui.hideAllScreens();
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('char-select-screen').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('level-up').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    document.getElementById('pause-overlay').style.display = 'none';

    game.setScene(cfg.SCENES.GAMEPLAY);
    game.resume();

    // Play BGM
    if (window.audio) {
      window.audio.startBGM();
    }

    console.log('New game started. Faction:', selectedFaction);
  }

  // ============ GAME OVER ============
  function endGame() {
    if (gameOverShown) return;
    gameOverShown = true;

    game.setScene(cfg.SCENES.GAME_OVER);
    game.timeScale = 0.3;

    // Stop BGM
    if (window.audio) {
      window.audio.stopBGM();
      window.audio.playGameOver();
    }

    // Save to leaderboard
    const name = 'Player';
    window.LeaderboardManager.saveScore(
      name, game.score, selectedFaction,
      skillManager ? skillManager.level : 1,
      game.kills, game.gameTime
    );

    // Show game over screen
    setTimeout(() => {
      game.timeScale = 1.0;
      document.getElementById('hud').style.display = 'none';
      
      const stats = {
        score: game.score,
        kills: game.kills,
        level: skillManager ? skillManager.level : 1,
        time: game.gameTime,
        maxCombo: game.maxCombo,
        faction: cfg.FACTIONS[selectedFaction] ? cfg.FACTIONS[selectedFaction].name : 'Unknown',
      };

      ui.showGameOver(stats, function() {
        // Restart
        startNewGame();
      }, function() {
        // Menu
        backToMenu();
      });
    }, 1500);
  }

  function backToMenu() {
    game.clearAllEntities();
    game.player = null;
    playerEntity = null;
    skillManager = null;
    weaponManager = null;
    itemSpawner = null;
    buffManager = null;
    waveSpawner = null;

    if (window.audio) window.audio.stopBGM();

    document.getElementById('hud').style.display = 'none';
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('level-up').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('char-select-screen').style.display = 'none';

    ui.hideAllScreens();
    document.getElementById('menu-screen').style.display = 'flex';
    game.setScene(cfg.SCENES.MENU);
  }

  // ============ LEADERBOARD ============
  function showLeaderboard() {
    ui.hideAllScreens();
    const lb = window.LeaderboardManager.getLeaderboard();
    const container = document.getElementById('lb-list');
    container.innerHTML = '';

    if (lb.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">暂无记录</div>';
    } else {
      lb.forEach((entry, i) => {
        const div = document.createElement('div');
        div.className = 'lb-entry';
        let rankDisplay = '';
        if (i === 0) rankDisplay = '🥇';
        else if (i === 1) rankDisplay = '🥈';
        else if (i === 2) rankDisplay = '🥉';
        else rankDisplay = `#${i + 1}`;
        div.innerHTML = `
          <span class="rank">${rankDisplay}</span>
          <span>${entry.name}</span>
          <span class="score">${formatScore(entry.score)}</span>
        `;
        container.appendChild(div);
      });
    }

    document.getElementById('leaderboard').style.display = 'flex';
  }

  function formatScore(score) {
    if (score >= 1000000) return (score / 1000000).toFixed(1) + 'M';
    if (score >= 1000) return (score / 1000).toFixed(1) + 'K';
    return score.toString();
  }

  // ============ GAME LOOP OVERRIDE ============
  // Override game._update to add game logic
  const originalUpdate = game._update.bind(game);
  game._update = function(dt) {
    originalUpdate(dt);

    if (game.scene !== cfg.SCENES.GAMEPLAY || game.isPaused) return;
    if (!playerEntity || !playerEntity.active) {
      if (!gameOverShown) endGame();
      return;
    }

    // Update difficulty
    game.difficulty = Math.floor(game.score / 5000) + Math.floor(game.gameTime / cfg.BALANCE.DIFFICULTY_INTERVAL);

    // Update wave spawner
    if (waveSpawner) waveSpawner.update(dt);

    // Update weapon
    if (weaponManager) weaponManager.update(dt);

    // Update skill manager
    if (skillManager) skillManager.update(dt);

    // Update buff manager
    if (buffManager) buffManager.update(dt);

    // Update combo
    if (game.comboTimer > 0) {
      game.comboTimer -= dt * 1000;
      if (game.comboTimer <= 0) {
        game.combo = 0;
        game.comboTimer = 0;
      }
    }

    // Collision: player bullets vs enemies
    for (const bullet of game.playerBullets) {
      if (!bullet.active) continue;
      for (const enemy of game.enemies) {
        if (!enemy.active) continue;
        if (game.checkCollision(bullet, enemy)) {
          handleBulletHitEnemy(bullet, enemy);
          break; // Bullet hit one enemy
        }
      }
    }

    // Collision: enemy bullets vs player
    if (playerEntity.invincibleTimer <= 0) {
      for (const bullet of game.enemyBullets) {
        if (!bullet.active) continue;
        if (game.checkCollision(bullet, playerEntity)) {
          handleEnemyBulletHitPlayer(bullet);
          break;
        }
      }
    }

    // Collision: enemies vs player (body collision)
    if (playerEntity.invincibleTimer <= 0) {
      for (const enemy of game.enemies) {
        if (!enemy.active) continue;
        if (game.checkCollision(enemy, playerEntity)) {
          handleEnemyBodyHitPlayer(enemy);
          break;
        }
      }
    }

    // Collision: items vs player
    if (itemSpawner) {
      for (const item of game.items) {
        if (!item.active || item.collected) continue;
        if (game.checkCollision(item, playerEntity)) {
          handleItemPickup(item);
        }
      }
    }

    // Update HUD
    updateHUD();

    // Check pause state
    const pauseOverlay = document.getElementById('pause-overlay');
    if (game.isPaused && game.scene === cfg.SCENES.GAMEPLAY) {
      pauseOverlay.style.display = 'flex';
    } else {
      pauseOverlay.style.display = 'none';
    }
  };

  // ============ COLLISION HANDLERS ============
  function handleBulletHitEnemy(bullet, enemy) {
    // Calculate damage
    let damage = bullet.damage;
    const isCrit = Math.random() < (playerEntity.stats.critRate || 0);
    if (isCrit) {
      damage *= playerEntity.stats.critMult || 1.5;
      window.ParticleSystem.spark(enemy.x, enemy.y);
      if (playerEntity.onCrit) playerEntity.onCrit();
    }

    // Apply status effects
    if (playerEntity.stats.slowChance && Math.random() < playerEntity.stats.slowChance) {
      enemy.slowTimer = cfg.FACTIONS.ice.baseStats.slowDuration || 2000;
      enemy.slowAmount = playerEntity.stats.slowAmount || 0.4;
    }
    if (playerEntity.stats.poisonDamage) {
      enemy.poisonDamage = playerEntity.stats.poisonDamage;
      enemy.poisonDuration = cfg.FACTIONS.poison.baseStats.poisonDuration || 3000;
      enemy.poisonTimer = enemy.poisonDuration;
    }
    if (playerEntity.stats.burnDamage) {
      enemy.burnDamage = playerEntity.stats.burnDamage;
      enemy.burnDuration = cfg.FACTIONS.elemental.baseStats.burnDuration || 2000;
      enemy.burnTimer = enemy.burnDuration;
    }
    if (playerEntity.stats.freezeChance && Math.random() < playerEntity.stats.freezeChance) {
      enemy.frozenTimer = 1500;
    }

    // Pierce handling
    if (bullet.pierceCount > 0) {
      bullet.pierceCount--;
      // Don't deactivate bullet
    } else {
      bullet.active = false;
      game.removeEntity(bullet);
    }

    // Apply damage
    const alive = enemy.takeDamage(damage);

    // Hit particles
    window.ParticleSystem.hitEffect(enemy.x, enemy.y);

    if (!alive) {
      handleEnemyKilled(enemy, isCrit);
    }

    // Arc weapon chain (if player has arc weapon)
    if (weaponManager && weaponManager.currentWeapon === 'arc') {
      chainDamage(enemy, damage * 0.3, 0);
    }
  }

  function handleEnemyKilled(enemy, isCrit) {
    // Particles
    if (enemy.isBoss) {
      window.ParticleSystem.bossExplosion(enemy.x, enemy.y);
      game.addShake(15);
      if (window.audio) window.audio.playBigExplosion();
    } else {
      window.ParticleSystem.explosion(enemy.x, enemy.y, enemy.size > 20 ? 'normal' : 'small');
      if (window.audio) window.audio.playExplosion();
    }

    // Score (with combo multiplier)
    const comboMult = 1 + game.combo * cfg.BALANCE.COMBO_MULTIPLIER;
    const scoreMult = playerEntity.stats.scoreMultiplier || 1;
    let scoreGain = Math.floor(enemy.score * comboMult * scoreMult);

    // Check for score boost buff
    if (buffManager && buffManager.getModifier('scoreBoost') > 1) {
      scoreGain = Math.floor(scoreGain * buffManager.getModifier('scoreBoost'));
    }

    game.score += scoreGain;
    game.kills++;
    game.combo++;
    game.comboTimer = cfg.BALANCE.COMBO_TIMEOUT;
    if (game.combo > game.maxCombo) game.maxCombo = game.combo;

    // XP
    let xpGain = enemy.xp;
    if (playerEntity.stats.xpMultiplier) xpGain = Math.floor(xpGain * playerEntity.stats.xpMultiplier);
    if (buffManager && buffManager.getModifier('xpBoost') > 1) {
      xpGain = Math.floor(xpGain * buffManager.getModifier('xpBoost'));
    }
    if (skillManager) skillManager.addXp(xpGain);

    // Lifesteal
    if (playerEntity.stats.lifesteal) {
      const healAmt = Math.floor(damage * playerEntity.stats.lifesteal);
      if (healAmt > 0) playerEntity.heal(healAmt);
    }

    // On-kill effects
    if (playerEntity.onKill) playerEntity.onKill();

    // Conditional: explosion on kill (elemental)
    if (playerEntity.stats.fireTrail) {
      window.ParticleSystem.explosion(enemy.x, enemy.y, 'small');
    }

    // Item drop
    if (itemSpawner && Math.random() < cfg.BALANCE.ITEM_DROP_CHANCE * (playerEntity.stats.dropRate || 1)) {
      itemSpawner.spawnAt(enemy.x, enemy.y);
    }

    // Check for boss trigger
    checkBossSpawn();
  }

  function checkBossSpawn() {
    const bossThresholds = cfg.WAVES.bossTriggers;
    for (const threshold of bossThresholds) {
      if (game.score >= threshold && lastBossScore < threshold) {
        lastBossScore = threshold;
        if (waveSpawner) {
          waveSpawner._spawnBoss(window.game);
        }
        if (window.audio) window.audio.playBossWarning();
        ui.showToast('⚠️ BOSS 来袭！', 2000);
        break;
      }
    }
  }

  function chainDamage(originEnemy, damage, depth) {
    if (depth >= 3) return;
    const maxDist = cfg.WEAPONS.arc.chainRange || 180;
    let closest = null;
    let closestDist = maxDist * maxDist;

    for (const enemy of game.enemies) {
      if (!enemy.active || enemy === originEnemy) continue;
      const dx = originEnemy.x - enemy.x;
      const dy = originEnemy.y - enemy.y;
      const dist = dx * dx + dy * dy;
      if (dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    }

    if (closest) {
      // Visual lightning line
      drawLightningLine(originEnemy.x, originEnemy.y, closest.x, closest.y);
      const alive = closest.takeDamage(damage);
      window.ParticleSystem.spark(closest.x, closest.y);
      if (!alive) handleEnemyKilled(closest, false);
      else chainDamage(closest, damage * 0.7, depth + 1);
    }
  }

  function drawLightningLine(x1, y1, x2, y2) {
    // Create a particle that looks like lightning
    const life = 150;
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
      const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
      window.ParticleSystem.trail(x, y, '#88ffff', 2);
    }
  }

  function handleEnemyBulletHitPlayer(bullet) {
    bullet.active = false;
    game.removeEntity(bullet);
    playerTakeDamage(bullet.damage || cfg.BALANCE.ENEMY_BULLET_DAMAGE);
  }

  function handleEnemyBodyHitPlayer(enemy) {
    // Reflect damage (counter faction)
    if (playerEntity.stats.reflectDamage) {
      const reflectDmg = Math.floor(cfg.BALANCE.COLLISION_DAMAGE * playerEntity.stats.reflectDamage);
      const alive = enemy.takeDamage(reflectDmg);
      if (!alive) handleEnemyKilled(enemy, false);
    }
    // Shield reflect
    if (playerEntity.stats.shieldReflect && playerEntity.shield > 0) {
      const reflectDmg = Math.floor(cfg.BALANCE.COLLISION_DAMAGE * playerEntity.stats.shieldReflect);
      enemy.takeDamage(reflectDmg);
    }
    playerTakeDamage(cfg.BALANCE.COLLISION_DAMAGE);
  }

  function playerTakeDamage(damage) {
    // Check dodge
    if (playerEntity.stats.dodgeChance && Math.random() < playerEntity.stats.dodgeChance) {
      window.ParticleSystem.spark(playerEntity.x, playerEntity.y);
      if (playerEntity.onDodge) playerEntity.onDodge();
      if (window.audio) window.audio.playSelect();
      return;
    }

    const alive = playerEntity.takeDamage(damage);
    game.addShake(5);
    if (window.audio) window.audio.playDamage();

    if (playerEntity.onHit) playerEntity.onHit();

    // Shield on hit skill
    if (playerEntity.stats.shieldOnHit && playerEntity.shield <= 0) {
      playerEntity.shield = playerEntity.stats.shieldOnHit;
    }

    if (!alive) {
      // Check revive
      if (playerEntity.stats.reviveCount && playerEntity.stats.reviveCount > 0) {
        playerEntity.stats.reviveCount--;
        playerEntity.hp = Math.floor(playerEntity.maxHp * 0.5);
        playerEntity.invincibleTimer = 3000;
        ui.showToast('💫 重生！', 2000);
        if (window.audio) window.audio.playLevelUp();
        return;
      }
      endGame();
    }
  }

  function handleItemPickup(item) {
    item.collected = true;
    item.active = false;
    game.removeEntity(item);

    if (window.audio) {
      if (item.config.type === 'debuff') {
        window.audio.playDamage();
      } else {
        window.audio.playPickup();
      }
    }

    // Apply effect via buff manager
    buffManager.applyItem(item.config);

    // Show toast
    if (item.config.dropText) {
      const color = item.config.type === 'debuff' ? '#ff4444' : '#ffdd00';
      ui.showToast(item.config.dropText, 1200, color);
    }

    // Heal particles for health items
    if (item.config.effect === 'heal') {
      window.ParticleSystem.healEffect(playerEntity.x, playerEntity.y);
    }

    // On-pickup skill trigger
    if (playerEntity.onPickup) playerEntity.onPickup();
  }

  // ============ HUD ============
  function updateHUD() {
    if (!playerEntity) return;

    const hpPct = Math.max(0, (playerEntity.hp / playerEntity.maxHp) * 100);
    document.getElementById('hp-fill').style.width = hpPct + '%';
    document.getElementById('hp-text').textContent = 
      Math.ceil(playerEntity.hp) + '/' + playerEntity.maxHp +
      (playerEntity.shield > 0 ? ' 🛡️' + Math.ceil(playerEntity.shield) : '');

    document.getElementById('score-text').textContent = formatScore(game.score);
    
    if (skillManager) {
      document.getElementById('level-text').textContent = skillManager.level;
      const xpNeeded = skillManager._xpNeeded;
      const xpPct = xpNeeded > 0 ? Math.min(100, (skillManager.xp / xpNeeded) * 100) : 0;
      document.getElementById('xp-fill').style.width = xpPct + '%';
    }

    document.getElementById('kills-text').textContent = game.kills;

    const totalSec = Math.floor(game.gameTime / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    document.getElementById('time-text').textContent = 
      String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');

    // Combo display
    const comboEl = document.getElementById('combo-text');
    if (game.combo >= 5) {
      comboEl.textContent = game.combo + ' COMBO!';
      comboEl.className = 'combo-text active';
    } else {
      comboEl.className = 'combo-text';
    }
  }

  // ============ STARTUP ============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
