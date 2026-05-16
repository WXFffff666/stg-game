import kaplay from "kaplay";
import { FACTIONS, SKILLS, ENEMY_TYPES, XP_CURVE, RARITY_WEIGHTS, CANVAS_WIDTH, CANVAS_HEIGHT } from "./config";
import type { Faction, Skill, EnemyType } from "./config";

// ============================================================
// Initialize Kaplay
// ============================================================
const k = kaplay({
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  background: [5, 5, 25],
  canvas: document.getElementById("game-canvas") as HTMLCanvasElement | undefined,
  global: false,
});

// ============================================================
// Game State
// ============================================================
let selectedFactionId = "";
let playerStats: Record<string, number> = {};
let score = 0;
let kills = 0;
let combo = 0;
let maxCombo = 0;
let level = 1;
let xp = 0;
let waveNumber = 0;
let gameTime = 0;
let difficulty = 0;
let learnedSkills: string[] = [];
let isPaused = false;
let gameOverShown = false;

// ============================================================
// Helper Functions
// ============================================================
function getXpNeeded(lv: number): number {
  return XP_CURVE[Math.min(lv, XP_CURVE.length - 1)];
}

function getStat(stat: string, base = 0): number {
  return playerStats[stat] ?? base;
}

function applyStatModifier(stat: string, op: string, value: number) {
  const current = playerStats[stat] ?? 0;
  if (op === 'add') playerStats[stat] = current + value;
  else if (op === 'multiply') playerStats[stat] = current * (1 + value);
  else playerStats[stat] = value;
}

function formatScore(s: number): string {
  if (s >= 1000000) return (s / 1000000).toFixed(1) + 'M';
  if (s >= 1000) return (s / 1000).toFixed(1) + 'K';
  return s.toString();
}

function formatTime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  return String(min).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function getRandomSkills(count: number): Skill[] {
  const available = SKILLS.filter(s => {
    if (learnedSkills.includes(s.id)) return false;
    if (s.faction !== 'any' && s.faction !== selectedFactionId) return false;
    return true;
  });
  const weights = available.map(s => RARITY_WEIGHTS[s.rarity] ?? 10);
  const picked: Skill[] = [];
  const pool = [...available];
  const poolWeights = [...weights];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = pickWeightedIndex(poolWeights);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
    poolWeights.splice(idx, 1);
  }
  return picked;
}

function pickWeightedIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

// ============================================================
// Scene: Menu
// ============================================================
k.scene("menu", () => {
  k.add([
    k.text("星域战机", { size: 48 }),
    k.pos(CANVAS_WIDTH / 2, 200),
    k.anchor("center"),
    k.color(255, 221, 0),
  ]);
  k.add([
    k.text("STAR DOMAIN STG", { size: 18 }),
    k.pos(CANVAS_WIDTH / 2, 260),
    k.anchor("center"),
    k.color(180, 180, 180),
  ]);
  const btnStart = k.add([
    k.rect(200, 50, { radius: 8 }),
    k.pos(CANVAS_WIDTH / 2, 400),
    k.anchor("center"),
    k.color(60, 60, 80),
    k.area(),
    "btn-start",
  ]);
  k.add([
    k.text("开始游戏", { size: 22 }),
    k.pos(CANVAS_WIDTH / 2, 400),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);
  btnStart.onClick(() => k.go("charSelect"));
  btnStart.onHover(() => { btnStart.color = k.rgb(80, 80, 120); });
  btnStart.onHoverEnd(() => { btnStart.color = k.rgb(60, 60, 80); });
});

// ============================================================
// Scene: Character Select
// ============================================================
k.scene("charSelect", () => {
  k.add([
    k.text("选择流派", { size: 32 }),
    k.pos(CANVAS_WIDTH / 2, 40),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);
  const cols = 4;
  const cardW = 130;
  const cardH = 90;
  const startX = (CANVAS_WIDTH - cols * cardW) / 2 + cardW / 2;
  const startY = 110;
  FACTIONS.forEach((f, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * cardW;
    const y = startY + row * cardH;
    const card = k.add([
      k.rect(cardW - 8, cardH - 8, { radius: 6 }),
      k.pos(x, y),
      k.anchor("center"),
      k.color(30, 30, 50),
      k.area(),
      `faction-${f.id}`,
    ]);
    k.add([
      k.text(f.name, { size: 14 }),
      k.pos(x, y - 20),
      k.anchor("center"),
      k.color(k.Color.fromHex(f.color)),
    ]);
    k.add([
      k.text(f.description, { size: 9, width: cardW - 20 }),
      k.pos(x, y + 10),
      k.anchor("center"),
      k.color(180, 180, 180),
    ]);
    card.onClick(() => {
      selectedFactionId = f.id;
      k.go("gameplay");
    });
    card.onHover(() => { card.color = k.rgb(50, 50, 80); });
    card.onHoverEnd(() => { card.color = k.rgb(30, 30, 50); });
  });
  const btnBack = k.add([
    k.rect(120, 40, { radius: 6 }),
    k.pos(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50),
    k.anchor("center"),
    k.color(60, 60, 80),
    k.area(),
  ]);
  k.add([
    k.text("返回", { size: 18 }),
    k.pos(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);
  btnBack.onClick(() => k.go("menu"));
});

// ============================================================
// Scene: Gameplay
// ============================================================
k.scene("gameplay", () => {
  // Reset state
  score = 0; kills = 0; combo = 0; maxCombo = 0;
  level = 1; xp = 0; waveNumber = 0; gameTime = 0;
  difficulty = 0; learnedSkills = []; isPaused = false; gameOverShown = false;

  const faction = FACTIONS.find(f => f.id === selectedFactionId) ?? FACTIONS[0];
  playerStats = { ...faction.baseStats, maxHp: faction.baseStats.hp };

  // --- Player ---
  const player = k.add([
    k.rect(20, 28, { radius: 4 }),
    k.pos(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.8),
    k.anchor("center"),
    k.color(k.Color.fromHex(faction.color)),
    k.area(),
    k.z(10),
    "player",
    {
      hp: getStat('hp'),
      maxHp: getStat('hp'),
      shield: getStat('shieldMax', 0),
      invincibleTimer: 0,
      fireTimer: 0,
    },
  ]);

  // --- HUD ---
  const hudHp = k.add([k.text("", { size: 14 }), k.pos(10, 10), k.z(100)]);
  const hudScore = k.add([k.text("", { size: 14 }), k.pos(CANVAS_WIDTH - 10, 10), k.anchor("topright"), k.z(100)]);
  const hudLevel = k.add([k.text("", { size: 14 }), k.pos(10, 30), k.z(100)]);
  const hudCombo = k.add([k.text("", { size: 18 }), k.pos(CANVAS_WIDTH / 2, 60), k.anchor("center"), k.color(255, 221, 0), k.z(100)]);

  function updateHud() {
    hudHp.text = `❤️ ${Math.ceil(player.hp)}/${player.maxHp}` + (player.shield > 0 ? ` 🛡️${Math.ceil(player.shield)}` : '');
    hudScore.text = `⭐ ${formatScore(score)}  💀 ${kills}`;
    hudLevel.text = `Lv.${level}  ⏱️ ${formatTime(gameTime)}`;
    hudCombo.text = combo >= 5 ? `${combo} COMBO!` : '';
  }

  // --- Player Movement ---
  k.onUpdate(() => {
    if (isPaused || gameOverShown) return;
    const mousePos = k.mousePos();
    const dx = mousePos.x - player.pos.x;
    const dy = mousePos.y - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      const speed = getStat('speed') * 60;
      const move = Math.min(dist, speed * k.dt());
      player.pos.x += (dx / dist) * move;
      player.pos.y += (dy / dist) * move;
    }
    // Clamp to canvas
    player.pos.x = Math.max(10, Math.min(CANVAS_WIDTH - 10, player.pos.x));
    player.pos.y = Math.max(10, Math.min(CANVAS_HEIGHT - 10, player.pos.y));
  });

  // --- Bullet Firing ---
  k.onUpdate(() => {
    if (isPaused || gameOverShown) return;
    player.fireTimer += k.dt() * 1000;
    const fireRate = getStat('fireRate');
    if (player.fireTimer >= fireRate) {
      player.fireTimer = 0;
      fireBullets();
    }
  });

  function fireBullets() {
    const bulletCount = Math.max(1, Math.round(getStat('bulletCount', 1)));
    const damage = getStat('attack') * 10;
    const size = 4 * (1 + getStat('bulletSize', 0));
    const spreadAngle = getStat('spreadAngle', 0) * (Math.PI / 180);
    const baseAngle = -Math.PI / 2;
    for (let i = 0; i < bulletCount; i++) {
      const offset = bulletCount === 1 ? 0 : (i / (bulletCount - 1) - 0.5) * (spreadAngle || 0.3);
      const angle = baseAngle + offset;
      const speed = 500;
      const bullet = k.add([
        k.circle(size),
        k.pos(player.pos.x, player.pos.y - 15),
        k.anchor("center"),
        k.color(k.Color.fromHex(faction.color)),
        k.area(),
        k.z(5),
        k.offscreen({ destroy: true }),
        "playerBullet",
        {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          damage: damage,
          factionId: faction.id,
        },
      ]);
      bullet.onUpdate(() => {
        bullet.pos.x += bullet.vx * k.dt();
        bullet.pos.y += bullet.vy * k.dt();
      });
    }
  }

  // --- Enemy Spawning ---
  let spawnTimer = 0;
  let waveEnemiesSpawned = 0;
  let waveEnemiesTotal = 8;
  let waveState = 'active';
  let wavePauseTimer = 0;

  k.onUpdate(() => {
    if (isPaused || gameOverShown) return;
    gameTime += k.dt() * 1000;
    difficulty = Math.floor(score / 5000) + Math.floor(gameTime / 45000);

    if (waveState === 'active') {
      spawnTimer += k.dt() * 1000;
      const spawnInterval = Math.max(300, 1000 / (1 + difficulty * 0.1));
      if (spawnTimer >= spawnInterval && waveEnemiesSpawned < waveEnemiesTotal) {
        spawnTimer = 0;
        spawnEnemy();
        waveEnemiesSpawned++;
      }
      // Check wave complete
      const activeEnemies = k.get("enemy").length;
      if (waveEnemiesSpawned >= waveEnemiesTotal && activeEnemies === 0) {
        waveState = 'pause';
        wavePauseTimer = 0;
      }
    } else {
      wavePauseTimer += k.dt() * 1000;
      if (wavePauseTimer >= 3000) {
        waveNumber++;
        waveEnemiesTotal = 8 + waveNumber * 2;
        waveEnemiesSpawned = 0;
        waveState = 'active';
      }
    }
  });

  function spawnEnemy() {
    const isBoss = waveNumber > 0 && waveNumber % 10 === 0 && waveEnemiesSpawned === 0;
    const type: EnemyType = isBoss ? ENEMY_TYPES.find(e => e.isBoss)! : ENEMY_TYPES[Math.floor(Math.random() * (ENEMY_TYPES.length - 1))];
    const hpMult = 1 + difficulty * 0.15;
    const spdMult = 1 + difficulty * 0.05;
    const x = Math.random() * (CANVAS_WIDTH - 40) + 20;
    const enemy = k.add([
      k.rect(type.size, type.size, { radius: type.isBoss ? 8 : 4 }),
      k.pos(x, -type.size),
      k.anchor("center"),
      k.color(k.Color.fromHex(type.color)),
      k.area(),
      k.z(3),
      "enemy",
      {
        hp: type.hp * hpMult,
        maxHp: type.hp * hpMult,
        speed: type.speed * spdMult,
        damage: type.damage,
        score: type.score,
        xp: type.xp,
        size: type.size,
        fireRate: type.fireRate,
        fireTimer: 0,
        isBoss: type.isBoss ?? false,
        splits: type.splits ?? 0,
        shieldHp: type.shieldHp ?? 0,
        // Status effects
        slowTimer: 0,
        freezeTimer: 0,
        burnTimer: 0,
        burnDamage: 0,
        poisonTimer: 0,
        poisonDamage: 0,
      },
    ]);

    enemy.onUpdate(() => {
      if (enemy.freezeTimer > 0) {
        enemy.freezeTimer -= k.dt();
        return; // Frozen: don't move
      }
      // Move toward player
      if (player.exists()) {
        const dx = player.pos.x - enemy.pos.x;
        const dy = player.pos.y - enemy.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const spd = enemy.speed * (enemy.slowTimer > 0 ? 0.4 : 1) * 60;
          enemy.pos.x += (dx / dist) * spd * k.dt();
          enemy.pos.y += (dy / dist) * spd * k.dt();
        }
      }
      // Status effect timers
      if (enemy.slowTimer > 0) enemy.slowTimer -= k.dt();
      if (enemy.burnTimer > 0) {
        enemy.burnTimer -= k.dt();
        enemy.hp -= enemy.burnDamage * k.dt();
      }
      if (enemy.poisonTimer > 0) {
        enemy.poisonTimer -= k.dt();
        enemy.hp -= enemy.poisonDamage * k.dt();
      }
      // Fire bullets
      if (enemy.fireRate > 0) {
        enemy.fireTimer += k.dt() * 1000;
        if (enemy.fireTimer >= enemy.fireRate) {
          enemy.fireTimer = 0;
          spawnEnemyBullet(enemy);
        }
      }
      // Die from DoT
      if (enemy.hp <= 0) {
        killEnemy(enemy, false);
      }
      // Status effect visuals
      if (enemy.freezeTimer > 0) enemy.color = k.rgb(100, 200, 255);
      else if (enemy.slowTimer > 0) enemy.color = k.rgb(100, 150, 255);
      else if (enemy.poisonTimer > 0) enemy.color = k.rgb(80, 200, 60);
      else if (enemy.burnTimer > 0) enemy.color = k.rgb(255, 100, 20);
      else enemy.color = k.Color.fromHex(type.color);
    });
  }

  function spawnEnemyBullet(enemy: any) {
    if (!player.exists()) return;
    const dx = player.pos.x - enemy.pos.x;
    const dy = player.pos.y - enemy.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 200;
    const bullet = k.add([
      k.circle(4),
      k.pos(enemy.pos.x, enemy.pos.y),
      k.anchor("center"),
      k.color(255, 100, 100),
      k.area(),
      k.z(2),
      k.offscreen({ destroy: true }),
      "enemyBullet",
      { vx: (dx / dist) * speed, vy: (dy / dist) * speed, damage: enemy.damage },
    ]);
    bullet.onUpdate(() => {
      bullet.pos.x += bullet.vx * k.dt();
      bullet.pos.y += bullet.vy * k.dt();
    });
  }

  // --- Collision: Player Bullets vs Enemies ---
  k.onCollide("playerBullet", "enemy", (bullet, enemy) => {
    const b = bullet as any;
    const e = enemy as any;
    let damage = b.damage;

    // Crit check
    const critRate = getStat('critRate', 0.05);
    const isCrit = Math.random() < critRate;
    if (isCrit) damage *= getStat('critMult', 1.5);

    // Apply faction effects
    const fid = b.factionId;
    if (fid === 'ice') {
      if (Math.random() < getStat('slowChance', 0)) e.slowTimer = 2;
      if (Math.random() < getStat('freezeChance', 0)) e.freezeTimer = 1.5;
    }
    if (fid === 'elemental' && getStat('burnDamage', 0) > 0) {
      e.burnTimer = getStat('burnDuration', 2);
      e.burnDamage = getStat('burnDamage');
    }
    if (fid === 'poison' && getStat('poisonDamage', 0) > 0) {
      e.poisonTimer = getStat('poisonDuration', 3);
      e.poisonDamage = getStat('poisonDamage');
    }
    if (fid === 'thunder' && Math.random() < getStat('chainChance', 0)) {
      chainLightning(e.pos.x, e.pos.y, damage * getStat('chainDamage', 0.5), Math.round(getStat('chainCount', 3)));
    }
    if (fid === 'void' && e.hp / e.maxHp < getStat('executeThreshold', 0)) {
      damage = 9999;
    }
    if (fid === 'gravity') {
      // Pull enemies toward player
      k.get("enemy").forEach(other => {
        if (other === enemy) return;
        const dx = enemy.pos.x - other.pos.x;
        const dy = enemy.pos.y - other.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < getStat('pullRadius', 0) && dist > 1) {
          const pull = getStat('pullForce', 0) * (1 - dist / getStat('pullRadius', 1));
          other.pos.x += (dx / dist) * pull * k.dt();
          other.pos.y += (dy / dist) * pull * k.dt();
        }
      });
    }
    if (fid === 'wind' && getStat('pushForce', 0) > 0) {
      const dx = enemy.pos.x - player.pos.x;
      const dy = enemy.pos.y - player.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      enemy.pos.x += (dx / dist) * getStat('pushForce');
      enemy.pos.y += (dy / dist) * getStat('pushForce');
    }

    // Apply damage
    e.hp -= damage;
    bullet.destroy();

    // Lifesteal
    const lifesteal = getStat('lifesteal', 0);
    if (lifesteal > 0) player.hp = Math.min(player.maxHp, player.hp + damage * lifesteal);

    if (e.hp <= 0) {
      killEnemy(enemy, isCrit);
    }
  });

  function chainLightning(x: number, y: number, damage: number, count: number) {
    let lastX = x, lastY = y;
    for (let i = 0; i < count; i++) {
      let nearest: any = null;
      let nearestDist = 200;
      k.get("enemy").forEach(e => {
        const dx = e.pos.x - lastX;
        const dy = e.pos.y - lastY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < nearestDist) { nearestDist = d; nearest = e; }
      });
      if (!nearest) break;
      nearest.hp -= damage;
      // Visual lightning line
      const line = k.add([
        k.rect(nearestDist, 2),
        k.pos(lastX, lastY),
        k.anchor("left"),
        k.color(255, 255, 100),
        k.z(8),
        k.opacity(0.8),
      ]);
      const angle = Math.atan2(nearest.pos.y - lastY, nearest.pos.x - lastX);
      line.angle = angle * (180 / Math.PI);
      k.wait(0.15, () => line.destroy());
      lastX = nearest.pos.x;
      lastY = nearest.pos.y;
      if (nearest.hp <= 0) killEnemy(nearest, false);
    }
  }

  // --- Collision: Enemy Bullets vs Player ---
  k.onCollide("enemyBullet", "player", (bullet, p) => {
    if (player.invincibleTimer > 0) return;
    const dmg = (bullet as any).damage;
    // Dodge check
    if (Math.random() < getStat('dodgeChance', 0)) { bullet.destroy(); return; }
    // Defense reduction
    const defense = getStat('defense', 0);
    const finalDmg = dmg * (1 - defense);
    // Shield absorbs first
    if (player.shield > 0) {
      const absorbed = Math.min(player.shield, finalDmg);
      player.shield -= absorbed;
      if (finalDmg - absorbed > 0) player.hp -= (finalDmg - absorbed);
    } else {
      player.hp -= finalDmg;
    }
    player.invincibleTimer = 1.5;
    combo = 0;
    bullet.destroy();
    // Reflect damage
    if (getStat('reflectDamage', 0) > 0) {
      k.get("enemy").forEach(e => {
        const dx = e.pos.x - player.pos.x;
        const dy = e.pos.y - player.pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < 150) {
          e.hp -= finalDmg * getStat('reflectDamage');
        }
      });
    }
    if (player.hp <= 0 && !gameOverShown) {
      gameOverShown = true;
      k.wait(0.5, () => k.go("gameOver", { score, kills, level, gameTime, maxCombo, faction: faction.name }));
    }
  });

  // --- Collision: Enemies vs Player Body ---
  k.onCollide("enemy", "player", (enemy, p) => {
    if (player.invincibleTimer > 0) return;
    const dmg = (enemy as any).damage;
    player.hp -= dmg * (1 - getStat('defense', 0));
    player.invincibleTimer = 1.5;
    combo = 0;
    if (player.hp <= 0 && !gameOverShown) {
      gameOverShown = true;
      k.wait(0.5, () => k.go("gameOver", { score, kills, level, gameTime, maxCombo, faction: faction.name }));
    }
  });

  // --- Kill Enemy ---
  function killEnemy(enemy: any, isCrit: boolean) {
    kills++;
    combo++;
    maxCombo = Math.max(maxCombo, combo);
    const comboMult = 1 + combo * 0.1;
    score += Math.round(enemy.score * comboMult);
    addXp(enemy.xp);

    // Splitter
    if (enemy.splits > 0) {
      for (let i = 0; i < enemy.splits; i++) {
        const small = k.add([
          k.rect(8, 8, { radius: 2 }),
          k.pos(enemy.pos.x + (Math.random() - 0.5) * 30, enemy.pos.y + (Math.random() - 0.5) * 30),
          k.anchor("center"),
          k.color(100, 255, 100),
          k.area(),
          k.z(3),
          "enemy",
          { hp: 15, maxHp: 15, speed: 120, damage: 5, score: 5, xp: 3, size: 8, fireRate: 0, fireTimer: 0, isBoss: false, splits: 0, shieldHp: 0, slowTimer: 0, freezeTimer: 0, burnTimer: 0, burnDamage: 0, poisonTimer: 0, poisonDamage: 0 },
        ]);
        small.onUpdate(() => {
          if (!player.exists()) return;
          const dx = player.pos.x - small.pos.x;
          const dy = player.pos.y - small.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          small.pos.x += (dx / dist) * small.speed * 60 * k.dt();
          small.pos.y += (dy / dist) * small.speed * 60 * k.dt();
        });
      }
    }
    // Heal on kill
    if (learnedSkills.some(id => SKILLS.find(s => s.id === id)?.trigger === 'onKill')) {
      const healSkills = SKILLS.filter(s => s.trigger === 'onKill' && learnedSkills.includes(s.id));
      healSkills.forEach(s => {
        s.effects.forEach(e => { if (e.stat === 'hp') player.hp = Math.min(player.maxHp, player.hp + e.value); });
      });
    }
    enemy.destroy();
  }

  // --- XP / Level System ---
  function addXp(amount: number) {
    xp += amount * (1 + getStat('xpMult', 0));
    while (xp >= getXpNeeded(level)) {
      xp -= getXpNeeded(level);
      level++;
      showLevelUp();
    }
  }

  function showLevelUp() {
    isPaused = true;
    const choices = getRandomSkills(3);
    if (choices.length === 0) { isPaused = false; return; }

    const overlay = k.add([
      k.rect(CANVAS_WIDTH, CANVAS_HEIGHT),
      k.pos(0, 0),
      k.color(0, 0, 0),
      k.opacity(0.7),
      k.z(200),
    ]);
    k.add([
      k.text("选择技能", { size: 28 }),
      k.pos(CANVAS_WIDTH / 2, 150),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(201),
      "levelUpUI",
    ]);

    choices.forEach((skill, i) => {
      const y = 250 + i * 120;
      const rarityColors: Record<string, string> = { common: '#aaaaaa', uncommon: '#44dd44', rare: '#4488ff', epic: '#aa44ff', legendary: '#ffaa00' };
      const card = k.add([
        k.rect(400, 100, { radius: 8 }),
        k.pos(CANVAS_WIDTH / 2, y),
        k.anchor("center"),
        k.color(40, 40, 60),
        k.area(),
        k.z(201),
        "levelUpUI",
      ]);
      k.add([
        k.text(skill.name, { size: 20 }),
        k.pos(CANVAS_WIDTH / 2, y - 20),
        k.anchor("center"),
        k.color(k.Color.fromHex(rarityColors[skill.rarity] ?? '#ffffff')),
        k.z(202),
        "levelUpUI",
      ]);
      const effectText = skill.effects.map(e => `${e.stat} ${e.op === 'add' ? '+' : '×'}${e.op === 'multiply' ? (e.value * 100).toFixed(0) + '%' : e.value}`).join(', ');
      k.add([
        k.text(effectText, { size: 12 }),
        k.pos(CANVAS_WIDTH / 2, y + 15),
        k.anchor("center"),
        k.color(180, 180, 180),
        k.z(202),
        "levelUpUI",
      ]);
      k.add([
        k.text(`[${skill.rarity.toUpperCase()}]`, { size: 11 }),
        k.pos(CANVAS_WIDTH / 2, y + 35),
        k.anchor("center"),
        k.color(120, 120, 120),
        k.z(202),
        "levelUpUI",
      ]);
      card.onClick(() => {
        learnedSkills.push(skill.id);
        skill.effects.forEach(e => applyStatModifier(e.stat, e.op, e.value));
        // Clean up UI
        k.get("levelUpUI").forEach(el => el.destroy());
        overlay.destroy();
        isPaused = false;
      });
      card.onHover(() => { card.color = k.rgb(60, 60, 100); });
      card.onHoverEnd(() => { card.color = k.rgb(40, 40, 60); });
    });
  }

  // --- Game Loop ---
  k.onUpdate(() => {
    if (gameOverShown) return;
    if (player.invincibleTimer > 0) player.invincibleTimer -= k.dt();
    // Shield regen
    const shieldMax = getStat('shieldMax', 0);
    if (shieldMax > 0 && player.shield < shieldMax) {
      player.shield = Math.min(shieldMax, player.shield + getStat('shieldRegen', 0.5) * k.dt());
    }
    // HP regen
    const hpRegen = getStat('hpRegen', 0);
    if (hpRegen > 0) player.hp = Math.min(player.maxHp, player.hp + hpRegen * k.dt());
    // Heal aura
    if (getStat('healAura', 0) > 0) {
      player.hp = Math.min(player.maxHp, player.hp + getStat('healAura') * k.dt());
    }
    updateHud();
  });

  // --- Pause ---
  k.onKeyPress("escape", () => {
    if (gameOverShown) return;
    isPaused = !isPaused;
  });

  // --- Starfield Background ---
  for (let i = 0; i < 80; i++) {
    const star = k.add([
      k.circle(Math.random() * 2 + 0.5),
      k.pos(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT),
      k.color(255, 255, 255),
      k.opacity(Math.random() * 0.5 + 0.2),
      k.z(-1),
    ]);
    star.onUpdate(() => {
      star.pos.y += (20 + Math.random() * 30) * k.dt();
      if (star.pos.y > CANVAS_HEIGHT + 5) {
        star.pos.y = -5;
        star.pos.x = Math.random() * CANVAS_WIDTH;
      }
    });
  }
});

// ============================================================
// Scene: Game Over
// ============================================================
k.scene("gameOver", (data: any) => {
  k.add([
    k.text("GAME OVER", { size: 40 }),
    k.pos(CANVAS_WIDTH / 2, 150),
    k.anchor("center"),
    k.color(255, 50, 50),
  ]);
  const stats = [
    `流派: ${data.faction}`,
    `分数: ${formatScore(data.score)}`,
    `击杀: ${data.kills}`,
    `等级: ${data.level}`,
    `时间: ${formatTime(data.gameTime)}`,
    `最高连击: ${data.maxCombo}`,
  ];
  stats.forEach((s, i) => {
    k.add([
      k.text(s, { size: 18 }),
      k.pos(CANVAS_WIDTH / 2, 250 + i * 35),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);
  });
  const btnRestart = k.add([
    k.rect(180, 45, { radius: 8 }),
    k.pos(CANVAS_WIDTH / 2, 500),
    k.anchor("center"),
    k.color(60, 60, 80),
    k.area(),
  ]);
  k.add([
    k.text("重新开始", { size: 20 }),
    k.pos(CANVAS_WIDTH / 2, 500),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);
  btnRestart.onClick(() => k.go("gameplay"));
  const btnMenu = k.add([
    k.rect(180, 45, { radius: 8 }),
    k.pos(CANVAS_WIDTH / 2, 570),
    k.anchor("center"),
    k.color(60, 60, 80),
    k.area(),
  ]);
  k.add([
    k.text("返回菜单", { size: 20 }),
    k.pos(CANVAS_WIDTH / 2, 570),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);
  btnMenu.onClick(() => k.go("menu"));
});

// ============================================================
// Start
// ============================================================
k.go("menu");
