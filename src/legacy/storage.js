/**
 * STG Game - Storage & Leaderboard
 * localStorage persistence with basic obfuscation (base64 + checksum).
 * Includes memory fallback for privacy/incognito mode.
 * 
 * Exports: window.StorageManager, window.LeaderboardManager
 */

// ====================================================================
//  Safe localStorage wrapper (memory fallback for privacy mode)
// ====================================================================

var _safeStorage = (function() {
  var memoryStore = {};
  var useMemory = false;

  // Test if localStorage is available and writable
  try {
    var testKey = '__stg_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
  } catch (e) {
    useMemory = true;
    console.warn('localStorage unavailable, using memory fallback (data won\'t persist)');
  }

  return {
    getItem: function(key) {
      if (useMemory) return memoryStore.hasOwnProperty(key) ? memoryStore[key] : null;
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem: function(key, value) {
      if (useMemory) { memoryStore[key] = value; return; }
      try { localStorage.setItem(key, value); } catch (e) { memoryStore[key] = value; }
    },
    removeItem: function(key) {
      if (useMemory) { delete memoryStore[key]; return; }
      try { localStorage.removeItem(key); } catch (e) { delete memoryStore[key]; }
    }
  };
})();

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
    // learnedSkills can be a Map (live) or array of [key, count] pairs (deserialized)
    var lsEntries = null;
    if (state.learnedSkills) {
      if (state.learnedSkills instanceof Map) {
        lsEntries = Array.from(state.learnedSkills.entries());
      } else if (Array.isArray(state.learnedSkills)) {
        lsEntries = state.learnedSkills;
      }
    }
    if (lsEntries && lsEntries.length) {
      hash ^= lsEntries.length;
      for (var i = 0; i < lsEntries.length; i++) {
        var entry = lsEntries[i];
        var skillKey = Array.isArray(entry) ? entry[0] : entry;
        if (typeof skillKey === 'string') {
          // Simple string hash contribution
          for (var j = 0; j < skillKey.length; j++) {
            hash ^= skillKey.charCodeAt(j) << (j % 8);
          }
        }
        // Include stack count in hash
        if (Array.isArray(entry) && typeof entry[1] === 'number') {
          hash ^= entry[1];
        }
      }
    }
    return hash >>> 0; // unsigned 32-bit
  },

  /**
   * Save current game state.
   * @param {Object} state — { score, level, xp, faction, learnedSkills (Map), gameTime, kills }
   */
  saveGame: function (state) {
    if (!state) return false;
    try {
      // Convert Map to array of [key, count] pairs for JSON serialization
      var saveState = state;
      if (state.learnedSkills instanceof Map) {
        saveState = {};
        for (var k in state) {
          if (state.hasOwnProperty(k)) saveState[k] = state[k];
        }
        saveState.learnedSkills = Array.from(state.learnedSkills.entries());
      }
      var jsonStr = JSON.stringify(saveState);
      var encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      var checksum = this._checksum(saveState);
      var payload = JSON.stringify({ v: this._VERSION, d: encoded, c: checksum });
      _safeStorage.setItem(this._KEY, payload);
      return true;
    } catch (e) {
      console.warn('StorageManager.saveGame failed:', e);
      return false;
    }
  },

  /**
   * Load saved game state.
   * @returns {Object|null} Parsed state, or null if no save / invalid checksum.
   *   learnedSkills is restored as a Map of skillId → stack count.
   */
  loadGame: function () {
    try {
      var raw = _safeStorage.getItem(this._KEY);
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

      // Convert learnedSkills from array of [key, count] pairs back to Map
      if (state.learnedSkills && Array.isArray(state.learnedSkills)) {
        state.learnedSkills = new Map(state.learnedSkills);
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
      _safeStorage.removeItem(this._KEY);
    } catch (e) {
      // ignore
    }
  },

  /**
   * Check if a save exists.
   * @returns {boolean}
   */
  hasSave: function () {
    return _safeStorage.getItem(this._KEY) !== null;
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
      var raw = _safeStorage.getItem(this._KEY);
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
      _safeStorage.setItem(this._KEY, payload);
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
      var raw = _safeStorage.getItem(this._KEY);
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
      _safeStorage.setItem(this._KEY, payload);
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
   * Add star coins (e.g. after a game run). Supports negative amounts for purchases.
   * @param {number} amount
   * @returns {number} new total
   */
  addStarCoins: function (amount) {
    var data = this.load();
    data.starCoins = Math.max(0, (data.starCoins || 0) + amount);
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
//  AchievementManager — unlocked achievements persistence
// ====================================================================

var AchievementManager = {
  _KEY: 'stg_achievements',
  _VERSION: 1,

  _checksum: function (achievements) {
    var hash = achievements.length;
    for (var i = 0; i < achievements.length; i++) {
      var a = achievements[i];
      if (typeof a.id === 'string') {
        for (var j = 0; j < a.id.length; j++) {
          hash ^= a.id.charCodeAt(j) << (j % 8);
        }
      }
      if (typeof a.unlockedAt === 'number') hash ^= a.unlockedAt;
    }
    return hash >>> 0;
  },

  /**
   * Load all achievements from localStorage.
   * @returns {Array} Array of { id: string, unlockedAt: number } or empty array.
   */
  load: function () {
    try {
      var raw = _safeStorage.getItem(this._KEY);
      if (!raw) return [];

      var payload = JSON.parse(raw);
      if (!payload || payload.v !== this._VERSION || typeof payload.c !== 'number' || typeof payload.d !== 'string') {
        return [];
      }

      var jsonStr = decodeURIComponent(escape(atob(payload.d)));
      var achievements = JSON.parse(jsonStr);

      if (!Array.isArray(achievements)) return [];

      if (this._checksum(achievements) !== payload.c) {
        console.warn('AchievementManager: checksum mismatch');
        return [];
      }

      return achievements;
    } catch (e) {
      console.warn('AchievementManager.load failed:', e);
      return [];
    }
  },

  /**
   * Save achievements array to localStorage.
   * @param {Array} achievements
   */
  _save: function (achievements) {
    try {
      var jsonStr = JSON.stringify(achievements);
      var encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      var checksum = this._checksum(achievements);
      var payload = JSON.stringify({ v: this._VERSION, d: encoded, c: checksum });
      _safeStorage.setItem(this._KEY, payload);
      return true;
    } catch (e) {
      console.warn('AchievementManager._save failed:', e);
      return false;
    }
  },

  /**
   * Unlock an achievement by id.
   * @param {string} id — achievement identifier
   * @returns {boolean} true if newly unlocked, false if already unlocked
   */
  unlock: function (id) {
    if (!id) return false;
    var achievements = this.load();

    for (var i = 0; i < achievements.length; i++) {
      if (achievements[i].id === id) return false; // already unlocked
    }

    achievements.push({ id: id, unlockedAt: Date.now() });
    return this._save(achievements);
  },

  /**
   * Award an achievement: mark unlocked, show toast, grant star coin reward.
   * Prevents double-award. Reads reward config from GAME_CONFIG.ACHIEVEMENTS.
   * @param {string} id — achievement identifier
   * @returns {boolean} true if newly awarded, false if already unlocked
   */
  awardAchievement: function (id) {
    if (!id) return false;

    // Prevent double-award
    if (this.isUnlocked(id)) return false;

    // Mark as unlocked
    this.unlock(id);

    // Find achievement definition for name and reward
    var cfg = window.GAME_CONFIG;
    var achDef = null;
    if (cfg && cfg.ACHIEVEMENTS) {
      for (var i = 0; i < cfg.ACHIEVEMENTS.length; i++) {
        if (cfg.ACHIEVEMENTS[i].id === id) {
          achDef = cfg.ACHIEVEMENTS[i];
          break;
        }
      }
    }

    var name = achDef ? achDef.name : id;
    var icon = achDef ? (achDef.icon || '') : '';
    var coinReward = (achDef && achDef.reward && achDef.reward.starCoins) ? achDef.reward.starCoins : 10;

    // Show toast notification
    if (window.ui) {
      window.ui.showToast('🏆 成就解锁: ' + icon + ' ' + name + ' (+' + coinReward + '⭐)', 3500, '#ffdd44');
    }

    // Award star coins via UpgradeManager
    if (window.UpgradeManager && typeof window.UpgradeManager.addStarCoins === 'function') {
      window.UpgradeManager.addStarCoins(coinReward);
    }

    return true;
  },

  /**
   * Check and award all achievements based on run stats.
   * Called after a game ends. Iterates ACHIEVEMENTS config and evaluates conditions.
   * @param {Object} stats — { kills, bossKills, surviveTime, score, level, maxCombo, ... }
   * @returns {number} count of newly awarded achievements
   */
  checkAndAward: function (stats) {
    if (!stats) return 0;
    var cfg = window.GAME_CONFIG;
    if (!cfg || !cfg.ACHIEVEMENTS) return 0;

    var awarded = 0;
    for (var i = 0; i < cfg.ACHIEVEMENTS.length; i++) {
      var ach = cfg.ACHIEVEMENTS[i];
      if (!ach.condition) continue;

      var met = false;
      switch (ach.condition.type) {
        case 'kills':
          met = (stats.kills || 0) >= ach.condition.value;
          break;
        case 'bossKills':
          met = (stats.bossKills || 0) >= ach.condition.value;
          break;
        case 'survive':
          met = ((stats.time || 0) / 1000) >= ach.condition.value;
          break;
        case 'score':
          met = (stats.score || 0) >= ach.condition.value;
          break;
        case 'level':
          met = (stats.level || 1) >= ach.condition.value;
          break;
        case 'maxCombo':
          met = (stats.maxCombo || 0) >= ach.condition.value;
          break;
        case 'eliteKills':
          met = (stats.eliteKills || 0) >= ach.condition.value;
          break;
        case 'fusions':
          met = (stats.fusions || 0) >= ach.condition.value;
          break;
        case 'maxLevelWeapons':
          met = (stats.maxLevelWeapons || 0) >= ach.condition.value;
          break;
        case 'uniqueBossKills':
          met = (stats.uniqueBossKills || 0) >= ach.condition.value;
          break;
        case 'uniqueFactionWins':
          met = (stats.uniqueFactionWins || 0) >= ach.condition.value;
          break;
        case 'noHitStreak':
          met = (stats.noHitStreak || 0) >= ach.condition.value;
          break;
        case 'bossKillTime':
          if (stats.bossKills > 0 && stats.bossKillTime > 0) {
            met = (stats.bossKillTime / 1000) <= ach.condition.value;
          }
          break;
      }

      if (met && this.awardAchievement(ach.id)) {
        awarded++;
      }
    }
    return awarded;
  },

  /**
   * Check if an achievement is unlocked.
   * @param {string} id
   * @returns {boolean}
   */
  isUnlocked: function (id) {
    var achievements = this.load();
    for (var i = 0; i < achievements.length; i++) {
      if (achievements[i].id === id) return true;
    }
    return false;
  },

  /**
   * Get all unlocked achievements.
   * @returns {Array}
   */
  getAll: function () {
    return this.load();
  },

  /**
   * Clear all achievements.
   */
  clear: function () {
    _safeStorage.removeItem(this._KEY);
  }
};

// ====================================================================
//  StatsManager — lifetime statistics persistence
// ====================================================================

var StatsManager = {
  _KEY: 'stg_stats',
  _VERSION: 1,

  _DEFAULTS: {
    totalGames: 0,
    totalKills: 0,
    totalDeaths: 0,
    longestSurvival: 0,
    totalScore: 0,
    totalPlayTime: 0
  },

  _checksum: function (stats) {
    var hash = 0;
    if (typeof stats.totalGames === 'number') hash ^= stats.totalGames;
    if (typeof stats.totalKills === 'number') hash ^= stats.totalKills;
    if (typeof stats.totalDeaths === 'number') hash ^= stats.totalDeaths;
    if (typeof stats.longestSurvival === 'number') hash ^= Math.floor(stats.longestSurvival);
    if (typeof stats.totalScore === 'number') hash ^= stats.totalScore;
    if (typeof stats.totalPlayTime === 'number') hash ^= Math.floor(stats.totalPlayTime);
    return hash >>> 0;
  },

  /**
   * Load statistics from localStorage.
   * @returns {Object} { totalGames, totalKills, totalDeaths, longestSurvival, totalScore, totalPlayTime }
   */
  load: function () {
    try {
      var raw = _safeStorage.getItem(this._KEY);
      if (!raw) return Object.assign({}, this._DEFAULTS);

      var payload = JSON.parse(raw);
      if (!payload || payload.v !== this._VERSION || typeof payload.c !== 'number' || typeof payload.d !== 'string') {
        return Object.assign({}, this._DEFAULTS);
      }

      var jsonStr = decodeURIComponent(escape(atob(payload.d)));
      var stats = JSON.parse(jsonStr);

      if (this._checksum(stats) !== payload.c) {
        console.warn('StatsManager: checksum mismatch');
        return Object.assign({}, this._DEFAULTS);
      }

      // Merge with defaults to handle missing fields from older saves
      return Object.assign({}, this._DEFAULTS, stats);
    } catch (e) {
      console.warn('StatsManager.load failed:', e);
      return Object.assign({}, this._DEFAULTS);
    }
  },

  /**
   * Save statistics to localStorage.
   * @param {Object} stats
   */
  _save: function (stats) {
    try {
      var jsonStr = JSON.stringify(stats);
      var encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      var checksum = this._checksum(stats);
      var payload = JSON.stringify({ v: this._VERSION, d: encoded, c: checksum });
      _safeStorage.setItem(this._KEY, payload);
      return true;
    } catch (e) {
      console.warn('StatsManager._save failed:', e);
      return false;
    }
  },

  /**
   * Record a completed game run.
   * @param {Object} data — { kills, deaths, survivalTime, score, playTime }
   */
  recordGame: function (data) {
    var stats = this.load();
    stats.totalGames += 1;
    stats.totalKills += (data.kills || 0);
    stats.totalDeaths += (data.deaths || 0);
    stats.totalScore += (data.score || 0);
    stats.totalPlayTime += (data.playTime || 0);
    if ((data.survivalTime || 0) > stats.longestSurvival) {
      stats.longestSurvival = data.survivalTime;
    }
    return this._save(stats);
  },

  /**
   * Get a specific stat value.
   * @param {string} key
   * @returns {number}
   */
  get: function (key) {
    var stats = this.load();
    return stats[key] || 0;
  },

  /**
   * Reset all statistics.
   */
  reset: function () {
    _safeStorage.removeItem(this._KEY);
  }
};

// ====================================================================
//  UnlockManager — faction & character unlock states
// ====================================================================

var UnlockManager = {
  _KEY: 'stg_unlocks',
  _VERSION: 1,

  _checksum: function (data) {
    var hash = 0;
    if (data.factions) {
      for (var f in data.factions) {
        if (data.factions.hasOwnProperty(f)) {
          for (var j = 0; j < f.length; j++) hash ^= f.charCodeAt(j) << (j % 4);
          hash ^= data.factions[f] ? 1 : 0;
        }
      }
    }
    if (data.characters) {
      for (var c in data.characters) {
        if (data.characters.hasOwnProperty(c)) {
          for (var k = 0; k < c.length; k++) hash ^= c.charCodeAt(k) << (k % 4);
          hash ^= data.characters[c] ? 2 : 0;
        }
      }
    }
    return hash >>> 0;
  },

  /**
   * Load unlock states from localStorage.
   * @returns {Object} { factions: { id: bool }, characters: { id: bool } }
   */
  load: function () {
    try {
      var raw = _safeStorage.getItem(this._KEY);
      if (!raw) return { factions: {}, characters: {} };

      var payload = JSON.parse(raw);
      if (!payload || payload.v !== this._VERSION || typeof payload.c !== 'number' || typeof payload.d !== 'string') {
        return { factions: {}, characters: {} };
      }

      var jsonStr = decodeURIComponent(escape(atob(payload.d)));
      var data = JSON.parse(jsonStr);

      if (this._checksum(data) !== payload.c) {
        console.warn('UnlockManager: checksum mismatch');
        return { factions: {}, characters: {} };
      }

      return data;
    } catch (e) {
      console.warn('UnlockManager.load failed:', e);
      return { factions: {}, characters: {} };
    }
  },

  /**
   * Save unlock states to localStorage.
   * @param {Object} data
   */
  _save: function (data) {
    try {
      var jsonStr = JSON.stringify(data);
      var encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      var checksum = this._checksum(data);
      var payload = JSON.stringify({ v: this._VERSION, d: encoded, c: checksum });
      _safeStorage.setItem(this._KEY, payload);
      return true;
    } catch (e) {
      console.warn('UnlockManager._save failed:', e);
      return false;
    }
  },

  /**
   * Unlock a faction.
   * @param {string} factionId
   * @returns {boolean} true if newly unlocked
   */
  unlockFaction: function (factionId) {
    if (!factionId) return false;
    var data = this.load();
    if (data.factions[factionId]) return false; // already unlocked
    data.factions[factionId] = true;
    return this._save(data);
  },

  /**
   * Check if a faction is unlocked.
   * @param {string} factionId
   * @returns {boolean}
   */
  isFactionUnlocked: function (factionId) {
    return true; // 所有流派默认解锁
  },

  /**
   * Unlock a character.
   * @param {string} characterId
   * @returns {boolean} true if newly unlocked
   */
  unlockCharacter: function (characterId) {
    if (!characterId) return false;
    var data = this.load();
    if (data.characters[characterId]) return false;
    data.characters[characterId] = true;
    return this._save(data);
  },

  /**
   * Check if a character is unlocked.
   * @param {string} characterId
   * @returns {boolean}
   */
  isCharacterUnlocked: function (characterId) {
    return true; // 所有角色默认解锁
  },

  /**
   * Get all unlock states.
   * @returns {Object}
   */
  getAll: function () {
    return this.load();
  },

  /**
   * Clear all unlock states.
   */
  clear: function () {
    _safeStorage.removeItem(this._KEY);
  }
};

// ====================================================================
//  SettingsManager — game settings persistence
// ====================================================================

var SettingsManager = {
  _KEY: 'stg_settings',
  _VERSION: 1,

  _DEFAULTS: {
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 1.0,
    effectsQuality: 'high', // 'low', 'medium', 'high'
    screenShake: true
  },

  _checksum: function (settings) {
    var hash = 0;
    if (typeof settings.masterVolume === 'number') hash ^= Math.round(settings.masterVolume * 100);
    if (typeof settings.musicVolume === 'number') hash ^= Math.round(settings.musicVolume * 100);
    if (typeof settings.sfxVolume === 'number') hash ^= Math.round(settings.sfxVolume * 100);
    if (typeof settings.effectsQuality === 'string') {
      for (var i = 0; i < settings.effectsQuality.length; i++) {
        hash ^= settings.effectsQuality.charCodeAt(i) << (i % 4);
      }
    }
    if (typeof settings.screenShake === 'boolean') hash ^= settings.screenShake ? 0xFFFF : 0;
    return hash >>> 0;
  },

  /**
   * Load settings from localStorage.
   * @returns {Object} { masterVolume, musicVolume, sfxVolume, effectsQuality }
   */
  load: function () {
    try {
      var raw = _safeStorage.getItem(this._KEY);
      if (!raw) return Object.assign({}, this._DEFAULTS);

      var payload = JSON.parse(raw);
      if (!payload || payload.v !== this._VERSION || typeof payload.c !== 'number' || typeof payload.d !== 'string') {
        return Object.assign({}, this._DEFAULTS);
      }

      var jsonStr = decodeURIComponent(escape(atob(payload.d)));
      var settings = JSON.parse(jsonStr);

      if (this._checksum(settings) !== payload.c) {
        console.warn('SettingsManager: checksum mismatch');
        return Object.assign({}, this._DEFAULTS);
      }

      return Object.assign({}, this._DEFAULTS, settings);
    } catch (e) {
      console.warn('SettingsManager.load failed:', e);
      return Object.assign({}, this._DEFAULTS);
    }
  },

  /**
   * Save settings to localStorage.
   * @param {Object} settings
   */
  _save: function (settings) {
    try {
      var jsonStr = JSON.stringify(settings);
      var encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      var checksum = this._checksum(settings);
      var payload = JSON.stringify({ v: this._VERSION, d: encoded, c: checksum });
      _safeStorage.setItem(this._KEY, payload);
      return true;
    } catch (e) {
      console.warn('SettingsManager._save failed:', e);
      return false;
    }
  },

  /**
   * Update and save specific setting(s).
   * @param {Object} partial — e.g. { masterVolume: 0.5 }
   * @returns {boolean}
   */
  update: function (partial) {
    var settings = Object.assign(this.load(), partial);
    return this._save(settings);
  },

  /**
   * Get a single setting value.
   * @param {string} key
   * @returns {*}
   */
  get: function (key) {
    return this.load()[key];
  },

  /**
   * Reset all settings to defaults.
   */
  reset: function () {
    _safeStorage.removeItem(this._KEY);
  }
};

// ====================================================================
//  WeaponLoadoutManager — between-run weapon loadout persistence
// ====================================================================

var WeaponLoadoutManager = {
  _KEY: 'stg_weapon_loadout',
  _MAX_SLOTS: 6,

  /**
   * Load saved weapon loadout.
   * @returns {Array<string>} array of weapon IDs (up to 6)
   */
  load: function () {
    try {
      var raw = _safeStorage.getItem(this._KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data.slice(0, this._MAX_SLOTS);
    } catch (e) {
      return [];
    }
  },

  /**
   * Save weapon loadout.
   * @param {Array<string>} weaponIds — array of weapon IDs to bring into the run
   */
  save: function (weaponIds) {
    try {
      var sanitized = [];
      if (Array.isArray(weaponIds)) {
        for (var i = 0; i < weaponIds.length && i < this._MAX_SLOTS; i++) {
          if (typeof weaponIds[i] === 'string') sanitized.push(weaponIds[i]);
        }
      }
      _safeStorage.setItem(this._KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('WeaponLoadoutManager.save failed:', e);
    }
  },

  /**
   * Get the number of weapon slots available.
   * @returns {number}
   */
  getMaxSlots: function () {
    return this._MAX_SLOTS;
  },

  /**
   * Clear saved loadout.
   */
  clear: function () {
    _safeStorage.removeItem(this._KEY);
  }
};

// ====================================================================
//  Export to window
// ====================================================================

window.StorageManager = StorageManager;
window.LeaderboardManager = LeaderboardManager;
window.UpgradeManager = UpgradeManager;
window.AchievementManager = AchievementManager;
window.StatsManager = StatsManager;
window.UnlockManager = UnlockManager;
window.SettingsManager = SettingsManager;
window.WeaponLoadoutManager = WeaponLoadoutManager;
