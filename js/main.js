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
  let ui, waveSpawner, weaponManager, skillManager, itemSpawner, buffManager, talentManager;

  // Game state
  let selectedFaction = null;
  let selectedCharacter = null;
  let playerEntity = null;
  let backgroundStars = [];
  let lastBossScore = 0;
  let gameOverShown = false;
  let bossDefeatedThisRun = false;
  let bossKillsThisRun = 0;

  // 波次间商店状态
  let waveShopLastWave = 0;
  let waveShopCurrentItems = [];
  let waveShopRefreshCount = 0;

  // Codex discovery tracking
  let discoveredEnemyTypes = null; // Set, initialized on game start

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

    // Set version display
    var versionEl = document.getElementById('version-info');
    if (versionEl) versionEl.textContent = 'v' + (cfg.VERSION || '1.0.0');

    // Start render loop (always running for menus)
    game.start();

    // Override game's draw to include background
    const originalDraw = game._draw.bind(game);
    game._draw = function() {
      drawBackground(game.ctx);
      originalDraw();
      // Draw spawn warning arrows (red arrows before enemy spawn)
      if (waveSpawner && waveSpawner.draw) {
        waveSpawner.draw(game.ctx);
      }
      drawUIOverlay(game.ctx);
    };

    // Check return guide (7 days inactive)
    checkReturnGuide();

    // Record last active time
    recordLastActive();

    // Hide loading screen
    hideLoadingScreen();

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

	    // Stars (pause-aware: stop motion when paused)
	    for (const star of backgroundStars) {
	      if (!game.isPaused) {
	        star.y += star.speed * 0.016;
	        if (star.y > game.height + 5) {
	          star.y = -5;
	          star.x = Math.random() * game.width;
	        }
	        star.twinkle += star.twinkleSpeed * 0.016;
	      }
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

    // Boss health bar is now rendered via DOM (#boss-bar), not canvas
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

  // ============ LOADING SCREEN ============
  function hideLoadingScreen() {
    window._loadingDone = true;
    var el = document.getElementById('loading-screen');
    if (el) {
      el.classList.add('fade-out');
      setTimeout(function() { el.style.display = 'none'; }, 600);
    }
  }

  // ============ RETURN GUIDE ============
  function checkReturnGuide() {
    try {
      var lastActive = localStorage.getItem('stg_last_active');
      if (!lastActive) return;

      var lastTime = parseInt(lastActive, 10);
      if (isNaN(lastTime)) return;

      var daysSince = (Date.now() - lastTime) / (1000 * 60 * 60 * 24);
      if (daysSince >= 7) {
        showWelcomeBack();
      }
    } catch (e) {
      // localStorage not available, skip
    }
  }

  function showWelcomeBack() {
    var banner = document.getElementById('welcome-back-banner');
    if (!banner) return;

    banner.style.display = 'block';
    banner.className = 'welcome-back';
    banner.innerHTML =
      '<div class="wb-title">欢迎回来!</div>' +
      '<div class="wb-desc">经验获取 2x 加成 (10分钟)</div>';

    // Apply 2x XP buff for 10 minutes
    window._returnGuideXpMultiplier = 2;
    setTimeout(function() {
      window._returnGuideXpMultiplier = 1;
    }, 10 * 60 * 1000);

    // Remove banner after animation
    setTimeout(function() {
      banner.style.display = 'none';
    }, 5000);
  }

  function recordLastActive() {
    try {
      localStorage.setItem('stg_last_active', String(Date.now()));
    } catch (e) {
      // localStorage not available, skip
    }
  }

  // ============ UI HANDLERS ============
  function setupUIHandlers() {
    // Set ui callbacks (ui.js handles all DOM rendering)
    // Character select: ui generates cards, calls this callback on selection
    ui.onStartGame = function(factionId, characterId) {
      selectedFaction = factionId;
      selectedCharacter = characterId || 'vanguard';
      // Show talent selection screen before starting game
      showTalentScreen();
    };
    // Leaderboard button (handled by ui.js, but set data source)
    ui.getLeaderboardData = function() {
      return window.LeaderboardManager.getLeaderboard();
    };
    // Back buttons (handled by ui.js)
    document.getElementById('btn-restart').addEventListener('click', showTalentScreen);
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
    document.getElementById('btn-pause-weapons').addEventListener('click', () => {
      showPauseWeaponsView();
    });
    document.getElementById('btn-pause-skills').addEventListener('click', () => {
      showPauseSkillsView();
    });
    document.getElementById('btn-pause-menu').addEventListener('click', () => {
      document.getElementById('pause-overlay').style.display = 'none';
      backToMenu();
    });
    document.getElementById('btn-pause-back').addEventListener('click', () => {
      hidePauseSubView();
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

  // ============ PAUSE SUB-VIEWS ============
  function showPauseSubView() {
    document.getElementById('pause-main-menu').style.display = 'none';
    document.getElementById('pause-sub-view').style.display = 'flex';
  }

  function hidePauseSubView() {
    document.getElementById('pause-sub-view').style.display = 'none';
    document.getElementById('pause-main-menu').style.display = 'block';
  }

  function showPauseWeaponsView() {
    var container = document.getElementById('pause-sub-content');
    if (!container) return;

    var html = '<h3>🔫 当前武器</h3>';
    if (weaponManager) {
      var slots = weaponManager.getSlots();
      var hasWeapon = false;
      for (var si = 0; si < slots.length; si++) {
        var s = slots[si];
        if (!s) continue;
        hasWeapon = true;
        html += '<div class="pause-sub-item">' +
          '<div class="item-icon">' + (s.icon || '🔫') + '</div>' +
          '<div><div class="item-name">' + (s.name || s.weaponId) + '</div>' +
          '<div class="item-desc">' + (s.description || '') + '</div></div></div>';
      }
      if (!hasWeapon) {
        html += '<div class="pause-sub-empty">无武器数据</div>';
      }
    } else {
      html += '<div class="pause-sub-empty">无武器数据</div>';
    }

    container.innerHTML = html;
    showPauseSubView();
  }

  function showPauseSkillsView() {
    var container = document.getElementById('pause-sub-content');
    if (!container) return;

    var html = '<h3>✨ 已学技能</h3>';
    if (skillManager && skillManager.learnedSkills && skillManager.learnedSkills.size > 0) {
      var skillIds = Array.from(skillManager.learnedSkills.keys());
      for (var i = 0; i < skillIds.length; i++) {
        var skillId = skillIds[i];
        var stackCount = skillManager.learnedSkills.get(skillId) || 1;
        var skillCfg = null;
        // Search in GAME_CONFIG.SKILLS
        for (var j = 0; j < cfg.SKILLS.length; j++) {
          if (cfg.SKILLS[j].id === skillId) { skillCfg = cfg.SKILLS[j]; break; }
        }
        var name = skillCfg ? skillCfg.name : skillId;
        var desc = skillCfg ? (skillCfg.description || '') : '';
        var icon = skillCfg ? (skillCfg.icon || '✨') : '✨';
        var stackLabel = stackCount > 1 ? ' <span style="color:#ffaa44;font-size:11px;">x' + stackCount + '</span>' : '';
        html += '<div class="pause-sub-item">' +
          '<div class="item-icon">' + icon + '</div>' +
          '<div><div class="item-name">' + name + stackLabel + '</div>' +
          '<div class="item-desc">' + desc + '</div></div></div>';
      }
    } else {
      html += '<div class="pause-sub-empty">尚未学习任何技能</div>';
    }

    container.innerHTML = html;
    showPauseSubView();
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
        showTalentScreen();
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

  // ============ WAVE SHOP (波次间商店) ============
  function getRandomShopItems(count) {
    var allItems = cfg.SHOP.items;
    var shuffled = allItems.slice().sort(function() { return 0.5 - Math.random(); });
    return shuffled.slice(0, count);
  }

	  function showWaveShop() {
	    var wave = waveSpawner ? waveSpawner.waveNumber : 0;
	    if (wave % cfg.SHOP.waveInterval !== 0 || wave === waveShopLastWave) return;

	    waveShopLastWave = wave;
	    waveShopRefreshCount = 0;
	    waveShopCurrentItems = getRandomShopItems(cfg.SHOP.displayCount);

	    window._isWaveShopOpen = true;
	    game.pause();
	    // 隐藏暂停覆盖层，避免与商店界面重叠
	    var po = document.getElementById('pause-overlay');
	    if (po) po.style.display = 'none';
	    ui.showWaveShop(waveShopCurrentItems, inRunGold, purchaseWaveShopItem, refreshWaveShopItems, hideWaveShop);
	  }

	  function hideWaveShop() {
	    window._isWaveShopOpen = false;
	    ui.hideWaveShop();
	    game.resume();
	  }

  function refreshWaveShopItems() {
    var cost = cfg.SHOP.refreshCost;
    if (inRunGold < cost) {
      ui.showToast('金币不足！', '#ff4444');
      return;
    }
    inRunGold -= cost;
    waveShopRefreshCount++;
    waveShopCurrentItems = getRandomShopItems(cfg.SHOP.displayCount);
    ui.showWaveShop(waveShopCurrentItems, inRunGold, purchaseWaveShopItem, refreshWaveShopItems, hideWaveShop);
  }

  function purchaseWaveShopItem(itemId) {
    var item = null;
    for (var i = 0; i < cfg.SHOP.items.length; i++) {
      if (cfg.SHOP.items[i].id === itemId) { item = cfg.SHOP.items[i]; break; }
    }
    if (!item) return;
    if (inRunGold < item.cost) {
      ui.showToast('金币不足！', '#ff4444');
      return;
    }

    inRunGold -= item.cost;

    // 应用商品效果
    switch (item.id) {
      case 'healthSmall':
        if (playerEntity) playerEntity.heal(30);
        ui.showToast('恢复30HP', '#44ff44');
        break;
      case 'healthMedium':
        if (playerEntity) playerEntity.heal(80);
        ui.showToast('恢复80HP', '#44ff44');
        break;
      case 'healthLarge':
        if (playerEntity) playerEntity.heal(playerEntity.maxHp);
        ui.showToast('恢复全部HP', '#44ff44');
        break;
      case 'fusionCore':
        if (!window._fusionCores) window._fusionCores = 0;
        window._fusionCores++;
        ui.showToast('获得融合核心！', '#aa66ff');
        break;
      case 'attackBoost':
        if (playerEntity) {
          playerEntity.applyStatModifiers([{ stat: 'attack', op: 'multiply', value: 0.15 }]);
        }
        ui.showToast('攻击力+15%', '#ff8800');
        break;
      case 'speedBoost':
        if (playerEntity) {
          playerEntity.applyStatModifiers([{ stat: 'speed', op: 'multiply', value: 0.10 }]);
        }
        ui.showToast('移动速度+10%', '#88ffff');
        break;
    }

    // 从当前商品列表移除已购买项
    for (var j = 0; j < waveShopCurrentItems.length; j++) {
      if (waveShopCurrentItems[j].id === itemId) {
        waveShopCurrentItems.splice(j, 1);
        break;
      }
    }

    // 刷新商店UI
    if (waveShopCurrentItems.length > 0) {
      ui.showWaveShop(waveShopCurrentItems, inRunGold, purchaseWaveShopItem, refreshWaveShopItems, hideWaveShop);
    } else {
      hideWaveShop();
    }
  }

  // ============ COUNTDOWN ============
  function showCountdown(onComplete) {
    var overlay = document.getElementById('countdown-overlay');
    var textEl = document.getElementById('countdown-text');
    if (!overlay || !textEl) {
      if (onComplete) onComplete();
      return;
    }

    game.pause();
    overlay.style.display = 'flex';

    var steps = [
      { text: '3', cls: 'countdown-number', duration: 900 },
      { text: '2', cls: 'countdown-number', duration: 900 },
      { text: '1', cls: 'countdown-number', duration: 900 },
      { text: 'GO!', cls: 'countdown-go', duration: 600 },
    ];
    var stepIndex = 0;

    function nextStep() {
      if (stepIndex >= steps.length) {
        overlay.style.display = 'none';
        // Play BGM after countdown
        if (window.audio) window.audio.startBGM();
        if (onComplete) onComplete();
        return;
      }
      var step = steps[stepIndex];
      textEl.textContent = step.text;
      textEl.className = step.cls;
      // Force re-trigger animation by removing and re-adding element
      var parent = textEl.parentNode;
      parent.removeChild(textEl);
      parent.appendChild(textEl);
      stepIndex++;
      setTimeout(nextStep, step.duration);
    }

    nextStep();
  }

  // ============ NEW PLAYER TUTORIAL ============
  var tutorialState = { active: false, step: 0, autoTimer: null };

  var TUTORIAL_STEPS = [
    { icon: '✈️', text: '移动战机', hint: '鼠标或触屏控制移动方向', highlight: 'player' },
    { icon: '🔫', text: '自动射击', hint: '战机会自动开火，专注移动即可', highlight: 'none' },
    { icon: '💎', text: '拾取道具', hint: '击杀敌人掉落的经验和道具，靠近自动拾取', highlight: 'item' },
    { icon: '⬆️', text: '升级选择', hint: '经验满后升级，选择一个技能强化自己', highlight: 'level' },
    { icon: '🎉', text: '准备就绪！', hint: '祝你好运，战士！', highlight: 'none' },
  ];

  function isTutorialDone() {
    try { return localStorage.getItem('stg_tutorial_done') === '1'; }
    catch (e) { return true; }
  }

  function markTutorialDone() {
    try { localStorage.setItem('stg_tutorial_done', '1'); } catch (e) {}
  }

  function showTutorial() {
    var overlay = document.getElementById('tutorial-overlay');
    var skipBtn = document.getElementById('tutorial-skip');
    if (!overlay) return;

    tutorialState = { active: true, step: 0, autoTimer: null };

    overlay.style.display = 'block';
    skipBtn.addEventListener('click', skipTutorial, { once: true });

    showTutorialStep(0);
  }

  function skipTutorial() {
    if (!tutorialState.active) return;
    clearTimeout(tutorialState.autoTimer);
    tutorialState.active = false;
    var overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'none';
    markTutorialDone();
  }

  function advanceTutorial() {
    if (!tutorialState.active) return;
    clearTimeout(tutorialState.autoTimer);
    showTutorialStep(tutorialState.step + 1);
  }

  function onTutorialItemPickup() {
    if (tutorialState.active && tutorialState.step === 2) advanceTutorial();
  }

  function onTutorialLevelUp() {
    if (tutorialState.active && tutorialState.step === 3) advanceTutorial();
  }

  function showTutorialStep(idx) {
    if (idx >= TUTORIAL_STEPS.length) {
      tutorialState.active = false;
      var overlay = document.getElementById('tutorial-overlay');
      if (overlay) overlay.style.display = 'none';
      markTutorialDone();
      return;
    }

    tutorialState.step = idx;
    var step = TUTORIAL_STEPS[idx];

    // Update text
    var indicator = document.getElementById('tutorial-step-indicator');
    var icon = document.getElementById('tutorial-icon');
    var text = document.getElementById('tutorial-text');
    var hint = document.getElementById('tutorial-hint');
    var highlight = document.getElementById('tutorial-highlight');
    var content = document.getElementById('tutorial-content');

    if (indicator) indicator.textContent = (idx + 1) + ' / ' + TUTORIAL_STEPS.length;
    if (icon) icon.textContent = step.icon;
    if (text) text.textContent = step.text;
    if (hint) hint.textContent = step.hint;

    // Re-trigger content animation
    if (content) {
      content.style.animation = 'none';
      content.offsetHeight; // force reflow
      content.style.animation = '';
    }

    // Position highlight
    if (highlight) {
      if (step.highlight === 'player' && playerEntity) {
        highlight.style.display = 'block';
        highlight.style.left = (playerEntity.x - 30) + 'px';
        highlight.style.top = (playerEntity.y - 30) + 'px';
        highlight.style.width = '60px';
        highlight.style.height = '60px';
      } else if (step.highlight === 'level') {
        var el = document.querySelector('.hud-top-left');
        if (el) {
          var r = el.getBoundingClientRect();
          var cr = game.canvas.getBoundingClientRect();
          highlight.style.display = 'block';
          highlight.style.left = (r.left - cr.left - 4) + 'px';
          highlight.style.top = (r.top - cr.top - 4) + 'px';
          highlight.style.width = (r.width + 8) + 'px';
          highlight.style.height = (r.height + 8) + 'px';
        } else {
          highlight.style.display = 'none';
        }
      } else {
        highlight.style.display = 'none';
      }
    }

    // Play ding sound
    if (window.audio) {
      window.audio._ensureContext();
      if (!window.audio._muted && window.audio._ctx) {
        var ctx = window.audio._ctx;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(window.audio._masterGain);
        osc.start(now);
        osc.stop(now + 0.21);
      }
    }

    // Auto-advance for time-based steps
    var autoDelay = (idx === 0) ? 4000 : (idx === 1) ? 3500 : (idx === 4) ? 3000 : null;
    if (autoDelay) {
      tutorialState.autoTimer = setTimeout(function() {
        if (tutorialState.active && tutorialState.step === idx) advanceTutorial();
      }, autoDelay);
    }
  }

  // ============ TALENT SCREEN ============
  function showTalentScreen() {
    // Create or reset talent manager
    if (!talentManager) {
      talentManager = new window.TalentManager();
    }
    talentManager.reset();

    // Show talent selection UI
    ui.showTalentScreen(talentManager, function() {
      // On confirm: apply talents and start game
      startNewGame();
    });
  }

  // ============ GAME START ============
  function startNewGame() {
    if (!selectedFaction) {
      selectedFaction = 'attackSpeed'; // Default
    }

    // Check if loadout selection is needed (player has unlocked more weapons than max slots)
    var maxSlots = (window.WeaponLoadoutManager) ? window.WeaponLoadoutManager.getMaxSlots() : 6;
    var ownedWeapons = _getOwnedWeapons();

    if (ownedWeapons.length > maxSlots) {
      var savedLoadout = (window.WeaponLoadoutManager) ? window.WeaponLoadoutManager.load() : [];
      // If no saved loadout, default to first maxSlots weapons
      if (savedLoadout.length === 0) {
        savedLoadout = ownedWeapons.slice(0, maxSlots);
      }
      ui.showLoadoutSelection(ownedWeapons, savedLoadout, function(selectedIds) {
        _initGameState(selectedIds);
      });
      return;
    }

    // Proceed with default loadout (all owned weapons)
    _initGameState(ownedWeapons);
  }

  /**
   * Get all weapons the player has unlocked (via meta shop purchases).
   * @returns {Array<string>} weapon IDs
   */
  function _getOwnedWeapons() {
    var weapons = ['normal']; // always have the default weapon
    try {
      var raw = localStorage.getItem('stg_meta_purchases');
      if (raw) {
        var purchases = JSON.parse(raw);
        var metaShop = (window.GAME_CONFIG && window.GAME_CONFIG.META_SHOP && window.GAME_CONFIG.META_SHOP.weapons)
          ? window.GAME_CONFIG.META_SHOP.weapons : {};
        var keys = Object.keys(metaShop);
        for (var i = 0; i < keys.length; i++) {
          var item = metaShop[keys[i]];
          if (item.id !== 'normal' && purchases['weapon_' + item.id]) {
            weapons.push(item.weaponId || item.id);
          }
        }
      }
    } catch (e) { /* ignore parse errors */ }
    return weapons;
  }

  /**
   * Apply meta shop permanent upgrade effects to the player entity.
   * Reads purchased upgrades from localStorage and applies stat modifiers.
   * @param {Object} player - the Player entity
   */
  function _applyMetaShopUpgrades(player) {
    if (!player) return;
    try {
      var raw = localStorage.getItem('stg_meta_purchases');
      if (!raw) return;
      var purchases = JSON.parse(raw);
      var metaShop = (window.GAME_CONFIG && window.GAME_CONFIG.META_SHOP && window.GAME_CONFIG.META_SHOP.upgrades)
        ? window.GAME_CONFIG.META_SHOP.upgrades : {};
      var effects = [];
      var keys = Object.keys(metaShop);
      for (var i = 0; i < keys.length; i++) {
        var item = metaShop[keys[i]];
        var level = purchases['upgrade_' + item.id] || 0;
        if (level > 0 && item.effect) {
          effects.push({
            stat: item.effect.stat,
            op: item.effect.op,
            value: item.effect.value * level,
          });
        }
      }
      if (effects.length > 0) {
        player.applyStatModifiers(effects);
      }
    } catch (e) { /* ignore parse errors */ }
  }

  /**
   * Initialize game state and start the run.
   * Called after faction selection (and optional loadout selection).
   * @param {Array<string>} loadoutWeaponIds - weapons to equip at start
   */
  function _initGameState(loadoutWeaponIds) {

    // Reset game state
    game.score = 0;
    game.kills = 0;
    game.combo = 0;
    game.comboTimer = 0;
    game.maxCombo = 0;
    game.difficulty = 0;
    game.timeScale = 1.0;
    game.shakeIntensity = 0;
    game.gameTime = 0;
    game.hpMultiplier = 1;
    game.xpMultiplier = 1;
    game.dropMultiplier = 1;
    game.bossHpMultiplier = 1;
    gameOverShown = false;
    lastBossScore = 0;

    // Init codex discovery tracking for this run
    discoveredEnemyTypes = new Set();

    // Codex: discover faction on game start (first time only)
    if (window.CodexProgressManager) {
      CodexProgressManager.discoverFaction(selectedFaction);
    }

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

    // Reset wave shop
    waveShopLastWave = 0;
    waveShopCurrentItems = [];
    waveShopRefreshCount = 0;

    // Clear all entities
    game.clearAllEntities();
    game.entities.length = 0;

    // Create player
    playerEntity = new window.Player(game.width / 2, game.height * 0.8);
    playerEntity.applyFaction(selectedFaction);

    // Apply character stat modifiers
    if (selectedCharacter && cfg.CHARACTERS[selectedCharacter]) {
      playerEntity.applyCharacter(selectedCharacter);
    }

    // Apply talent effects
    if (talentManager) {
      talentManager.setPlayer(playerEntity);
      talentManager.applyAllTalents(playerEntity);
    }

    // Apply meta shop permanent upgrades
    _applyMetaShopUpgrades(playerEntity);

    // Reset boss-defeated flag for this run
    bossDefeatedThisRun = false;
    bossKillsThisRun = 0;

    game.addEntity(playerEntity);
    game.player = playerEntity;

    // Initialize systems
    skillManager = new window.SkillManager(playerEntity);
    skillManager._pendingLevelUps = 0;
    skillManager._isChoosing = false;
    weaponManager = new window.WeaponManager(playerEntity);
    // Equip loadout weapons (first weapon via setWeapon, rest via addWeaponToSlot)
    var loadoutWeapons = (typeof loadoutWeaponIds !== 'undefined' && loadoutWeaponIds.length > 0)
      ? loadoutWeaponIds : ['normal'];
    weaponManager.setWeapon(loadoutWeapons[0]);
    for (var wi = 1; wi < loadoutWeapons.length; wi++) {
      weaponManager.addWeaponToSlot(loadoutWeapons[wi]);
    }
    // Codex: discover initial weapons
    if (window.CodexProgressManager) {
      for (var cd = 0; cd < loadoutWeapons.length; cd++) {
        CodexProgressManager.discoverWeapon(loadoutWeapons[cd]);
      }
    }

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
      // NOTE: Game no longer paused during level-up — choices shown as overlay on top of gameplay

      // 降低BGM音量至30%
      if (window.audio && window.audio._bgmNodes) {
        window.audio._bgmNodes.forEach(function(n) {
          if (n.gain) n.gain.value = window.audio._bgmVolume * 0.3;
        });
      }

      // Tutorial: advance on level up
      onTutorialLevelUp();

      // Check for available fusions and add fusion cards to choices
      var availableFusions = skillManager.checkFusions();
      if (availableFusions.length > 0) {
        ui.showFusionNotification(availableFusions);
      }

      // Helper: clear auto-select timer and countdown display
      function clearAutoSelect() {
        if (skillManager._autoSelectTimer) {
          clearTimeout(skillManager._autoSelectTimer);
          skillManager._autoSelectTimer = null;
        }
        if (skillManager._autoSelectInterval) {
          clearInterval(skillManager._autoSelectInterval);
          skillManager._autoSelectInterval = null;
        }
        var timerEl = document.getElementById('level-up-timer');
        if (timerEl) timerEl.textContent = '';
      }

      // Helper: visual countdown "自动选择剩余 X 秒"
      function showLevelUpCountdown(totalMs) {
        var el = document.getElementById('level-up-timer');
        if (!el) return;
        var remaining = Math.ceil(totalMs / 1000);
        el.textContent = '自动选择剩余 ' + remaining + ' 秒';
        skillManager._autoSelectInterval = setInterval(function() {
          remaining--;
          if (remaining <= 0) {
            clearInterval(skillManager._autoSelectInterval);
            skillManager._autoSelectInterval = null;
            el.textContent = '';
            return;
          }
          el.textContent = '自动选择剩余 ' + remaining + ' 秒';
        }, 1000);
      }

      ui.showLevelUp(choices, function(selectedItem) {
        clearAutoSelect();
        // Handle fusion cards (they have _choiceType === 'fusion')
        if (selectedItem._choiceType === 'fusion') {
          // Fusion cards are handled by the separate addFusionCards callback
          // This should not be reached, but handle gracefully
          return;
        }

        // Handle slot expansion cards
        if (selectedItem._choiceType === 'slot') {
          skillManager._assignSlot(selectedItem._slotType);
          ui.hideLevelUp();
          // 设置1.5秒恢复缓冲期
          window._resumeTimer = 1.5;
          // 恢复BGM音量
          if (window.audio && window.audio._bgmNodes) {
            window.audio._bgmNodes.forEach(function(n) {
              if (n.gain) n.gain.value = window.audio._bgmVolume;
            });
          }
          // game.resume() handled by _assignSlot in skills.js
          return;
        }

        // Handle normal skills and weapons
        if (selectedItem._choiceType === 'weapon') {
          skillManager.selectWeapon(selectedItem._weaponId);
          // Codex: discover weapon on first acquisition
          if (window.CodexProgressManager) {
            CodexProgressManager.discoverWeapon(selectedItem._weaponId);
          }
        } else {
          skillManager.learnSkill(selectedItem._data.id);
        }
        ui.hideLevelUp();
        // 设置1.5秒恢复缓冲期
        window._resumeTimer = 1.5;
        // 恢复BGM音量
        if (window.audio && window.audio._bgmNodes) {
          window.audio._bgmNodes.forEach(function(n) {
            if (n.gain) n.gain.value = window.audio._bgmVolume;
          });
        }
        // game.resume() handled by learnSkill/selectWeapon in skills.js
      });

      // 8-second auto-select timer: if no choice made, click first skill card
      clearAutoSelect();
      skillManager._autoSelectTimer = setTimeout(function() {
        var firstCard = document.querySelector('#skill-choices .skill-card');
        if (firstCard) firstCard.click();
      }, 8000);
      showLevelUpCountdown(8000);

      // Add fusion cards to the level-up UI if fusions are available
      if (availableFusions.length > 0) {
        var container = document.getElementById('skill-choices');
        ui.addFusionCards(availableFusions, container, function(selectedItem) {
          clearAutoSelect();
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
            // 设置1.5秒恢复缓冲期
            window._resumeTimer = 1.5;
            // 恢复BGM音量
            if (window.audio && window.audio._bgmNodes) {
              window.audio._bgmNodes.forEach(function(n) {
                if (n.gain) n.gain.value = window.audio._bgmVolume;
              });
            }
            game.resume();
          }
        });
      }
    };

    // Connect fusion availability callback
    skillManager.onFusionAvailable = function(fusions) {
      ui.showFusionNotification(fusions);
    };

    // Connect fusion execute callback (called from fusion confirm UI)
    ui.onFusionExecute = function(fusion) {
      if (!fusion || !fusion.recipe) return;
      if (fusion.type === 'weapon') {
        skillManager.executeWeaponFusion(fusion.recipe);
      } else if (fusion.type === 'skill') {
        skillManager.executeSkillFusion(fusion.recipe);
      }
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
    document.getElementById('talent-screen').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('level-up').style.display = 'none';
	    ui.showHUD();
	    if (ui.elPauseOverlay) ui.elPauseOverlay.style.display = 'none';

    game.setScene(cfg.SCENES.GAMEPLAY);

    // 3-second countdown before gameplay starts
    showCountdown(function() {
      game.resume();
      console.log('New game started. Faction:', selectedFaction);

      // Show tutorial for first-time players
      if (!isTutorialDone()) {
        showTutorial();
      }
    });
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

    // Check character unlocks
    ui.checkCharacterUnlocks(game.kills, bossDefeatedThisRun);

    // Compute run stats for achievements and star coins
    var runStats = {
      kills: game.kills,
      bossKills: bossKillsThisRun,
      time: game.gameTime,
      score: game.score,
      level: skillManager ? skillManager.level : 1,
      maxCombo: game.maxCombo,
      eliteKills: game._eliteKills || 0,
      fusions: (skillManager && skillManager._fusionCount) ? skillManager._fusionCount : 0,
    };

    // Award star coins based on run performance
    if (window.GAME_CONFIG && window.GAME_CONFIG.PERMANENT_UPGRADES && window.GAME_CONFIG.PERMANENT_UPGRADES.starCoinFormula) {
      var minutes = game.gameTime / 60000;
      var coinsEarned = window.GAME_CONFIG.PERMANENT_UPGRADES.starCoinFormula(minutes, game.kills, bossKillsThisRun);
      if (coinsEarned > 0 && window.UpgradeManager) {
        window.UpgradeManager.addStarCoins(coinsEarned);
      }
    }

    // Check and award achievements
    if (window.AchievementManager) {
      window.AchievementManager.checkAndAward(runStats);
    }

    // Record stats
    if (window.StatsManager) {
      window.StatsManager.recordGame({
        kills: game.kills,
        deaths: 1,
        survivalTime: game.gameTime,
        score: game.score,
        playTime: game.gameTime,
      });
    }

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
        bossKills: bossKillsThisRun,
        wave: waveSpawner ? waveSpawner.waveNumber : 0,
      };

      // Save personal bests
      if (ui && typeof ui.savePersonalBests === 'function') {
        ui.savePersonalBests(stats);
      }

      ui.showGameOver(stats, function() {
        // Restart: show talent screen first
        showTalentScreen();
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

    // Clean up tutorial
    if (tutorialState.active) {
      clearTimeout(tutorialState.autoTimer);
      tutorialState.active = false;
    }
    var tutOverlay = document.getElementById('tutorial-overlay');
    if (tutOverlay) tutOverlay.style.display = 'none';

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
    // 恢复缓冲期计时
    if (window._resumeTimer > 0) {
      window._resumeTimer -= dt;
      if (window._resumeTimer <= 0) {
        window._resumeTimer = 0;
      }
      return; // 缓冲期内不更新游戏逻辑
    }
    if (!playerEntity || !playerEntity.active) {
      if (!gameOverShown) endGame();
      return;
    }

    // Update difficulty — 难度曲线：前期简单、后期有挑战
    var baseDifficulty = Math.floor(game.score / 5000) + Math.floor(game.gameTime / cfg.BALANCE.DIFFICULTY_INTERVAL);

    // 前期(0-5分钟)：降低难度，让玩家轻松上手
    if (game.gameTime < cfg.BALANCE.EARLY_PHASE_END) {
      game.difficulty = Math.max(0, baseDifficulty - 1);
      game.hpMultiplier = cfg.BALANCE.EARLY_HP_MULTIPLIER;    // 敌人HP×0.8
      game.xpMultiplier = cfg.BALANCE.EARLY_XP_MULTIPLIER;    // 经验×1.2
      game.dropMultiplier = cfg.BALANCE.EARLY_DROP_MULTIPLIER; // 掉率×1.5
    }
    // 中期(5-15分钟)：标准难度
    else if (game.gameTime < cfg.BALANCE.MID_PHASE_END) {
      game.difficulty = baseDifficulty;
      game.hpMultiplier = 1;
      game.xpMultiplier = 1;
      game.dropMultiplier = 1;
    }
    // 后期(15分钟+)：难度逐渐提升
    else {
      var lateMinutes = (game.gameTime - cfg.BALANCE.MID_PHASE_END) / 60000;
      var lateBonus = Math.floor(lateMinutes * cfg.BALANCE.LATE_DIFFICULTY_SCALE * 10) / 10;
      game.difficulty = baseDifficulty + lateBonus;
      game.hpMultiplier = 1 + lateBonus * 0.05; // 后期敌人HP逐渐增加
      game.xpMultiplier = 1;
      game.dropMultiplier = 1;
    }

    // Boss难度递增：第一个Boss简单，后续逐渐变强
    if (bossKillsThisRun === 0) {
      game.bossHpMultiplier = cfg.BALANCE.BOSS_FIRST_HP_SCALE; // 第一个Boss HP×0.7
    } else {
      game.bossHpMultiplier = 1 + bossKillsThisRun * cfg.BALANCE.BOSS_SCALING_PER_KILL;
    }

    // Update wave spawner
    if (waveSpawner) waveSpawner.update(dt);

    // 波次间商店触发：每N波完成后显示商店
    if (waveSpawner && waveSpawner.waveState === 'pause' &&
        waveSpawner.waveNumber % cfg.SHOP.waveInterval === 0 &&
        waveSpawner.waveNumber !== waveShopLastWave) {
      showWaveShop();
    }

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

    // Gravity faction: per-frame aura that slows enemies in range
    if (playerEntity.stats.gravityRadius && playerEntity.stats.gravitySlow) {
      var _gravRadius = playerEntity.stats.gravityRadius;
      var _gravSlow = playerEntity.stats.gravitySlow;
      var _gravDmg = playerEntity.stats.gravityDamage || 0;
      for (var _gi = 0; _gi < game.enemies.length; _gi++) {
        var _ge = game.enemies[_gi];
        if (!_ge.active) continue;
        var _gdx = _ge.x - playerEntity.x;
        var _gdy = _ge.y - playerEntity.y;
        var _gdist = Math.sqrt(_gdx * _gdx + _gdy * _gdy);
        if (_gdist < _gravRadius) {
          _ge.slowTimer = 300;
          _ge.slowAmount = _gravSlow;
          if (_gravDmg > 0) {
            var _alive = _ge.takeDamage(_gravDmg * dt);
            if (!_alive) handleEnemyKilled(_ge, false, _gravDmg);
          }
        }
      }
    }

    // Sonic faction: periodic pulse that damages enemies in range
    if (playerEntity.stats.sonicPulseInterval && playerEntity.stats.sonicDamage) {
      if (!playerEntity._sonicPulseTimer) playerEntity._sonicPulseTimer = 0;
      playerEntity._sonicPulseTimer += dt;
      if (playerEntity._sonicPulseTimer >= playerEntity.stats.sonicPulseInterval) {
        playerEntity._sonicPulseTimer = 0;
        var _sonicRadius = playerEntity.stats.sonicRadius || 120;
        var _sonicDmg = playerEntity.stats.sonicDamage;
        // Visual: expanding ring nova
        if (window.ParticleSystem) {
          window.ParticleSystem.nova(playerEntity.x, playerEntity.y, '#ff88ff');
        }
        // Damage enemies in range
        for (var _si = 0; _si < game.enemies.length; _si++) {
          var _se = game.enemies[_si];
          if (!_se.active) continue;
          var _sdx = _se.x - playerEntity.x;
          var _sdy = _se.y - playerEntity.y;
          var _sdist = Math.sqrt(_sdx * _sdx + _sdy * _sdy);
          if (_sdist < _sonicRadius) {
            var _alive = _se.takeDamage(_sonicDmg * 10);
            if (!_alive) handleEnemyKilled(_se, false, _sonicDmg);
            // Stun if ultimate unlocked
            if (playerEntity.stats.sonicStun) {
              _se.frozenTimer = Math.max(_se.frozenTimer || 0, playerEntity.stats.sonicStun);
            }
          }
        }
      }
    }

    // Holy faction: heal aura that heals player when enemies are nearby
    if (playerEntity.stats.healAuraAmount && playerEntity.stats.healAuraRadius) {
      if (!playerEntity._healAuraTimer) playerEntity._healAuraTimer = 0;
      playerEntity._healAuraTimer += dt;
      if (playerEntity._healAuraTimer >= 1.0) { // heal every 1 second
        playerEntity._healAuraTimer = 0;
        var _holyRadius = playerEntity.stats.healAuraRadius;
        var _nearbyEnemy = false;
        for (var _hi = 0; _hi < game.enemies.length; _hi++) {
          var _he = game.enemies[_hi];
          if (!_he.active) continue;
          var _hdx = _he.x - playerEntity.x;
          var _hdy = _he.y - playerEntity.y;
          if (Math.sqrt(_hdx * _hdx + _hdy * _hdy) < _holyRadius) {
            _nearbyEnemy = true;
            break;
          }
        }
        if (_nearbyEnemy) {
          playerEntity.heal(playerEntity.stats.healAuraAmount);
        }
      }
    }

    // Time faction: periodic time slow aura that slows all enemies
    if (playerEntity.stats.timeSlowAmount && playerEntity.stats.timeSlowDuration) {
      if (!playerEntity._timeSlowTimer) playerEntity._timeSlowTimer = 0;
      playerEntity._timeSlowTimer += dt * 1000;
      if (playerEntity._timeSlowTimer >= 5000) { // trigger every 5 seconds
        playerEntity._timeSlowTimer = 0;
        var _tsDur = playerEntity.stats.timeSlowDuration;
        var _tsAmt = playerEntity.stats.timeSlowAmount;
        for (var _ti = 0; _ti < game.enemies.length; _ti++) {
          var _te = game.enemies[_ti];
          if (!_te.active) continue;
          _te.slowTimer = Math.max(_te.slowTimer || 0, _tsDur);
          _te.slowAmount = Math.max(_te.slowAmount || 0, _tsAmt);
        }
        if (window.ParticleSystem) {
          window.ParticleSystem.nova(playerEntity.x, playerEntity.y, '#ccbb88');
        }
      }
    }

    // Codex: discover new enemy types on first encounter
    if (window.CodexProgressManager && discoveredEnemyTypes && game.enemies) {
      for (let _ei = 0; _ei < game.enemies.length; _ei++) {
        const _e = game.enemies[_ei];
        if (_e.active && _e.type && !discoveredEnemyTypes.has(_e.type)) {
          discoveredEnemyTypes.add(_e.type);
          const _cfg = cfg.ENEMIES && cfg.ENEMIES[_e.type];
          CodexProgressManager.discoverEnemy(_e.type, _cfg ? _cfg.name : null);
        }
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
        // Magnet: bullet repel - chance to deflect enemy bullets
        if (playerEntity.stats.bulletRepelChance && Math.random() < playerEntity.stats.bulletRepelChance) {
          var _repelRadius = playerEntity.stats.bulletRepelRadius || 120;
          var _bdx = bullet.x - playerEntity.x;
          var _bdy = bullet.y - playerEntity.y;
          if (Math.sqrt(_bdx * _bdx + _bdy * _bdy) < _repelRadius) {
            bullet.active = false;
            game.removeEntity(bullet);
            if (window.ParticleSystem) window.ParticleSystem.spark(bullet.x, bullet.y);
            continue;
          }
        }
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
        // Skip enemies far off-screen to prevent invisible contact damage
        if (enemy._isInVisibleArea && !enemy._isInVisibleArea()) continue;
        if (game.checkCollision(enemy, playerEntity)) {
          handleEnemyBodyHitPlayer(enemy);
          break;
        }
      }
    }

    // Collision: items vs player (with magnet pickupRange attraction)
    if (itemSpawner) {
      var _pickupRange = playerEntity.stats.pickupRange || 0;
      for (const item of game.items) {
        if (!item.active || item.collected) continue;
        // Magnet: attract items within pickupRange
        if (_pickupRange > 0) {
          var _idx = item.x - playerEntity.x;
          var _idy = item.y - playerEntity.y;
          var _idist = Math.sqrt(_idx * _idx + _idy * _idy);
          if (_idist < _pickupRange && _idist > 1) {
            var _attractSpeed = 400 * dt;
            item.x -= (_idx / _idist) * _attractSpeed;
            item.y -= (_idy / _idist) * _attractSpeed;
          }
        }
        if (game.checkCollision(item, playerEntity)) {
          handleItemPickup(item);
        }
      }
    }

    // Update HUD
    updateHUD();

	    // Check pause state — don't show pause overlay during level-up or wave shop
	    const pauseOverlay = document.getElementById('pause-overlay');
	    if (game.isPaused && game.scene === cfg.SCENES.GAMEPLAY && !window._isLevelingUp && !window._isWaveShopOpen) {
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

    // Shadow: stealth damage bonus
    if (playerEntity._stealthActive && playerEntity._stealthDamageMult > 1) {
      damage = Math.floor(damage * playerEntity._stealthDamageMult);
    }

    // Apply status effects + track applied elements for reaction system
    var _appliedElements = [];
    if (playerEntity.stats.slowChance && Math.random() < playerEntity.stats.slowChance) {
      enemy.slowTimer = cfg.FACTIONS.ice.baseStats.slowDuration || 2000;
      enemy.slowAmount = playerEntity.stats.slowAmount || 0.4;
      _appliedElements.push('ice');
    }
    if (playerEntity.stats.poisonDamage) {
      enemy.poisonDamage = playerEntity.stats.poisonDamage;
      enemy.poisonDuration = cfg.FACTIONS.poison.baseStats.poisonDuration || 3000;
      enemy.poisonTimer = enemy.poisonDuration;
      _appliedElements.push('poison');
    }
    if (playerEntity.stats.burnDamage) {
      enemy.burnDamage = playerEntity.stats.burnDamage;
      enemy.burnDuration = cfg.FACTIONS.elemental.baseStats.burnDuration || 2000;
      enemy.burnTimer = enemy.burnDuration;
      _appliedElements.push('fire');
    }
    if (playerEntity.stats.freezeChance && Math.random() < playerEntity.stats.freezeChance) {
      enemy.frozenTimer = 1500;
      _appliedElements.push('ice');
    }
    // Thunder: chain lightning on hit + mark shocked element
    if (playerEntity.stats.chainLightningChance && Math.random() < playerEntity.stats.chainLightningChance) {
      enemy._shockedTimer = 1500;
      _appliedElements.push('lightning');
      chainDamage(enemy, damage * (playerEntity.stats.chainDamage || 0.5), 0);
    }
    // Element Reaction System: check if two elements coexist → trigger reaction
    if (window.ElementalReactionSystem && _appliedElements.length > 0) {
      for (var _ei = 0; _ei < _appliedElements.length; _ei++) {
        var reactionResult = window.ElementalReactionSystem.checkAndTrigger(enemy, _appliedElements[_ei], damage, playerEntity);
        if (reactionResult) break; // One reaction per hit
      }
    }
    // Vulnerable debuff (from shatter reaction): enemy takes more damage
    if (enemy._vulnerableTimer > 0 && enemy._vulnerableMult) {
      damage = Math.floor(damage * enemy._vulnerableMult);
    }
    // Holy: boss damage bonus
    if (enemy.isBoss && playerEntity.stats.bossDamageBonus) {
      damage = Math.floor(damage * (1 + playerEntity.stats.bossDamageBonus));
    }
    // Wind: push enemy away (支持 windPushForce 和 pushForce 两种命名)
    var _pushForce = playerEntity.stats.windPushForce || playerEntity.stats.pushForce;
    if (_pushForce) {
      const dx = enemy.x - playerEntity.x;
      const dy = enemy.y - playerEntity.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      enemy.x += (dx / dist) * _pushForce;
      enemy.y += (dy / dist) * _pushForce;
    }
    // Void: execute enemies below HP threshold (支持 voidExecuteThreshold 和 executeThreshold)
    var _voidThreshold = playerEntity.stats.voidExecuteThreshold || playerEntity.stats.executeThreshold;
    if (_voidThreshold && enemy.hp / enemy.maxHp < _voidThreshold) {
      var _voidChance = playerEntity.stats.voidExecuteChance || 1.0;
      if (Math.random() < _voidChance) {
        damage = 9999;
      }
    }
    // Gravity: pull enemies toward bullet impact (ultimate skill effect)
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

    // 触发子弹命中事件（供流派效果系统使用）
    if (window.eventBus) window.eventBus.emit('bulletHit', {enemy: enemy, bullet: bullet, damage: damage, isCrit: isCrit});

    // Apply damage
    const alive = enemy.takeDamage(damage);

    // Hit particles
    window.ParticleSystem.hitEffect(enemy.x, enemy.y);

    if (!alive) {
      handleEnemyKilled(enemy, isCrit, damage);
    }

    // Arc weapon chain (if player has arc weapon in any slot)
    if (weaponManager && weaponManager.hasWeapon('arc')) {
      chainDamage(enemy, damage * 0.3, 0);
    }
  }

  function handleEnemyKilled(enemy, isCrit, damage) {
    // 触发敌人击杀事件（供流派效果系统使用）
    if (window.eventBus) window.eventBus.emit('enemyKilled', {enemy: enemy, isCrit: isCrit, damage: damage});

    // Particles
    if (enemy.isBoss) {
      window.ParticleSystem.bossExplosion(enemy.x, enemy.y);
      game.addShake(15);
      if (window.audio) window.audio.playBigExplosion();
      bossDefeatedThisRun = true;
      bossKillsThisRun++;

      // Grant bonus talent point
      if (talentManager) {
        talentManager.onBossKill();
      }

      // Codex: discover boss on first kill
      if (window.CodexProgressManager) {
        const bossId = enemy.type || enemy.bossName || 'boss';
        const bossName = enemy.bossName || (cfg.BOSSES && cfg.BOSSES[enemy.type || 'boss']
          ? cfg.BOSSES[enemy.type || 'boss'].name : null);
        CodexProgressManager.discoverBoss(bossId, bossName);
      }
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
    // 难度曲线：前期经验加成
    if (game.xpMultiplier && game.xpMultiplier > 1) xpGain = Math.floor(xpGain * game.xpMultiplier);
    if (playerEntity.stats.xpMultiplier) xpGain = Math.floor(xpGain * playerEntity.stats.xpMultiplier);
    if (buffManager && buffManager.getModifier('xpBoost') > 1) {
      xpGain = Math.floor(xpGain * buffManager.getModifier('xpBoost'));
    }
    // Return guide 2x XP buff
    if (window._returnGuideXpMultiplier && window._returnGuideXpMultiplier > 1) {
      xpGain = Math.floor(xpGain * window._returnGuideXpMultiplier);
    }
    if (skillManager) skillManager.addXp(xpGain);

    // Gold (in-run currency)
    let goldGain = Math.floor(enemy.score * 0.3) + 1;
    if (enemy.isBoss) goldGain *= 5; // Boss gives 5x gold
    addInRunGold(goldGain);

    // Lifesteal — only heal based on actual damage dealt (capped at enemy HP before death)
    if (playerEntity.stats.lifesteal) {
      const actualDamage = Math.min(damage, enemy.maxHp);
      const healAmt = Math.floor(actualDamage * playerEntity.stats.lifesteal);
      if (healAmt > 0) playerEntity.heal(healAmt);
    }

    // Vampire aura: heal % max HP on kill
    if (playerEntity.stats.vampireAuraOnKill) {
      const auraHeal = Math.floor(playerEntity.maxHp * playerEntity.stats.vampireAuraOnKill);
      if (auraHeal > 0) playerEntity.heal(auraHeal);
    }

    // healOnKill: flat HP heal on each kill (from skills/talents)
    if (playerEntity.stats.healOnKill) {
      playerEntity.heal(playerEntity.stats.healOnKill);
    }

    // 默认击杀回血2%（所有流派）
    if (playerEntity && playerEntity.active) {
      var healAmount = Math.floor(playerEntity.stats.maxHp * 0.02);
      playerEntity.heal(healAmount);
      // 显示回血飘字
      if (window.ParticleSystem) {
        window.ParticleSystem.damageNumber(playerEntity.x, playerEntity.y - 20, '+' + healAmount, '#44ff44');
      }
    }

    // On-kill effects
    if (playerEntity.onKill) playerEntity.onKill();

    // Conditional: explosion on kill (elemental)
    if (playerEntity.stats.fireTrail) {
      window.ParticleSystem.explosion(enemy.x, enemy.y, 'small');
    }

    // Item drop — 动态掉率：难度曲线加成 + 低血量加成
    var dropChanceMult = playerEntity.stats.dropRate || 1;
    var dropChance = cfg.BALANCE.ITEM_DROP_CHANCE;
    if (game.gameTime < cfg.BALANCE.EARLY_GAME_DURATION) {
      dropChance = cfg.BALANCE.EARLY_ITEM_DROP_RATE;
    }
    // 难度曲线：前期掉率×1.5
    if (game.dropMultiplier && game.dropMultiplier > 1) {
      dropChance *= game.dropMultiplier;
    }
    if (playerEntity && playerEntity.hp / playerEntity.stats.maxHp < cfg.BALANCE.LOW_HP_THRESHOLD) {
      dropChance += cfg.BALANCE.LOW_HP_DROP_BONUS;
    }
    if (itemSpawner && Math.random() < dropChance * dropChanceMult) {
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
      // Boss: 100% guaranteed fusion core drop
      if (skillManager) {
        skillManager.addFusionCore(1);
      }
      // Show boss defeat message
      ui.showToast('🎉 Boss 击败！稀有道具掉落！融合核心 +1', 3000);
    }

    // Elite enemies: 15% chance to drop fusion core
    if (enemy.type === 'elite' && !enemy.isBoss && skillManager && Math.random() < 0.15) {
      skillManager.addFusionCore(1);
    }

    // Check for boss trigger
    checkBossSpawn();
  }

  // Expose for DOT kill handling in enemies.js
  window.handleEnemyKilled = handleEnemyKilled;

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
    // 触发玩家受击事件（供流派效果系统使用）
    if (window.eventBus) window.eventBus.emit('playerHit', {damage: bullet.damage || cfg.BALANCE.ENEMY_BULLET_DAMAGE, source: 'bullet'});
    playerTakeDamage(bullet.damage || cfg.BALANCE.ENEMY_BULLET_DAMAGE, bullet.sourceCategory || 'normal');
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
    // 触发玩家受击事件（供流派效果系统使用）
    if (window.eventBus) window.eventBus.emit('playerHit', {damage: cfg.BALANCE.COLLISION_DAMAGE, source: 'body'});
    // Determine source category from enemy type
    var sourceCategory = enemy.isBoss ? 'boss'
      : (enemy.type === 'elite' || enemy.type === 'sniperElite' || enemy.type === 'titan' || enemy.type === 'colossus' || enemy.type === 'berserker') ? 'elite'
      : 'normal';
    playerTakeDamage(cfg.BALANCE.COLLISION_DAMAGE, sourceCategory);
  }

  function playerTakeDamage(damage, sourceCategory) {
    // Check dodge
    if (playerEntity.stats.dodgeChance && Math.random() < playerEntity.stats.dodgeChance) {
      window.ParticleSystem.spark(playerEntity.x, playerEntity.y);
      if (playerEntity.onDodge) playerEntity.onDodge();
      if (window.audio) window.audio.playSelect();
      return;
    }

    // Enforce damage cap based on source category
    var bCfg = GAME_CONFIG.BALANCE;
    var maxHp = playerEntity.maxHp || bCfg.PLAYER_BASE_HP;
    var capPct = bCfg.NORMAL_ENEMY_DAMAGE_CAP || 0.30;
    if (sourceCategory === 'elite') capPct = bCfg.ELITE_ENEMY_DAMAGE_CAP || 0.50;
    else if (sourceCategory === 'boss') capPct = bCfg.BOSS_DAMAGE_CAP || 1.0;
    var maxDamage = Math.floor(maxHp * capPct);
    if (damage > maxDamage) damage = maxDamage;

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

    // 触发道具拾取事件（供流派效果系统使用）
    if (window.eventBus) window.eventBus.emit('itemPickup', {item: item});

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

    // Tutorial: advance on first pickup
    onTutorialItemPickup();
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

    // Boss HP bar (DOM-based)
    var boss = null;
    if (game.enemies) {
      for (var bi = 0; bi < game.enemies.length; bi++) {
        if (game.enemies[bi].active && game.enemies[bi].isBoss) {
          boss = game.enemies[bi];
          break;
        }
      }
    }
    if (boss) {
      ui.updateBossHP(boss.bossName || 'BOSS', boss.hp, boss.maxHp, true);
    } else {
      ui.updateBossHP('', 0, 0, false);
    }

    // Wave announcement
    if (waveSpawner) {
      var currentWave = waveSpawner.waveNumber || 0;
      if (currentWave > 0 && currentWave !== ui._lastWaveNumber) {
        ui._lastWaveNumber = currentWave;
        ui.showWaveAnnouncement(currentWave);
      }
    }
  }

  // ============ STARTUP ============
  function safeInit() {
    try {
      init();
    } catch (e) {
      console.error('STG Game init failed:', e);
      // Show error screen
      var loadingEl = document.getElementById('loading-screen');
      if (loadingEl) loadingEl.style.display = 'none';
      var errorEl = document.getElementById('error-screen');
      if (errorEl) errorEl.style.display = 'flex';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }

})();
