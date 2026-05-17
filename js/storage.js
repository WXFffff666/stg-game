/**
 * STG Game - Storage & Leaderboard
 * localStorage persistence with basic obfuscation (base64 + checksum).
 * 
 * Exports: window.StorageManager, window.LeaderboardManager
 */

// ====================================================================
//  StorageManager — game progress save/load
// ====================================================================

var StorageManager = {
  _KEY: 'stg_save',
  _VERSION: 1,

  /**
   * Compute a simple checksum over numeric values in state.
   * XOR of all numbers found at the top level and inside learnedSkills lengths.
   * Prevents casual editing of saved data.
   */
  _checksum: function (state) {
    var hash = 0;
    // Top-level numeric fields
    if (typeof state.score === 'number') hash ^= state.score;
    if (typeof state.level === 'number') hash ^= state.level;
    if (typeof state.xp === 'number') hash ^= state.xp;
    if (typeof state.kills === 'number') hash ^= state.kills;
    if (typeof state.gameTime === 'number') hash ^= Math.floor(state.gameTime);
    // Include learnedSkills count and skill id hashes
    if (state.learnedSkills && state.learnedSkills.length) {
      hash ^= state.learnedSkills.length;
      for (var i = 0; i < state.learnedSkills.length; i++) {
        if (typeof state.learnedSkills[i] === 'string') {
          // Simple string hash contribution
          for (var j = 0; j < state.learnedSkills[i].length; j++) {
            hash ^= state.learnedSkills[i].charCodeAt(j) << (j % 8);
          }
        }
      }
    }
    return hash >>> 0; // unsigned 32-bit
  },

  /**
   * Save current game state.
   * @param {Object} state — { score, level, xp, faction, learnedSkills[], gameTime, kills }
   */
  saveGame: function (state) {
    if (!state) return false;
    try {
      var jsonStr = JSON.stringify(state);
      var encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      var checksum = this._checksum(state);
      var payload = JSON.stringify({ v: this._VERSION, d: encoded, c: checksum });
      localStorage.setItem(this._KEY, payload);
      return true;
    } catch (e) {
      console.warn('StorageManager.saveGame failed:', e);
      return false;
    }
  },

  /**
   * Load saved game state.
   * @returns {Object|null} Parsed state, or null if no save / invalid checksum.
   */
  loadGame: function () {
    try {
      var raw = localStorage.getItem(this._KEY);
      if (!raw) return null;

      var payload = JSON.parse(raw);
      if (!payload || payload.v !== this._VERSION || typeof payload.c !== 'number' || typeof payload.d !== 'string') {
        return null;
      }

      var jsonStr = decodeURIComponent(escape(atob(payload.d)));
      var state = JSON.parse(jsonStr);

      // Verify checksum
      if (this._checksum(state) !== payload.c) {
        console.warn('StorageManager: checksum mismatch — save may have been tampered');
        return null;
      }

      return state;
    } catch (e) {
      console.warn('StorageManager.loadGame failed:', e);
      return null;
    }
  },

  /**
   * Remove saved game.
   */
  clearSave: function () {
    try {
      localStorage.removeItem(this._KEY);
    } catch (e) {
      // ignore
    }
  },

  /**
   * Check if a save exists.
   * @returns {boolean}
   */
  hasSave: function () {
    return localStorage.getItem(this._KEY) !== null;
  }
};

// ====================================================================
//  LeaderboardManager — high score tracking
// ====================================================================

var LeaderboardManager = {
  _KEY: 'stg_leaderboard',
  _VERSION: 1,
  _MAX_ENTRIES: 50,
  _TOP_COUNT: 20,

  /**
   * Compute checksum over leaderboard entries.
   * XOR of each entry's score + kills + level + time, plus entry count.
   */
  _checksum: function (entries) {
    var hash = entries.length;
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (typeof e.score === 'number') hash ^= e.score;
      if (typeof e.kills === 'number') hash ^= e.kills;
      if (typeof e.level === 'number') hash ^= e.level;
      if (typeof e.time === 'number') hash ^= Math.floor(e.time);
    }
    return hash >>> 0;
  },

  /**
   * Load raw leaderboard entries from localStorage.
   * @returns {Array} Array of entry objects, or empty array.
   */
  _loadRaw: function () {
    try {
      var raw = localStorage.getItem(this._KEY);
      if (!raw) return [];

      var payload = JSON.parse(raw);
      if (!payload || payload.v !== this._VERSION || typeof payload.c !== 'number' || typeof payload.d !== 'string') {
        return [];
      }

      var jsonStr = decodeURIComponent(escape(atob(payload.d)));
      var entries = JSON.parse(jsonStr);

      if (!Array.isArray(entries)) return [];

      // Verify checksum
      if (this._checksum(entries) !== payload.c) {
        console.warn('LeaderboardManager: checksum mismatch');
        return [];
      }

      return entries;
    } catch (e) {
      console.warn('LeaderboardManager._loadRaw failed:', e);
      return [];
    }
  },

  /**
   * Save entries to localStorage with encoding + checksum.
   * @param {Array} entries
   */
  _saveRaw: function (entries) {
    try {
      var jsonStr = JSON.stringify(entries);
      var encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      var checksum = this._checksum(entries);
      var payload = JSON.stringify({ v: this._VERSION, d: encoded, c: checksum });
      localStorage.setItem(this._KEY, payload);
      return true;
    } catch (e) {
      console.warn('LeaderboardManager._saveRaw failed:', e);
      return false;
    }
  },

  /**
   * Add or update a leaderboard entry.
   * If the same name already exists:
   *   - Lower score → replaces old entry (update)
   *   - Higher or equal score → keeps old entry (no change)
   * 
   * @param {string}   name
   * @param {number}   score
   * @param {string}   faction
   * @param {number}   level
   * @param {number}   kills
   * @param {number}   time     — game time in seconds
   */
  saveScore: function (name, score, faction, level, kills, time) {
    if (!name || typeof score !== 'number' || score < 0) return false;

    var entries = this._loadRaw();
    var existing = -1;

    // Check for existing entry with same name
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].name === name) {
        existing = i;
        break;
      }
    }

    if (existing !== -1) {
      // Same name exists: only update if new score is HIGHER
      if (score <= entries[existing].score) {
        return false; // existing entry has equal or higher score, keep it
      }
      // Replace old entry
      entries[existing] = {
        name: name,
        score: score,
        faction: faction || '',
        level: level || 1,
        kills: kills || 0,
        time: time || 0,
        date: new Date().toISOString()
      };
    } else {
      // New entry
      entries.push({
        name: name,
        score: score,
        faction: faction || '',
        level: level || 1,
        kills: kills || 0,
        time: time || 0,
        date: new Date().toISOString()
      });
    }

    // Sort by score descending
    entries.sort(function (a, b) { return b.score - a.score; });

    // Trim to max entries
    if (entries.length > this._MAX_ENTRIES) {
      entries = entries.slice(0, this._MAX_ENTRIES);
    }

    return this._saveRaw(entries);
  },

  /**
   * Get top leaderboard entries.
   * @returns {Array} Sorted top 20 entries (or fewer).
   */
  getLeaderboard: function () {
    var entries = this._loadRaw();
    // Already sorted descending in saveScore, but sort again for safety
    entries.sort(function (a, b) { return b.score - a.score; });
    return entries.slice(0, this._TOP_COUNT);
  },

  /**
   * Get the rank a given score would achieve (1-based).
   * Returns 1 if leaderboard is empty or score is the highest.
   * Returns (leaderboard.length + 1) if score is lower than all entries.
   * 
   * @param {number} score
   * @returns {number} 1-based rank
   */
  getRank: function (score) {
    var entries = this._loadRaw();
    entries.sort(function (a, b) { return b.score - a.score; });

    for (var i = 0; i < entries.length; i++) {
      if (score >= entries[i].score) {
        return i + 1;
      }
    }
    return entries.length + 1;
  }
};

// ====================================================================
//  UpgradeManager — star coins & permanent upgrades
// ====================================================================

var UpgradeManager = {
  _KEY: 'stg_upgrades',
  _VERSION: 1,

  _checksum: function (data) {
    var hash = 0;
    if (typeof data.starCoins === 'number') hash ^= data.starCoins;
    if (data.upgrades) {
      for (var key in data.upgrades) {
        if (data.upgrades.hasOwnProperty(key)) {
          hash ^= data.upgrades[key] * 7;
        }
      }
    }
    return hash >>> 0;
  },

  /**
   * Load upgrade data from localStorage.
   * @returns {Object} { starCoins: number, upgrades: { attackPower: level, ... } }
   */
  load: function () {
    try {
      var raw = localStorage.getItem(this._KEY);
      if (!raw) return { starCoins: 0, upgrades: {} };

      var payload = JSON.parse(raw);
      if (!payload || payload.v !== this._VERSION || typeof payload.c !== 'number' || typeof payload.d !== 'string') {
        return { starCoins: 0, upgrades: {} };
      }

      var jsonStr = decodeURIComponent(escape(atob(payload.d)));
      var data = JSON.parse(jsonStr);

      if (this._checksum(data) !== payload.c) {
        console.warn('UpgradeManager: checksum mismatch');
        return { starCoins: 0, upgrades: {} };
      }

      return data;
    } catch (e) {
      console.warn('UpgradeManager.load failed:', e);
      return { starCoins: 0, upgrades: {} };
    }
  },

  /**
   * Save upgrade data to localStorage.
   * @param {Object} data — { starCoins, upgrades }
   */
  _save: function (data) {
    try {
      var jsonStr = JSON.stringify(data);
      var encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      var checksum = this._checksum(data);
      var payload = JSON.stringify({ v: this._VERSION, d: encoded, c: checksum });
      localStorage.setItem(this._KEY, payload);
      return true;
    } catch (e) {
      console.warn('UpgradeManager._save failed:', e);
      return false;
    }
  },

  /**
   * Get current star coin balance.
   * @returns {number}
   */
  getStarCoins: function () {
    return this.load().starCoins || 0;
  },

  /**
   * Add star coins (e.g. after a game run).
   * @param {number} amount
   * @returns {number} new total
   */
  addStarCoins: function (amount) {
    var data = this.load();
    data.starCoins = (data.starCoins || 0) + Math.max(0, amount);
    this._save(data);
    return data.starCoins;
  },

  /**
   * Get the current level of a specific upgrade.
   * @param {string} upgradeId
   * @returns {number} level (0 if not purchased)
   */
  getUpgradeLevel: function (upgradeId) {
    var data = this.load();
    return (data.upgrades && data.upgrades[upgradeId]) || 0;
  },

  /**
   * Get all upgrade levels.
   * @returns {Object} { upgradeId: level, ... }
   */
  getAllUpgradeLevels: function () {
    var data = this.load();
    return data.upgrades || {};
  },

  /**
   * Attempt to purchase an upgrade.
   * @param {string} upgradeId
   * @returns {Object} { success: boolean, message: string, newLevel: number }
   */
  purchaseUpgrade: function (upgradeId) {
    var cfg = window.GAME_CONFIG;
    var upgradeDef = cfg && cfg.UPGRADES && cfg.UPGRADES[upgradeId];
    if (!upgradeDef) return { success: false, message: '未知升级', newLevel: 0 };

    var data = this.load();
    var currentLevel = (data.upgrades && data.upgrades[upgradeId]) || 0;

    if (currentLevel >= upgradeDef.maxLevel) {
      return { success: false, message: '已满级', newLevel: currentLevel };
    }

    var cost = cfg.UPGRADES.costFormula(currentLevel);
    if (data.starCoins < cost) {
      return { success: false, message: '星币不足', newLevel: currentLevel };
    }

    // Deduct and upgrade
    data.starCoins -= cost;
    if (!data.upgrades) data.upgrades = {};
    data.upgrades[upgradeId] = currentLevel + 1;
    this._save(data);

    return { success: true, message: '升级成功', newLevel: currentLevel + 1 };
  },

  /**
   * Get the cost to upgrade a specific upgrade to next level.
   * @param {string} upgradeId
   * @returns {number} cost, or -1 if max level
   */
  getUpgradeCost: function (upgradeId) {
    var cfg = window.GAME_CONFIG;
    var upgradeDef = cfg && cfg.UPGRADES && cfg.UPGRADES[upgradeId];
    if (!upgradeDef) return -1;

    var currentLevel = this.getUpgradeLevel(upgradeId);
    if (currentLevel >= upgradeDef.maxLevel) return -1;

    return cfg.UPGRADES.costFormula(currentLevel);
  }
};

// ====================================================================
//  Export to window
// ====================================================================

window.StorageManager = StorageManager;
window.LeaderboardManager = LeaderboardManager;
window.UpgradeManager = UpgradeManager;
