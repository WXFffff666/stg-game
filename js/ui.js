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

    // Toast timer ref
    this._toastTimer = null;

    // Combo fade timer
    this._comboFadeTimer = null;

    // Callbacks (set by main.js)
    this.onStartGame = null;       // (factionId) => {}
    this.onSkillSelected = null;   // (skillId) => {}
    this.onRestart = null;         // () => {}
    this.onMenu = null;            // () => {}
    this.onPauseToggle = null;     // () => {}

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

  showLevelUp(skills, onSelect) {
    const choices = this.elSkillChoices;
    if (!choices) return;

    // Build skill cards
    choices.innerHTML = '';
    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      const card = document.createElement('div');
      card.className = 'skill-card rarity-' + (s.rarity || 'common');
      card.dataset.skillId = s.id;

      const nameEl = document.createElement('div');
      nameEl.className = 'skill-name';
      nameEl.textContent = s.name || s.id;

      const descEl = document.createElement('div');
      descEl.className = 'skill-desc';
      descEl.textContent = s.description || '';

      const rarityEl = document.createElement('div');
      rarityEl.className = 'skill-rarity';
      rarityEl.textContent = this._rarityLabel(s.rarity);

      card.appendChild(nameEl);
      card.appendChild(descEl);
      card.appendChild(rarityEl);

      // Add click handler
      card.addEventListener('click', (function(skillId) {
        return function() {
          if (typeof onSelect === 'function') {
            onSelect(skillId);
          }
        };
      })(s.id));

      choices.appendChild(card);
    }

    // Show the overlay as flex
    if (this.elLevelUp) this.elLevelUp.style.display = 'flex';
  }

  hideLevelUp() {
    if (this.elLevelUp) this.elLevelUp.style.display = 'none';
  }

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
}

// ====================================================================
//  Singleton export
// ====================================================================
window.UIManager = UIManager;
window.ui = new UIManager();
