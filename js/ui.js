/**
 * STG Game UI Manager
 * Handles all DOM-based UI: HUD updates, menus, screens, overlays, toasts.
 *
 * Global: window.UIManager = class, window.ui = singleton instance
 * Reads game state from window.game, reads config from GAME_CONFIG
 */

class UIManager {
  constructor() {
    // Cache frequently accessed DOM elements
    const gid = (id) => document.getElementById(id);

    // HUD
    this.elHud = gid('hud');
    this.elHpFill = gid('hp-fill');
    this.elHpText = gid('hp-text');
    this.elScoreText = gid('score-text');
    this.elLevelText = gid('level-text');
    this.elXpFill = gid('xp-fill');
    this.elKillsText = gid('kills-text');
    this.elTimeText = gid('time-text');
    this.elComboText = gid('combo-text');

    // Toast / Pause
    this.elToast = gid('toast');
    this.elPauseOverlay = gid('pause-overlay');

    // Menu buttons
    this.elBtnStart = gid('btn-start');
    this.elBtnLeaderboard = gid('btn-leaderboard');
    this.elBtnHowto = gid('btn-howto');
    this.elBtnBackMenu = gid('btn-back-menu');

    // Star coin earned display (reused for gold)
    this.elStarCoinEarned = gid('star-coin-earned');

    // Screens
    this.elMenuScreen = gid('menu-screen');
    this.elCharSelectScreen = gid('char-select-screen');
    this.elCharSelect = gid('char-select');
    this.elLevelUp = gid('level-up');
    this.elSkillChoices = gid('skill-choices');
    this.elGameOver = gid('game-over');
    this.elFinalScore = gid('final-score');
    this.elGameStats = gid('game-stats');
    this.elBtnRestart = gid('btn-restart');
    this.elBtnMenu = gid('btn-menu');
    this.elLeaderboard = gid('leaderboard');
    this.elLbList = gid('lb-list');
    this.elBtnBackFromLb = gid('btn-back-from-lb');
    this.elHowtoScreen = gid('howto-screen');
    this.elBtnBackFromHowto = gid('btn-back-from-howto');

    // Fusion notification
    this.elFusionNotification = gid('fusion-notification');
    this.elFusionDesc = gid('fusion-notification-desc');

    // Toast timer ref
    this._toastTimer = null;

    // Combo fade timer
    this._comboFadeTimer = null;

    // Fusion notification timer
    this._fusionNotificationTimer = null;

    // Callbacks (set by main.js)
    this.onStartGame = null;       // (factionId) => {}
    this.onSkillSelected = null;   // (skillId) => {}
    this.onRestart = null;         // () => {}
    this.onMenu = null;            // () => {}
    this.onPauseToggle = null;     // () => {}
    this.onFusionExecute = null;   // (fusionData) => {}

    // Init
    this._attachEvents();
  }

  // ====================================================================
  //  Screen Management
  // ====================================================================

  showScreen(id) {
    this.hideAllScreens();
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
  }

  hideAllScreens() {
    const screens = document.querySelectorAll('.menu-screen');
    for (let i = 0; i < screens.length; i++) {
      screens[i].style.display = 'none';
    }
    // Also hide level-up (it's not .menu-screen)
    if (this.elLevelUp) this.elLevelUp.style.display = 'none';
  }

  showHUD() {
    if (this.elHud) this.elHud.style.display = 'flex';
  }

  hideHUD() {
    if (this.elHud) this.elHud.style.display = 'none';
  }

  // ====================================================================
  //  Event Wiring (attached once on init)
  // ====================================================================

  _attachEvents() {
    // Menu screen buttons
    if (this.elBtnStart) {
      this.elBtnStart.addEventListener('click', () => {
        this._showCharacterSelect();
      });
    }

    if (this.elBtnLeaderboard) {
      this.elBtnLeaderboard.addEventListener('click', () => {
        this.showLeaderboard();
      });
    }

    if (this.elBtnHowto) {
      this.elBtnHowto.addEventListener('click', () => {
        this.showScreen('howto-screen');
      });
    }

    // Codex button
    const btnCodex = document.getElementById('btn-codex');
    if (btnCodex) {
      btnCodex.addEventListener('click', () => {
        this.showCodex();
      });
    }

    // Settings button
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        this.showScreen('settings-screen');
      });
    }

    // Back buttons (multiple may share same ID convention)
    const backButtons = document.querySelectorAll('#btn-back-menu');
    for (let i = 0; i < backButtons.length; i++) {
      backButtons[i].addEventListener('click', () => {
        this.showScreen('menu-screen');
      });
    }

    if (this.elBtnBackFromLb) {
      this.elBtnBackFromLb.addEventListener('click', () => {
        this.showScreen('menu-screen');
      });
    }

    if (this.elBtnBackFromHowto) {
      this.elBtnBackFromHowto.addEventListener('click', () => {
        this.showScreen('menu-screen');
      });
    }

    // Codex back button
    const btnBackFromCodex = document.getElementById('btn-back-from-codex');
    if (btnBackFromCodex) {
      btnBackFromCodex.addEventListener('click', () => {
        this.showScreen('menu-screen');
      });
    }

    // Settings back button
    const btnBackFromSettings = document.getElementById('btn-back-from-settings');
    if (btnBackFromSettings) {
      btnBackFromSettings.addEventListener('click', () => {
        this.showScreen('menu-screen');
      });
    }

    // Codex tabs
    const codexTabs = document.querySelectorAll('.codex-tab');
    for (const tab of codexTabs) {
      tab.addEventListener('click', () => {
        // Remove active from all tabs
        for (const t of codexTabs) t.classList.remove('active');
        tab.classList.add('active');
        this._renderCodexContent(tab.dataset.tab);
      });
    }

    // Settings sliders
    const masterVol = document.getElementById('master-volume');
    const sfxVol = document.getElementById('sfx-volume');
    const musicVol = document.getElementById('music-volume');
    const screenShake = document.getElementById('screen-shake');

    if (masterVol) masterVol.addEventListener('input', () => {
      if (window.audio) window.audio.masterVolume = masterVol.value / 100;
    });
    if (sfxVol) sfxVol.addEventListener('input', () => {
      if (window.audio) window.audio.sfxVolume = sfxVol.value / 100;
    });
    if (musicVol) musicVol.addEventListener('input', () => {
      if (window.audio) window.audio.bgmVolume = musicVol.value / 100;
    });
    if (screenShake) screenShake.addEventListener('change', () => {
      if (window.game) window.game.screenShakeEnabled = screenShake.checked;
    });

    // Game Over buttons
    if (this.elBtnRestart) {
      this.elBtnRestart.addEventListener('click', () => {
        if (this.onRestart) this.onRestart();
      });
    }

    if (this.elBtnMenu) {
      this.elBtnMenu.addEventListener('click', () => {
        if (this.onMenu) this.onMenu();
      });
    }

    // Keyboard pause
    document.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        // Only toggle during gameplay
        if (game && game.scene === GAME_CONFIG.SCENES.GAMEPLAY) {
          if (this.onPauseToggle) this.onPauseToggle();
        }
      }
    });

    // Delegate click on skill choices (dynamic content)
    if (this.elSkillChoices) {
      this.elSkillChoices.addEventListener('click', (e) => {
        const card = e.target.closest('.skill-card');
        if (card && card.dataset.skillId) {
          if (this.onSkillSelected) {
            this.onSkillSelected(card.dataset.skillId);
          }
        }
      });
    }
  }

  // ====================================================================
  //  Character Select
  // ====================================================================

  _showCharacterSelect() {
    const container = this.elCharSelect;
    if (!container) return;

    // Clear previous cards
    container.innerHTML = '';

    const factions = GAME_CONFIG.FACTIONS;
    for (const key in factions) {
      const f = factions[key];
      const card = document.createElement('div');
      card.className = 'char-card';
      card.dataset.factionId = f.id;

      const icon = document.createElement('div');
      icon.className = 'icon';
      icon.textContent = f.icon || '?';

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = f.name;

      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.textContent = f.description;

      card.appendChild(icon);
      card.appendChild(name);
      card.appendChild(desc);

      card.addEventListener('click', () => {
        if (this.onStartGame) {
          this.onStartGame(f.id);
        }
      });

      container.appendChild(card);
    }

    // Make char-select visible (via CSS flex)
    container.style.display = 'flex';
    this.showScreen('char-select-screen');
  }

  // ====================================================================
  //  HUD Updates (called each frame or on change)
  // ====================================================================

  updateHP(current, max) {
    const pct = max > 0 ? Math.max(0, current / max * 100) : 0;
    if (this.elHpFill) this.elHpFill.style.width = pct + '%';
    if (this.elHpText) this.elHpText.textContent = Math.ceil(current) + '/' + max;
  }

  updateScore(score) {
    if (this.elScoreText) this.elScoreText.textContent = score;
  }

  updateLevel(level) {
    if (this.elLevelText) this.elLevelText.textContent = level;
  }

  updateXP(current, needed) {
    const pct = needed > 0 ? Math.min(100, Math.max(0, current / needed * 100)) : 0;
    if (this.elXpFill) this.elXpFill.style.width = pct + '%';
  }

  updateKills(kills) {
    if (this.elKillsText) this.elKillsText.textContent = kills;
  }

  updateTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const str = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    if (this.elTimeText) this.elTimeText.textContent = str;
  }

  updateCombo(combo) {
    if (!this.elComboText) return;

    // Clear any pending fade
    if (this._comboFadeTimer) {
      clearTimeout(this._comboFadeTimer);
      this._comboFadeTimer = null;
    }

    if (combo > 1) {
      this.elComboText.textContent = combo + ' COMBO!';
      this.elComboText.classList.add('active');
    } else if (combo <= 1) {
      // Combo just ended — schedule fade out
      this._comboFadeTimer = setTimeout(() => {
        if (this.elComboText) {
          this.elComboText.classList.remove('active');
          this.elComboText.textContent = '';
        }
        this._comboFadeTimer = null;
      }, GAME_CONFIG.BALANCE.COMBO_TIMEOUT || 3000);
    }
  }

  /**
   * Convenience: update all HUD elements from current game state.
   * Called each frame by main loop.
   */
  updateAll() {
    if (!game || !game.player) return;

    const p = game.player;
    this.updateHP(p.hp, p.maxHp);
    this.updateScore(game.score);
    this.updateLevel(p.level || 1);
    this.updateXP(p.xp || 0, p.xpNeeded || 100);
    this.updateKills(game.kills);
    this.updateTime(game.gameTime / 1000);
    this.updateCombo(game.combo);

    // Pause overlay visibility
    this.updatePause();
  }

  // ====================================================================
  //  Level-Up Overlay
  // ====================================================================

  showLevelUp(choices, onSelect) {
    const container = this.elSkillChoices;
    if (!container) return;

    // Build choice cards (skills and weapons)
    container.innerHTML = '';
    for (let i = 0; i < choices.length; i++) {
      const item = choices[i];
      const isWeapon = item._choiceType === 'weapon';
      const data = item._data;

      const card = document.createElement('div');
      card.className = 'skill-card rarity-' + (data.rarity || 'common');
      if (isWeapon) {
        card.classList.add('weapon-card');
        // Add bullet color accent
        card.style.borderColor = data.bulletColor || '#fff';
      }

      // Icon line
      const iconEl = document.createElement('div');
      iconEl.className = 'skill-icon';
      iconEl.textContent = data.icon || '';
      iconEl.style.fontSize = '24px';
      iconEl.style.marginBottom = '4px';
      card.appendChild(iconEl);

      // Name
      const nameEl = document.createElement('div');
      nameEl.className = 'skill-name';
      if (isWeapon) {
        const curLvl = item._currentLevel || 0;
        const nextLvl = item._nextLevel || 1;
        const upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
        const lvlLabel = upgradeCfg && upgradeCfg.descriptions ? upgradeCfg.descriptions[nextLvl] : '';
        if (curLvl === 0) {
          nameEl.textContent = data.name;
        } else {
          nameEl.textContent = data.name + ' ' + lvlLabel;
        }
      } else {
        nameEl.textContent = data.name || data.id;
      }
      card.appendChild(nameEl);

      // Description
      const descEl = document.createElement('div');
      descEl.className = 'skill-desc';
      if (isWeapon) {
        descEl.textContent = data.description || '';
        // Show upgrade preview for owned weapons
        if (item._currentLevel > 0) {
          const upgradeCfg = GAME_CONFIG.WEAPON_UPGRADE;
          if (upgradeCfg) {
            const curLvl = item._currentLevel;
            const nextLvl = item._nextLevel;
            const dmgCur = upgradeCfg.damageMult[curLvl] || 1;
            const dmgNext = upgradeCfg.damageMult[nextLvl] || dmgCur;
            const rateCur = upgradeCfg.fireRateMult[curLvl] || 1;
            const rateNext = upgradeCfg.fireRateMult[nextLvl] || rateCur;
            const upgradeText = '伤害 x' + dmgNext.toFixed(2) + ' | 射速 x' + rateNext.toFixed(2);
            const upgradeEl = document.createElement('div');
            upgradeEl.className = 'weapon-upgrade-info';
            upgradeEl.textContent = upgradeText;
            upgradeEl.style.fontSize = '9px';
            upgradeEl.style.color = '#88ff88';
            upgradeEl.style.marginTop = '2px';
            descEl.appendChild(upgradeEl);
          }
        }
      } else {
        descEl.textContent = data.description || '';
      }
      card.appendChild(descEl);

      // Type badge (for weapons)
      if (isWeapon) {
        const typeEl = document.createElement('div');
        typeEl.className = 'skill-type';
        typeEl.textContent = item._currentLevel > 0 ? '⬆️ 升级武器' : '🆕 新武器';
        typeEl.style.fontSize = '9px';
        typeEl.style.color = item._currentLevel > 0 ? '#ffdd44' : '#44ddff';
        typeEl.style.marginTop = '2px';
        card.appendChild(typeEl);
      }

      // Rarity label
      const rarityEl = document.createElement('div');
      rarityEl.className = 'skill-rarity';
      rarityEl.textContent = this._rarityLabel(data.rarity);
      card.appendChild(rarityEl);

      // Click handler: pass full item object back
      card.addEventListener('click', (function(selectedItem) {
        return function() {
          if (typeof onSelect === 'function') {
            onSelect(selectedItem);
          }
        };
      })(item));

      container.appendChild(card);
    }

    // Show the overlay as flex
    if (this.elLevelUp) this.elLevelUp.style.display = 'flex';
  }

  hideLevelUp() {
    if (this.elLevelUp) this.elLevelUp.style.display = 'none';
  }

  // ====================================================================
  //  Fusion UI
  // ====================================================================

  /**
   * Show fusion notification banner.
   * @param {Array} fusions - Array of available fusion objects { type, recipe }
   */
  showFusionNotification(fusions) {
    if (!this.elFusionNotification || !fusions || fusions.length === 0) return;

    var desc = '';
    for (var i = 0; i < fusions.length; i++) {
      var f = fusions[i];
      if (i > 0) desc += ' | ';
      desc += f.recipe.icon + ' ' + f.recipe.name;
    }
    if (this.elFusionDesc) this.elFusionDesc.textContent = '点击融合: ' + desc;
    this.elFusionNotification.style.display = 'block';

    // Auto-hide after 8 seconds
    if (this._fusionNotificationTimer) clearTimeout(this._fusionNotificationTimer);
    this._fusionNotificationTimer = setTimeout(() => {
      this.hideFusionNotification();
    }, 8000);
  }

  /**
   * Hide fusion notification banner.
   */
  hideFusionNotification() {
    if (this.elFusionNotification) this.elFusionNotification.style.display = 'none';
    if (this._fusionNotificationTimer) {
      clearTimeout(this._fusionNotificationTimer);
      this._fusionNotificationTimer = null;
    }
  }

  /**
   * Add fusion cards to the level-up choices.
   * Called before showing level-up overlay when fusions are available.
   * @param {Array} fusions - Array of available fusion objects { type, recipe }
   * @param {HTMLElement} container - The skill-choices container
   */
  addFusionCards(fusions, container, onSelect) {
    if (!fusions || fusions.length === 0 || !container) return;

    for (var i = 0; i < fusions.length; i++) {
      var fusion = fusions[i];
      var recipe = fusion.recipe;

      var card = document.createElement('div');
      card.className = 'skill-card fusion-card';
      card.setAttribute('data-fusion-id', recipe.id);
      card.setAttribute('data-fusion-type', fusion.type);

      // Icon
      var iconEl = document.createElement('div');
      iconEl.className = 'skill-icon';
      iconEl.textContent = recipe.icon;
      iconEl.style.fontSize = '24px';
      iconEl.style.marginBottom = '4px';
      card.appendChild(iconEl);

      // Name
      var nameEl = document.createElement('div');
      nameEl.className = 'skill-name';
      nameEl.textContent = '🔮 ' + recipe.name;
      card.appendChild(nameEl);

      // Description
      var descEl = document.createElement('div');
      descEl.className = 'skill-desc';
      descEl.textContent = recipe.description;
      card.appendChild(descEl);

      // Ingredients
      var ingredEl = document.createElement('div');
      ingredEl.className = 'fusion-ingredients';
      ingredEl.textContent = '⚡ 点击融合';
      card.appendChild(ingredEl);

      // Type badge
      var typeEl = document.createElement('div');
      typeEl.className = 'skill-type';
      typeEl.textContent = '✨ 融合';
      typeEl.style.fontSize = '9px';
      typeEl.style.color = '#ff88ff';
      typeEl.style.marginTop = '2px';
      card.appendChild(typeEl);

      // Rarity label
      var rarityEl = document.createElement('div');
      rarityEl.className = 'skill-rarity';
      rarityEl.textContent = '传说';
      rarityEl.style.color = '#ffaa00';
      card.appendChild(rarityEl);

      // Create a fusion item object that works with the onSelect callback
      var fusionItem = {
        _choiceType: 'fusion',
        _fusionType: fusion.type,
        _recipe: recipe,
        _data: { id: recipe.result, name: recipe.name, rarity: 'legendary' }
      };

      // Click handler using onSelect callback (same pattern as regular cards)
      card.addEventListener('click', (function(selectedItem) {
        return function() {
          if (typeof onSelect === 'function') {
            onSelect(selectedItem);
          }
        };
      })(fusionItem));

      container.appendChild(card);
    }
  }

  /**
   * Show fusion confirmation overlay.
   * @param {object} recipe - Fusion recipe
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function} onCancel - Callback when cancelled
   */
  showFusionConfirm(recipe, onConfirm, onCancel) {
    // Create overlay
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:35;display:flex;flex-direction:column;align-items:center;justify-content:center;';

    var title = document.createElement('div');
    title.style.cssText = 'font-size:24px;font-weight:bold;color:#ff88ff;margin-bottom:16px;text-shadow:0 0 20px rgba(255,136,255,0.6);';
    title.textContent = '🔮 融合确认';
    overlay.appendChild(title);

    var name = document.createElement('div');
    name.style.cssText = 'font-size:20px;font-weight:bold;color:#fff;margin-bottom:8px;';
    name.textContent = recipe.icon + ' ' + recipe.name;
    overlay.appendChild(name);

    var desc = document.createElement('div');
    desc.style.cssText = 'font-size:13px;color:#ccaaff;margin-bottom:24px;text-align:center;max-width:300px;';
    desc.textContent = recipe.description;
    overlay.appendChild(desc);

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:16px;';

    var btnConfirm = document.createElement('button');
    btnConfirm.className = 'menu-btn highlight';
    btnConfirm.textContent = '确认融合';
    btnConfirm.style.cssText = 'background:linear-gradient(135deg,#6633aa,#3366aa);border:2px solid #ff44ff;';
    btnConfirm.addEventListener('click', function() {
      document.body.removeChild(overlay);
      if (typeof onConfirm === 'function') onConfirm();
    });
    btnRow.appendChild(btnConfirm);

    var btnCancel = document.createElement('button');
    btnCancel.className = 'menu-btn';
    btnCancel.textContent = '取消';
    btnCancel.addEventListener('click', function() {
      document.body.removeChild(overlay);
      if (typeof onCancel === 'function') onCancel();
    });
    btnRow.appendChild(btnCancel);

    overlay.appendChild(btnRow);
    document.getElementById('ui-overlay').appendChild(overlay);
  }

  // ====================================================================
  _rarityLabel(rarity) {
    const labels = {
      common: '普通',
      uncommon: '稀有',
      rare: '罕见',
      epic: '史诗',
      legendary: '传说'
    };
    return labels[rarity] || rarity || '';
  }

  // ====================================================================
  //  Game Over Screen
  // ====================================================================

  showGameOver(stats) {
    // Populate final score
    if (this.elFinalScore) {
      this.elFinalScore.textContent = stats.score || 0;
    }

    // Show gold earned
    if (this.elStarCoinEarned) {
      var earned = stats.goldEarned || 0;
      if (earned > 0) {
        this.elStarCoinEarned.textContent = '💰 +' + earned + ' 金币';
        this.elStarCoinEarned.style.display = 'block';
      } else {
        this.elStarCoinEarned.style.display = 'none';
      }
    }

    // Populate stats text
    if (this.elGameStats) {
      const s = stats;
      this.elGameStats.innerHTML =
        '💀 击杀: ' + (s.kills || 0) + '<br>' +
        '⬆️ 等级: ' + (s.level || 1) + '<br>' +
        '⏱️ 时间: ' + this._formatTime(s.time || 0) + '<br>' +
        '🔥 最高连击: ' + (s.maxCombo || 0) + '<br>' +
        '🎯 流派: ' + (s.faction || '--');
    }

    // Show the game over screen
    this.hideAllScreens();
    this.hideHUD();
    this.hidePause();
    this.showScreen('game-over');
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  // ====================================================================
  //  Leaderboard Display
  // ====================================================================

  showLeaderboard() {
    const list = this.elLbList;
    if (!list) return;

    // Get data from LeaderboardManager if available
    let entries = [];
    if (window.LeaderboardManager && typeof window.LeaderboardManager.getLeaderboard === 'function') {
      entries = window.LeaderboardManager.getLeaderboard();
    } else if (window.LeaderboardManager && Array.isArray(window.LeaderboardManager.getLeaderboard)) {
      // Fallback: treat as array
      entries = [];
    }

    // Build entries
    list.innerHTML = '';

    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lb-entry';
      empty.style.justifyContent = 'center';
      empty.style.color = '#888';
      empty.textContent = '暂无记录';
      list.appendChild(empty);
    } else {
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const row = document.createElement('div');
        row.className = 'lb-entry';

        const rank = document.createElement('span');
        rank.className = 'rank';
        rank.textContent = (i + 1);

        const name = document.createElement('span');
        name.textContent = e.name || '???';

        const score = document.createElement('span');
        score.className = 'score';
        score.textContent = e.score || 0;

        const date = document.createElement('span');
        date.style.fontSize = '11px';
        date.style.color = '#666';
        date.textContent = e.date || '';

        row.appendChild(rank);
        row.appendChild(name);
        row.appendChild(score);
        row.appendChild(date);
        list.appendChild(row);
      }
    }

    this.showScreen('leaderboard');
  }

  // ====================================================================
  //  Toast Messages
  // ====================================================================

  showToast(text, duration) {
    if (!this.elToast) return;
    duration = duration || 2000;

    // Clear any existing timer
    if (this._toastTimer) {
      clearTimeout(this._toastTimer);
      this._toastTimer = null;
    }

    this.elToast.textContent = text;
    this.elToast.classList.add('show');

    this._toastTimer = setTimeout(() => {
      if (this.elToast) {
        this.elToast.classList.remove('show');
        this.elToast.textContent = '';
      }
      this._toastTimer = null;
    }, duration);
  }

  // ====================================================================
  //  Pause Overlay
  // ====================================================================

  updatePause() {
    if (!this.elPauseOverlay) return;
    if (game && game.isPaused) {
      this.elPauseOverlay.style.display = 'flex';
    } else {
      this.elPauseOverlay.style.display = 'none';
    }
  }

  showPause() {
    if (this.elPauseOverlay) this.elPauseOverlay.style.display = 'flex';
  }

  hidePause() {
    if (this.elPauseOverlay) this.elPauseOverlay.style.display = 'none';
  }

  // ====================================================================
  //  Codex (图鉴)
  // ====================================================================

  showCodex() {
    this.showScreen('codex-screen');
    // Default to weapons tab
    const tabs = document.querySelectorAll('.codex-tab');
    for (const t of tabs) t.classList.remove('active');
    if (tabs[0]) tabs[0].classList.add('active');
    this._renderCodexContent('weapons');
  }

  _renderCodexContent(tab) {
    const container = document.getElementById('codex-content');
    if (!container) return;
    container.innerHTML = '';

    const cfg = GAME_CONFIG;

    if (tab === 'weapons') {
      // Render weapons
      for (const [id, w] of Object.entries(cfg.WEAPONS)) {
        const card = document.createElement('div');
        card.className = 'codex-card';
        card.innerHTML = `
          <div class="codex-card-icon">${w.icon || '🔫'}</div>
          <div class="codex-card-name">${w.name || id}</div>
          <div class="codex-card-desc">${w.description || w.pattern || ''}</div>
          ${w.fusionRecipe ? '<div class="codex-card-fusion">🔮 可融合</div>' : ''}
        `;
        container.appendChild(card);
      }
    } else if (tab === 'skills') {
      // Render skills
      for (const skill of cfg.SKILLS) {
        const card = document.createElement('div');
        card.className = 'codex-card';
        card.innerHTML = `
          <div class="codex-card-icon">${skill.icon || '✨'}</div>
          <div class="codex-card-name">${skill.name || skill.id}</div>
          <div class="codex-card-desc">${skill.description || ''}</div>
          ${skill.fusionRecipe ? '<div class="codex-card-fusion">🔮 可融合</div>' : ''}
        `;
        container.appendChild(card);
      }
    } else if (tab === 'factions') {
      // Render factions
      for (const [id, f] of Object.entries(cfg.FACTIONS)) {
        const card = document.createElement('div');
        card.className = 'codex-card';
        card.innerHTML = `
          <div class="codex-card-icon">${f.icon || '🎯'}</div>
          <div class="codex-card-name" style="color:${f.color}">${f.name || id}</div>
          <div class="codex-card-desc">${f.description || ''}</div>
        `;
        container.appendChild(card);
      }
    }
  }
}

// ====================================================================
//  Singleton export
// ====================================================================
window.UIManager = UIManager;
window.ui = new UIManager();
