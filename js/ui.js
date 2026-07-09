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

    // HUD - Wave display
    this.elWaveDisplay = gid('wave-display');
    this.elWaveProgress = gid('wave-progress');
    this.elWaveProgressFill = gid('wave-progress-fill');
    this.elGameTimerHud = gid('game-timer-hud');
    this._waveFadeTimer = null;
    this._lastWaveNumber = 0;

    // HUD - Boss HP bar
    this.elBossBar = gid('boss-bar');
    this.elBossName = gid('boss-name');
    this.elBossHpFill = gid('boss-hp-fill');
    this.elBossHpPct = gid('boss-hp-pct');

    // HUD - Skill bar
    this.elSkillBar = gid('skill-bar');
    this.elActiveSkillRow = gid('active-skill-row');
    this.elPassiveSkillRow = gid('passive-skill-row');

    // HUD - Weapon bar
    this.elWeaponBar = gid('weapon-bar');

    // HUD - Pause button (手机端)
    this.elHudPauseBtn = gid('hud-pause-btn');

    // HUD - Buff bar
    this.elBuffBar = gid('buff-bar');

    // HUD - Minimap
    this.elMinimap = gid('minimap');
    this._minimapCtx = this.elMinimap ? this.elMinimap.getContext('2d') : null;

    // Low HP warning
    this.elLowHpWarning = gid('low-hp-warning');
    this._lowHpActive = false;
    this._lowHpCritical = false;

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

    // Meta Shop
    this.elMetaShopScreen = gid('meta-shop-screen');
    this.elMetaShopCoins = gid('meta-shop-coins');
    this.elMetaShopItems = gid('meta-shop-items');
    this._metaShopCategory = 'consumable';

    // Screens
    this.elMenuScreen = gid('menu-screen');
    this.elCharSelectScreen = gid('char-select-screen');
    this.elCharSelect = gid('char-select');
    this.elLevelUp = gid('level-up');
    this.elSkillChoices = gid('skill-choices');
    this.elGameOver = gid('game-over');
    this.elFinalScore = gid('final-score');
    this.elGameStats = gid('game-stats');
    this.elSettlementStats = gid('settlement-stats');
    this.elBtnRestart = gid('btn-restart');
    this.elBtnMenu = gid('btn-menu');
    this.elBtnShare = gid('btn-share');
    this.elLeaderboard = gid('leaderboard');
    this.elLbList = gid('lb-list');
    this.elBtnBackFromLb = gid('btn-back-from-lb');
    this.elHowtoScreen = gid('howto-screen');
    this.elBtnBackFromHowto = gid('btn-back-from-howto');

    // Fusion notification
    this.elFusionNotification = gid('fusion-notification');
    this.elFusionDesc = gid('fusion-notification-desc');

    // Fusion notification click handler — show fusion confirm overlay
    if (this.elFusionNotification) {
      this.elFusionNotification.addEventListener('click', () => {
        this._onFusionNotificationClick();
      });
    }

    // Toast timer ref
    this._toastTimer = null;

    // Combo fade timer
    this._comboFadeTimer = null;

    // Fusion notification timer
    this._fusionNotificationTimer = null;

    // HUD auto-update loop (requestAnimationFrame)
    this._hudRAFId = null;
    this._hudUpdateBound = this._hudUpdateLoop.bind(this);

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
    // 显示悬浮按钮组(手机端右上角)
    var btnGroup = document.getElementById('hud-btn-group');
    if (btnGroup) btnGroup.style.removeProperty('display');
    if (this.elHudPauseBtn) this.elHudPauseBtn.style.removeProperty('display');
    this._startHUDLoop();
  }

  hideHUD() {
    if (this.elHud) this.elHud.style.display = 'none';
    // 隐藏悬浮按钮组
    var btnGroup = document.getElementById('hud-btn-group');
    if (btnGroup) btnGroup.style.display = 'none';
    if (this.elHudPauseBtn) this.elHudPauseBtn.style.display = 'none';
    this._stopHUDLoop();
  }

  /**
   * Start the HUD auto-update loop (called when HUD becomes visible).
   * Uses requestAnimationFrame for smooth updates.
   */
  _startHUDLoop() {
    if (this._hudRAFId) return; // Already running
    this._hudRAFId = requestAnimationFrame(this._hudUpdateBound);
  }

  /**
   * Stop the HUD auto-update loop.
   */
  _stopHUDLoop() {
    if (this._hudRAFId) {
      cancelAnimationFrame(this._hudRAFId);
      this._hudRAFId = null;
    }
  }

  /**
   * HUD update loop - called every animation frame.
   * Only runs during gameplay scene.
   */
  _hudUpdateLoop() {
    this._hudRAFId = null;
    if (!game || game.scene !== GAME_CONFIG.SCENES.GAMEPLAY || game.isPaused) {
      // Don't continue the loop if not in gameplay
      return;
    }
    this.updateHUD();
    this._hudRAFId = requestAnimationFrame(this._hudUpdateBound);
  }

  // ====================================================================
  //  Event Wiring (attached once on init)
  // ====================================================================

  _attachEvents() {
    // Menu screen buttons
    if (this.elBtnStart) {
      this.elBtnStart.addEventListener('click', () => {
        this._showCharacterSelectScreen();
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

    // Meta Shop button (main menu)
    const btnMetaShop = document.getElementById('btn-meta-shop');
    if (btnMetaShop) {
      btnMetaShop.addEventListener('click', () => {
        this.showMetaShop();
      });
    }

    // Meta Shop back button
    const btnBackFromShop = document.getElementById('btn-back-from-shop');
    if (btnBackFromShop) {
      btnBackFromShop.addEventListener('click', () => {
        this.showScreen('menu-screen');
      });
    }

    // Meta Shop tabs (consumable / permanent)
    const metaShopTabs = document.querySelectorAll('.meta-shop-tab');
    for (var t = 0; t < metaShopTabs.length; t++) {
      (function(self, tab) {
        tab.addEventListener('click', function() {
          for (var j = 0; j < metaShopTabs.length; j++) metaShopTabs[j].classList.remove('active');
          tab.classList.add('active');
          self._metaShopCategory = tab.getAttribute('data-category');
          self._renderMetaShopItems(self._metaShopCategory);
        });
      })(this, metaShopTabs[t]);
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

    // Character select back button
    const btnBackFromChar = document.getElementById('btn-back-from-char');
    if (btnBackFromChar) {
      btnBackFromChar.addEventListener('click', () => {
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

    // Effects quality select
    const effectsQuality = document.getElementById('effects-quality');
    if (effectsQuality) {
      // Load saved preference
      try {
        var savedQuality = localStorage.getItem('stg_effects_quality');
        if (savedQuality) effectsQuality.value = savedQuality;
      } catch (e) {}
      effectsQuality.addEventListener('change', () => {
        var q = effectsQuality.value;
        try { localStorage.setItem('stg_effects_quality', q); } catch (e) {}
        if (window.game) window.game.effectsQuality = q;
        this.showToast('✨ 特效质量: ' + (q === 'low' ? '低' : q === 'high' ? '高' : '中'), 1500);
      });
    }

    // Fullscreen toggle (delegates to unified window.toggleFullscreen in core.js)
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('change', () => {
        if (typeof window.toggleFullscreen === 'function') {
          window.toggleFullscreen();
        }
      });
      // Note: fullscreenchange sync is handled globally in core.js init()
    }

    // 重置数据按钮
    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        this._showResetConfirm();
      });
    }

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

    // 暂停按钮点击事件 (手机端)
    const pauseBtn = document.getElementById('hud-pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (game && game.scene === GAME_CONFIG.SCENES.GAMEPLAY) {
          if (this.onPauseToggle) this.onPauseToggle();
        }
      });
    }

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
  //  Character & Faction Select
  // ====================================================================

  /**
   * Show character selection screen (角色选择).
   * Flow: Menu → Character Select → Faction Select → Game
   */
  _showCharacterSelectScreen() {
    const container = document.getElementById('character-select');
    if (!container) return;
    container.innerHTML = '';

    const characters = GAME_CONFIG.CHARACTERS;
    const unlockedChars = this._getUnlockedCharacters();

    for (const key in characters) {
      const char = characters[key];
      const isUnlocked = unlockedChars.includes(key);

      const card = document.createElement('div');
      card.className = 'character-card' + (isUnlocked ? '' : ' locked');
      card.dataset.characterId = char.id;

      const icon = document.createElement('div');
      icon.className = 'char-icon';
      icon.textContent = char.icon || '?';

      const name = document.createElement('div');
      name.className = 'char-name';
      name.style.color = char.color;
      name.textContent = char.name;

      const desc = document.createElement('div');
      desc.className = 'char-desc';
      desc.textContent = char.description;

      card.appendChild(icon);
      card.appendChild(name);
      card.appendChild(desc);

      if (!isUnlocked) {
        const unlockText = document.createElement('div');
        unlockText.className = 'char-unlock';
        unlockText.textContent = this._getUnlockCondition(key);
        card.appendChild(unlockText);
      } else {
        card.addEventListener('click', () => {
          this._selectedCharacter = key;
          this._showFactionSelectScreen();
        });
      }

      container.appendChild(card);
    }

    container.style.display = 'flex';
    this.showScreen('character-select-screen');
  }

  /**
   * Get unlocked characters from localStorage.
   * 所有角色默认解锁。
   */
  _getUnlockedCharacters() {
    // 返回所有角色key
    var allChars = [];
    var characters = GAME_CONFIG.CHARACTERS;
    for (var key in characters) {
      allChars.push(key);
    }
    return allChars;
  }

  /**
   * Save unlocked characters to localStorage.
   */
  _saveUnlockedCharacters(list) {
    try {
      localStorage.setItem('stg_unlocked_characters', JSON.stringify(list));
    } catch (e) {}
  }

  /**
   * Check and unlock characters based on conditions.
   * 所有角色已默认解锁，此方法保留兼容性但不再执行解锁逻辑。
   */
  checkCharacterUnlocks(totalKills, bossDefeated) {
    // 所有角色默认已解锁，无需检查
  }

  /**
   * Get unlock condition text for a character.
   */
  _getUnlockCondition(charId) {
    switch (charId) {
      case 'vanguard': return '默认解锁';
      case 'ironWall': return '累计击杀500敌人解锁';
      case 'agile': return '击败BOSS解锁';
      default: return '未解锁';
    }
  }

  /**
   * Show faction selection screen (流派选择).
   * Called after character is selected.
   */
  _showFactionSelectScreen() {
    const container = this.elCharSelect;
    if (!container) return;

    // Clear previous cards
    container.innerHTML = '';

    // === Character Selection Section ===
    var charSection = document.createElement('div');
    charSection.className = 'faction-char-section';

    var charLabel = document.createElement('div');
    charLabel.className = 'faction-char-label';
    charLabel.textContent = '选择战机';
    charSection.appendChild(charLabel);

    var charRow = document.createElement('div');
    charRow.className = 'faction-char-row';

    var characters = GAME_CONFIG.CHARACTERS;
    var unlockedChars = this._getUnlockedCharacters();

    // Default to first unlocked character if none selected
    if (!this._selectedCharacter || !unlockedChars.includes(this._selectedCharacter)) {
      this._selectedCharacter = unlockedChars[0] || 'vanguard';
    }

    for (var key in characters) {
      var char = characters[key];
      var isUnlocked = unlockedChars.includes(key);

      var card = document.createElement('div');
      card.className = 'faction-char-card' + (isUnlocked ? '' : ' locked');
      if (key === this._selectedCharacter) card.classList.add('selected');

      var icon = document.createElement('div');
      icon.className = 'fc-icon';
      icon.textContent = char.icon || '?';

      var name = document.createElement('div');
      name.className = 'fc-name';
      name.style.color = char.color;
      name.textContent = char.name;

      var desc = document.createElement('div');
      desc.className = 'fc-desc';
      desc.textContent = char.description;

      card.appendChild(icon);
      card.appendChild(name);
      card.appendChild(desc);

      if (!isUnlocked) {
        var unlockText = document.createElement('div');
        unlockText.className = 'fc-unlock';
        unlockText.textContent = this._getUnlockCondition(key);
        card.appendChild(unlockText);
      } else {
        (function(self, charKey, charCard, row) {
          charCard.addEventListener('click', function() {
            self._selectedCharacter = charKey;
            row.querySelectorAll('.faction-char-card').forEach(function(c) { c.classList.remove('selected'); });
            charCard.classList.add('selected');
          });
        })(this, key, card, charRow);
      }

      charRow.appendChild(card);
    }

    charSection.appendChild(charRow);
    container.appendChild(charSection);

    // === Faction Selection Section ===
    var factionSection = document.createElement('div');
    factionSection.className = 'faction-section';

    var factionLabel = document.createElement('div');
    factionLabel.className = 'faction-char-label';
    factionLabel.textContent = '选择流派';
    factionSection.appendChild(factionLabel);

    var factionRow = document.createElement('div');
    factionRow.className = 'faction-row';

    var factions = GAME_CONFIG.FACTIONS;
    for (var fkey in factions) {
      var f = factions[fkey];
      var fcard = document.createElement('div');
      fcard.className = 'char-card';
      fcard.dataset.factionId = f.id;

      var ficon = document.createElement('div');
      ficon.className = 'icon';
      ficon.textContent = f.icon || '?';

      var fname = document.createElement('div');
      fname.className = 'name';
      fname.textContent = f.name;

      var fdesc = document.createElement('div');
      fdesc.className = 'desc';
      fdesc.textContent = f.description;

      fcard.appendChild(ficon);
      fcard.appendChild(fname);
      fcard.appendChild(fdesc);

      (function(self, factionId) {
        fcard.addEventListener('click', function() {
          if (self.onStartGame) {
            self.onStartGame(factionId, self._selectedCharacter);
          }
        });
      })(this, f.id);

      factionRow.appendChild(fcard);
    }

    factionSection.appendChild(factionRow);
    container.appendChild(factionSection);

    // Make char-select visible (via CSS flex)
    container.style.display = 'flex';
    this.showScreen('char-select-screen');
  }

  // ====================================================================
  //  Talent Tree Screen
  // ====================================================================

  /**
   * Show talent tree selection screen.
   * Called after faction is selected, before game starts.
   * @param {TalentManager} talentManager
   * @param {Function} onConfirm - callback when player confirms talents
   */
  showTalentScreen(talentManager, onConfirm) {
    this._talentMgr = talentManager;
    this._talentOnConfirm = onConfirm;
    this._activeBranch = talentManager.branches[0];

    this._renderTalentBranches();
    this._renderTalentTree();
    this._updateTalentPointsDisplay();
    this.showScreen('talent-screen');

    // Wire buttons
    var self = this;
    var btnConfirm = document.getElementById('btn-talent-confirm');
    if (btnConfirm) {
      btnConfirm.onclick = function() {
        if (self._talentOnConfirm) self._talentOnConfirm();
      };
    }
    var btnReset = document.getElementById('btn-talent-reset');
    if (btnReset) {
      btnReset.onclick = function() {
        self._talentMgr.reset();
        self._renderTalentTree();
        self._updateTalentPointsDisplay();
      };
    }
  }

  _renderTalentBranches() {
    var container = document.getElementById('talent-branches');
    if (!container) return;
    container.innerHTML = '';

    var cfg = GAME_CONFIG.TALENTS;
    var self = this;

    for (var i = 0; i < cfg.branches.length; i++) {
      var branchId = cfg.branches[i];
      var branchCfg = cfg[branchId];
      if (!branchCfg) continue;

      var tab = document.createElement('div');
      tab.className = 'talent-branch-tab' + (branchId === this._activeBranch ? ' active' : '');
      tab.style.setProperty('--branch-color', branchCfg.color || '#ffdd00');
      tab.textContent = (branchCfg.icon || '') + ' ' + (branchCfg.name || branchId);
      tab.dataset.branchId = branchId;

      (function(bid) {
        tab.addEventListener('click', function() {
          self._activeBranch = bid;
          self._renderTalentBranches();
          self._renderTalentTree();
        });
      })(branchId);

      container.appendChild(tab);
    }
  }

  _renderTalentTree() {
    var container = document.getElementById('talent-tree');
    if (!container) return;
    container.innerHTML = '';

    var cfg = GAME_CONFIG.TALENTS;
    var branchId = this._activeBranch;
    var branchCfg = cfg[branchId];
    if (!branchCfg || !branchCfg.layers) return;

    var self = this;
    var branchColor = branchCfg.color || '#ffdd00';

    for (var l = 0; l < branchCfg.layers.length; l++) {
      var layer = branchCfg.layers[l];
      var layerDiv = document.createElement('div');
      layerDiv.className = 'talent-layer';

      // Layer label
      var label = document.createElement('div');
      label.className = 'talent-layer-label';
      label.textContent = '第' + (l + 1) + '层';
      layerDiv.appendChild(label);

      var selectedInLayer = this._talentMgr.getSelectedInLayer(branchId, l);

      for (var t = 0; t < layer.length; t++) {
        var talent = layer[t];
        var node = document.createElement('div');
        node.className = 'talent-node';
        node.style.setProperty('--branch-color', branchColor);
        node.dataset.talentId = talent.id;
        node.dataset.branchId = branchId;
        node.dataset.layerIndex = l;

        var isSelected = selectedInLayer === talent.id;
        var canSelect = this._talentMgr.canSelect(branchId, l, talent.id);

        if (isSelected) {
          node.classList.add('selected');
        } else if (!canSelect && !isSelected) {
          node.classList.add('locked');
        }

        var icon = document.createElement('div');
        icon.className = 'talent-node-icon';
        icon.textContent = talent.icon || '⭐';

        var name = document.createElement('div');
        name.className = 'talent-node-name';
        name.textContent = talent.name;

        var desc = document.createElement('div');
        desc.className = 'talent-node-desc';
        desc.textContent = talent.description;

        node.appendChild(icon);
        node.appendChild(name);
        node.appendChild(desc);

        // Click handler
        (function(bid, lIdx, tId) {
          node.addEventListener('click', function() {
            if (self._talentMgr.select(bid, lIdx, tId)) {
              self._renderTalentTree();
              self._updateTalentPointsDisplay();
            }
          });
        })(branchId, l, talent.id);

        layerDiv.appendChild(node);
      }

      container.appendChild(layerDiv);
    }
  }

  _updateTalentPointsDisplay() {
    var el = document.getElementById('talent-points-remaining');
    if (el) {
      el.textContent = this._talentMgr ? this._talentMgr.remaining : 0;
    }
  }

  /**
   * Update talent points display (called externally after boss kill).
   */
  updateTalentPoints(remaining) {
    this._updateTalentPointsDisplay();
  }

  // ====================================================================
  //  HUD Updates (called each frame or on change)
  // ====================================================================

  updateHP(current, max) {
    const pct = max > 0 ? Math.max(0, current / max * 100) : 0;
    if (this.elHpFill) this.elHpFill.style.width = pct + '%';
    if (this.elHpText) this.elHpText.textContent = Math.floor(current) + '/' + max;
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
    if (this.elGameTimerHud) this.elGameTimerHud.textContent = str;
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
      this.elComboText.className = 'combo-text active';
    } else if (combo <= 1) {
      // Combo just ended — schedule fade out
      this._comboFadeTimer = setTimeout(() => {
        if (this.elComboText) {
          this.elComboText.className = 'combo-text';
          this.elComboText.textContent = '';
        }
        this._comboFadeTimer = null;
      }, GAME_CONFIG.BALANCE.COMBO_TIMEOUT || 3000);
    }
  }

  // ====================================================================
  //  HUD - Wave Display
  // ====================================================================

  /**
   * Show wave announcement with enhanced scale animation.
   * Normal waves: white text, scale 0.5→1.2→1.0 over 600ms, fade after 1.5s
   * Elite waves (every 5th): gold text with sparkle particles
   * Boss waves (every 10th): red text with screen flash
   */
  showWaveAnnouncement(waveNumber) {
    if (!this.elWaveDisplay) return;
    var el = this.elWaveDisplay;

    // Determine wave type
    var isBoss = (waveNumber % 10 === 0);
    var isElite = !isBoss && (waveNumber % 5 === 0);

    // Set text content
    el.textContent = '第' + waveNumber + '波';
    el.style.transition = 'none';
    el.style.transform = 'scale(0.5)';
    el.style.opacity = '1';
    el.className = 'hud-wave';

    if (isBoss) {
      el.style.color = '#ff3333';
      el.style.textShadow = '0 0 20px rgba(255,0,0,0.8), 0 0 40px rgba(255,0,0,0.5)';
      // Screen flash
      var flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,0,0,0.15);z-index:100;pointer-events:none;transition:opacity 0.3s';
      document.body.appendChild(flash);
      setTimeout(function () { flash.style.opacity = '0'; }, 150);
      setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 500);
    } else if (isElite) {
      el.style.color = '#ffdd44';
      el.style.textShadow = '0 0 20px rgba(255,200,0,0.8), 0 0 40px rgba(255,180,0,0.5)';
    } else {
      el.style.color = '#ffffff';
      el.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
    }

    el.classList.add('active');

    // Scale-in animation: 0.5 → 1.2 → 1.0 over 600ms
    var self = this;
    var startTime = performance.now();
    var duration = 600;

    function animStep(ts) {
      var elapsed = ts - startTime;
      var t = Math.min(1, elapsed / duration);
      // Ease-out: overshoot then settle
      var scale;
      if (t < 0.6) {
        // 0 → 0.6: scale from 0.5 to 1.2
        var t1 = t / 0.6;
        scale = 0.5 + (1.2 - 0.5) * (1 - Math.pow(1 - t1, 3));
      } else {
        // 0.6 → 1.0: scale from 1.2 to 1.0 (settle)
        var t2 = (t - 0.6) / 0.4;
        scale = 1.2 - (1.2 - 1.0) * (1 - Math.pow(1 - t2, 2));
      }
      el.style.transform = 'scale(' + scale + ')';
      if (t < 1) {
        requestAnimationFrame(animStep);
      }
    }
    requestAnimationFrame(animStep);

    // Fade out after show duration
    if (this._waveFadeTimer) clearTimeout(this._waveFadeTimer);
    this._waveFadeTimer = setTimeout(function () {
      if (el) {
        el.style.transition = 'opacity 0.5s';
        el.style.opacity = '0';
      }
      self._waveFadeTimer = null;
    }, 1800);
  }

  /**
   * Update wave progress bar (remaining enemies %).
   */
  updateWaveProgress(enemiesRemaining, enemiesTotal) {
    if (!this.elWaveProgress || !this.elWaveProgressFill) return;
    if (enemiesTotal <= 0) {
      this.elWaveProgress.style.display = 'none';
      return;
    }
    this.elWaveProgress.style.display = 'block';
    var pct = Math.max(0, Math.min(100, (enemiesRemaining / enemiesTotal) * 100));
    this.elWaveProgressFill.style.width = pct + '%';
  }

  // ====================================================================
  //  HUD - Boss HP Bar
  // ====================================================================

  /**
   * Show/update boss HP bar. Call with visible=false to hide.
   */
  updateBossHP(bossName, hp, maxHp, visible) {
    if (!this.elBossBar) return;
    if (!visible) {
      this.elBossBar.style.display = 'none';
      return;
    }
    this.elBossBar.style.display = 'flex';
    if (this.elBossName) this.elBossName.textContent = bossName || 'BOSS';

    var pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
    if (this.elBossHpFill) {
      this.elBossHpFill.style.width = pct + '%';
      // Color segments: green(>75%), yellow(50-75%), orange(25-50%), red+flash(<25%)
      this.elBossHpFill.className = 'hud-boss-hp-fill';
      if (pct <= 25) {
        this.elBossHpFill.classList.add('boss-red');
      } else if (pct <= 50) {
        this.elBossHpFill.classList.add('boss-orange');
      } else if (pct <= 75) {
        this.elBossHpFill.classList.add('boss-yellow');
      }
    }
    if (this.elBossHpPct) this.elBossHpPct.textContent = Math.floor(pct) + '%';
  }

  // ====================================================================
  //  HUD - HP Color Logic
  // ====================================================================

  /**
   * Update HP bar fill color based on percentage.
   * green(>50%), yellow(25-50%), red+flash(<25%)
   */
  updateHPColor(hpPct) {
    if (!this.elHpFill) return;
    this.elHpFill.className = 'hud-hp-fill';
    if (hpPct <= 25) {
      this.elHpFill.classList.add('hp-red');
    } else if (hpPct <= 50) {
      this.elHpFill.classList.add('hp-yellow');
    }
    // else default green
  }

  // ====================================================================
  //  HUD - Skill Bar
  // ====================================================================

  /**
   * Update skill bar with active and passive skills.
   * @param {Array} activeSkills - [{icon, cooldownPct, level}]
   * @param {Array} passiveSkills - [{icon, level}]
   */
  updateSkillBar(activeSkills, passiveSkills) {
    if (!this.elSkillBar) return;

    var hasSkills = (activeSkills && activeSkills.length > 0) || (passiveSkills && passiveSkills.length > 0);
    this.elSkillBar.style.display = hasSkills ? 'flex' : 'none';

    // Active skills (top row)
    if (this.elActiveSkillRow) {
      this.elActiveSkillRow.innerHTML = '';
      if (activeSkills) {
        for (var i = 0; i < activeSkills.length; i++) {
          var sk = activeSkills[i];
          var slot = document.createElement('div');
          slot.className = 'hud-skill-slot';
          slot.textContent = sk.icon || '✨';

          // Cooldown overlay
          if (sk.cooldownPct > 0) {
            var cd = document.createElement('div');
            cd.className = 'skill-cooldown-overlay';
            cd.style.height = (sk.cooldownPct * 100) + '%';
            slot.appendChild(cd);
          }

          // Level badge
          if (sk.level > 1) {
            var badge = document.createElement('div');
            badge.className = 'skill-level-badge';
            badge.textContent = sk.level;
            slot.appendChild(badge);
          }

          this.elActiveSkillRow.appendChild(slot);
        }
      }
    }

    // Passive skills (bottom row)
    if (this.elPassiveSkillRow) {
      this.elPassiveSkillRow.innerHTML = '';
      if (passiveSkills) {
        for (var j = 0; j < passiveSkills.length; j++) {
          var ps = passiveSkills[j];
          var pSlot = document.createElement('div');
          pSlot.className = 'hud-skill-slot';
          pSlot.style.opacity = '0.8';
          pSlot.textContent = ps.icon || '✨';

          if (ps.level > 1) {
            var pBadge = document.createElement('div');
            pBadge.className = 'skill-level-badge';
            pBadge.textContent = ps.level;
            pSlot.appendChild(pBadge);
          }

          this.elPassiveSkillRow.appendChild(pSlot);
        }
      }
    }
  }

  // ====================================================================
  //  HUD - Weapon Bar
  // ====================================================================

  /**
   * Update weapon bar — 6-slot grid with cooldown overlays and passive row.
   * @param {Array} weaponSlots - up to 6 items ({id, icon, level, cooldownPct}) or null for empty
   * @param {string} activeWeaponId - currently selected weapon ID
   * @param {Array} [passiveSlots] - optional array of passive weapon objects ({icon, level})
   */
  updateWeaponBar(weaponSlots, activeWeaponId, passiveSlots) {
    if (!this.elWeaponBar) return;

    var hasWeapons = weaponSlots && weaponSlots.length > 0;
    this.elWeaponBar.style.display = hasWeapons ? 'flex' : 'none';
    if (!hasWeapons) return;

    // === Grid: dynamic weapon slots (supports B2 expansion) ===
    var grid = document.getElementById('weapon-grid');
    if (!grid) {
      this.elWeaponBar.innerHTML = '';
      grid = document.createElement('div');
      grid.className = 'hud-weapon-grid';
      grid.id = 'weapon-grid';
      this.elWeaponBar.appendChild(grid);
    }
    grid.innerHTML = '';

    // B8: Check fusion recipes for glow effect
    var fusionGlowSlots = this._getFusionGlowSlots();
    // B6: Get focused slot
    var focusedSlot = (window.weaponManager) ? window.weaponManager.getFocusedSlot() : -1;

    // Support up to 8 slots (dynamic from B2 expansion)
    var slots = weaponSlots.slice(0, 8);
    var slotCount = Math.max(slots.length, 6);
    // Adjust grid columns based on slot count
    grid.style.gridTemplateColumns = 'repeat(' + slotCount + ', 40px)';

    for (var i = 0; i < slotCount; i++) {
      var w = (i < slots.length) ? slots[i] : null;
      var slot = document.createElement('div');
      slot.className = 'hud-weapon-slot';

      if (w && w.id) {
        slot.dataset.weaponId = w.id;
        // B6: Highlight focused weapon
        if (i === focusedSlot) {
          slot.classList.add('active-weapon');
        }
        // B8: Fusion glow
        if (fusionGlowSlots.indexOf(i) !== -1) {
          slot.classList.add('fusion-glow');
        }
        slot.textContent = w.icon || '🔫';

        // Cooldown overlay (bottom-up fill)
        if (w.cooldownPct > 0) {
          var cd = document.createElement('div');
          cd.className = 'weapon-cooldown-overlay';
          cd.style.height = (w.cooldownPct * 100) + '%';
          slot.appendChild(cd);
        }

        // Level badge
        if (w.level > 0) {
          var badge = document.createElement('div');
          badge.className = 'weapon-level-badge';
          badge.textContent = 'Lv' + w.level;
          slot.appendChild(badge);
        }

        // Click-to-focus slot (B6: quick-switch)
        (function(slotIdx) {
          slot.addEventListener('click', function() {
            if (window.weaponManager && typeof window.weaponManager.toggleFocusedSlot === 'function') {
              window.weaponManager.toggleFocusedSlot(slotIdx);
            }
          });
        })(i);
      } else {
        // Empty slot
        slot.classList.add('empty');
        slot.textContent = '－';
      }

      grid.appendChild(slot);
    }

    // === Passive row (orbital drones, etc.) ===
    var passiveRow = document.getElementById('weapon-passive-row');
    if (!passiveRow) {
      passiveRow = document.createElement('div');
      passiveRow.className = 'hud-weapon-passive-row';
      passiveRow.id = 'weapon-passive-row';
      this.elWeaponBar.appendChild(passiveRow);
    }
    passiveRow.innerHTML = '';

    if (passiveSlots && passiveSlots.length > 0) {
      passiveRow.style.display = 'flex';
      for (var j = 0; j < passiveSlots.length; j++) {
        var ps = passiveSlots[j];
        var pSlot = document.createElement('div');
        pSlot.className = 'hud-weapon-slot passive';
        pSlot.textContent = ps.icon || '🛸';
        if (ps.level > 0) {
          var pBadge = document.createElement('div');
          pBadge.className = 'weapon-level-badge';
          pBadge.textContent = 'Lv' + ps.level;
          pSlot.appendChild(pBadge);
        }
        passiveRow.appendChild(pSlot);
      }
    } else {
      passiveRow.style.display = 'none';
    }
  }

  /**
   * B8: Fusion Preview — return slot indices that are part of a complete fusion recipe.
   * Checks if player owns both weapons in any fusion recipe, returns their slot indices.
   * @returns {Array<number>} slot indices that should glow
   */
  _getFusionGlowSlots() {
    var glowSlots = [];
    var sm = window.skillManager;
    var wm = window.weaponManager;
    if (!sm || !wm || !wm.weaponSlots) return glowSlots;

    var recipes = GAME_CONFIG.FUSION_RECIPES;
    if (!recipes || !recipes.weapons) return glowSlots;
    var requiredLevel = recipes.requiredLevel || 5;

    for (var r = 0; r < recipes.weapons.length; r++) {
      var recipe = recipes.weapons[r];
      // Skip already-fused recipes
      if (sm.fusedWeapons && sm.fusedWeapons.has(recipe.id)) continue;

      var lvlA = sm.weaponLevels.get(recipe.ingredientA) || 0;
      var lvlB = sm.weaponLevels.get(recipe.ingredientB) || 0;

      // Check if both ingredients are at required level
      if (lvlA >= requiredLevel && lvlB >= requiredLevel) {
        // Find their slot indices
        var slotA = -1;
        var slotB = -1;
        for (var i = 0; i < wm.weaponSlots.length; i++) {
          if (wm.weaponSlots[i]) {
            if (wm.weaponSlots[i].weaponId === recipe.ingredientA) slotA = i;
            if (wm.weaponSlots[i].weaponId === recipe.ingredientB) slotB = i;
          }
        }
        if (slotA >= 0) glowSlots.push(slotA);
        if (slotB >= 0) glowSlots.push(slotB);
      }
    }
    return glowSlots;
  }

  // ====================================================================
  //  HUD - Comprehensive Update (called from game loop)
  // ====================================================================

  /**
   * Update all HUD elements from current game state.
   * Enhanced version that handles wave, boss, skills, weapons, HP colors.
   */
  updateHUD() {
    if (!game || !game.player) return;
    var p = game.player;

    // HP with color logic
    var hpPct = p.maxHp > 0 ? Math.max(0, (p.hp / p.maxHp) * 100) : 0;
    this.updateHP(p.hp, p.maxHp);
    this.updateHPColor(hpPct);

    // Score, Level, XP, Kills, Time, Combo
    this.updateScore(game.score);
    if (typeof skillManager !== 'undefined' && skillManager) {
      this.updateLevel(skillManager.level);
      this.updateXP(skillManager.xp || 0, skillManager.xpNeeded || 100);
    } else {
      this.updateLevel(p.level || 1);
      this.updateXP(p.xp || 0, p.xpNeeded || 100);
    }
    this.updateKills(game.kills);
    this.updateTime(game.gameTime / 1000);
    this.updateCombo(game.combo);

    // Gold (read from DOM since main.js manages inRunGold)
    // main.js already updates gold-text, no need to duplicate

    // Boss HP bar
    var boss = null;
    if (game.enemies) {
      for (var i = 0; i < game.enemies.length; i++) {
        if (game.enemies[i].active && game.enemies[i].isBoss) {
          boss = game.enemies[i];
          break;
        }
      }
    }
    if (boss) {
      this.updateBossHP(boss.bossName || 'BOSS', boss.hp, boss.maxHp, true);
    } else {
      this.updateBossHP('', 0, 0, false);
    }

    // Wave announcement
    if (typeof waveSpawner !== 'undefined' && waveSpawner) {
      var currentWave = waveSpawner.waveNumber || 0;
      if (currentWave > 0 && currentWave !== this._lastWaveNumber) {
        this._lastWaveNumber = currentWave;
        this.showWaveAnnouncement(currentWave);
      }
    }

    // Wave progress
    if (typeof waveSpawner !== 'undefined' && waveSpawner && waveSpawner.waveState === 'active') {
      var activeEnemies = 0;
      if (game.enemies) {
        for (var e = 0; e < game.enemies.length; e++) {
          if (game.enemies[e].active && !game.enemies[e].isBoss) activeEnemies++;
        }
      }
      this.updateWaveProgress(activeEnemies, waveSpawner.waveEnemiesTotal);
    } else {
      this.updateWaveProgress(0, 0);
    }

    // Skill bar
    if (typeof skillManager !== 'undefined' && skillManager) {
      var activeSkills = [];
      var passiveSkills = [];
      var learnedSkills = skillManager.learnedSkills || new Map();
      var cfg = GAME_CONFIG;
      var skillIds = Array.from(learnedSkills.keys());
      for (var s = 0; s < skillIds.length; s++) {
        var skillId = skillIds[s];
        var stackCount = learnedSkills.get(skillId) || 1;
        var skillCfg = null;
        if (cfg.SKILLS) {
          for (var sk = 0; sk < cfg.SKILLS.length; sk++) {
            if (cfg.SKILLS[sk].id === skillId) { skillCfg = cfg.SKILLS[sk]; break; }
          }
        }
        if (!skillCfg) continue;
        var skillData = {
          icon: skillCfg.icon || '✨',
          level: stackCount,
          cooldownPct: 0
        };
        // Check cooldown for active skills
        if (skillCfg.type === 'active' || skillCfg.type === 'conditional') {
          var cdRemaining = skillManager.activeCooldowns ? (skillManager.activeCooldowns.get(skillId) || 0) : 0;
          var cdTotal = skillCfg.cooldown || 1;
          skillData.cooldownPct = cdTotal > 0 ? Math.min(1, cdRemaining / cdTotal) : 0;
          activeSkills.push(skillData);
        } else {
          passiveSkills.push(skillData);
        }
      }
      this.updateSkillBar(activeSkills, passiveSkills);
    }

    // Weapon bar — 6-slot grid with cooldown
    if (typeof weaponManager !== 'undefined' && weaponManager) {
      var cfg2 = GAME_CONFIG;
      var slotData = weaponManager.weaponSlots;
      var displaySlots = weaponManager.getSlots();

      // ——— Helper: compute cooldown percentage for a specific weapon slot ———
      function _weaponCooldownPct(wId, slot) {
        var fCfg = cfg2.WEAPONS ? cfg2.WEAPONS[wId] : null;
        if (!fCfg || !fCfg.fireRate || fCfg.fireRate <= 0) return 0;
        if (!slot || typeof slot.fireTimer !== 'number') return 0;
        var stats = (typeof weaponManager._getStats === 'function') ? weaponManager._getStats() : {};
        var effRate = fCfg.fireRate * (stats.attackSpeed || 1);
        if (stats.cooldownReduction && stats.cooldownReduction > 0) {
          effRate *= (1 - Math.min(stats.cooldownReduction, 0.9));
        }
        var skRef = window._skillManagerRef;
        if (skRef && typeof skRef.getWeaponFireRateMult === 'function') {
          effRate *= skRef.getWeaponFireRateMult(wId);
        }
        if (effRate < 30) effRate = 30;
        return 1 - Math.min(1, slot.fireTimer / effRate);
      }

      // Build weapon slots from weaponManager slots
      var weaponSlots = [];
      for (var si = 0; si < displaySlots.length; si++) {
        var s = displaySlots[si];
        if (!s) {
          weaponSlots.push(null);
          continue;
        }
        var level = (skillManager && skillManager.weaponLevels)
          ? (skillManager.weaponLevels.get(s.weaponId) || 0) : 0;
        weaponSlots.push({
          id: s.weaponId,
          icon: s.icon,
          level: level,
          cooldownPct: _weaponCooldownPct(s.weaponId, slotData[si])
        });
      }

      // Passive weapon slots (orbital drones, etc.)
      var passiveSlots = [];
      if (weaponManager.orbitals && weaponManager.orbitals.length > 0) {
        passiveSlots.push({
          icon: '🛸',
          level: 0
        });
      }

      // In multi-slot mode all equipped weapons fire simultaneously; pass null for activeWeaponId
      this.updateWeaponBar(weaponSlots, null, passiveSlots);
    }

    // Pause overlay
    this.updatePause();

    // Minimap
    this.updateMinimap();

    // Buff bar
    this.updateBuffBar();

    // Low HP warning
    this.updateLowHpWarning();
  }

  // ====================================================================
  //  Minimap — world 1200×800 → canvas (reads actual CSS size)
  // ====================================================================
  updateMinimap() {
    var ctx = this._minimapCtx;
    var el = this.elMinimap;
    if (!ctx || !el) return;
    if (!game || !game.player) return;

    var w = el.width;
    var h = el.height;
    var worldW = game.width || 1200;
    var worldH = game.height || 800;
    var scaleX = w / worldW;
    var scaleY = h / worldH;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Dark background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, w, h);

    // Draw enemies (red dots)
    if (game.enemies) {
      for (var i = 0; i < game.enemies.length; i++) {
        var e = game.enemies[i];
        if (!e.active) continue;
        var ex = e.x * scaleX;
        var ey = e.y * scaleY;
        if (e.isBoss) {
          // Boss: purple 5px
          ctx.fillStyle = '#cc44ff';
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Normal enemy: red 3px
          ctx.fillStyle = '#ff3333';
          ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
        }
      }
    }

    // Draw items (green dots)
    if (game.items) {
      ctx.fillStyle = '#44ff44';
      for (var j = 0; j < game.items.length; j++) {
        var it = game.items[j];
        if (!it.active || it.collected) continue;
        ctx.fillRect(it.x * scaleX - 1, it.y * scaleY - 1, 2, 2);
      }
    }

    // Draw player (white dot with glow)
    var px = game.player.x * scaleX;
    var py = game.player.y * scaleY;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ====================================================================
  //  Buff/Debuff Status Bar — renders active buffs with countdown rings
  // ====================================================================
  updateBuffBar() {
    if (!this.elBuffBar) return;
    var buffMgr = (typeof buffManager !== 'undefined') ? buffManager : null;
    if (!buffMgr) return;

    var bar = this.elBuffBar;
    bar.innerHTML = '';

    var items = [];
    buffMgr.activeBuffs.forEach(function (buff, type) {
      var cfg = buff.config;
      var remaining = Math.max(0, buff.remaining);
      var duration = Math.max(0.001, buff.duration);
      var pct = remaining / duration;
      var isDebuff = (cfg.type === 'debuff' ||
        ['poison', 'speedDown', 'damageDown', 'blind', 'curse', 'reverseControl'].indexOf(type) >= 0);
      var icon = cfg.icon || cfg.emoji || '💠';
      items.push({ type: type, icon: icon, pct: pct, isDebuff: isDebuff });
    });

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var div = document.createElement('div');
      div.className = 'buff-icon' + (item.isDebuff ? ' debuff' : '');
      div.title = item.type + ' (' + Math.ceil(item.pct * 100) + '%)';

      // Canvas countdown ring
      var canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      var cctx = canvas.getContext('2d');

      // Ring background
      cctx.beginPath();
      cctx.arc(16, 16, 13, 0, Math.PI * 2);
      cctx.strokeStyle = item.isDebuff ? 'rgba(255,68,68,0.25)' : 'rgba(68,255,68,0.25)';
      cctx.lineWidth = 2;
      cctx.stroke();

      // Ring fill
      if (item.pct > 0) {
        cctx.beginPath();
        cctx.arc(16, 16, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * item.pct);
        cctx.strokeStyle = item.isDebuff ? '#ff4444' : '#44ff44';
        cctx.lineWidth = 2;
        cctx.stroke();
      }

      div.appendChild(canvas);

      // Emoji label
      var span = document.createElement('span');
      span.style.cssText = 'position:relative;z-index:1';
      span.textContent = item.icon;
      div.appendChild(span);

      bar.appendChild(div);
    }
  }

  // ====================================================================
  //  Low HP Warning — red screen-edge pulse
  // ====================================================================
  updateLowHpWarning() {
    if (!this.elLowHpWarning) return;
    if (!game || !game.player) return;

    var p = game.player;
    var ratio = p.maxHp > 0 ? p.hp / p.maxHp : 1;

    if (ratio < 0.3) {
      this.elLowHpWarning.classList.add('active');
      if (ratio < 0.15) {
        this.elLowHpWarning.classList.add('critical');
      } else {
        this.elLowHpWarning.classList.remove('critical');
      }
      this._lowHpActive = true;
    } else {
      this.elLowHpWarning.classList.remove('active');
      this.elLowHpWarning.classList.remove('critical');
      this._lowHpActive = false;
    }
  }

  // ====================================================================
  //  DPS Stats Panel — shows weapon damage breakdown when paused
  // ====================================================================
  showDpsStats(container) {
    if (!container) return;
    var wm = (typeof weaponManager !== 'undefined') ? weaponManager : null;
    var cfg = GAME_CONFIG;

    if (!wm || !wm._dpsData || Object.keys(wm._dpsData).length === 0) {
      container.innerHTML = '<div class="pause-sub-empty">暂无伤害数据（继续游戏以收集）</div>';
      return;
    }

    // Compute totals
    var totalDmg = 0;
    var entries = [];
    for (var wId in wm._dpsData) {
      if (!wm._dpsData.hasOwnProperty(wId)) continue;
      var dmg = wm._dpsData[wId];
      totalDmg += dmg;
      var weaponCfg = cfg.WEAPONS ? cfg.WEAPONS[wId] : null;
      entries.push({
        id: wId,
        name: weaponCfg ? weaponCfg.name : wId,
        icon: weaponCfg ? (weaponCfg.icon || '🔫') : '🔫',
        damage: dmg
      });
    }

    if (totalDmg <= 0) {
      container.innerHTML = '<div class="pause-sub-empty">暂无伤害数据</div>';
      return;
    }

    // Sort by damage descending
    entries.sort(function (a, b) { return b.damage - a.damage; });

    var html = '';
    var maxDmg = entries[0].damage;

    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var barPct = maxDmg > 0 ? (e.damage / maxDmg) * 100 : 0;
      var totalPct = totalDmg > 0 ? ((e.damage / totalDmg) * 100).toFixed(1) : '0.0';
      var dmgLabel = e.damage >= 1000000 ? (e.damage / 1000000).toFixed(1) + 'M' :
                     e.damage >= 1000 ? (e.damage / 1000).toFixed(0) + 'K' :
                     Math.floor(e.damage).toString();

      html += '<div class="dps-item" style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.08)">' +
        '<span style="font-size:18px;width:28px;text-align:center">' + e.icon + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;color:#ddd;margin-bottom:3px">' + e.name + '</div>' +
          '<div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden">' +
            '<div style="height:100%;width:' + barPct + '%;background:linear-gradient(90deg,' + (i === 0 ? '#ffaa00' : '#4488ff') + ', ' + (i === 0 ? '#ffdd44' : '#66aaff') + ');border-radius:4px;transition:width 0.3s"></div>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;font-size:12px;min-width:60px">' +
          '<div style="color:#fff;font-weight:bold">' + dmgLabel + '</div>' +
          '<div style="color:#888">' + totalPct + '%</div>' +
        '</div>' +
      '</div>';
    }

    // Total
    var totalLabel = totalDmg >= 1000000 ? (totalDmg / 1000000).toFixed(1) + 'M' :
                     totalDmg >= 1000 ? (totalDmg / 1000).toFixed(0) + 'K' :
                     Math.floor(totalDmg).toString();
    html += '<div style="text-align:center;margin-top:10px;font-size:13px;color:#aaa">总伤害输出: <span style="color:#ffdd44;font-weight:bold">' + totalLabel + '</span></div>';

    container.innerHTML = html;
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
        // Show stack indicator for already-learned skills
        if (item._stackCount > 0) {
          nameEl.textContent += ' (Stack +1)';
        }
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

      // Stack badge (for already-learned skills)
      if (!isWeapon && item._stackCount > 0) {
        const stackEl = document.createElement('div');
        stackEl.className = 'skill-type';
        stackEl.textContent = '📈 堆叠 Lv' + (item._stackCount + 1);
        stackEl.style.fontSize = '9px';
        stackEl.style.color = '#ffaa44';
        stackEl.style.marginTop = '2px';
        card.appendChild(stackEl);
      }

      // Rarity label
      const rarityEl = document.createElement('div');
      rarityEl.className = 'skill-rarity';
      rarityEl.textContent = this._rarityLabel(data.rarity);
      card.appendChild(rarityEl);

      // Click handler: pass full item object back (with anti-spam)
      card.addEventListener('click', (function(selectedItem) {
        return function() {
          if (card.classList.contains('disabled')) return;
          card.classList.add('disabled');
          card.style.pointerEvents = 'none';
          card.style.opacity = '0.5';
          setTimeout(function() {
            card.classList.remove('disabled');
            card.style.pointerEvents = '';
            card.style.opacity = '';
          }, 500);
          if (typeof onSelect === 'function') {
            onSelect(selectedItem);
          }
        };
      })(item));

      container.appendChild(card);
    }

    // 键盘快捷键选择（1/2/3）和ESC阻止
    var self = this;
    var keyHandler = function(e) {
      if (e.key >= '1' && e.key <= '3') {
        var idx = parseInt(e.key) - 1;
        var cards = container.querySelectorAll('.skill-card');
        if (cards[idx]) cards[idx].click();
      }
      // 阻止ESC关闭弹窗
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', keyHandler);
    this._levelUpKeyHandler = keyHandler;

    // Show the overlay as flex
    if (this.elLevelUp) this.elLevelUp.style.display = 'flex';
  }

  hideLevelUp() {
    if (this._levelUpKeyHandler) {
      document.removeEventListener('keydown', this._levelUpKeyHandler);
      this._levelUpKeyHandler = null;
    }
    if (this.elLevelUp) this.elLevelUp.style.display = 'none';
  }

  // ====================================================================
  //  Wave Shop Overlay (波次间商店)
  // ====================================================================

  showWaveShop(items, gold, onPurchase, onRefresh, onClose) {
    var overlay = document.getElementById('wave-shop-overlay');
    if (!overlay) {
      overlay = this._createWaveShopOverlay();
    }

    var goldDisplay = overlay.querySelector('#wave-shop-gold');
    var itemsContainer = overlay.querySelector('#wave-shop-items');
    var refreshBtn = overlay.querySelector('#wave-shop-refresh');
    var closeBtn = overlay.querySelector('#wave-shop-close');
    var refreshCost = document.getElementById('wave-shop-refresh-cost');

    if (goldDisplay) goldDisplay.textContent = gold;
    if (refreshCost) refreshCost.textContent = GAME_CONFIG.SHOP.refreshCost;

    // 渲染商品
    if (itemsContainer) {
      itemsContainer.innerHTML = '';
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var canAfford = gold >= item.cost;
        var card = document.createElement('div');
        card.className = 'wave-shop-item' + (canAfford ? '' : ' disabled');
        card.innerHTML =
          '<div class="wave-shop-item-icon">' + item.icon + '</div>' +
          '<div class="wave-shop-item-info">' +
            '<div class="wave-shop-item-name">' + item.name + '</div>' +
            '<div class="wave-shop-item-desc">' + (item.description || '') + '</div>' +
          '</div>' +
          '<button class="wave-shop-item-btn' + (canAfford ? '' : ' cant-afford') + '"' +
            (canAfford ? '' : ' disabled') + '>' +
            '💰 ' + item.cost +
          '</button>';

        (function(itemId, canAfford) {
          if (canAfford) {
            card.querySelector('.wave-shop-item-btn').addEventListener('click', function() {
              if (typeof onPurchase === 'function') onPurchase(itemId);
            });
          }
        })(item.id, canAfford);

        itemsContainer.appendChild(card);
      }
    }

    // 刷新按钮
    if (refreshBtn) {
      refreshBtn.onclick = function() {
        if (typeof onRefresh === 'function') onRefresh();
      };
    }

    // 关闭按钮
    if (closeBtn) {
      closeBtn.onclick = function() {
        if (typeof onClose === 'function') onClose();
      };
    }

    // 阻止ESC关闭
    this._waveShopKeyHandler = function(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', this._waveShopKeyHandler);

    overlay.style.display = 'flex';
  }

  hideWaveShop() {
    if (this._waveShopKeyHandler) {
      document.removeEventListener('keydown', this._waveShopKeyHandler);
      this._waveShopKeyHandler = null;
    }
    var overlay = document.getElementById('wave-shop-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  _createWaveShopOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'wave-shop-overlay';
    overlay.style.cssText = 'display:none;position:absolute;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(5,5,30,0.95);z-index:65;flex-direction:column;align-items:center;' +
      'overflow-y:auto;padding:20px;';

    overlay.innerHTML =
      '<div style="text-align:center;margin-bottom:20px;">' +
        '<div style="font-size:28px;color:#ffdd00;font-weight:bold;text-shadow:0 0 15px rgba(255,221,0,0.5);">🛒 波次商店</div>' +
        '<div style="font-size:20px;color:#ffdd00;margin-top:8px;">金币: <span id="wave-shop-gold">0</span></div>' +
      '</div>' +
      '<div id="wave-shop-items" style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:400px;margin-bottom:20px;"></div>' +
      '<div style="display:flex;gap:12px;">' +
        '<button id="wave-shop-refresh" class="wave-shop-btn" style="background:rgba(100,200,255,0.15);border-color:#64c8ff;color:#64c8ff;">🔄 刷新 (<span id="wave-shop-refresh-cost">50</span>💰)</button>' +
        '<button id="wave-shop-close" class="wave-shop-btn" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.3);color:#fff;">继续游戏 ▶</button>' +
      '</div>';

    document.body.appendChild(overlay);
    return overlay;
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

    // Store fusions for click handler
    this._currentFusions = fusions;

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
   * Handle click on fusion notification banner.
   * Shows fusion confirm overlay for the first available fusion.
   */
  _onFusionNotificationClick() {
    var fusions = this._currentFusions;
    if (!fusions || fusions.length === 0) return;

    // Hide notification
    this.hideFusionNotification();

    // Pause game
    if (window.game) window.game.pause();

    // Show fusion confirm for the first available fusion
    var fusion = fusions[0];
    var recipe = fusion.recipe;
    var self = this;

    this.showFusionConfirm(recipe, function onConfirm() {
      // Execute fusion via callback
      if (typeof self.onFusionExecute === 'function') {
        self.onFusionExecute(fusion);
      }
      // Resume game
      if (window.game) window.game.resume();
    }, function onCancel() {
      // Resume game on cancel
      if (window.game) window.game.resume();
    });
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

  /**
   * Show the settlement panel with stats appearing one by one.
   * New personal records are highlighted in gold.
   * @param {object} stats - { score, kills, level, time, maxCombo, faction, goldEarned, bossKills, wave }
   * @param {Function} onRestart - callback for Play Again
   * @param {Function} onMenu - callback for Return to Menu
   */
  showGameOver(stats, onRestart, onMenu) {
    // Store callbacks for share
    this._lastStats = stats;

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

    // Load personal bests from leaderboard
    var best = this._getPersonalBests();

    // Build stat rows data
    var statRows = [
      { key: 'kills',       icon: '💀', label: '击杀数',   value: stats.kills || 0,      format: 'int' },
      { key: 'goldEarned',  icon: '💰', label: '获得金币', value: stats.goldEarned || 0, format: 'int' },
      { key: 'level',       icon: '⬆️', label: '等级',     value: stats.level || 1,      format: 'int' },
      { key: 'time',        icon: '⏱️', label: '生存时间', value: Math.floor((stats.time || 0) / 1000),       format: 'time' },
      { key: 'bossKills',   icon: '👑', label: 'Boss击杀', value: stats.bossKills || 0,  format: 'int' },
      { key: 'maxCombo',    icon: '🔥', label: '最大连击', value: stats.maxCombo || 0,   format: 'int' },
      { key: 'wave',        icon: '🌊', label: '到达波次', value: stats.wave || 0,       format: 'int' },
      { key: 'faction',     icon: '🎯', label: '流派',     value: stats.faction || '--',  format: 'text' },
    ];

    // Build settlement stats container
    var container = this.elSettlementStats || document.getElementById('settlement-stats');
    if (container) {
      container.innerHTML = '';
      for (var i = 0; i < statRows.length; i++) {
        var row = statRows[i];
        var isRecord = this._isRecord(row.key, row.value, best, stats);

        var rowEl = document.createElement('div');
        rowEl.className = 'stat-row' + (isRecord ? ' is-record' : '');

        var labelEl = document.createElement('span');
        labelEl.className = 'stat-label';
        labelEl.textContent = row.icon + ' ' + row.label;

        var valueEl = document.createElement('span');
        valueEl.className = 'stat-value';
        if (row.format === 'time') {
          valueEl.textContent = this._formatTime(row.value);
        } else if (row.format === 'text') {
          valueEl.textContent = row.value;
        } else {
          valueEl.textContent = row.value;
        }

        if (isRecord) {
          var badge = document.createElement('span');
          badge.className = 'record-badge';
          badge.textContent = 'NEW!';
          valueEl.appendChild(badge);
        }

        rowEl.appendChild(labelEl);
        rowEl.appendChild(valueEl);
        container.appendChild(rowEl);
      }
    }

    // Wire up buttons
    if (this.elBtnRestart) {
      this.elBtnRestart.onclick = function() {
        if (typeof onRestart === 'function') onRestart();
      };
    }
    if (this.elBtnMenu) {
      this.elBtnMenu.onclick = function() {
        if (typeof onMenu === 'function') onMenu();
      };
    }
    if (this.elBtnShare) {
      this.elBtnShare.onclick = function() {
        this._shareResults(stats);
      }.bind(this);
    }

    // Show the game over screen
    this.hideAllScreens();
    this.hideHUD();
    this.hidePause();
    this.showScreen('game-over');

    // Animate stat rows one by one
    this._animateSettlementRows();
  }

  /**
   * Animate settlement stat rows appearing one by one.
   */
  _animateSettlementRows() {
    var rows = document.querySelectorAll('#settlement-stats .stat-row');
    for (var i = 0; i < rows.length; i++) {
      (function(row, delay) {
        setTimeout(function() {
          row.classList.add('visible');
        }, delay);
      })(rows[i], 300 + i * 250);
    }
  }

  /**
   * Get personal best stats from leaderboard.
   */
  _getPersonalBests() {
    var best = { score: 0, kills: 0, level: 1, time: 0, maxCombo: 0, bossKills: 0, wave: 0, goldEarned: 0 };
    try {
      if (window.LeaderboardManager && typeof window.LeaderboardManager.getLeaderboard === 'function') {
        var entries = window.LeaderboardManager.getLeaderboard();
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (e.score > best.score) best.score = e.score;
          if (e.kills > best.kills) best.kills = e.kills;
          if (e.level > best.level) best.level = e.level;
          if (e.time > best.time) best.time = e.time;
        }
      }
      // Load additional bests from localStorage
      var raw = localStorage.getItem('stg_personal_bests');
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved.maxCombo > best.maxCombo) best.maxCombo = saved.maxCombo;
        if (saved.bossKills > best.bossKills) best.bossKills = saved.bossKills;
        if (saved.wave > best.wave) best.wave = saved.wave;
        if (saved.goldEarned > best.goldEarned) best.goldEarned = saved.goldEarned;
      }
    } catch (e) { /* ignore */ }
    return best;
  }

  /**
   * Check if a stat value is a new personal record.
   */
  _isRecord(key, value, best, stats) {
    if (key === 'faction') return false;
    if (typeof value !== 'number' || value <= 0) return false;
    var bestVal = best[key] || 0;
    return value > bestVal;
  }

  /**
   * Save personal bests after a run.
   */
  savePersonalBests(stats) {
    try {
      var raw = localStorage.getItem('stg_personal_bests');
      var best = raw ? JSON.parse(raw) : {};
      if ((stats.maxCombo || 0) > (best.maxCombo || 0)) best.maxCombo = stats.maxCombo;
      if ((stats.bossKills || 0) > (best.bossKills || 0)) best.bossKills = stats.bossKills;
      if ((stats.wave || 0) > (best.wave || 0)) best.wave = stats.wave;
      if ((stats.goldEarned || 0) > (best.goldEarned || 0)) best.goldEarned = stats.goldEarned;
      localStorage.setItem('stg_personal_bests', JSON.stringify(best));
    } catch (e) { /* ignore */ }
  }

  /**
   * Share results to clipboard.
   */
  _shareResults(stats) {
    var text = '🎮 星域战机 战绩 🎮\n' +
      '得分: ' + (stats.score || 0) + '\n' +
      '击杀: ' + (stats.kills || 0) + '\n' +
      '等级: ' + (stats.level || 1) + '\n' +
      '生存: ' + this._formatTime(stats.time || 0) + '\n' +
      'Boss: ' + (stats.bossKills || 0) + '\n' +
      '连击: ' + (stats.maxCombo || 0) + '\n' +
      '波次: ' + (stats.wave || 0) + '\n' +
      '流派: ' + (stats.faction || '--');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          this.showToast('📋 已复制到剪贴板！', 2000);
        }.bind(this));
      } else {
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.showToast('📋 已复制到剪贴板！', 2000);
      }
    } catch (e) {
      this.showToast('⚠️ 复制失败', 2000);
    }
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
      this._stopHUDLoop(); // Stop updates while paused
    } else {
      this.elPauseOverlay.style.display = 'none';
      // Restart HUD loop if HUD is visible and in gameplay
      if (this.elHud && this.elHud.style.display !== 'none' &&
          game && game.scene === GAME_CONFIG.SCENES.GAMEPLAY) {
        this._startHUDLoop();
      }
    }
  }

  showPause() {
    if (this.elPauseOverlay) this.elPauseOverlay.style.display = 'flex';
  }

  hidePause() {
    if (this.elPauseOverlay) this.elPauseOverlay.style.display = 'none';
  }

  // ====================================================================
  //  Meta Shop (Between-Run Shop)
  // ====================================================================

  showMetaShop() {
    this._metaShopCategory = 'consumable';
    var tabs = document.querySelectorAll('.meta-shop-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove('active');
      if (tabs[i].getAttribute('data-category') === 'consumable') tabs[i].classList.add('active');
    }
    this._updateMetaShopCoins();
    this._renderMetaShopItems('consumable');
    this.showScreen('meta-shop-screen');
  }

  _updateMetaShopCoins() {
    var coins = 0;
    if (window.UpgradeManager && typeof window.UpgradeManager.getStarCoins === 'function') {
      coins = window.UpgradeManager.getStarCoins();
    }
    if (this.elMetaShopCoins) this.elMetaShopCoins.textContent = coins;
  }

  _renderMetaShopItems(category) {
    if (category === 'weapons') {
      this._renderMetaShopWeapons();
      return;
    }
    if (category === 'upgrades') {
      this._renderMetaShopUpgrades();
      return;
    }
    if (category === 'permanent') {
      this._renderMetaShopPermanent();
      return;
    }
    var container = this.elMetaShopItems;
    if (!container) return;
    container.innerHTML = '';

    var shopItems = GAME_CONFIG.SHOP_ITEMS;
    if (!shopItems) return;

    var purchases = this._getShopPurchases();
    var starCoins = (window.UpgradeManager && typeof window.UpgradeManager.getStarCoins === 'function')
      ? window.UpgradeManager.getStarCoins() : 0;

    var keys = Object.keys(shopItems);
    for (var i = 0; i < keys.length; i++) {
      var item = shopItems[keys[i]];
      if (item.category !== category) continue;

      var owned = !item.consumable && purchases[item.id];
      var count = item.consumable ? (purchases[item.id] || 0) : 0;
      var canAfford = starCoins >= item.price;

      var card = document.createElement('div');
      card.className = 'meta-shop-card' + (owned ? ' owned' : '');

      var iconEl = document.createElement('div');
      iconEl.className = 'meta-shop-icon';
      iconEl.textContent = item.icon || '?';
      card.appendChild(iconEl);

      var infoEl = document.createElement('div');
      infoEl.className = 'meta-shop-info';

      var nameEl = document.createElement('div');
      nameEl.className = 'meta-shop-name';
      nameEl.textContent = item.name;
      infoEl.appendChild(nameEl);

      var descEl = document.createElement('div');
      descEl.className = 'meta-shop-desc';
      descEl.textContent = item.description;
      infoEl.appendChild(descEl);

      var catEl = document.createElement('div');
      catEl.className = 'meta-shop-category';
      catEl.textContent = item.consumable
        ? ('消耗品' + (count > 0 ? ' · 已购 ' + count + ' 个' : ''))
        : (owned ? '✓ 已拥有' : '永久道具');
      infoEl.appendChild(catEl);

      card.appendChild(infoEl);

      var btnEl = document.createElement('button');
      btnEl.className = 'meta-shop-buy' + (owned ? ' owned-btn' : '');

      if (owned) {
        btnEl.textContent = '已拥有';
        btnEl.disabled = true;
      } else {
        btnEl.textContent = '⭐ ' + item.price;
        btnEl.disabled = !canAfford;
        (function(self, shopItem) {
          btnEl.addEventListener('click', function() {
            self._purchaseShopItem(shopItem);
          });
        })(this, item);
      }

      card.appendChild(btnEl);
      container.appendChild(card);
    }
  }

  _purchaseShopItem(item) {
    var starCoins = (window.UpgradeManager && typeof window.UpgradeManager.getStarCoins === 'function')
      ? window.UpgradeManager.getStarCoins() : 0;

    if (starCoins < item.price) {
      this.showToast('⭐ 星币不足！', 2000);
      return;
    }

    // Deduct star coins
    if (window.UpgradeManager && typeof window.UpgradeManager.addStarCoins === 'function') {
      window.UpgradeManager.addStarCoins(-item.price);
    }

    // Record purchase
    var purchases = this._getShopPurchases();
    if (item.consumable) {
      purchases[item.id] = (purchases[item.id] || 0) + 1;
    } else {
      purchases[item.id] = true;
    }
    this._saveShopPurchases(purchases);

    // Apply effect
    this._applyShopItemEffect(item);

    // Refresh UI
    this._updateMetaShopCoins();
    this._renderMetaShopItems(this._metaShopCategory);
    this.showToast('🛒 购买成功: ' + item.name + '！', 2000, '#44ff44');
  }

  _applyShopItemEffect(item) {
    // Store active consumables for next run
    if (item.consumable) {
      var active = this._getActiveConsumables();
      active[item.id] = (active[item.id] || 0) + 1;
      try { localStorage.setItem('stg_active_consumables', JSON.stringify(active)); } catch (e) {}
    }
    // Permanent effects are read at game start from _getShopPurchases()
  }

  _getShopPurchases() {
    try {
      var raw = localStorage.getItem('stg_shop_purchases');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  _saveShopPurchases(data) {
    try { localStorage.setItem('stg_shop_purchases', JSON.stringify(data)); } catch (e) {}
  }

  _getActiveConsumables() {
    try {
      var raw = localStorage.getItem('stg_active_consumables');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  // ====================================================================
  //  Meta Shop - Weapons & Upgrades (META_SHOP)
  // ====================================================================

  _getMetaPurchases() {
    try {
      var raw = localStorage.getItem('stg_meta_purchases');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  _saveMetaPurchases(data) {
    try { localStorage.setItem('stg_meta_purchases', JSON.stringify(data)); } catch (e) {}
  }

  _renderMetaShopWeapons() {
    var container = this.elMetaShopItems;
    if (!container) return;
    container.innerHTML = '';

    var metaShop = GAME_CONFIG.META_SHOP;
    if (!metaShop || !metaShop.weapons) return;

    var purchases = this._getMetaPurchases();
    var starCoins = (window.UpgradeManager && typeof window.UpgradeManager.getStarCoins === 'function')
      ? window.UpgradeManager.getStarCoins() : 0;

    var keys = Object.keys(metaShop.weapons);
    for (var i = 0; i < keys.length; i++) {
      var item = metaShop.weapons[keys[i]];
      var owned = !!purchases['weapon_' + item.id];
      var canAfford = starCoins >= item.price;

      var card = document.createElement('div');
      card.className = 'meta-shop-card' + (owned ? ' owned' : '');

      var iconEl = document.createElement('div');
      iconEl.className = 'meta-shop-icon';
      iconEl.textContent = item.icon || '?';
      card.appendChild(iconEl);

      var infoEl = document.createElement('div');
      infoEl.className = 'meta-shop-info';

      var nameEl = document.createElement('div');
      nameEl.className = 'meta-shop-name';
      nameEl.textContent = item.name;
      infoEl.appendChild(nameEl);

      var descEl = document.createElement('div');
      descEl.className = 'meta-shop-desc';
      descEl.textContent = item.description;
      infoEl.appendChild(descEl);

      var catEl = document.createElement('div');
      catEl.className = 'meta-shop-category';
      catEl.textContent = owned ? '✓ 已解锁' : '武器解锁';
      infoEl.appendChild(catEl);

      card.appendChild(infoEl);

      var btnEl = document.createElement('button');
      btnEl.className = 'meta-shop-buy' + (owned ? ' owned-btn' : '');

      if (owned) {
        btnEl.textContent = '已拥有';
        btnEl.disabled = true;
      } else if (item.price === 0) {
        btnEl.textContent = '免费';
        btnEl.disabled = true;
      } else {
        btnEl.textContent = '⭐ ' + item.price;
        btnEl.disabled = !canAfford;
        (function(self, shopItem) {
          btnEl.addEventListener('click', function() {
            self._purchaseMetaWeapon(shopItem);
          });
        })(this, item);
      }

      card.appendChild(btnEl);
      container.appendChild(card);
    }
  }

  _renderMetaShopUpgrades() {
    var container = this.elMetaShopItems;
    if (!container) return;
    container.innerHTML = '';

    var metaShop = GAME_CONFIG.META_SHOP;
    if (!metaShop || !metaShop.upgrades) return;

    var purchases = this._getMetaPurchases();
    var starCoins = (window.UpgradeManager && typeof window.UpgradeManager.getStarCoins === 'function')
      ? window.UpgradeManager.getStarCoins() : 0;

    var keys = Object.keys(metaShop.upgrades);
    for (var i = 0; i < keys.length; i++) {
      var item = metaShop.upgrades[keys[i]];
      var currentLevel = purchases['upgrade_' + item.id] || 0;
      var maxed = currentLevel >= item.maxLevel;
      var cost = maxed ? 0 : Math.floor(item.price * Math.pow(1.3, currentLevel));
      var canAfford = starCoins >= cost;

      var card = document.createElement('div');
      card.className = 'meta-shop-card' + (maxed ? ' owned' : '');

      var iconEl = document.createElement('div');
      iconEl.className = 'meta-shop-icon';
      iconEl.textContent = item.icon || '?';
      card.appendChild(iconEl);

      var infoEl = document.createElement('div');
      infoEl.className = 'meta-shop-info';

      var nameEl = document.createElement('div');
      nameEl.className = 'meta-shop-name';
      nameEl.textContent = item.name + (currentLevel > 0 ? ' Lv.' + currentLevel : '');
      infoEl.appendChild(nameEl);

      var descEl = document.createElement('div');
      descEl.className = 'meta-shop-desc';
      descEl.textContent = item.description;
      infoEl.appendChild(descEl);

      var catEl = document.createElement('div');
      catEl.className = 'meta-shop-category';
      catEl.textContent = maxed ? '✓ 已满级' : ('Lv.' + currentLevel + '/' + item.maxLevel);
      infoEl.appendChild(catEl);

      card.appendChild(infoEl);

      var btnEl = document.createElement('button');
      btnEl.className = 'meta-shop-buy' + (maxed ? ' owned-btn' : '');

      if (maxed) {
        btnEl.textContent = '已满级';
        btnEl.disabled = true;
      } else {
        btnEl.textContent = '⭐ ' + cost;
        btnEl.disabled = !canAfford;
        (function(self, shopItem, upgradeCost) {
          btnEl.addEventListener('click', function() {
            self._purchaseMetaUpgrade(shopItem, upgradeCost);
          });
        })(this, item, cost);
      }

      card.appendChild(btnEl);
      container.appendChild(card);
    }
  }

  _purchaseMetaWeapon(item) {
    var starCoins = (window.UpgradeManager && typeof window.UpgradeManager.getStarCoins === 'function')
      ? window.UpgradeManager.getStarCoins() : 0;

    if (starCoins < item.price) {
      this.showToast('⭐ 星币不足！', 2000);
      return;
    }

    // Deduct star coins
    if (window.UpgradeManager && typeof window.UpgradeManager.addStarCoins === 'function') {
      window.UpgradeManager.addStarCoins(-item.price);
    }

    // Record purchase
    var purchases = this._getMetaPurchases();
    purchases['weapon_' + item.id] = true;
    this._saveMetaPurchases(purchases);

    // Refresh UI
    this._updateMetaShopCoins();
    this._renderMetaShopWeapons();
    this.showToast('🔫 武器解锁: ' + item.name + '！', 2000, '#44ff44');
  }

  _purchaseMetaUpgrade(item, cost) {
    var starCoins = (window.UpgradeManager && typeof window.UpgradeManager.getStarCoins === 'function')
      ? window.UpgradeManager.getStarCoins() : 0;

    if (starCoins < cost) {
      this.showToast('⭐ 星币不足！', 2000);
      return;
    }

    var purchases = this._getMetaPurchases();
    var currentLevel = purchases['upgrade_' + item.id] || 0;
    if (currentLevel >= item.maxLevel) {
      this.showToast('已达到最高等级！', 2000);
      return;
    }

    // Deduct star coins
    if (window.UpgradeManager && typeof window.UpgradeManager.addStarCoins === 'function') {
      window.UpgradeManager.addStarCoins(-cost);
    }

    // Record purchase
    purchases['upgrade_' + item.id] = currentLevel + 1;
    this._saveMetaPurchases(purchases);

    // Refresh UI
    this._updateMetaShopCoins();
    this._renderMetaShopUpgrades();
    this.showToast('⬆️ 升级成功: ' + item.name + ' Lv.' + (currentLevel + 1) + '！', 2000, '#44ff44');
  }

  _renderMetaShopPermanent() {
    var container = this.elMetaShopItems;
    if (!container) return;
    container.innerHTML = '';

    var shopItems = GAME_CONFIG.SHOP_ITEMS;
    if (!shopItems) return;

    var purchases = this._getShopPurchases();
    var starCoins = (window.UpgradeManager && typeof window.UpgradeManager.getStarCoins === 'function')
      ? window.UpgradeManager.getStarCoins() : 0;

    var keys = Object.keys(shopItems);
    var hasItems = false;
    for (var i = 0; i < keys.length; i++) {
      var item = shopItems[keys[i]];
      if (item.category !== 'permanent') continue;
      hasItems = true;

      var owned = purchases[item.id];
      var canAfford = starCoins >= item.price;

      var card = document.createElement('div');
      card.className = 'meta-shop-card' + (owned ? ' owned' : '');

      var iconEl = document.createElement('div');
      iconEl.className = 'meta-shop-icon';
      iconEl.textContent = item.icon || '?';
      card.appendChild(iconEl);

      var infoEl = document.createElement('div');
      infoEl.className = 'meta-shop-info';

      var nameEl = document.createElement('div');
      nameEl.className = 'meta-shop-name';
      nameEl.textContent = item.name;
      infoEl.appendChild(nameEl);

      var descEl = document.createElement('div');
      descEl.className = 'meta-shop-desc';
      descEl.textContent = item.description;
      infoEl.appendChild(descEl);

      var catEl = document.createElement('div');
      catEl.className = 'meta-shop-category';
      catEl.textContent = owned ? '✓ 已拥有' : '永久道具';
      infoEl.appendChild(catEl);

      card.appendChild(infoEl);

      var btnEl = document.createElement('button');
      btnEl.className = 'meta-shop-buy' + (owned ? ' owned-btn' : '');

      if (owned) {
        btnEl.textContent = '已拥有';
        btnEl.disabled = true;
      } else {
        btnEl.textContent = '⭐ ' + item.price;
        btnEl.disabled = !canAfford;
        (function(self, shopItem) {
          btnEl.addEventListener('click', function() {
            self._purchaseShopItem(shopItem);
          });
        })(this, item);
      }

      card.appendChild(btnEl);
      container.appendChild(card);
    }

    if (!hasItems) {
      container.innerHTML = '<div style="color:#888;padding:20px;text-align:center;">暂无永久道具</div>';
    }
  }

  // ====================================================================
  //  Loadout Selection (Between-Run Weapon Selection)
  // ====================================================================

  /**
   * Show loadout selection screen for choosing which weapons to bring.
   * B7: Pre-game loadout — pick up to maxSlots starting weapons.
   * @param {Array<string>} ownedWeaponIds - all weapon IDs the player has unlocked
   * @param {Array<string>} currentLoadout - currently selected weapon IDs
   * @param {number} maxSlots - maximum number of weapons to select (default 2 for B7)
   * @param {Function} onConfirm - callback(selectedIds) when player confirms
   */
  showLoadoutSelection(ownedWeaponIds, currentLoadout, maxSlots, onConfirm) {
    maxSlots = maxSlots || 2; // B7: default max 2 starting weapons
    var selectedIds = currentLoadout.slice(0, maxSlots);

    // Create or reuse loadout screen
    var screen = document.getElementById('loadout-screen');
    if (!screen) {
      screen = document.createElement('div');
      screen.id = 'loadout-screen';
      screen.className = 'menu-screen';
      screen.style.display = 'none';
      document.body.appendChild(screen);
    }

    screen.innerHTML = '';

    // Title
    var title = document.createElement('h1');
    title.style.fontSize = '24px';
    title.textContent = '选择武器配置';
    screen.appendChild(title);

    var subtitle = document.createElement('div');
    subtitle.className = 'subtitle';
    subtitle.textContent = 'SELECT LOADOUT';
    screen.appendChild(subtitle);

    // Selection counter
    var counter = document.createElement('div');
    counter.style.cssText = 'color:#ffdd00;font-size:14px;margin:8px 0;';
    counter.textContent = '已选择: ' + selectedIds.length + ' / ' + maxSlots;
    screen.appendChild(counter);

    // Weapon grid
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:55vh;overflow-y:auto;padding:4px;';
    screen.appendChild(grid);

    var cfg = window.GAME_CONFIG;
    var self = this;

    function renderGrid() {
      grid.innerHTML = '';
      counter.textContent = '已选择: ' + selectedIds.length + ' / ' + maxSlots;

      for (var i = 0; i < ownedWeaponIds.length; i++) {
        var wid = ownedWeaponIds[i];
        var wCfg = (cfg && cfg.WEAPONS && cfg.WEAPONS[wid]) ? cfg.WEAPONS[wid] : null;
        var isSelected = selectedIds.indexOf(wid) !== -1;

        var card = document.createElement('div');
        card.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:8px;cursor:pointer;border:2px solid ' +
          (isSelected ? '#ffdd00' : '#334') + ';background:' + (isSelected ? 'rgba(255,221,0,0.12)' : 'rgba(255,255,255,0.04)') + ';transition:border-color 0.15s,background 0.15s;';

        var iconSpan = document.createElement('span');
        iconSpan.style.cssText = 'font-size:24px;flex-shrink:0;';
        iconSpan.textContent = wCfg ? (wCfg.icon || '?') : '?';
        card.appendChild(iconSpan);

        var infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'flex:1;text-align:left;';

        var nameDiv = document.createElement('div');
        nameDiv.style.cssText = 'font-size:13px;font-weight:bold;color:#fff;';
        nameDiv.textContent = wCfg ? (wCfg.name || wid) : wid;
        infoDiv.appendChild(nameDiv);

        var descDiv = document.createElement('div');
        descDiv.style.cssText = 'font-size:10px;color:#88ccff;margin-top:2px;line-height:1.3;';
        descDiv.textContent = wCfg ? (wCfg.description || '') : '';
        infoDiv.appendChild(descDiv);

        card.appendChild(infoDiv);

        if (isSelected) {
          var checkMark = document.createElement('span');
          checkMark.style.cssText = 'color:#ffdd00;font-size:18px;flex-shrink:0;';
          checkMark.textContent = '✓';
          card.appendChild(checkMark);
        }

        (function(weaponId) {
          card.addEventListener('click', function() {
            var idx = selectedIds.indexOf(weaponId);
            if (idx !== -1) {
              selectedIds.splice(idx, 1);
            } else if (selectedIds.length < maxSlots) {
              selectedIds.push(weaponId);
            } else {
              self.showToast('最多选择 ' + maxSlots + ' 把武器！', 1500);
              return;
            }
            renderGrid();
          });
        })(wid);

        grid.appendChild(card);
      }
    }

    renderGrid();

    // Confirm button
    var confirmBtn = document.createElement('button');
    confirmBtn.className = 'menu-btn';
    confirmBtn.style.marginTop = '12px';
    confirmBtn.textContent = '确认配置 (' + selectedIds.length + '/' + maxSlots + ')';
    confirmBtn.addEventListener('click', function() {
      if (selectedIds.length === 0) {
        self.showToast('请至少选择1把武器！', 1500);
        return;
      }
      // Save loadout
      if (window.WeaponLoadoutManager) {
        window.WeaponLoadoutManager.save(selectedIds);
      }
      // Hide loadout screen
      screen.style.display = 'none';
      // Callback
      if (onConfirm) onConfirm(selectedIds);
    });
    screen.appendChild(confirmBtn);

    // Update confirm button text on re-render
    var origRender = renderGrid;
    renderGrid = function() {
      origRender();
      confirmBtn.textContent = '确认配置 (' + selectedIds.length + '/' + maxSlots + ')';
    };

    // Show the screen
    this.showScreen('loadout-screen');
  }

  // ====================================================================
  //  Settings - Reset Data (重置数据)
  // ====================================================================

  /**
   * 显示重置数据确认弹窗
   */
  _showResetConfirm() {
    var self = this;
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:35;display:flex;flex-direction:column;align-items:center;justify-content:center;';

    var title = document.createElement('div');
    title.style.cssText = 'font-size:22px;font-weight:bold;color:#ff6666;margin-bottom:12px;text-shadow:0 0 15px rgba(255,68,68,0.5);';
    title.textContent = '⚠️ 重置数据';
    overlay.appendChild(title);

    var desc = document.createElement('div');
    desc.style.cssText = 'font-size:14px;color:#ccc;margin-bottom:24px;text-align:center;max-width:280px;line-height:1.6;';
    desc.textContent = '将清除以下数据:\n· 排行榜记录\n· 个人最佳战绩\n· 商店购买记录\n· 消耗品库存\n· 角色解锁进度\n\n此操作不可撤销！';
    overlay.appendChild(desc);

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:16px;';

    var btnConfirm = document.createElement('button');
    btnConfirm.className = 'menu-btn';
    btnConfirm.textContent = '确认重置';
    btnConfirm.style.cssText = 'border-color:#ff4444;color:#ff4444;';
    btnConfirm.addEventListener('click', function() {
      document.getElementById('ui-overlay').removeChild(overlay);
      self._resetAllData();
    });
    btnRow.appendChild(btnConfirm);

    var btnCancel = document.createElement('button');
    btnCancel.className = 'menu-btn';
    btnCancel.textContent = '取消';
    btnCancel.addEventListener('click', function() {
      document.getElementById('ui-overlay').removeChild(overlay);
    });
    btnRow.appendChild(btnCancel);

    overlay.appendChild(btnRow);
    document.getElementById('ui-overlay').appendChild(overlay);
  }

  /**
   * 执行数据重置
   */
  _resetAllData() {
    try {
      // 清除排行榜
      localStorage.removeItem('stg_leaderboard');
      // 清除个人最佳
      localStorage.removeItem('stg_personal_bests');
      // 清除商店购买
      localStorage.removeItem('stg_shop_purchases');
      // 清除消耗品
      localStorage.removeItem('stg_active_consumables');
      // 清除角色解锁
      localStorage.removeItem('stg_unlocked_characters');
      // 清除特效设置
      localStorage.removeItem('stg_effects_quality');
      // 清除已完成教程
      localStorage.removeItem('stg_tutorial_done');
      // 清除星币（如果有UpgradeManager）
      if (window.UpgradeManager && typeof window.UpgradeManager.resetStarCoins === 'function') {
        window.UpgradeManager.resetStarCoins();
      }
      this.showToast('✅ 数据已重置！', 2500);
    } catch (e) {
      this.showToast('⚠️ 重置失败', 2000);
    }
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
      // 渲染流派
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
    } else if (tab === 'enemies') {
      // 渲染敌人
      var enemyTypes = cfg.ENEMIES;
      if (enemyTypes) {
        for (var key in enemyTypes) {
          var e = enemyTypes[key];
          var card = document.createElement('div');
          card.className = 'codex-card';
          card.style.borderColor = (e.color || '#fff') + '44';
          card.innerHTML =
            '<div class="codex-card-icon" style="color:' + (e.color || '#fff') + '">●</div>' +
            '<div class="codex-card-name" style="color:' + (e.color || '#fff') + '">' + (e.name || key) + '</div>' +
            '<div class="codex-card-desc">' + (e.ai ? '行为: ' + e.ai : '') + '</div>' +
            '<div class="codex-card-stats">HP:' + e.hp + ' 速度:' + e.speed + ' 伤害:' + e.damage + '</div>' +
            '<div class="codex-card-stats">分数:' + e.score + ' 经验:' + e.xp + '</div>';
          container.appendChild(card);
        }
      }
    } else if (tab === 'bosses') {
      // 渲染Boss
      var bossTypes = cfg.BOSSES;
      if (bossTypes) {
        for (var key in bossTypes) {
          var b = bossTypes[key];
          var card = document.createElement('div');
          card.className = 'codex-card codex-card-boss';
          card.style.borderColor = (b.color || '#ff4444') + '66';
          var phaseHtml = '';
          if (b.phases) {
            phaseHtml = '<div class="codex-card-phases">';
            for (var p = 0; p < b.phases.length; p++) {
              var ph = b.phases[p];
              phaseHtml += '<div class="codex-phase">' +
                '<span class="codex-phase-hp">HP≤' + Math.round(ph.hpThreshold * 100) + '%</span> ' +
                '<span class="codex-phase-name">' + (ph.name || '阶段' + (p + 1)) + '</span>' +
                '</div>';
            }
            phaseHtml += '</div>';
          }
          card.innerHTML =
            '<div class="codex-card-icon" style="font-size:32px">' + (b.icon || '💀') + '</div>' +
            '<div class="codex-card-name" style="color:' + (b.color || '#ff4444') + ';font-size:14px">' + (b.name || key) + '</div>' +
            '<div class="codex-card-desc">' + (b.description || '') + '</div>' +
            '<div class="codex-card-stats">HP:' + b.baseHp + ' 伤害:' + b.baseDamage + ' 分数:' + b.score + '</div>' +
            phaseHtml;
          container.appendChild(card);
        }
      }
    }
  }

  // ====================================================================
  //  B1: BACKPACK INVENTORY UI
  // ====================================================================

  /**
   * Toggle backpack overlay open/closed.
   * Shows all owned weapons/skills with click-to-swap.
   */
  toggleBackpack() {
    var screen = document.getElementById('backpack-screen');
    if (!screen) return;

    if (screen.style.display === 'flex') {
      this.closeBackpack();
      return;
    }

    // Pause gameplay while backpack is open
    if (window.game) window.game.pause();

    // Hide HUD elements
    document.getElementById('hud').style.display = 'none';

    this._backpackSelectedWeapon = null;
    this._renderBackpack();
    screen.style.display = 'flex';
  }

  /**
   * Close backpack and resume game.
   */
  closeBackpack() {
    var screen = document.getElementById('backpack-screen');
    if (screen) screen.style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    if (window.game) window.game.resume();
    if (this._backpackEscHandler) {
      document.removeEventListener('keydown', this._backpackEscHandler);
      this._backpackEscHandler = null;
    }
  }

  /**
   * Render backpack contents: weapon slots grid + inventory items.
   */
  _renderBackpack() {
    var screen = document.getElementById('backpack-screen');
    if (!screen) return;

    screen.innerHTML = '';
    screen.className = 'menu-screen'; // Use same styling as other screens
    screen.style.zIndex = '40';
    screen.style.overflowY = 'auto';
    screen.style.padding = '20px 16px';

    // Title
    var title = document.createElement('h2');
    title.style.cssText = 'color:#ffdd00;font-size:22px;margin-bottom:4px;text-shadow:0 0 10px rgba(255,221,0,0.4);';
    title.textContent = '🎒 背包';
    screen.appendChild(title);

    var subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:11px;color:#888;margin-bottom:10px;';
    subtitle.textContent = '点击物品 → 点击槽位进行装备/交换 | 按 I 关闭';
    screen.appendChild(subtitle);

    var self = this;
    var wm = window.weaponManager;
    var sm = window.skillManager;
    var cfg = window.GAME_CONFIG;

    // === Stat Summary Panel ===
    var p = window.playerEntity || (window.game ? window.game.player : null);
    if (p) {
      var statPanel = document.createElement('div');
      statPanel.style.cssText = 'background:rgba(255,255,255,0.04);border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:12px;';
      var statTitle = document.createElement('div');
      statTitle.style.cssText = 'font-size:12px;color:#ffdd00;margin-bottom:6px;font-weight:bold;';
      statTitle.textContent = '📊 当前属性';
      statPanel.appendChild(statTitle);

      var stats = p.stats || {};
      var hpPct = p.maxHp > 0 ? Math.round(p.hp / p.maxHp * 100) : 0;
      var atkBonus = stats.attack ? Math.round((stats.attack - 1) * 100) : 0;
      var spd = Math.round(p.speed);
      var def = stats.defense ? Math.round(stats.defense * 100) : 0;
      var crit = stats.critRate ? Math.round(stats.critRate * 100) : 0;
      var cdmg = stats.critMult ? Math.round((stats.critMult - 1.5) * 100) : 0;
      var ls = stats.lifesteal ? Math.round(stats.lifesteal * 100) : 0;
      var dodge = stats.dodgeChance ? Math.round(stats.dodgeChance * 100) : 0;
      var ap = stats.armorPenetration ? Math.round(stats.armorPenetration * 100) : 0;
      var regen = stats.hpRegen || 0;
      var wSlots = wm ? (wm.maxWeaponSlots || 0) : (sm ? sm.weaponSlotsUnlocked : 0);
      var pSlots = wm ? (wm.maxPassiveSlots || 0) : 0;
      var cores = sm ? (sm.fusionCoreCount || 0) : 0;

      var statGrid = document.createElement('div');
      statGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;font-size:11px;color:#aaa;';
      statGrid.innerHTML =
        '❤️ HP: ' + Math.floor(p.hp) + '/' + p.maxHp + ' (' + hpPct + '%)<br>' +
        '⚔️ 攻击: ' + (atkBonus >= 0 ? '+' : '') + atkBonus + '%<br>' +
        '👟 速度: ' + spd + '<br>' +
        '🛡️ 减伤: ' + def + '%' +
        '💥 暴击: ' + crit + '%' +
        ' 📈 爆伤: ' + cdmg + '%' +
        '🩸 吸血: ' + ls + '%' +
        ' 💨 闪避: ' + dodge + '%' +
        '🔱 穿甲: ' + ap + '%' +
        ' 💚 再生: ' + regen + '/s' +
        '🔫 武器槽: ' + wSlots +
        ' 🛡️ 被动槽: ' + pSlots +
        '🔮 核心: ' + cores;

      statPanel.appendChild(statGrid);
      screen.appendChild(statPanel);
    }

    // === Weapon Slots Row ===
    var slotLabel = document.createElement('div');
    slotLabel.style.cssText = 'font-size:13px;color:#ccc;margin-bottom:6px;';
    slotLabel.textContent = '🔫 武器槽位';
    screen.appendChild(slotLabel);

    var slotsRow = document.createElement('div');
    slotsRow.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;';
    screen.appendChild(slotsRow);

    var maxWSlots = (wm && wm.maxWeaponSlots) || (sm && sm.MAX_WEAPON_SLOTS) || 6;
    if (wm && wm.weaponSlots) {
      for (var i = 0; i < Math.min(maxWSlots, wm.weaponSlots.length); i++) {
        var slot = wm.weaponSlots[i];
        var slotEl = document.createElement('div');
        slotEl.style.cssText = 'width:48px;height:48px;border:2px solid ' + (slot ? '#44ddff' : '#444') +
          ';border-radius:8px;display:flex;align-items:center;justify-content:center;' +
          'background:' + (slot ? 'rgba(68,221,255,0.1)' : 'rgba(255,255,255,0.03)') +
          ';cursor:pointer;font-size:18px;position:relative;transition:border-color 0.2s;';
        slotEl.title = '槽位 ' + (i + 1);

        if (slot) {
          var wCfg = cfg.WEAPONS ? cfg.WEAPONS[slot.weaponId] : null;
          slotEl.textContent = wCfg ? (wCfg.icon || '🔫') : '🔫';

          var lvlBadge = document.createElement('span');
          lvlBadge.style.cssText = 'position:absolute;bottom:0;right:2px;font-size:8px;color:#44ffaa;text-shadow:0 0 2px #000;';
          lvlBadge.textContent = 'Lv' + (slot.level || 1);
          slotEl.appendChild(lvlBadge);

          // Click filled slot: select for swapping or unequip
          (function(slotIdx) {
            slotEl.addEventListener('click', function() {
              if (self._backpackSelectedWeapon) {
                self._backpackEquipToSlot(slotIdx);
              } else {
                self._backpackUnequipWeapon(slotIdx);
              }
            });
          })(i);
        } else {
          slotEl.textContent = '－';
          slotEl.style.opacity = '0.4';
          (function(slotIdx) {
            slotEl.addEventListener('click', function() {
              self._backpackEquipToSlot(slotIdx);
            });
          })(i);
        }

        slotsRow.appendChild(slotEl);
      }
    }

    // === Inventory: All owned weapons ===
    var invLabel = document.createElement('div');
    invLabel.style.cssText = 'font-size:13px;color:#ccc;margin-bottom:6px;';
    invLabel.textContent = '📦 武器仓库';
    screen.appendChild(invLabel);

    var invGrid = document.createElement('div');
    invGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px;max-height:35vh;overflow-y:auto;padding:4px;';
    screen.appendChild(invGrid);

    if (sm && sm.weaponLevels) {
      sm.weaponLevels.forEach(function(lvl, wid) {
        var wCfg = cfg.WEAPONS ? cfg.WEAPONS[wid] : null;
        if (!wCfg || wCfg.fused) return;

        var itemEl = document.createElement('div');
        var isSelected = self._backpackSelectedWeapon === wid;
        itemEl.style.cssText = 'padding:8px;border:2px solid ' + (isSelected ? '#ffdd00' : '#334') +
          ';border-radius:8px;cursor:pointer;text-align:center;transition:border-color 0.15s;' +
          'background:' + (isSelected ? 'rgba(255,221,0,0.12)' : 'rgba(255,255,255,0.04)') + ';';
        itemEl.title = wCfg.name + ' Lv' + lvl;

        var iconEl = document.createElement('div');
        iconEl.style.cssText = 'font-size:24px;';
        iconEl.textContent = wCfg.icon || '🔫';
        itemEl.appendChild(iconEl);

        var nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-size:10px;color:#fff;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        nameEl.textContent = wCfg.name;
        itemEl.appendChild(nameEl);

        var lvlEl = document.createElement('div');
        lvlEl.style.cssText = 'font-size:9px;color:#44ffaa;';
        lvlEl.textContent = 'Lv' + lvl;
        itemEl.appendChild(lvlEl);

        (function(wId) {
          itemEl.addEventListener('click', function() {
            self._backpackSelectedWeapon = (self._backpackSelectedWeapon === wId) ? null : wId;
            self._renderBackpack();
          });
        })(wid);

        invGrid.appendChild(itemEl);
      });
    }

    // === Passive Slots Row ===
    var passiveLabel = document.createElement('div');
    passiveLabel.style.cssText = 'font-size:13px;color:#ccc;margin-bottom:6px;margin-top:8px;';
    passiveLabel.textContent = '🛡️ 被动槽位';
    screen.appendChild(passiveLabel);

    var passiveRow = document.createElement('div');
    passiveRow.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;';
    screen.appendChild(passiveRow);

    var maxPSlots = (wm && wm.maxPassiveSlots) || 4;
    if (wm && wm.passiveSlots) {
      for (var pi = 0; pi < Math.min(maxPSlots, wm.passiveSlots.length); pi++) {
        var pSlot = wm.passiveSlots[pi];
        var pSlotEl = document.createElement('div');
        pSlotEl.style.cssText = 'width:48px;height:48px;border:2px solid ' + (pSlot ? '#dd88ff' : '#444') +
          ';border-radius:8px;display:flex;align-items:center;justify-content:center;' +
          'background:' + (pSlot ? 'rgba(221,136,255,0.12)' : 'rgba(255,255,255,0.03)') +
          ';font-size:18px;position:relative;';
        if (pSlot) {
          var pCfg = cfg.WEAPONS ? cfg.WEAPONS[pSlot.weaponId] : null;
          pSlotEl.textContent = pCfg ? (pCfg.icon || '🛡️') : '🛡️';
          var pLvl = document.createElement('span');
          pLvl.style.cssText = 'position:absolute;bottom:0;right:2px;font-size:8px;color:#cc88ff;text-shadow:0 0 2px #000;';
          pLvl.textContent = 'Lv' + (pSlot.level || 1);
          pSlotEl.appendChild(pLvl);
        } else {
          pSlotEl.textContent = '－';
          pSlotEl.style.opacity = '0.4';
        }
        passiveRow.appendChild(pSlotEl);
      }
    }

    // === Fusion Core Count & Manual Fusion ===
    var fusionSection = document.createElement('div');
    fusionSection.style.cssText = 'margin-top:8px;border-top:1px solid #333;padding-top:10px;';
    screen.appendChild(fusionSection);

    var coreCount = sm ? (sm.fusionCoreCount || 0) : 0;
    var coreLabel = document.createElement('div');
    coreLabel.style.cssText = 'font-size:13px;color:#ccc;margin-bottom:6px;';
    coreLabel.textContent = '🔮 融合核心: ' + coreCount + ' 个';
    fusionSection.appendChild(coreLabel);

    if (sm && typeof sm.checkFusions === 'function') {
      var fusions = sm.checkFusions();
      if (fusions.length > 0 && coreCount > 0) {
        var fusionHint = document.createElement('div');
        fusionHint.style.cssText = 'font-size:11px;color:#aa66ff;margin-bottom:6px;';
        fusionHint.textContent = '✨ 以下武器/技能可进行融合:';
        fusionSection.appendChild(fusionHint);

        for (var fi = 0; fi < fusions.length; fi++) {
          (function(fusionItem) {
            var fBtn = document.createElement('button');
            var isWeapon = fusionItem.type === 'weapon';
            var recipe = fusionItem.recipe;
            var rName = recipe.name || (isWeapon ? '武器融合' : '技能融合');
            fBtn.style.cssText = 'display:block;width:100%;padding:8px;margin-bottom:4px;border:1px solid #8844cc;border-radius:6px;background:rgba(136,68,204,0.1);color:#ddbbff;cursor:pointer;font-size:12px;text-align:left;';
            fBtn.innerHTML = '🔀 ' + rName + ' <span style="float:right;color:#ffdd44;">消耗 1 核心</span>';

            if (isWeapon) {
              var wA = cfg.WEAPONS ? cfg.WEAPONS[recipe.ingredientA] : null;
              var wB = cfg.WEAPONS ? cfg.WEAPONS[recipe.ingredientB] : null;
              var wR = cfg.WEAPONS ? cfg.WEAPONS[recipe.result] : null;
              fBtn.title = (wA ? wA.name : recipe.ingredientA) + ' + ' + (wB ? wB.name : recipe.ingredientB) + ' → ' + (wR ? wR.name : recipe.result);
            }

            fBtn.addEventListener('click', function() {
              if (isWeapon && typeof sm.executeWeaponFusion === 'function') {
                sm.executeWeaponFusion(recipe);
              } else if (!isWeapon && typeof sm.executeSkillFusion === 'function') {
                sm.executeSkillFusion(recipe);
              }
              self._renderBackpack();
            });
            fusionSection.appendChild(fBtn);
          })(fusions[fi]);
        }
      } else if (coreCount > 0) {
        var noFusion = document.createElement('div');
        noFusion.style.cssText = 'font-size:11px;color:#666;margin-bottom:6px;';
        noFusion.textContent = '当前没有可用的融合配方';
        fusionSection.appendChild(noFusion);
      }
    }

    // === Close button ===
    var closeBtn = document.createElement('button');
    closeBtn.className = 'menu-btn';
    closeBtn.style.cssText = 'margin-top:12px;';
    closeBtn.textContent = '关闭背包 (I)';
    closeBtn.addEventListener('click', function() {
      self.closeBackpack();
    });
    screen.appendChild(closeBtn);

    // ESC to close
    this._backpackEscHandler = function(e) {
      if (e.key === 'Escape') {
        self.closeBackpack();
      }
    };
    document.addEventListener('keydown', this._backpackEscHandler);
  }

  _backpackUnequipWeapon(slotIndex) {
    var wm = window.weaponManager;
    if (!wm || !wm.weaponSlots[slotIndex]) return;
    wm.removeWeaponFromSlot(slotIndex);
    this.showToast('🗑️ 卸载武器 (槽位 ' + (slotIndex + 1) + ')', 1500, '#ffaa44');
    this._renderBackpack();
  }

  _backpackEquipToSlot(slotIndex) {
    if (!this._backpackSelectedWeapon) {
      this.showToast('请先从仓库选择一把武器', 1500, '#ff4444');
      return;
    }

    var wm = window.weaponManager;
    var sm = window.skillManager;
    if (!wm) return;

    var weaponId = this._backpackSelectedWeapon;
    var curLvl = sm ? (sm.weaponLevels.get(weaponId) || 0) : 0;

    // Check if weapon is already in another slot
    for (var i = 0; i < wm.weaponSlots.length; i++) {
      if (wm.weaponSlots[i] && wm.weaponSlots[i].weaponId === weaponId) {
        // Swap: move from old slot to new slot
        var oldSlot = wm.weaponSlots[i];
        wm.weaponSlots[i] = wm.weaponSlots[slotIndex];
        wm.weaponSlots[slotIndex] = oldSlot;
        this._backpackSelectedWeapon = null;
        this.showToast('🔄 交换武器到槽位 ' + (slotIndex + 1), 1500, '#ffdd00');
        this._renderBackpack();
        return;
      }
    }

    // Weapon not in any slot: equip to slot
    wm.addWeaponToSlot(weaponId, slotIndex);
    if (curLvl > 0 && wm.weaponSlots[slotIndex]) {
      wm.weaponSlots[slotIndex].level = curLvl;
    }

    this._backpackSelectedWeapon = null;
    var wCfg = GAME_CONFIG.WEAPONS ? GAME_CONFIG.WEAPONS[weaponId] : null;
    this.showToast('✅ ' + (wCfg ? wCfg.name : weaponId) + ' 装备到槽位 ' + (slotIndex + 1), 1500, '#44ff44');
    this._renderBackpack();
  }
}

// ====================================================================
//  Singleton export
// ====================================================================
window.UIManager = UIManager;
window.ui = new UIManager();
