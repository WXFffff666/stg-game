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

    // Boss health bar (full screen width at top)
    if (game.scene === cfg.SCENES.GAMEPLAY) {
      const boss = game.enemies.find(e => e.isBoss && e.active);
      if (boss) {
        drawBossHealthBar(ctx, boss);
      }
    }
  }

  function drawBossHealthBar(ctx, boss) {
    const barX = 20;
    const barY = 8;
    const barWidth = game.width - 40;
    const barHeight = 16;
    const hpPercent = Math.max(0, boss.hp / boss.maxHp);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // Border
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // HP fill
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth * hpPercent, barY);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(0.5, '#ff4444');
    gradient.addColorStop(1, '#ff8888');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

    // Boss name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(boss.bossName || 'BOSS', game.width / 2, barY + 12);

    // HP percentage
    ctx.textAlign = 'right';
    ctx.fillText(Math.floor(hpPercent * 100) + '%', barX + barWidth - 5, barY + 12);
    ctx.textAlign = 'left';
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

    // Pause menu buttons
    document.getElementById('btn-resume').addEventListener('click', () => {
      game.resume();
      document.getElementById('pause-overlay').style.display = 'none';
    });
    document.getElementById('btn-pause-shop').addEventListener('click', () => {
      showInRunShop();
    });
    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      document.getElementById('pause-overlay').style.display = 'none';
      startNewGame();
    });
    document.getElementById('btn-pause-menu').addEventListener('click', () => {
      document.getElementById('pause-overlay').style.display = 'none';
      backToMenu();
    });

    // In-run shop close button
    document.getElementById('btn-close-shop').addEventListener('click', () => {
      hideInRunShop();
    });
  }

  // ============ IN-RUN SHOP UI ============
  function showInRunShop() {
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('in-run-shop').style.display = 'flex';
    renderInRunShopItems();
  }

  function hideInRunShop() {
    document.getElementById('in-run-shop').style.display = 'none';
    document.getElementById('pause-overlay').style.display = 'flex';
  }

  function renderInRunShopItems() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';
    document.getElementById('shop-gold-display').textContent = inRunGold;

    IN_RUN_SHOP_ITEMS.forEach(item => {
      const level = inRunUpgrades[item.id] || 0;
      const cost = getInRunUpgradeCost(item.id);
      const isMaxLevel = level >= item.maxLevel;
      const canAfford = inRunGold >= cost;

      const div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = `
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-info">
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-level">等级: ${level}/${item.maxLevel}</div>
          <div class="shop-item-desc">${item.desc}</div>
        </div>
        <button class="shop-item-btn ${isMaxLevel ? 'max-level' : ''}" 
                data-item-id="${item.id}"
                ${isMaxLevel || !canAfford ? 'disabled' : ''}>
          ${isMaxLevel ? '已满级' : '💰 ' + cost}
        </button>
      `;

      if (!isMaxLevel && canAfford) {
        div.querySelector('.shop-item-btn').addEventListener('click', () => {
          if (purchaseInRunUpgrade(item.id)) {
            renderInRunShopItems(); // Refresh UI
            if (window.audio) window.audio.playPickup();
          }
        });
      }

      container.appendChild(div);
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

  // ============ IN-RUN SHOP SYSTEM ============
  let inRunGold = 0;
  let inRunUpgrades = {
    attackPower: 0,
    maxHp: 0,
    moveSpeed: 0,
    fireRate: 0,
    critChance: 0,
    pickupRange: 0,
  };

  const IN_RUN_SHOP_ITEMS = [
    { id: 'attackPower', name: '攻击强化', icon: '⚔️', desc: '+15% 攻击力', cost: 50, maxLevel: 10, effect: (level) => ({ stat: 'attack', op: 'multiply', value: level * 0.15 }) },
    { id: 'maxHp', name: '生命强化', icon: '❤️', desc: '+20 最大生命', cost: 40, maxLevel: 10, effect: (level) => ({ stat: 'hp', op: 'add', value: level * 20 }) },
    { id: 'moveSpeed', name: '速度强化', icon: '👟', desc: '+10% 移动速度', cost: 45, maxLevel: 8, effect: (level) => ({ stat: 'speed', op: 'multiply', value: level * 0.10 }) },
    { id: 'fireRate', name: '射速强化', icon: '🔫', desc: '-12% 射击间隔', cost: 60, maxLevel: 8, effect: (level) => ({ stat: 'attackSpeed', op: 'multiply', value: -level * 0.12 }) },
    { id: 'critChance', name: '暴击强化', icon: '💥', desc: '+5% 暴击率', cost: 70, maxLevel: 6, effect: (level) => ({ stat: 'critRate', op: 'add', value: level * 0.05 }) },
    { id: 'pickupRange', name: '拾取范围', icon: '🧲', desc: '+30 拾取半径', cost: 35, maxLevel: 5, effect: (level) => ({ stat: 'pickupRange', op: 'add', value: level * 30 }) },
  ];

  function getInRunUpgradeCost(itemId) {
    const item = IN_RUN_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return 999999;
    const level = inRunUpgrades[itemId] || 0;
    return Math.floor(item.cost * Math.pow(1.5, level));
  }

  function purchaseInRunUpgrade(itemId) {
    const item = IN_RUN_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    const level = inRunUpgrades[itemId] || 0;
    if (level >= item.maxLevel) return false;
    const cost = getInRunUpgradeCost(itemId);
    if (inRunGold < cost) return false;

    inRunGold -= cost;
    inRunUpgrades[itemId] = level + 1;

    // Apply upgrade effect
    if (playerEntity) {
      const effect = item.effect(level + 1);
      playerEntity.applyStatModifiers([effect]);
    }

    return true;
  }

  function addInRunGold(amount) {
    inRunGold += Math.floor(amount);
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

    // Reset in-run shop
    inRunGold = 0;
    inRunUpgrades = {
      attackPower: 0,
      maxHp: 0,
      moveSpeed: 0,
      fireRate: 0,
      critChance: 0,
      pickupRange: 0,
    };

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

    // Connect skill manager to weapon manager for weapon upgrades
    skillManager.weaponManager = weaponManager;
    // Expose skillManager globally so weapons.js can access upgrade multipliers
    window._skillManagerRef = skillManager;

    // Connect skill level-up to UI (with fusion integration)
    skillManager.onLevelUp = function(choices) {
      game.pause();

      // Check for available fusions and add fusion cards to choices
      var availableFusions = skillManager.checkFusions();
      if (availableFusions.length > 0) {
        ui.showFusionNotification(availableFusions);
      }

      ui.showLevelUp(choices, function(selectedItem) {
        // Handle fusion cards (they have _choiceType === 'fusion')
        if (selectedItem._choiceType === 'fusion') {
          // Fusion cards are handled by the separate addFusionCards callback
          // This should not be reached, but handle gracefully
          return;
        }

        // Handle normal skills and weapons
        if (selectedItem._choiceType === 'weapon') {
          skillManager.selectWeapon(selectedItem._weaponId);
        } else {
          skillManager.learnSkill(selectedItem._data.id);
        }
        ui.hideLevelUp();
        // game.resume() handled by learnSkill/selectWeapon in skills.js
      });

      // Add fusion cards to the level-up UI if fusions are available
      if (availableFusions.length > 0) {
        var container = document.getElementById('skill-choices');
        ui.addFusionCards(availableFusions, container, function(selectedItem) {
          // This is called when a fusion card is clicked
          if (selectedItem._fusionType === 'weapon') {
            skillManager.executeWeaponFusion(selectedItem._recipe);
          } else {
            skillManager.executeSkillFusion(selectedItem._recipe);
          }
          ui.hideLevelUp();
          skillManager._pendingLevelUps--;
          if (skillManager._pendingLevelUps > 0) {
            skillManager._isChoosing = false;
            skillManager._showLevelUpChoices();
          } else {
            skillManager._isChoosing = false;
            game.resume();
          }
        });
      }
    };

    // Connect fusion availability callback
    skillManager.onFusionAvailable = function(fusions) {
      ui.showFusionNotification(fusions);
    };

    // Connect fusion notification click
    var fusionNotifEl = document.getElementById('fusion-notification');
    if (fusionNotifEl) {
      fusionNotifEl.addEventListener('click', function() {
        ui.hideFusionNotification();
        // If in gameplay and not paused, trigger level-up to show fusion options
        if (skillManager && !skillManager._isChoosing) {
          skillManager._showLevelUpChoices();
        }
      });
    }

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
        goldEarned: inRunGold,
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
    window._skillManagerRef = null;

    // Hide fusion notification
    if (ui) ui.hideFusionNotification();

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

    // Collision: player bullets vs enemies (only if both sides exist)
    if (game.playerBullets.length > 0 && game.enemies.length > 0) {
      for (let bi = 0; bi < game.playerBullets.length; bi++) {
        const bullet = game.playerBullets[bi];
        if (!bullet.active) continue;
        // Early bounds check: skip bullets far off screen
        if (bullet.x < -100 || bullet.x > game.width + 100 ||
            bullet.y < -100 || bullet.y > game.height + 100) continue;
        for (let ei = 0; ei < game.enemies.length; ei++) {
          const enemy = game.enemies[ei];
          if (!enemy.active) continue;
          if (game.checkCollision(bullet, enemy)) {
            handleBulletHitEnemy(bullet, enemy);
            if (!bullet.active) break; // Bullet destroyed
          }
        }
        // Safety: break if too many collision iterations (performance guard)
        if (bi > 200) break;
      }
    }

    // Collision: enemy bullets vs player (check at most 50 per frame)
    if (playerEntity.invincibleTimer <= 0 && game.enemyBullets.length > 0) {
      const maxCheck = Math.min(game.enemyBullets.length, 50);
      for (let bi = 0; bi < maxCheck; bi++) {
        const bullet = game.enemyBullets[bi];
        if (!bullet.active) continue;
        if (game.checkCollision(bullet, playerEntity)) {
          handleEnemyBulletHitPlayer(bullet);
          break;
        }
      }
    }

    // Collision: enemies vs player body (check at most 30 per frame)
    if (playerEntity.invincibleTimer <= 0 && game.enemies.length > 0) {
      const maxCheck = Math.min(game.enemies.length, 30);
      for (let ei = 0; ei < maxCheck; ei++) {
        const enemy = game.enemies[ei];
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
    let critRate = playerEntity.stats.critRate || 0;
    if (buffManager) critRate += buffManager.getModifier('critRate');
    const isCrit = Math.random() < critRate;
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
    // Thunder: chain lightning on hit
    if (playerEntity.stats.chainChance && Math.random() < playerEntity.stats.chainChance) {
      chainDamage(enemy, damage * (playerEntity.stats.chainDamage || 0.5), 0);
    }
    // Wind: push enemy away
    if (playerEntity.stats.pushForce) {
      const dx = enemy.x - playerEntity.x;
      const dy = enemy.y - playerEntity.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      enemy.x += (dx / dist) * playerEntity.stats.pushForce;
      enemy.y += (dy / dist) * playerEntity.stats.pushForce;
    }
    // Void: execute enemies below HP threshold
    if (playerEntity.stats.executeThreshold && enemy.hp / enemy.maxHp < playerEntity.stats.executeThreshold) {
      damage = 9999;
    }
    // Gravity: pull enemies toward bullet impact
    if (playerEntity.stats.pullRadius && playerEntity.stats.pullForce) {
      for (const other of game.enemies) {
        if (!other.active || other === enemy) continue;
        const dx = enemy.x - other.x;
        const dy = enemy.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < playerEntity.stats.pullRadius && dist > 1) {
          const pull = playerEntity.stats.pullForce * (1 - dist / playerEntity.stats.pullRadius);
          other.x += (dx / dist) * pull;
          other.y += (dy / dist) * pull;
        }
      }
    }

    // Pierce handling
    if (bullet.pierceCount > 0) {
      bullet.pierceCount--;
      // Don't deactivate bullet
    } else {
      bullet.active = false;
      game.removeEntity(bullet);
    }

    // Void rift execute: instant kill enemies below HP threshold
    if (bullet.executeThreshold && enemy.hp && enemy.maxHp && enemy.hp / enemy.maxHp < bullet.executeThreshold) {
      damage = 9999;
    }

    // Apply damage
    const alive = enemy.takeDamage(damage);

    // Hit particles
    window.ParticleSystem.hitEffect(enemy.x, enemy.y);

    if (!alive) {
      handleEnemyKilled(enemy, isCrit, damage);
    }

    // Arc weapon chain (if player has arc weapon)
    if (weaponManager && weaponManager.currentWeapon === 'arc') {
      chainDamage(enemy, damage * 0.3, 0);
    }
  }

  function handleEnemyKilled(enemy, isCrit, damage) {
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

    // Gold (in-run currency)
    let goldGain = Math.floor(enemy.score * 0.3) + 1;
    if (enemy.isBoss) goldGain *= 5; // Boss gives 5x gold
    addInRunGold(goldGain);

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
    var dropChanceMult = playerEntity.stats.dropRate || 1;
    if (itemSpawner && Math.random() < cfg.BALANCE.ITEM_DROP_CHANCE * dropChanceMult) {
      itemSpawner.spawnAt(enemy.x, enemy.y);
    }

    // Boss drops: guaranteed rare items
    if (enemy.isBoss && itemSpawner) {
      // Drop 3-5 items around boss position
      const dropCount = 3 + Math.floor(Math.random() * 3);
      const rareItems = ['power_up_big', 'health_large', 'shield_item', 'invincible', 'xp_boost_item', 'score_boost'];
      for (let i = 0; i < dropCount; i++) {
        const angle = (Math.PI * 2 / dropCount) * i;
        const dist = 30 + Math.random() * 40;
        const dx = enemy.x + Math.cos(angle) * dist;
        const dy = enemy.y + Math.sin(angle) * dist;
        const itemId = rareItems[Math.floor(Math.random() * rareItems.length)];
        itemSpawner.spawnById(itemId, dx, dy);
      }
      // Show boss defeat message
      ui.showToast('🎉 Boss 击败！稀有道具掉落！', 3000);
    }

    // Check for boss trigger
    checkBossSpawn();
  }

  function checkBossSpawn() {
    // Enforce max 1 boss at a time
    if (game.enemies.some(e => e.isBoss && e.active)) return;

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
      if (!alive) handleEnemyKilled(closest, false, damage);
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
      if (!alive) handleEnemyKilled(enemy, false, reflectDmg);
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
    buffManager.applyBuff(item.config.effect, item.config);

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
      const xpNeeded = skillManager.xpNeeded;
      const xpPct = xpNeeded > 0 ? Math.min(100, (skillManager.xp / xpNeeded) * 100) : 0;
      document.getElementById('xp-fill').style.width = xpPct + '%';
    }

    document.getElementById('kills-text').textContent = game.kills;

    const totalSec = Math.floor(game.gameTime / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    document.getElementById('time-text').textContent = 
      String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');

    // Gold display
    document.getElementById('gold-text').textContent = inRunGold;

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
