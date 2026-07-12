import '../styles/season-pass.css';

export interface SeasonReward {
  level: number;
  xp: number;
  icon: string;
  label: string;
  type: 'starCoins' | 'consumable' | 'cosmetic';
  amount?: number;
  consumableId?: string;
}

const SEASON_ID = '2026-s1';
const STORAGE_KEY = 'stg_season_pass_v1';

const REWARDS: SeasonReward[] = [
  { level: 1, xp: 0, icon: '⭐', label: '50 星币', type: 'starCoins', amount: 50 },
  { level: 2, xp: 120, icon: '💊', label: '急救包×1', type: 'consumable', consumableId: 'healthPack' },
  { level: 3, xp: 280, icon: '⭐', label: '80 星币', type: 'starCoins', amount: 80 },
  { level: 4, xp: 480, icon: '🛡️', label: '护盾强化', type: 'consumable', consumableId: 'shieldBoost' },
  { level: 5, xp: 720, icon: '⭐', label: '120 星币', type: 'starCoins', amount: 120 },
  { level: 6, xp: 1000, icon: '🔫', label: '武器券', type: 'consumable', consumableId: 'weaponTicket' },
  { level: 7, xp: 1350, icon: '⭐', label: '150 星币', type: 'starCoins', amount: 150 },
  { level: 8, xp: 1750, icon: '✨', label: '经验加成', type: 'consumable', consumableId: 'xpBoost' },
  { level: 9, xp: 2200, icon: '⭐', label: '180 星币', type: 'starCoins', amount: 180 },
  { level: 10, xp: 2700, icon: '🎖️', label: '赛季徽章', type: 'cosmetic' },
  { level: 12, xp: 3500, icon: '⭐', label: '220 星币', type: 'starCoins', amount: 220 },
  { level: 14, xp: 4400, icon: '💎', label: '稀有箱', type: 'consumable', consumableId: 'rareCrate' },
  { level: 16, xp: 5400, icon: '⭐', label: '280 星币', type: 'starCoins', amount: 280 },
  { level: 18, xp: 6500, icon: '🔥', label: '火力芯片', type: 'consumable', consumableId: 'damageChip' },
  { level: 20, xp: 7800, icon: '⭐', label: '350 星币', type: 'starCoins', amount: 350 },
  { level: 25, xp: 10000, icon: '👑', label: '赛季战机涂装', type: 'cosmetic' },
  { level: 30, xp: 13000, icon: '🌟', label: '500 星币 + 称号', type: 'starCoins', amount: 500 },
];

interface SeasonState {
  seasonId: string;
  xp: number;
  claimed: number[];
}

function loadState(): SeasonState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as SeasonState;
      if (s.seasonId === SEASON_ID) return s;
    }
  } catch {
    /* ignore */
  }
  return { seasonId: SEASON_ID, xp: 0, claimed: [] };
}

function saveState(s: SeasonState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function currentLevel(xp: number): number {
  let lv = 1;
  for (const r of REWARDS) {
    if (xp >= r.xp) lv = r.level;
  }
  return lv;
}

function nextLevelXp(xp: number): number {
  for (const r of REWARDS) {
    if (xp < r.xp) return r.xp;
  }
  return REWARDS[REWARDS.length - 1].xp;
}

export const SeasonPassManager = {
  getState(): SeasonState {
    return loadState();
  },

  addXp(amount: number): void {
    const s = loadState();
    s.xp += Math.max(0, Math.floor(amount));
    saveState(s);
  },

  onRunComplete(stats: { score?: number; kills?: number; bossKills?: number; time?: number }): void {
    const score = stats.score ?? 0;
    const kills = stats.kills ?? 0;
    const bosses = stats.bossKills ?? 0;
    const minutes = (stats.time ?? 0) / 60000;
    const xp = Math.floor(score / 500 + kills * 2 + bosses * 80 + minutes * 15);
    this.addXp(xp);
  },

  claim(level: number): boolean {
    const s = loadState();
    if (s.claimed.includes(level)) return false;
    const reward = REWARDS.find((r) => r.level === level);
    if (!reward || s.xp < reward.xp) return false;

    if (reward.type === 'starCoins' && reward.amount) {
      const um = (window as StgWindow).UpgradeManager;
      if (um?.addStarCoins) um.addStarCoins(reward.amount);
    } else if (reward.type === 'consumable') {
      const bonus: Record<string, number> = {
        healthPack: 40,
        shieldBoost: 50,
        weaponTicket: 60,
        xpBoost: 45,
        rareCrate: 80,
        damageChip: 70,
      };
      const id = reward.consumableId ?? '';
      const um = (window as StgWindow).UpgradeManager;
      if (um?.addStarCoins) um.addStarCoins(bonus[id] ?? 30);
    } else if (reward.type === 'cosmetic') {
      try {
        const key = 'stg_cosmetics';
        const list = JSON.parse(localStorage.getItem(key) || '[]') as string[];
        list.push(`season_${SEASON_ID}_${level}`);
        localStorage.setItem(key, JSON.stringify(list));
      } catch {
        /* ignore */
      }
    }

    s.claimed.push(level);
    saveState(s);
    return true;
  },

  renderScreen(): void {
    const list = document.getElementById('season-pass-list');
    const xpEl = document.getElementById('season-pass-xp');
    const lvEl = document.getElementById('season-pass-level');
    const bar = document.getElementById('season-pass-bar-fill');
    if (!list) return;

    const s = loadState();
    const lv = currentLevel(s.xp);
    const next = nextLevelXp(s.xp);
    const prev = REWARDS.filter((r) => r.level <= lv).pop()?.xp ?? 0;
    const pct = next > prev ? ((s.xp - prev) / (next - prev)) * 100 : 100;

    if (xpEl) xpEl.textContent = String(s.xp);
    if (lvEl) lvEl.textContent = String(lv);
    if (bar) bar.style.width = `${Math.min(100, pct)}%`;

    list.innerHTML = '';
    for (const r of REWARDS) {
      const claimed = s.claimed.includes(r.level);
      const unlocked = s.xp >= r.xp;
      const row = document.createElement('div');
      row.className = `season-reward-row${unlocked ? ' unlocked' : ''}${claimed ? ' claimed' : ''}`;
      row.innerHTML = `
        <span class="season-reward-lv">Lv.${r.level}</span>
        <span class="season-reward-icon">${r.icon}</span>
        <span class="season-reward-label">${r.label}</span>
        <span class="season-reward-xp">${r.xp} XP</span>
        <button class="season-claim-btn" ${!unlocked || claimed ? 'disabled' : ''}>
          ${claimed ? '已领取' : unlocked ? '领取' : '锁定'}
        </button>`;
      const btn = row.querySelector('.season-claim-btn');
      btn?.addEventListener('click', () => {
        if (this.claim(r.level)) {
          this.renderScreen();
          const ui = (window as StgWindow).ui;
          ui?.showToast?.(`🎁 已领取: ${r.label}`, 2000, '#ffdd00');
        }
      });
      list.appendChild(row);
    }
  },

  initUI(): void {
    const btn = document.getElementById('btn-season-pass');
    const back = document.getElementById('btn-back-from-season');
    const screen = document.getElementById('season-pass-screen');

    btn?.addEventListener('click', () => {
      this.renderScreen();
      document.querySelectorAll('.menu-screen').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
      if (screen) screen.style.display = 'flex';
    });

    back?.addEventListener('click', () => {
      if (screen) screen.style.display = 'none';
      const menu = document.getElementById('menu-screen');
      if (menu) menu.style.display = 'flex';
    });
  },
};

export function initSeasonPass(): void {
  SeasonPassManager.initUI();
  (window as StgWindow).SeasonPassManager = SeasonPassManager;
}

interface StgWindow extends Window {
  ui?: { showToast?: (msg: string, ms: number, color: string) => void };
  UpgradeManager?: { addStarCoins?: (n: number) => void };
  SeasonPassManager?: typeof SeasonPassManager;
}

declare const window: StgWindow;
