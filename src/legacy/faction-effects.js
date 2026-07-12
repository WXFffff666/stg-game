/**
 * STG Game - Faction Effects System
 * Handcrafted unique bullet-hit / kill / tick handlers per faction.
 * Global: window.FactionEffects
 * Dependencies (runtime): window.game, window.ParticleSystem, window.GAME_CONFIG
 */
(function() {
  'use strict';

  function stat(p, key, def) {
    if (!p || !p.stats) return def;
    var v = p.stats[key];
    return v !== undefined && v !== null ? v : def;
  }

  function distSq(ax, ay, bx, by) {
    var dx = ax - bx, dy = ay - by;
    return dx * dx + dy * dy;
  }

  function nearestEnemy(game, x, y, maxR, skip) {
    if (!game || !game.enemies) return null;
    var maxSq = maxR * maxR, best = null, bestD = maxSq;
    for (var i = 0; i < game.enemies.length; i++) {
      var e = game.enemies[i];
      if (!e.active || e === skip) continue;
      var d = distSq(x, y, e.x, e.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  function enemiesInRadius(game, x, y, radius) {
    var out = [], r2 = radius * radius;
    if (!game || !game.enemies) return out;
    for (var i = 0; i < game.enemies.length; i++) {
      var e = game.enemies[i];
      if (!e.active) continue;
      if (distSq(x, y, e.x, e.y) <= r2) out.push(e);
    }
    return out;
  }

  function pullEnemyToward(ex, ey, enemy, force) {
    var dx = ex - enemy.x, dy = ey - enemy.y;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    enemy.x += (dx / d) * force;
    enemy.y += (dy / d) * force;
  }

  function pushEnemyFrom(px, py, enemy, force) {
    var dx = enemy.x - px, dy = enemy.y - py;
    var d = Math.sqrt(dx * dx + dy * dy) || 1;
    enemy.x += (dx / d) * force;
    enemy.y += (dy / d) * force;
  }

  function chainFrom(ctx, origin, dmg, depth, maxDepth, range, falloff, color) {
    if (!ctx.chainDamage || depth >= maxDepth) return;
    var next = nearestEnemy(ctx.game, origin.x, origin.y, range, origin);
    if (!next) return;
    if (ctx.ParticleSystem && ctx.ParticleSystem.lightning) {
      ctx.ParticleSystem.lightning(origin.x, origin.y, next.x, next.y, color || '#ffff00');
    }
    ctx.chainDamage(next, Math.floor(dmg * falloff), depth);
  }

  function spawnBurst(PS, x, y, color, count) {
    if (!PS) return;
    PS.spawn(x, y, { count: count || 6, speed: 90, life: 400, color: color, size: 2.5 });
  }

  /** @type {Object.<string, {onBulletHit?: Function, onKill?: Function, tick?: Function}>} */
  var HANDLERS = {};

  // ===== 1-20 =====
  HANDLERS.attackSpeed = {
    onBulletHit: function(ctx) {
      var p = ctx.player;
      p._asRhythm = (p._asRhythm || 0) + 1;
      if (p._asRhythm % 5 === 0 && ctx.ParticleSystem) {
        ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
          count: 8, speed: 140, life: 300, colors: ['#ffdd00', '#ffaa00'], size: 2
        });
      }
      ctx.enemy._factionDebuff = ctx.enemy._factionDebuff || {};
      ctx.enemy._factionDebuff.asFlurry = (ctx.enemy._factionDebuff.asFlurry || 0) + 1;
    },
    onKill: function(ctx) {
      ctx.player._asKillStreak = (ctx.player._asKillStreak || 0) + 1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.trail(ctx.enemy.x, ctx.enemy.y, '#ffdd00', 3);
    }
  };

  HANDLERS.counter = {
    onBulletHit: function(ctx) {
      ctx.enemy._factionDebuff = ctx.enemy._factionDebuff || {};
      ctx.enemy._factionDebuff.thornsMark = 2000;
      ctx.enemy._reflectOnTouch = stat(ctx.player, 'reflectDamage', 0.2);
      if (ctx.ParticleSystem) ctx.ParticleSystem.shieldBreak(ctx.enemy.x, ctx.enemy.y, '#ff6644');
    },
    onKill: function(ctx) {
      var r = stat(ctx.player, 'reflectDamage', 0.2);
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 80).forEach(function(e) {
        e.takeDamage(Math.floor(ctx.damage * r * 0.5));
      });
    }
  };

  HANDLERS.crit = {
    onBulletHit: function(ctx) {
      if (!ctx.isCrit) {
        ctx.enemy._critWound = (ctx.enemy._critWound || 0) + 1;
        return;
      }
      ctx.enemy._vulnerableTimer = 1500;
      ctx.enemy._vulnerableMult = 1 + stat(ctx.player, 'critMult', 1.5) * 0.1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.nova(ctx.enemy.x, ctx.enemy.y, '#ff0000');
    },
    onKill: function(ctx) {
      if (!ctx.isCrit) return;
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 100).forEach(function(e) {
        e.takeDamage(Math.floor(ctx.damage * 0.35));
      });
      if (ctx.ParticleSystem) ctx.ParticleSystem.layeredExplosion(ctx.enemy.x, ctx.enemy.y, 'small');
    }
  };

  HANDLERS.summon = {
    onBulletHit: function(ctx) {
      ctx.enemy._droneTag = (ctx.enemy._droneTag || 0) + 1;
      if (ctx.ParticleSystem) {
        ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
          count: 3, speed: 60, life: 500, color: '#aa66ff', size: 2, angle: Math.random() * 6.28
        });
      }
    },
    onKill: function(ctx) {
      ctx.player._droneEnergy = (ctx.player._droneEnergy || 0) + 1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.healEffect(ctx.enemy.x, ctx.enemy.y);
    }
  };

  HANDLERS.elemental = {
    onBulletHit: function(ctx) {
      var p = ctx.player;
      ctx.enemy.burnTimer = Math.max(ctx.enemy.burnTimer || 0, stat(p, 'burnDuration', 2000));
      ctx.enemy.burnDamage = stat(p, 'burnDamage', 5);
      ctx.enemy.burnDuration = ctx.enemy.burnTimer;
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
        count: 5, speed: 40, life: 600, colors: ['#ff4400', '#ff8800'], size: 3, gravity: -20
      });
    },
    onKill: function(ctx) {
      if (ctx.ParticleSystem) ctx.ParticleSystem.explosion(ctx.enemy.x, ctx.enemy.y, 'small');
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 70).forEach(function(e) {
        e.burnTimer = 1500;
        e.burnDamage = stat(ctx.player, 'burnDamage', 5) * 0.6;
      });
    }
  };

  HANDLERS.lifesteal = {
    onBulletHit: function(ctx) {
      var ls = stat(ctx.player, 'lifesteal', 0.12);
      var heal = Math.floor(ctx.damage * ls * 0.25);
      if (heal > 0) ctx.player.heal(heal);
      if (ctx.ParticleSystem) ctx.ParticleSystem.healEffect(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      ctx.player.heal(Math.floor(stat(ctx.player, 'maxHp', 100) * 0.02));
      if (ctx.ParticleSystem) ctx.ParticleSystem.screenFlash('rgba(255,51,102,0.12)', 120);
    }
  };

  HANDLERS.shield = {
    onBulletHit: function(ctx) {
      ctx.enemy._shieldCrack = (ctx.enemy._shieldCrack || 0) + ctx.damage * 0.05;
      if (stat(ctx.player, 'shieldReflect', 0)) {
        ctx.enemy.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'shieldReflect', 0.5) * 0.15));
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.shieldBreak(ctx.enemy.x, ctx.enemy.y, '#44aaff');
    },
    onKill: function(ctx) {
      if (ctx.player.shield !== undefined) {
        ctx.player.shield = Math.min(ctx.player.maxShield || 200, (ctx.player.shield || 0) + 5);
      }
    }
  };

  HANDLERS.poison = {
    onBulletHit: function(ctx) {
      var p = ctx.player;
      ctx.enemy.poisonTimer = Math.max(ctx.enemy.poisonTimer || 0, stat(p, 'poisonDuration', 3000));
      ctx.enemy.poisonDamage = stat(p, 'poisonDamage', 8);
      ctx.enemy._poisonStacks = (ctx.enemy._poisonStacks || 0) + 1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
        count: 6, speed: 30, life: 800, colors: ['#55cc44', '#88ff66'], size: 2.5, gravity: -10
      });
    },
    onKill: function(ctx) {
      if (Math.random() > stat(ctx.player, 'poisonSpread', 0.2)) return;
      var near = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 120, ctx.enemy);
      if (near) {
        near.poisonTimer = 2500;
        near.poisonDamage = stat(ctx.player, 'poisonDamage', 8) * 0.7;
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.paralyzeEffect(ctx.enemy.x, ctx.enemy.y);
    }
  };

  HANDLERS.ice = {
    onBulletHit: function(ctx) {
      var p = ctx.player;
      if (Math.random() < stat(p, 'slowChance', 0.35)) {
        ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, stat(p, 'slowDuration', 2000));
        ctx.enemy.slowAmount = stat(p, 'slowAmount', 0.4);
      }
      if (Math.random() < stat(p, 'freezeChance', 0.05)) {
        ctx.enemy.frozenTimer = Math.max(ctx.enemy.frozenTimer || 0, 1200);
        if (ctx.ParticleSystem) ctx.ParticleSystem.shatterEffect(ctx.enemy.x, ctx.enemy.y);
      } else if (ctx.ParticleSystem) {
        ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
          count: 4, speed: 50, life: 500, color: '#66ddff', size: 2, isSquare: true
        });
      }
    },
    onKill: function(ctx) {
      if (ctx.enemy.frozenTimer > 0 && ctx.ParticleSystem) {
        ctx.ParticleSystem.shatterEffect(ctx.enemy.x, ctx.enemy.y);
      }
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 90).forEach(function(e) {
        e.slowTimer = Math.max(e.slowTimer || 0, 800);
        e.slowAmount = 0.25;
      });
    },
    tick: function(player, dt) {
      if (!stat(player, 'slowAura', 0) && !player._iceSlowAura) return;
      var aura = stat(player, 'slowAura', 0) || player._iceSlowAura || 0.2;
      var r = 150, g = window.game;
      if (!g || !g.enemies) return;
      for (var i = 0; i < g.enemies.length; i++) {
        var e = g.enemies[i];
        if (!e.active) continue;
        if (distSq(player.x, player.y, e.x, e.y) <= r * r) {
          e.slowTimer = Math.max(e.slowTimer || 0, dt * 1000 + 200);
          e.slowAmount = Math.max(e.slowAmount || 0, aura);
        }
      }
    }
  };

  HANDLERS.barrage = {
    onBulletHit: function(ctx) {
      ctx.enemy._barragePellets = (ctx.enemy._barragePellets || 0) + stat(ctx.player, 'extraBullets', 2);
      if (ctx.ParticleSystem) {
        for (var i = 0; i < 4; i++) {
          var a = (i / 4) * Math.PI * 2;
          ctx.ParticleSystem.trail(
            ctx.enemy.x + Math.cos(a) * 12, ctx.enemy.y + Math.sin(a) * 12, '#ff66aa', 2
          );
        }
      }
    },
    onKill: function(ctx) {
      if (ctx.ParticleSystem) ctx.ParticleSystem.layeredExplosion(ctx.enemy.x, ctx.enemy.y, 'small');
    }
  };

  HANDLERS.gravity = {
    onBulletHit: function(ctx) {
      var p = ctx.player, rad = stat(p, 'gravityRadius', 200);
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, rad).forEach(function(e) {
        if (e === ctx.enemy) return;
        pullEnemyToward(ctx.enemy.x, ctx.enemy.y, e, stat(p, 'gravitySlow', 0.35) * 18);
        e.slowTimer = Math.max(e.slowTimer || 0, 600);
        e.slowAmount = Math.max(e.slowAmount || 0, stat(p, 'gravitySlow', 0.35));
      });
      if (ctx.ParticleSystem) ctx.ParticleSystem.implosion(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      ctx.enemy._gravityWell = { x: ctx.enemy.x, y: ctx.enemy.y, life: 1.5 };
      if (ctx.ParticleSystem) ctx.ParticleSystem.nova(ctx.enemy.x, ctx.enemy.y, '#8866cc');
    }
  };

  HANDLERS.void = {
    onBulletHit: function(ctx) {
      var e = ctx.enemy, thresh = stat(ctx.player, 'voidExecuteThreshold', 0.15);
      if (e.hp && e.maxHp && e.hp / e.maxHp < thresh && Math.random() < stat(ctx.player, 'voidExecuteChance', 0.2)) {
        e.takeDamage(9999);
        if (ctx.ParticleSystem) ctx.ParticleSystem.implosion(e.x, e.y);
        return;
      }
      e._voidMark = (e._voidMark || 0) + stat(ctx.player, 'voidDamage', 8);
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(e.x, e.y, {
        count: 5, speed: 70, life: 450, color: '#440066', size: 3
      });
    },
    onKill: function(ctx) {
      ctx.player._voidExecutions = (ctx.player._voidExecutions || 0) + 1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.implosion(ctx.enemy.x, ctx.enemy.y);
    }
  };

  HANDLERS.thunder = {
    onBulletHit: function(ctx) {
      var p = ctx.player;
      if (Math.random() >= stat(p, 'chainLightningChance', 0.3)) return;
      var dmg = Math.floor(ctx.damage * stat(p, 'chainDamage', 0.5));
      var count = Math.floor(stat(p, 'chainCount', 3));
      var range = stat(p, 'chainRange', 150) || 150;
      ctx.enemy._shockTimer = 2000;
      ctx.enemy._shockDamage = dmg;
      if (ctx.chainDamage) ctx.chainDamage(ctx.enemy, dmg, 0);
      else chainFrom(ctx, ctx.enemy, dmg, 0, count, range, 0.7, '#ffff00');
    },
    onKill: function(ctx) {
      var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 200, ctx.enemy);
      if (n && ctx.ParticleSystem) {
        ctx.ParticleSystem.lightning(ctx.enemy.x, ctx.enemy.y, n.x, n.y, '#ffff00');
        n.takeDamage(Math.floor(ctx.damage * 0.4));
      }
    }
  };

  HANDLERS.wind = {
    onBulletHit: function(ctx) {
      var force = stat(ctx.player, 'windPushForce', 80);
      pushEnemyFrom(ctx.player.x, ctx.player.y, ctx.enemy, force * 0.15);
      ctx.enemy._windShear = 1200;
      if (ctx.ParticleSystem) {
        ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
          count: 6, speed: 110, life: 350, color: '#88ff88', size: 2
        });
      }
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'windPushRadius', 180)).forEach(function(e) {
        pushEnemyFrom(ctx.enemy.x, ctx.enemy.y, e, 40);
      });
    }
  };

  HANDLERS.shadow = {
    onBulletHit: function(ctx) {
      ctx.enemy._shadowMarked = 2500;
      ctx.enemy._shadowBonus = stat(ctx.player, 'stealthDamageBonus', 1.5) * 0.1;
      if (Math.random() < 0.15) {
        ctx.player._shadowStrikeReady = true;
        if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
          count: 4, speed: 40, life: 600, color: '#111166', size: 4
        });
      }
    },
    onKill: function(ctx) {
      ctx.player._shadowKillCount = (ctx.player._shadowKillCount || 0) + 1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.shieldBreak(ctx.enemy.x, ctx.enemy.y, '#333388');
    }
  };

  HANDLERS.holy = {
    onBulletHit: function(ctx) {
      ctx.player.heal(stat(ctx.player, 'healAuraAmount', 1.5) * 0.3);
      ctx.enemy._holyBrand = 2000;
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
        count: 5, speed: 50, life: 500, color: '#ffffcc', size: 3
      });
    },
    onKill: function(ctx) {
      ctx.player.heal(3);
      if (ctx.ParticleSystem) ctx.ParticleSystem.healEffect(ctx.enemy.x, ctx.enemy.y);
    },
    tick: function(player, dt) {
      var amt = stat(player, 'healAuraAmount', 1.5);
      var r = stat(player, 'healAuraRadius', 150);
      if (amt <= 0) return;
      player._holyAuraTick = (player._holyAuraTick || 0) + dt;
      if (player._holyAuraTick < 0.5) return;
      player._holyAuraTick = 0;
      player.heal(amt * 0.5);
      if (window.ParticleSystem) window.ParticleSystem.trail(player.x, player.y - 20, '#ffffcc', 2);
    }
  };

  HANDLERS.blood = {
    onBulletHit: function(ctx) {
      ctx.enemy._bloodRite = (ctx.enemy._bloodRite || 0) + 1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.screenFlash('rgba(204,0,0,0.08)', 80);
    },
    onKill: function(ctx) {
      var bonus = stat(ctx.player, 'bloodRageDamage', 0.7);
      ctx.player._bloodFrenzy = 3000;
      ctx.player._bloodFrenzyMult = 1 + bonus * 0.1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.explosion(ctx.enemy.x, ctx.enemy.y, 'small');
    }
  };

  HANDLERS.magnet = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'bulletRepelChance', 0.3) * 0.2) {
        ctx.enemy._magnetDisorient = 1000;
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.spark(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      var g = ctx.game, r = stat(ctx.player, 'pickupRange', 120) + stat(ctx.player, 'goldMagnet', 100);
      if (!g || !g.items) return;
      for (var i = 0; i < g.items.length; i++) {
        var it = g.items[i];
        if (!it.active) continue;
        if (distSq(ctx.enemy.x, ctx.enemy.y, it.x, it.y) <= (r + 80) * (r + 80)) {
          it._magnetPulled = true;
          pullEnemyToward(ctx.player.x, ctx.player.y, it, 25);
        }
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.nova(ctx.enemy.x, ctx.enemy.y, '#cc44cc');
    }
  };

  HANDLERS.mirror = {
    onBulletHit: function(ctx) {
      ctx.enemy._mirrorEcho = 2000;
      ctx.enemy._mirrorRedirect = stat(ctx.player, 'damageRedirect', 0.4) * 0.15;
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
        count: 4, speed: 60, life: 400, color: '#aaccee', size: 2, isSquare: true
      });
    },
    onKill: function(ctx) {
      if (ctx.ParticleSystem) ctx.ParticleSystem.shieldBreak(ctx.enemy.x, ctx.enemy.y, '#aaccee');
    }
  };

  HANDLERS.time = {
    onBulletHit: function(ctx) {
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, stat(ctx.player, 'timeSlowDuration', 3000));
      ctx.enemy.slowAmount = Math.max(ctx.enemy.slowAmount || 0, stat(ctx.player, 'timeSlowAmount', 0.3));
      ctx.enemy._timeWarped = true;
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
        count: 3, speed: 20, life: 700, color: '#ccbb88', size: 4
      });
    },
    onKill: function(ctx) {
      ctx.player._timeKillBoost = 2000;
      if (ctx.ParticleSystem) ctx.ParticleSystem.screenFlash('rgba(204,187,136,0.15)', 150);
    },
    tick: function(player, dt) {
      if (!player._timeSlowAuraActive) return;
      var g = window.game, amt = player._timeSlowAmount || 0.2;
      if (!g || !g.enemies) return;
      for (var i = 0; i < g.enemies.length; i++) {
        var e = g.enemies[i];
        if (!e.active) continue;
        if (distSq(player.x, player.y, e.x, e.y) <= 180 * 180) {
          e.slowTimer = Math.max(e.slowTimer || 0, 400);
          e.slowAmount = Math.max(e.slowAmount || 0, amt);
        }
      }
    }
  };

  HANDLERS.fury = {
    onBulletHit: function(ctx) {
      var ratio = ctx.player.hp / ctx.player.maxHp;
      if (ratio < stat(ctx.player, 'rageThreshold', 0.3)) {
        ctx.enemy._furyMark = Math.floor(ctx.damage * stat(ctx.player, 'lowHpBonus', 0.5) * 0.2);
      }
      if (ctx.ParticleSystem && ratio < 0.5) {
        ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
          count: 5, speed: 100, life: 300, color: '#ff0044', size: 3
        });
      }
    },
    onKill: function(ctx) {
      ctx.player._furyStacks = Math.min(10, (ctx.player._furyStacks || 0) + 1);
    }
  };

  HANDLERS.luck = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'luckBonus', 0.2) * 0.15) {
        ctx.enemy._luckyWeak = 1500;
        ctx.enemy._vulnerableMult = 1.15;
        ctx.enemy._vulnerableTimer = 1500;
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.spark(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      if (Math.random() < 0.25 + stat(ctx.player, 'dropRateBonus', 0.15)) {
        ctx.player._luckJackpot = (ctx.player._luckJackpot || 0) + 1;
        if (ctx.ParticleSystem) ctx.ParticleSystem.levelUpEffect(ctx.enemy.x, ctx.enemy.y);
      }
    }
  };

  HANDLERS.sonic = {
    onBulletHit: function(ctx) {
      var r = stat(ctx.player, 'sonicRadius', 120);
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, r).forEach(function(e) {
        e._sonicStun = Math.max(e._sonicStun || 0, 400);
        e.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'sonicDamage', 0.5) * 0.15));
      });
      if (ctx.ParticleSystem) {
        ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, {
          count: 10, speed: 130, life: 350, color: '#ff88ff', size: 2
        });
      }
    },
    onKill: function(ctx) {
      if (ctx.ParticleSystem) ctx.ParticleSystem.reactionEffect(ctx.enemy.x, ctx.enemy.y, 'sonic');
    }
  };

  // ===== 21-40 =====
  HANDLERS.minion = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'bloodOrbDrop', 0.15) * 0.3) ctx.player._bloodOrbs = (ctx.player._bloodOrbs || 0) + 1;
      ctx.enemy._minionFeast = (ctx.enemy._minionFeast || 0) + 1;
    },
    onKill: function(ctx) {
      ctx.player._minionKills = (ctx.player._minionKills || 0) + 1;
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#ff4488', 6);
    }
  };

  HANDLERS.data = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'weakPointChance', 0.15)) {
        ctx.enemy._weakPoint = 3000;
        ctx.enemy._weakPointMult = 1 + stat(ctx.player, 'weakPointBonus', 0.5);
        if (ctx.ParticleSystem) ctx.ParticleSystem.damageNumber(ctx.enemy.x, ctx.enemy.y, 'SCAN', '#00ffcc');
      }
    },
    onKill: function(ctx) { ctx.player._dataKills = (ctx.player._dataKills || 0) + 1; }
  };

  HANDLERS.nature = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'vineRoot', 0.1)) {
        ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 1500);
        ctx.enemy._vineRooted = true;
      }
      ctx.enemy.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'thornDamage', 0.2) * 0.2));
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#44ff88', 4);
    },
    onKill: function(ctx) { ctx.player.heal(Math.floor(stat(ctx.player, 'regenRate', 0.003) * ctx.player.maxHp * 5)); },
    tick: function(player, dt) {
      player._natureTick = (player._natureTick || 0) + dt;
      if (player._natureTick < 1) return;
      player._natureTick = 0;
      player.heal(Math.floor(stat(player, 'regenRate', 0.003) * player.maxHp));
    }
  };

  HANDLERS.psychic = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'markChance', 0.2)) {
        ctx.enemy._psychicMark = 4000;
        ctx.enemy._psychicBonus = stat(ctx.player, 'markBonus', 0.4);
      }
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#ff44ff', 3);
    },
    onKill: function(ctx) {
      var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'predictRange', 250), ctx.enemy);
      if (n) { n._psychicMark = 3000; n._psychicBonus = stat(ctx.player, 'markBonus', 0.4) * 0.7; }
    }
  };

  HANDLERS.explosive = {
    onBulletHit: function(ctx) {
      var rad = stat(ctx.player, 'explosionRadius', 70);
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, rad).forEach(function(e) {
        e.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'explosionBonus', 0.3) * 0.4));
      });
      if (ctx.ParticleSystem) ctx.ParticleSystem.explosion(ctx.enemy.x, ctx.enemy.y, 'small');
    },
    onKill: function(ctx) {
      if (Math.random() < stat(ctx.player, 'chainExplosion', 0.1)) {
        var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 150, ctx.enemy);
        if (n) n.takeDamage(Math.floor(ctx.damage * 0.5));
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.layeredExplosion(ctx.enemy.x, ctx.enemy.y, 'normal');
    }
  };

  HANDLERS.mech = {
    onBulletHit: function(ctx) { ctx.enemy._mechTagged = 2000; if (ctx.ParticleSystem) ctx.ParticleSystem.spark(ctx.enemy.x, ctx.enemy.y); },
    onKill: function(ctx) {
      ctx.player.heal(Math.floor(ctx.player.maxHp * stat(ctx.player, 'repairRate', 0.01)));
      ctx.player._robotCharge = (ctx.player._robotCharge || 0) + 1;
    }
  };

  HANDLERS.rune = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'runeDrop', 0.15)) {
        ctx.enemy._runeMark = stat(ctx.player, 'runeDuration', 5000);
        ctx.enemy._runePower = stat(ctx.player, 'runeEffect', 0.3);
      }
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#ffaa44', 4);
    },
    onKill: function(ctx) {
      ctx.player._runeCharges = (ctx.player._runeCharges || 0) + 1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.nova(ctx.enemy.x, ctx.enemy.y, '#ffaa44');
    }
  };

  HANDLERS.star = {
    onBulletHit: function(ctx) {
      ctx.player._starCharge = Math.min(stat(ctx.player, 'maxStarCharge', 100), (ctx.player._starCharge || 0) + stat(ctx.player, 'chargeRate', 5));
      if (ctx.player._starCharge >= stat(ctx.player, 'maxStarCharge', 100)) {
        enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 120).forEach(function(e) { e.takeDamage(stat(ctx.player, 'chargeRate', 5) * 8); });
        ctx.player._starCharge = 0;
        if (ctx.ParticleSystem) ctx.ParticleSystem.nova(ctx.enemy.x, ctx.enemy.y, '#ffffaa');
      }
    },
    onKill: function(ctx) {
      ctx.player._starCharge = Math.min(stat(ctx.player, 'maxStarCharge', 100), (ctx.player._starCharge || 0) + 10);
    }
  };

  HANDLERS.darkGold = {
    onBulletHit: function(ctx) { ctx.player._goldOnHitAcc = (ctx.player._goldOnHitAcc || 0) + stat(ctx.player, 'goldOnHit', 1); },
    onKill: function(ctx) {
      ctx.player._bonusGold = (ctx.player._bonusGold || 0) + Math.floor(1 + stat(ctx.player, 'goldBonus', 0.3) * 3);
      if (ctx.ParticleSystem) ctx.ParticleSystem.levelUpEffect(ctx.enemy.x, ctx.enemy.y);
    }
  };

  HANDLERS.storm = {
    onBulletHit: function(ctx) {
      var p = ctx.player;
      var now = Date.now();
      if (p._lastTornadoSpawn && now - p._lastTornadoSpawn < 400) return;
      if (Math.random() >= stat(ctx.player, 'tornadoChance', 0.08)) return;
      p._lastTornadoSpawn = now;
      var g = ctx.game, ex = ctx.enemy.x, ey = ctx.enemy.y;
      g.addEntity({
        x: ex, y: ey, size: 30, _age: 0, lifetime: 2, active: true, category: 'particle', drawLayer: 3,
        _pullRadius: 100, _pullForce: 60,
        update: function(dt) {
          this._age += dt;
          if (this._age >= this.lifetime) { this.active = false; g.removeEntity(this); return; }
          for (var i = 0; i < g.enemies.length; i++) {
            var te = g.enemies[i];
            if (!te.active) continue;
            var tdx = this.x - te.x, tdy = this.y - te.y, td = Math.sqrt(tdx * tdx + tdy * tdy);
            if (td < this._pullRadius && td > 5) {
              var f = this._pullForce * (1 - td / this._pullRadius) * dt;
              te.x += (tdx / td) * f; te.y += (tdy / td) * f;
              te.slowTimer = Math.max(te.slowTimer || 0, 300);
            }
          }
          this.size += dt * 20;
        },
        draw: function(c) {
          c.save(); c.globalAlpha = (1 - this._age / this.lifetime) * 0.4;
          c.strokeStyle = '#88ffcc'; c.beginPath(); c.arc(this.x, this.y, this.size, 0, 6.28); c.stroke(); c.restore();
        }
      });
      spawnBurst(ctx.ParticleSystem, ex, ey, '#88ffcc', 12);
    },
    onKill: function(ctx) { pushEnemyFrom(ctx.player.x, ctx.player.y, ctx.enemy, stat(ctx.player, 'windPushForce', 100) * 0.1); }
  };

  HANDLERS.soul = {
    onBulletHit: function(ctx) { ctx.enemy._soulTether = 1500; },
    onKill: function(ctx) {
      ctx.player._souls = Math.min(stat(ctx.player, 'maxSouls', 50), (ctx.player._souls || 0) + 1);
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#cc88ff', 5);
    },
    tick: function(player, dt) {
      var souls = player._souls || 0;
      if (souls <= 0) return;
      player._soulDamageBuff = 1 + souls * stat(player, 'soulBonus', 0.02);
      player._soulAuraTick = (player._soulAuraTick || 0) + dt;
      if (player._soulAuraTick > 2 && window.ParticleSystem) {
        player._soulAuraTick = 0;
        window.ParticleSystem.trail(player.x, player.y - 15, '#cc88ff', 2);
      }
    }
  };

  HANDLERS.genesis = {
    onBulletHit: function(ctx) { ctx.enemy._genesisChaos = (ctx.enemy._genesisChaos || 0) + 1; },
    onKill: function(ctx) {
      var buffs = ['attack', 'speed', 'critRate'];
      ctx.player._genesisBuff = buffs[Math.floor(Math.random() * buffs.length)];
      ctx.player._genesisBuffTimer = stat(ctx.player, 'buffDuration', 30000) / 10;
      ctx.player._genesisBuffVal = 0.15 + Math.random() * 0.15;
      if (ctx.ParticleSystem) ctx.ParticleSystem.levelUpEffect(ctx.enemy.x, ctx.enemy.y);
    },
    tick: function(player, dt) {
      if (!player._genesisBuffTimer || player._genesisBuffTimer <= 0) return;
      player._genesisBuffTimer -= dt * 1000;
      if (player._genesisBuffTimer <= 0) { player._genesisBuff = null; return; }
      var v = player._genesisBuffVal || 0.2;
      if (player._genesisBuff === 'attack') player._genesisAttackMult = 1 + v;
      else if (player._genesisBuff === 'speed') player._genesisSpeedMult = 1 + v;
      else player._genesisCritBonus = v;
    }
  };

  HANDLERS.tech = {
    onBulletHit: function(ctx) {
      ctx.player._techCharge = (ctx.player._techCharge || 0) + stat(ctx.player, 'skillBoost', 0.15) * 10;
      ctx.enemy._nanoDisrupt = 1500;
      if (ctx.ParticleSystem) ctx.ParticleSystem.spark(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) { ctx.player.heal(Math.floor(ctx.player.maxHp * stat(ctx.player, 'nanoRepair', 0.005))); },
    tick: function(player, dt) {
      player._nanoRepairTick = (player._nanoRepairTick || 0) + dt;
      if (player._nanoRepairTick >= 2) { player._nanoRepairTick = 0; player.heal(Math.floor(player.maxHp * stat(player, 'nanoRepair', 0.005))); }
    }
  };

  HANDLERS.chaos = {
    onBulletHit: function(ctx) {
      if (Math.random() >= stat(ctx.player, 'randomEffectChance', 0.15)) return;
      var e = ctx.enemy, r = Math.floor(Math.random() * 5);
      if (r === 0) { e.burnTimer = 1500; e.burnDamage = 6; }
      else if (r === 1) { e.poisonTimer = 2000; e.poisonDamage = 5; }
      else if (r === 2) { e.frozenTimer = 800; }
      else if (r === 3) { e.slowTimer = 1500; e.slowAmount = 0.35; }
      else e.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'chaosMultiplier', 0.2)));
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(e.x, e.y, { count: 8, speed: 100, life: 400, colors: ['#ff44aa','#44ffaa','#ffaa44'], size: 2 });
    },
    onKill: function(ctx) {
      if (Math.random() < 0.2) enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 100).forEach(function(e) { e.takeDamage(Math.floor(ctx.damage * 0.25)); });
    }
  };

  HANDLERS.light = {
    onBulletHit: function(ctx) {
      ctx.player._lightCharge = (ctx.player._lightCharge || 0) + 3;
      ctx.enemy._radiantBurn = 2000;
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#fff9c4', 6);
    },
    onKill: function(ctx) {
      if ((ctx.player._lightCharge || 0) >= 50) {
        enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 100).forEach(function(e) { e.takeDamage(stat(ctx.player, 'lightBurstDamage', 30)); });
        ctx.player._lightCharge = 0;
        if (ctx.ParticleSystem) ctx.ParticleSystem.nova(ctx.enemy.x, ctx.enemy.y, '#fff9c4');
      }
    }
  };

  HANDLERS.dark = {
    onBulletHit: function(ctx) {
      ctx.enemy._darkBolt = stat(ctx.player, 'darkBolt', 15);
      ctx.enemy._factionDebuff = ctx.enemy._factionDebuff || {};
      ctx.enemy._factionDebuff.darkVeil = 2500;
      if (ctx.ParticleSystem) ctx.ParticleSystem.implosion(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) { ctx.player._darkMeldStacks = Math.min(5, (ctx.player._darkMeldStacks || 0) + 1); }
  };

  HANDLERS.lava = {
    onBulletHit: function(ctx) {
      ctx.enemy.burnTimer = Math.max(ctx.enemy.burnTimer || 0, 2500);
      ctx.enemy.burnDamage = stat(ctx.player, 'magmaPoolDamage', 8);
      if (ctx.ParticleSystem) ctx.ParticleSystem.meltEffect(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      var dmg = stat(ctx.player, 'magmaPoolDamage', 8), rad = stat(ctx.player, 'magmaPoolRadius', 100);
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, rad).forEach(function(e) { e.burnTimer = 3000; e.burnDamage = dmg; });
      if (ctx.ParticleSystem) ctx.ParticleSystem.explosion(ctx.enemy.x, ctx.enemy.y, 'normal');
    }
  };

  HANDLERS.steam = {
    onBulletHit: function(ctx) {
      ctx.player._steamPressure = Math.min(1, (ctx.player._steamPressure || 0) + stat(ctx.player, 'steamPressure', 0.1));
      ctx.enemy._steamBlind = 1200;
      if (ctx.ParticleSystem) ctx.ParticleSystem.steamEffect(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      if ((ctx.player._steamPressure || 0) >= 0.8) {
        enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'steamBurstRadius', 120)).forEach(function(e) {
          e.takeDamage(Math.floor(ctx.damage * 0.3)); e.slowTimer = Math.max(e.slowTimer || 0, 800);
        });
        ctx.player._steamPressure = 0;
      }
    }
  };

  HANDLERS.dust = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'dustBlindChance', 0.1)) { ctx.enemy._blindTimer = 1500; ctx.enemy._blindAmount = 0.4; }
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 1000);
      ctx.enemy.slowAmount = Math.max(ctx.enemy.slowAmount || 0, stat(ctx.player, 'dustSlowAmount', 0.15));
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#8d6e63', 10);
    },
    onKill: function(ctx) { spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#a1887f', 15); }
  };

  HANDLERS.metal = {
    onBulletHit: function(ctx) {
      ctx.enemy._armorShred = (ctx.enemy._armorShred || 0) + stat(ctx.player, 'armorPierce', 0.15);
      if (ctx.ParticleSystem) ctx.ParticleSystem.spark(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      for (var i = 0; i < stat(ctx.player, 'shrapnelCount', 0) + 3; i++) {
        var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 120, ctx.enemy);
        if (n) n.takeDamage(Math.floor(ctx.damage * 0.15));
      }
    }
  };

  HANDLERS.glass = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'glassShardChance', 0.2)) {
        ctx.enemy.takeDamage(stat(ctx.player, 'shardDamage', 20));
        if (ctx.ParticleSystem) ctx.ParticleSystem.shatterEffect(ctx.enemy.x, ctx.enemy.y);
      }
      ctx.enemy._glassFragile = 2000;
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 80).forEach(function(e) {
        if (Math.random() < 0.3) e.takeDamage(stat(ctx.player, 'shardDamage', 20) * 0.5);
      });
    }
  };

  HANDLERS.silk = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'silkSnareChance', 0.1)) {
        ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, stat(ctx.player, 'silkSnareDuration', 2000));
        ctx.enemy.slowAmount = 0.55; ctx.enemy._silkSnared = true;
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.trail(ctx.enemy.x, ctx.enemy.y, '#f06292', 2);
    },
    onKill: function(ctx) {
      var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 100, ctx.enemy);
      if (n) { n.slowTimer = 1500; n._silkSnared = true; }
    }
  };

  HANDLERS.bone = {
    onBulletHit: function(ctx) {
      ctx.enemy._boneSpikeDot = stat(ctx.player, 'boneSpikeDamage', 10);
      ctx.enemy._boneSpikeTimer = 2500;
      ctx.player._boneArmorStacks = Math.min(10, (ctx.player._boneArmorStacks || 0) + 1);
    },
    onKill: function(ctx) { spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#bcaaa4', 6); }
  };

  // ===== 41-88 =====
  HANDLERS.arrow = {
    onBulletHit: function(ctx) {
      ctx.enemy._arrowMarked = 3000;
      if (ctx.isCrit) ctx.enemy.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'arrowCritBonus', 0.3)));
      if (ctx.ParticleSystem) ctx.ParticleSystem.trail(ctx.enemy.x, ctx.enemy.y, '#ff6d00', 2);
    },
    onKill: function(ctx) { ctx.player._arrowPrecisionStacks = Math.min(5, (ctx.player._arrowPrecisionStacks || 0) + 1); }
  };

  HANDLERS.spear = {
    onBulletHit: function(ctx) {
      var line = stat(ctx.player, 'spearRange', 30) + 40;
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, line).forEach(function(e) {
        if (e !== ctx.enemy) e.takeDamage(Math.floor(ctx.damage * 0.2));
      });
      ctx.enemy._spearImpaled = 2000;
    },
    onKill: function(ctx) {
      var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 200, ctx.enemy);
      if (n) { n._spearImpaled = 1500; n.takeDamage(Math.floor(ctx.damage * 0.25)); }
    }
  };

  HANDLERS.hammer = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'hammerStunChance', 0.08)) {
        ctx.enemy.frozenTimer = Math.max(ctx.enemy.frozenTimer || 0, 600);
        ctx.enemy._hammerStunned = true;
      }
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'hammerRadius', 30) + 20).forEach(function(e) {
        e.takeDamage(Math.floor(ctx.damage * 0.15));
      });
      if (ctx.ParticleSystem) ctx.ParticleSystem.explosion(ctx.enemy.x, ctx.enemy.y, 'small');
    },
    onKill: function(ctx) { if (ctx.game.addShake) ctx.game.addShake(4); }
  };

  HANDLERS.whip = {
    onBulletHit: function(ctx) {
      var chains = stat(ctx.player, 'whipChainCount', 1);
      var cur = ctx.enemy;
      for (var i = 0; i < chains; i++) {
        var n = nearestEnemy(ctx.game, cur.x, cur.y, stat(ctx.player, 'whipRange', 20) + 60, cur);
        if (!n) break;
        n.takeDamage(Math.floor(ctx.damage * 0.2));
        if (ctx.ParticleSystem) ctx.ParticleSystem.trail(cur.x, cur.y, '#ad1457', 2);
        cur = n;
      }
    },
    onKill: function(ctx) { ctx.enemy._whipLash = true; spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#ad1457', 5); }
  };

  HANDLERS.sword = {
    onBulletHit: function(ctx) {
      ctx.player._swordCombo = (ctx.player._swordCombo || 0) + 1;
      var bonus = 1 + (ctx.player._swordCombo * stat(ctx.player, 'swordComboBonus', 0.1));
      ctx.enemy._swordMarked = Math.floor(ctx.damage * (bonus - 1));
    },
    onKill: function(ctx) { ctx.player._swordCombo = 0; if (ctx.ParticleSystem) ctx.ParticleSystem.lightning(ctx.enemy.x, ctx.enemy.y, ctx.player.x, ctx.player.y, '#78909c'); }
  };

  HANDLERS.ax = {
    onBulletHit: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'axCleaveRadius', 20) + 30).forEach(function(e) {
        e.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'axCleaveDamage', 0.4) * 0.35));
      });
      if (ctx.ParticleSystem) ctx.ParticleSystem.explosion(ctx.enemy.x, ctx.enemy.y, 'small');
    },
    onKill: function(ctx) {
      if (ctx.enemy.hp !== undefined && ctx.enemy.maxHp && ctx.enemy.hp / ctx.enemy.maxHp < 0.25) {
        enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 100).forEach(function(e) { e.takeDamage(Math.floor(ctx.damage * 0.5)); });
      }
    }
  };

  HANDLERS.dagger = {
    onBulletHit: function(ctx) {
      var dx = ctx.enemy.x - ctx.player.x, dy = ctx.enemy.y - ctx.player.y;
      var behind = (ctx.bullet && ctx.bullet.vx * dx + ctx.bullet.vy * dy < 0);
      if (behind || Math.random() < stat(ctx.player, 'daggerCritChance', 0.1)) {
        ctx.enemy.takeDamage(Math.floor(ctx.damage * (stat(ctx.player, 'daggerBackstabMult', 1.5) - 1)));
        ctx.enemy._daggerBleed = 2000;
      }
    },
    onKill: function(ctx) { ctx.player._daggerKillSpeed = 1500; }
  };

  HANDLERS.staff = {
    onBulletHit: function(ctx) {
      ctx.player._magicCharge = (ctx.player._magicCharge || 0) + 5;
      if (ctx.player._magicCharge >= 40) {
        ctx.enemy.takeDamage(stat(ctx.player, 'magicBurstDamage', 40));
        ctx.player._magicCharge = 0;
        if (ctx.ParticleSystem) ctx.ParticleSystem.nova(ctx.enemy.x, ctx.enemy.y, '#6a1b9a');
      }
    },
    onKill: function(ctx) { ctx.player._magicCharge = (ctx.player._magicCharge || 0) + 8; }
  };

  HANDLERS.bow = {
    onBulletHit: function(ctx) {
      ctx.enemy._bowPinned = 2500;
      if (ctx.ParticleSystem) ctx.ParticleSystem.trail(ctx.enemy.x, ctx.enemy.y, '#2e7d32', 2);
    },
    onKill: function(ctx) {
      var volleys = stat(ctx.player, 'bowVolleyCount', 0) + 2;
      for (var i = 0; i < volleys; i++) {
        var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'bowRangeBonus', 20) + 180, ctx.enemy);
        if (n) n.takeDamage(Math.floor(ctx.damage * 0.2));
      }
    }
  };

  HANDLERS.wolf = {
    onBulletHit: function(ctx) {
      ctx.enemy._wolfMarked = 4000;
      var pack = enemiesInRadius(ctx.game, ctx.player.x, ctx.player.y, stat(ctx.player, 'wolfPackRadius', 150));
      if (pack.length >= 2) ctx.enemy.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'wolfPackAttack', 0.1)));
    },
    onKill: function(ctx) { ctx.player._wolfHowl = 3000; spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#5d4037', 5); }
  };

  HANDLERS.bear = {
    onBulletHit: function(ctx) {
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 800);
      ctx.player._bearFortify = Math.min(5, (ctx.player._bearFortify || 0) + stat(ctx.player, 'bearFortify', 0.1));
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'bearRoarRadius', 150)).forEach(function(e) {
        e.slowTimer = 1200; e.slowAmount = 0.3;
      });
    }
  };

  HANDLERS.eagle = {
    onBulletHit: function(ctx) {
      var dist = Math.sqrt(distSq(ctx.player.x, ctx.player.y, ctx.enemy.x, ctx.enemy.y));
      if (dist > stat(ctx.player, 'eagleSwoopRange', 50)) {
        ctx.enemy.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'eagleSwoopDamage', 0.3)));
      }
      ctx.enemy._eagleMarked = 2000;
    },
    onKill: function(ctx) { if (ctx.ParticleSystem) ctx.ParticleSystem.trail(ctx.enemy.x, ctx.enemy.y, '#0d47a1', 3); }
  };

  HANDLERS.snake = {
    onBulletHit: function(ctx) {
      ctx.enemy._snakeVenom = (ctx.enemy._snakeVenom || 0) + 1;
      ctx.enemy._snakeVenomTimer = stat(ctx.player, 'snakeVenomDuration', 2500);
      ctx.enemy._snakeVenomDmg = stat(ctx.player, 'snakeVenomDamage', 5);
      if (ctx.ParticleSystem) ctx.ParticleSystem.paralyzeEffect(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 100, ctx.enemy);
      if (n && Math.random() < 0.4) { n._snakeVenom = 2; n._snakeVenomTimer = 2000; n._snakeVenomDmg = stat(ctx.player, 'snakeVenomDamage', 5); }
    }
  };

  HANDLERS.lion = {
    onBulletHit: function(ctx) { ctx.enemy._lionFeared = 1500; },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'lionAuraRadius', 180)).forEach(function(e) {
        e.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'lionAuraDamage', 0.15)));
        e._lionFeared = 1000;
      });
    },
    tick: function(player, dt) {
      var g = window.game, r = stat(player, 'lionAuraRadius', 180), dmg = stat(player, 'lionAuraDamage', 0.15) * 3;
      if (!g || !g.enemies) return;
      player._lionTick = (player._lionTick || 0) + dt;
      if (player._lionTick < 0.8) return;
      player._lionTick = 0;
      for (var i = 0; i < g.enemies.length; i++) {
        var e = g.enemies[i];
        if (e.active && distSq(player.x, player.y, e.x, e.y) <= r * r) e.takeDamage(Math.floor(dmg));
      }
    }
  };

  HANDLERS.tiger = {
    onBulletHit: function(ctx) {
      ctx.enemy._tigerBleed = 2000;
      ctx.player._tigerMomentum = (ctx.player._tigerMomentum || 0) + 1;
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, { count: 4, speed: 90, life: 300, color: '#e65100', size: 2 });
    },
    onKill: function(ctx) { ctx.player._tigerPounceReady = true; }
  };

  HANDLERS.fox = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'foxDodgeChance', 0.05)) ctx.player._foxEvade = 500;
      ctx.enemy._foxTricked = 2000;
      ctx.enemy._foxTrickDmg = stat(ctx.player, 'foxTrickDamage', 0.2);
    },
    onKill: function(ctx) { ctx.player._foxKills = (ctx.player._foxKills || 0) + 1; }
  };

  HANDLERS.crane = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'craneDanceChance', 0.08)) {
        ctx.player._craneDance = stat(ctx.player, 'craneDanceDuration', 2000);
        ctx.player.heal(2);
      }
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 500);
    },
    onKill: function(ctx) { if (ctx.ParticleSystem) ctx.ParticleSystem.healEffect(ctx.enemy.x, ctx.enemy.y); }
  };

  HANDLERS.dragon = {
    onBulletHit: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'dragonBreathRadius', 80)).forEach(function(e) {
        e.burnTimer = 2000; e.burnDamage = stat(ctx.player, 'dragonBreathDamage', 15);
      });
      if (ctx.ParticleSystem) ctx.ParticleSystem.explosion(ctx.enemy.x, ctx.enemy.y, 'small');
    },
    onKill: function(ctx) { if (ctx.ParticleSystem) ctx.ParticleSystem.bossExplosion(ctx.enemy.x, ctx.enemy.y); }
  };

  HANDLERS.phoenix = {
    onBulletHit: function(ctx) {
      ctx.enemy.burnTimer = Math.max(ctx.enemy.burnTimer || 0, 2000);
      ctx.enemy.burnDamage = stat(ctx.player, 'phoenixFireDamage', 10);
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#b71c1c', 5);
    },
    onKill: function(ctx) {
      ctx.player.heal(Math.floor(ctx.player.maxHp * stat(ctx.player, 'phoenixRebirthHp', 0.3) * 0.05));
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 90).forEach(function(e) { e.burnTimer = 1500; e.burnDamage = 8; });
    },
    tick: function(player, dt) {
      player._phoenixAuraTick = (player._phoenixAuraTick || 0) + dt;
      if (player._phoenixAuraTick < 1.2) return;
      player._phoenixAuraTick = 0;
      var g = window.game;
      if (!g || !g.enemies) return;
      for (var i = 0; i < g.enemies.length; i++) {
        var e = g.enemies[i];
        if (e.active && distSq(player.x, player.y, e.x, e.y) <= 100 * 100) {
          e.burnTimer = Math.max(e.burnTimer || 0, 400);
          e.burnDamage = stat(player, 'phoenixFireDamage', 10) * 0.3;
        }
      }
    }
  };

  HANDLERS.nightmare = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'nightmareFearChance', 0.06)) {
        ctx.enemy._nightmareFear = stat(ctx.player, 'nightmareFearDuration', 1500);
        ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 1000);
      }
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#4a148c', 4);
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 120).forEach(function(e) { e._nightmareFear = 800; });
    }
  };

  HANDLERS.fate = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'fateMarkChance', 0.15)) {
        ctx.enemy._fateMarked = 5000;
        ctx.enemy._fateBonus = stat(ctx.player, 'fateMarkBonus', 0.25);
      }
    },
    onKill: function(ctx) {
      if (ctx.enemy._fateMarked) ctx.player.heal(5);
    }
  };

  HANDLERS.destiny = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'destinyBuffChance', 0.12)) {
        ctx.player._destinyMicroBuff = stat(ctx.player, 'destinyBuffAmount', 0.2);
        ctx.player._destinyMicroTimer = 2000;
      }
    },
    onKill: function(ctx) { ctx.player._destinyKills = (ctx.player._destinyKills || 0) + 1; }
  };

  HANDLERS.karma = {
    onBulletHit: function(ctx) {
      ctx.player._karmaStacks = (ctx.player._karmaStacks || 0) + 1;
      ctx.enemy._karmaDebt = Math.floor(ctx.damage * stat(ctx.player, 'karmaReflect', 0.1));
    },
    onKill: function(ctx) {
      var heal = Math.floor((ctx.player._karmaStacks || 0) * stat(ctx.player, 'karmaStackBonus', 0.05) * ctx.player.maxHp);
      if (heal > 0) ctx.player.heal(heal);
    }
  };

  HANDLERS.order = {
    onBulletHit: function(ctx) {
      ctx.player._orderRunes = Math.min(5, (ctx.player._orderRunes || 0) + 1);
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 600);
      ctx.enemy._orderJudged = stat(ctx.player, 'orderRuneDamage', 15);
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 100).forEach(function(e) {
        e.takeDamage(stat(ctx.player, 'orderRuneDamage', 15));
        e.slowTimer = 800;
      });
    }
  };

  HANDLERS.truth = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'trueSightChance', 0.1)) {
        ctx.enemy._trueSeen = 3000;
        ctx.enemy._vulnerableTimer = 2000;
        ctx.enemy._vulnerableMult = 1 + stat(ctx.player, 'trueDamageBonus', 0.2);
      }
    },
    onKill: function(ctx) { if (ctx.ParticleSystem) ctx.ParticleSystem.nova(ctx.enemy.x, ctx.enemy.y, '#00acc1'); }
  };

  HANDLERS.lies = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'liesDeceiveChance', 0.12)) {
        ctx.enemy._liesConfused = 2000;
        ctx.enemy._liesMissChance = 0.3;
      }
      ctx.enemy.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'liesDeceiveDamage', 0.3) * 0.2));
    },
    onKill: function(ctx) {
      var decoy = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 150, ctx.enemy);
      if (decoy) decoy._liesConfused = 1500;
    }
  };

  HANDLERS.forest = {
    onBulletHit: function(ctx) {
      ctx.enemy._forestEntangle = 2000;
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 1000);
      ctx.enemy.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'forestThornDamage', 0.15)));
    },
    onKill: function(ctx) { ctx.player.heal(Math.floor(ctx.player.maxHp * stat(ctx.player, 'forestRegen', 0.005))); },
    tick: function(player, dt) {
      player._forestTick = (player._forestTick || 0) + dt;
      if (player._forestTick >= 1.5) { player._forestTick = 0; player.heal(Math.floor(player.maxHp * stat(player, 'forestRegen', 0.005))); }
    }
  };

  HANDLERS.mountain = {
    onBulletHit: function(ctx) {
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 1200);
      ctx.enemy.slowAmount = Math.max(ctx.enemy.slowAmount || 0, stat(ctx.player, 'mountainCrush', 0.1) + 0.15);
      ctx.player._mountainStance = 3000;
    },
    onKill: function(ctx) { if (ctx.game.addShake) ctx.game.addShake(6); }
  };

  HANDLERS.river = {
    onBulletHit: function(ctx) {
      ctx.player._riverFlow = Math.min(20, (ctx.player._riverFlow || 0) + 1);
      ctx.enemy._riverDrag = 1500;
    },
    onKill: function(ctx) {
      ctx.player._riverFlowBonus = 1 + (ctx.player._riverFlow || 0) * stat(ctx.player, 'riverFlowBonus', 0.03);
      ctx.player._riverFlowTimer = 3000;
    }
  };

  HANDLERS.ocean = {
    onBulletHit: function(ctx) {
      ctx.enemy._oceanDepth = (ctx.enemy._oceanDepth || 0) + 1;
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 800);
      ctx.enemy.slowAmount = Math.max(ctx.enemy.slowAmount || 0, stat(ctx.player, 'oceanCurrentSlow', 0.1));
      ctx.enemy.takeDamage(stat(ctx.player, 'oceanDepthDamage', 5));
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 130).forEach(function(e) {
        pullEnemyToward(ctx.enemy.x, ctx.enemy.y, e, 20);
      });
    }
  };

  HANDLERS.desert = {
    onBulletHit: function(ctx) {
      ctx.enemy._desertScorch = stat(ctx.player, 'desertScorchDamage', 4);
      ctx.enemy._desertScorchTimer = 2500;
      ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, 900);
      ctx.enemy.slowAmount = Math.max(ctx.enemy.slowAmount || 0, stat(ctx.player, 'desertThirstSlow', 0.1));
    },
    onKill: function(ctx) { spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#d4a574', 8); },
    tick: function(player, dt) {
      var g = window.game;
      if (!g || !g.enemies) return;
      player._desertTick = (player._desertTick || 0) + dt;
      if (player._desertTick < 1) return;
      player._desertTick = 0;
      for (var i = 0; i < g.enemies.length; i++) {
        var e = g.enemies[i];
        if (e.active && distSq(player.x, player.y, e.x, e.y) <= 140 * 140) {
          e._desertScorch = stat(player, 'desertScorchDamage', 4);
          e._desertScorchTimer = 500;
        }
      }
    }
  };

  HANDLERS.tundra = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'tundraFrostChance', 0.1)) {
        ctx.enemy.frozenTimer = Math.max(ctx.enemy.frozenTimer || 0, stat(ctx.player, 'tundraFrostDuration', 2000) * 0.5);
      } else {
        ctx.enemy.slowTimer = Math.max(ctx.enemy.slowTimer || 0, stat(ctx.player, 'tundraFrostDuration', 2000));
        ctx.enemy.slowAmount = 0.45;
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.shatterEffect(ctx.enemy.x, ctx.enemy.y);
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 100).forEach(function(e) { e.slowTimer = 1500; e.slowAmount = 0.35; });
    }
  };

  HANDLERS.phantom = {
    onBulletHit: function(ctx) {
      ctx.enemy._phantomPhase = 2000;
      if (Math.random() < stat(ctx.player, 'dodgeChance', 0.18) * 0.2) ctx.player._phantomBlink = 300;
      if (ctx.ParticleSystem) ctx.ParticleSystem.shieldBreak(ctx.enemy.x, ctx.enemy.y, '#b8d4ff');
    },
    onKill: function(ctx) { ctx.player._phantomKillDodge = 1000; }
  };

  HANDLERS.chain = {
    onBulletHit: function(ctx) {
      var p = ctx.player, dmg = Math.floor(ctx.damage * stat(p, 'chainDamage', 0.55));
      var count = Math.floor(stat(p, 'chainCount', 3));
      if (ctx.chainDamage) ctx.chainDamage(ctx.enemy, dmg, 0);
      else chainFrom(ctx, ctx.enemy, dmg, 0, count, stat(p, 'chainRange', 150) || 150, 0.65, '#ffcc00');
    },
    onKill: function(ctx) {
      var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 220, ctx.enemy);
      if (n && ctx.ParticleSystem) {
        ctx.ParticleSystem.lightning(ctx.enemy.x, ctx.enemy.y, n.x, n.y, '#ffcc00');
        n.takeDamage(Math.floor(ctx.damage * 0.35));
      }
    }
  };

  HANDLERS.decay = {
    onBulletHit: function(ctx) {
      ctx.enemy._decayStacks = (ctx.enemy._decayStacks || 0) + 1;
      ctx.enemy._decayRate = stat(ctx.player, 'decayRate', 0.04);
      ctx.enemy._decayDuration = stat(ctx.player, 'decayDuration', 4) * 1000;
      ctx.enemy._factionDebuff = ctx.enemy._factionDebuff || {};
      ctx.enemy._factionDebuff.decay = ctx.enemy._decayStacks;
      if (ctx.ParticleSystem) ctx.ParticleSystem.spawn(ctx.enemy.x, ctx.enemy.y, { count: 4, speed: 25, life: 900, color: '#7fff00', size: 2 });
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 110).forEach(function(e) {
        e._decayStacks = (e._decayStacks || 0) + 1;
        e._decayRate = stat(ctx.player, 'decayRate', 0.04);
      });
    }
  };

  HANDLERS.crystal = {
    onBulletHit: function(ctx) {
      var shards = stat(ctx.player, 'crystalShards', 4) || stat(ctx.player, 'crystalShardCount', 1);
      for (var i = 0; i < shards; i++) {
        var ang = (i / shards) * Math.PI * 2;
        var tx = ctx.enemy.x + Math.cos(ang) * 20, ty = ctx.enemy.y + Math.sin(ang) * 20;
        var n = nearestEnemy(ctx.game, tx, ty, 80, ctx.enemy);
        if (n) n.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'shatterDamage', 0.7) * 0.15));
      }
      if (ctx.ParticleSystem) ctx.ParticleSystem.shatterEffect(ctx.enemy.x, ctx.enemy.y);
      ctx.enemy._crystalEmbedded = 2000;
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 90).forEach(function(e) {
        if (Math.random() < 0.35) e.takeDamage(Math.floor(ctx.damage * stat(ctx.player, 'shatterDamage', 0.7) * 0.3));
      });
      if (ctx.ParticleSystem) ctx.ParticleSystem.shatterEffect(ctx.enemy.x, ctx.enemy.y);
    }
  };

  HANDLERS.momentum = {
    onBulletHit: function(ctx) {
      ctx.player._momentum = Math.min(stat(ctx.player, 'maxMomentum', 100), (ctx.player._momentum || 0) + stat(ctx.player, 'momentumRate', 0.06) * 20);
      ctx.enemy.takeDamage(Math.floor(ctx.damage * (ctx.player._momentum / stat(ctx.player, 'maxMomentum', 100)) * 0.3));
    },
    onKill: function(ctx) { ctx.player._momentum = Math.min(stat(ctx.player, 'maxMomentum', 100), (ctx.player._momentum || 0) + 5); },
    tick: function(player, dt) {
      if ((player._momentum || 0) > 0) {
        player._momentum = Math.max(0, player._momentum - stat(player, 'momentumRate', 0.06) * dt * 15);
      }
    }
  };

  HANDLERS.pact = {
    onBulletHit: function(ctx) {
      var maxC = stat(ctx.player, 'maxContracts', 3);
      ctx.player._activeContracts = ctx.player._activeContracts || [];
      if (ctx.player._activeContracts.length < maxC) {
        ctx.player._activeContracts.push({ enemy: ctx.enemy, until: Date.now() + stat(ctx.player, 'contractDuration', 5) * 1000 });
      }
      ctx.enemy._pactBound = stat(ctx.player, 'contractDamage', 0.25);
    },
    onKill: function(ctx) {
      ctx.player.heal(Math.floor(ctx.damage * stat(ctx.player, 'contractDamage', 0.25) * 0.5));
      ctx.player._activeContracts = (ctx.player._activeContracts || []).filter(function(c) { return c.enemy && c.enemy.active; });
    }
  };

  HANDLERS.dream = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'sleepChance', 0.12) || Math.random() < stat(ctx.player, 'dreamConfuseChance', 0.08)) {
        ctx.enemy._sleepTimer = 2500;
        ctx.enemy._sleeping = true;
      }
      if (Math.random() < stat(ctx.player, 'confuseChance', 0.1)) ctx.enemy._dreamConfused = 2000;
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, 100).forEach(function(e) {
        if (Math.random() < 0.2) { e._sleepTimer = 1500; e._sleeping = true; }
      });
      if (ctx.ParticleSystem) ctx.ParticleSystem.screenFlash('rgba(100,200,255,0.12)', 150);
    }
  };

  HANDLERS.forge = {
    onBulletHit: function(ctx) {
      var max = stat(ctx.player, 'forgeStacksMax', 5);
      ctx.player._forgeStacks = Math.min(max, (ctx.player._forgeStacks || 0) + 1);
      ctx.enemy._forgeHeated = stat(ctx.player, 'forgeDuration', 8) * 200;
    },
    onKill: function(ctx) {
      ctx.player._forgeStacks = Math.min(stat(ctx.player, 'forgeStacksMax', 5), (ctx.player._forgeStacks || 0) + 1);
      if (ctx.ParticleSystem) ctx.ParticleSystem.explosion(ctx.enemy.x, ctx.enemy.y, 'small');
    },
    tick: function(player, dt) {
      if ((player._forgeStacks || 0) > 0) {
        player._forgeAttackMult = 1 + player._forgeStacks * 0.06;
      }
    }
  };

  HANDLERS.rebound = {
    onBulletHit: function(ctx) {
      ctx.enemy._reboundMarked = 1500;
      var bullet = ctx.bullet;
      var enemy = ctx.enemy;
      var game = ctx.game;
      if (bullet && bullet.bounceCount > 0 && game && game.enemies) {
        var nearest = null, nearestDist = Infinity;
        for (var i = 0; i < game.enemies.length; i++) {
          var e = game.enemies[i];
          if (!e.active || e === enemy) continue;
          var dx = e.x - enemy.x, dy = e.y - enemy.y;
          var d = dx * dx + dy * dy;
          if (d < nearestDist) { nearestDist = d; nearest = e; }
        }
        if (nearest) {
          bullet.bounceCount--;
          bullet.x = enemy.x; bullet.y = enemy.y;
          var ang = Math.atan2(nearest.y - enemy.y, nearest.x - enemy.x);
          var spd = bullet.speed || 400;
          bullet.vx = Math.cos(ang) * spd * (bullet.bounceRetention || 0.6);
          bullet.vy = Math.sin(ang) * spd * (bullet.bounceRetention || 0.6);
          bullet._keepAliveAfterHit = true;
          if (ctx.ParticleSystem && ctx.ParticleSystem.lightning) {
            ctx.ParticleSystem.lightning(enemy.x, enemy.y, nearest.x, nearest.y, '#33ccaa');
          }
        }
      } else if (bullet && bullet.bounceCount > 0) {
        var n = nearestEnemy(ctx.game, ctx.enemy.x, ctx.enemy.y, 180, ctx.enemy);
        if (n && ctx.ParticleSystem) ctx.ParticleSystem.lightning(ctx.enemy.x, ctx.enemy.y, n.x, n.y, '#33ccaa');
      }
    },
    onKill: function(ctx) {
      if (ctx.ParticleSystem) ctx.ParticleSystem.damageNumber(ctx.enemy.x, ctx.enemy.y, '↩', '#33ccaa');
    }
  };

  HANDLERS.shroud = {
    onBulletHit: function(ctx) {
      if (Math.random() < stat(ctx.player, 'blindChance', 0.18)) {
        ctx.enemy._blindTimer = stat(ctx.player, 'blindDuration', 3) * 1000;
        ctx.enemy._blindAmount = 0.55;
      }
      ctx.enemy._shrouded = stat(ctx.player, 'shroudRadius', 150);
      spawnBurst(ctx.ParticleSystem, ctx.enemy.x, ctx.enemy.y, '#6b5b8f', 6);
    },
    onKill: function(ctx) {
      enemiesInRadius(ctx.game, ctx.enemy.x, ctx.enemy.y, stat(ctx.player, 'shroudRadius', 150)).forEach(function(e) {
        e._blindTimer = 1200; e._blindAmount = 0.4;
      });
    },
    tick: function(player, dt) {
      var g = window.game, r = stat(player, 'shroudRadius', 150);
      if (!g || !g.enemies) return;
      for (var i = 0; i < g.enemies.length; i++) {
        var e = g.enemies[i];
        if (e.active && distSq(player.x, player.y, e.x, e.y) <= r * r) {
          e._shrouded = true;
          if (Math.random() < 0.02) { e._blindTimer = 800; e._blindAmount = 0.35; }
        }
      }
    }
  };

  // Remove any stray placeholder keys
  delete HANDLERS._BATCH41_;
  delete HANDLERS._BATCH61_;
  delete HANDLERS._BATCH81_;

  var FACTION_IDS = [
    'attackSpeed','counter','crit','summon','elemental','lifesteal','shield','poison','ice','barrage',
    'gravity','void','thunder','wind','shadow','holy','blood','magnet','mirror','time','fury','luck','sonic',
    'minion','data','nature','psychic','explosive','mech','rune','star','darkGold','storm','soul','genesis','tech','chaos',
    'light','dark','lava','steam','dust','metal','glass','silk','bone','arrow','spear','hammer','whip','sword','ax',
    'dagger','staff','bow','wolf','bear','eagle','snake','lion','tiger','fox','crane','dragon','phoenix',
    'nightmare','fate','destiny','karma','order','truth','lies','forest','mountain','river','ocean','desert','tundra',
    'phantom','chain','decay','crystal','momentum','pact','dream','forge','rebound','shroud'
  ];

  function _call(method, factionId, arg) {
    var h = HANDLERS[factionId];
    if (!h || !h[method]) return;
    h[method](arg);
  }

  window.FactionEffects = {
    HANDLERS: HANDLERS,
    FACTION_IDS: FACTION_IDS,

    onBulletHit: function(factionId, ctx) {
      if (!factionId || !ctx) return;
      _call('onBulletHit', factionId, ctx);
    },

    onKill: function(factionId, ctx) {
      if (!factionId || !ctx) return;
      _call('onKill', factionId, ctx);
    },

    tick: function(player, dt) {
      if (!player || !player.active || !player.factionId) return;
      var h = HANDLERS[player.factionId];
      if (h && h.tick) h.tick(player, dt || 0);
    },

    /** Wire eventBus once core.js is loaded */
    wireEvents: function() {
      if (this._wired || !window.eventBus) return;
      this._wired = true;
      var self = this;
      window.eventBus.on('bulletHit', function(data) {
        var g = window.game, p = g && g.player;
        if (!p || !p.factionId) return;
        self.onBulletHit(p.factionId, {
          bullet: data.bullet,
          enemy: data.enemy,
          player: p,
          damage: data.damage,
          game: g,
          chainDamage: g._chainDamage || null,
          ParticleSystem: window.ParticleSystem,
          isCrit: data.isCrit
        });
      });
      window.eventBus.on('enemyKilled', function(data) {
        var g = window.game, p = g && g.player;
        if (!p || !p.factionId) return;
        self.onKill(p.factionId, {
          enemy: data.enemy,
          player: p,
          game: g,
          damage: data.damage,
          skillManager: p.skillManager || (window.game && window.game.skillManager),
          ParticleSystem: window.ParticleSystem
        });
      });
    }
  };

  (function _deferWire() {
    if (window.FactionEffects._wired) return;
    if (window.eventBus) window.FactionEffects.wireEvents();
    else setTimeout(_deferWire, 50);
  })();

})();
