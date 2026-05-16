/**
 * STG Game Core Engine
 * Game loop, object pool, canvas management, scene system, entity management.
 * 
 * Global: window.game = Game instance
 * Other modules access engine via window.game
 */

class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = GAME_CONFIG.BALANCE.CANVAS_WIDTH;
    this.height = GAME_CONFIG.BALANCE.CANVAS_HEIGHT;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Game state
    this.scene = GAME_CONFIG.SCENES.MENU;
    this.previousScene = null;
    this.isPaused = false;
    this.isRunning = false;
    this.rafId = null;
    this.lastTime = 0;
    this.gameTime = 0;
    this.difficulty = 0;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.kills = 0;

    // Input state
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.isPointerDown = false;
    this.pointerActive = false;

    // Entity pools
    this.entities = [];
    this.pendingAdd = [];
    this.pendingRemove = [];

    // Entity categories for fast iteration
    this.players = [];
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.items = [];
    this.particles = [];

    // Object pools for bullets
    this.bulletPool = [];
    this.particlePool = [];
    this.itemPool = [];

    // Global time scale (for slow-mo effects)
    this.timeScale = 1.0;

    // Screen shake
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;

    // Player reference (single player game)
    this.player = null;

    // Callbacks for UI
    this.onSceneChange = null;

    // Bind methods
    this._loop = this._loop.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas element not found:', canvasId);
      return;
    }
    this.ctx = this.canvas.getContext('2d');

    // Event listeners
    window.addEventListener('resize', this._onResize);
    this.canvas.addEventListener('mousemove', this._onPointerMove);
    this.canvas.addEventListener('mousedown', this._onPointerDown);
    this.canvas.addEventListener('mouseup', this._onPointerUp);
    this.canvas.addEventListener('mouseleave', this._onPointerUp);
    this.canvas.addEventListener('touchmove', this._onPointerMove, { passive: false });
    this.canvas.addEventListener('touchstart', this._onPointerDown, { passive: false });
    this.canvas.addEventListener('touchend', this._onPointerUp);
    this.canvas.addEventListener('touchcancel', this._onPointerUp);
    window.addEventListener('keydown', this._onKeyDown);

    // Prevent context menu on canvas
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    this._onResize();
    console.log('STG Engine initialized');
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this._loop);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  togglePause() {
    if (this.isPaused) this.resume();
    else this.pause();
  }

  setScene(scene) {
    this.previousScene = this.scene;
    this.scene = scene;
    if (this.onSceneChange) this.onSceneChange(scene, this.previousScene);
  }

  // ===== ENTITY MANAGEMENT =====
  addEntity(entity) {
    // Cap total entities to prevent memory explosion
    if (this.entities.length >= 800) {
      // Drop oldest inactive entity to make room (swap-and-pop)
      for (let i = 0; i < this.entities.length; i++) {
        if (!this.entities[i].active) {
          this.entities[i] = this.entities[this.entities.length - 1];
          this.entities.pop();
          break;
        }
      }
      if (this.entities.length >= 800) return; // All active, refuse new
    }
    this.pendingAdd.push(entity);
  }

  removeEntity(entity) {
    this.pendingRemove.push(entity);
  }

  clearAllEntities() {
    this.players.length = 0;
    this.enemies.length = 0;
    this.playerBullets.length = 0;
    this.enemyBullets.length = 0;
    this.items.length = 0;
    this.particles.length = 0;
    this.entities.length = 0;
    this.player = null;
  }

  _categorizeEntity(entity) {
    switch (entity.category) {
      case 'player': this.players.push(entity); break;
      case 'enemy': this.enemies.push(entity); break;
      case 'playerBullet': this.playerBullets.push(entity); break;
      case 'enemyBullet': this.enemyBullets.push(entity); break;
      case 'item': this.items.push(entity); break;
      case 'particle': this.particles.push(entity); break;
    }
  }

  _uncategorizeEntity(entity) {
    const lists = {
      player: this.players,
      enemy: this.enemies,
      playerBullet: this.playerBullets,
      enemyBullet: this.enemyBullets,
      item: this.items,
      particle: this.particles,
    };
    const list = lists[entity.category];
    if (list) {
      const idx = list.indexOf(entity);
      if (idx >= 0) {
        list[idx] = list[list.length - 1];
        list.pop();
      }
    }
  }

  // Periodically clean inactive entities from category arrays to prevent memory leaks
  _purgeCategoryArrays() {
    const purgeList = (list) => {
      let write = 0;
      for (let read = 0; read < list.length; read++) {
        if (list[read].active) {
          list[write] = list[read];
          write++;
        }
      }
      list.length = write;
    };
    purgeList(this.players);
    purgeList(this.enemies);
    purgeList(this.playerBullets);
    purgeList(this.enemyBullets);
    purgeList(this.items);
    purgeList(this.particles);
  }

  // ===== OBJECT POOL =====
  getFromPool(pool, factory) {
    if (pool.length > 0) {
      const obj = pool.pop();
      if (factory) factory(obj);
      return obj;
    }
    return factory ? factory(null) : null;
  }

  returnToPool(pool, obj, maxSize) {
    if (!maxSize || pool.length < maxSize) {
      pool.push(obj);
    }
  }

  // ===== SCREEN SHAKE =====
  addShake(intensity) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  // ===== COORDINATE CONVERSION =====
  canvasToGame(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / this.scale,
      y: (clientY - rect.top) / this.scale,
    };
  }

  // ===== MAIN GAME LOOP =====
  _loop(timestamp) {
    if (!this.isRunning) return;

    const rawDt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Cap delta time to prevent spiral of death
    const dt = Math.min(rawDt, 50) * 0.001 * this.timeScale;

    if (!this.isPaused) {
      this.gameTime += rawDt;
      this._update(dt);
    }

    this._draw();
    this.rafId = requestAnimationFrame(this._loop);
  }

  _update(dt) {
    // Process pending adds/removes
    if (this.pendingAdd.length > 0) {
      for (const entity of this.pendingAdd) {
        this.entities.push(entity);
        this._categorizeEntity(entity);
      }
      this.pendingAdd.length = 0;
    }

    if (this.pendingRemove.length > 0) {
      for (const entity of this.pendingRemove) {
        const idx = this.entities.indexOf(entity);
        if (idx >= 0) {
          this.entities[idx] = this.entities[this.entities.length - 1];
          this.entities.pop();
        }
        this._uncategorizeEntity(entity);
      }
      this.pendingRemove.length = 0;
    }

    // Periodically purge inactive entities from category arrays (every 60 frames ~1 second)
    if (this._purgeCounter === undefined) this._purgeCounter = 0;
    this._purgeCounter++;
    if (this._purgeCounter >= 60) {
      this._purgeCounter = 0;
      this._purgeCategoryArrays();
    }

    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt * 1000;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboTimer = 0;
      }
    }

    // Update screen shake
    if (this.shakeIntensity > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= GAME_CONFIG.BALANCE.SCREEN_SHAKE_DECAY;
      if (this.shakeIntensity < 0.5) {
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }

    // Update all active entities (backward iteration for safe removal)
    // Also purge inactive entities from the array to prevent memory leaks
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (!entity.active) {
        // Swap-and-pop: O(1) removal instead of splice O(N)
        this.entities[i] = this.entities[this.entities.length - 1];
        this.entities.pop();
        continue;
      }
      if (entity.update) {
        entity.update(dt);
      }
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Apply screen shake
    if (this.shakeIntensity > 0) {
      ctx.translate(this.shakeX, this.shakeY);
    }

    // Draw entities by layer
    // Layer 0: background effects (particles behind)
    // Layer 1: items
    // Layer 2: enemy bullets
    // Layer 3: enemies
    // Layer 4: player bullets
    // Layer 5: player
    // Layer 6: foreground particles

    const drawLayer = (list, layer) => {
      for (const entity of list) {
        if (entity.active && entity.draw && (entity.drawLayer || 0) === layer) {
          entity.draw(ctx);
        }
      }
    };

    for (let layer = 0; layer <= 6; layer++) {
      drawLayer(this.particles, layer);
      drawLayer(this.items, layer);
      drawLayer(this.enemyBullets, layer);
      drawLayer(this.enemies, layer);
      drawLayer(this.playerBullets, layer);
      drawLayer(this.players, layer);
    }

    ctx.restore();
  }

  // ===== EVENT HANDLERS =====
  _onResize() {
    const container = this.canvas.parentElement || document.body;
    const maxW = container.clientWidth || window.innerWidth;
    const maxH = container.clientHeight || window.innerHeight;

    const aspect = this.width / this.height;
    let w, h;
    if (maxW / maxH > aspect) {
      h = maxH;
      w = h * aspect;
    } else {
      w = maxW;
      h = w / aspect;
    }

    this.scale = w / this.width;
    this.offsetX = (maxW - w) / 2;
    this.offsetY = (maxH - h) / 2;

    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width = this.width * (window.devicePixelRatio || 1);
    this.canvas.height = this.height * (window.devicePixelRatio || 1);
    this.ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  }

  _onPointerMove(e) {
    e.preventDefault();
    this.pointerActive = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = this.canvasToGame(clientX, clientY);
    this.mouseX = pos.x;
    this.mouseY = pos.y;
  }

  _onPointerDown(e) {
    e.preventDefault();
    this.isPointerDown = true;
    this.pointerActive = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = this.canvasToGame(clientX, clientY);
    this.mouseX = pos.x;
    this.mouseY = pos.y;
  }

  _onPointerUp(e) {
    e.preventDefault();
    this.isPointerDown = false;
  }

  _onKeyDown(e) {
    switch (e.key) {
      case 'p':
      case 'P':
        if (this.scene === GAME_CONFIG.SCENES.GAMEPLAY) {
          this.togglePause();
        }
        break;
      case 'Escape':
        if (this.scene === GAME_CONFIG.SCENES.GAMEPLAY) {
          this.togglePause();
        }
        break;
      case 'f':
      case 'F':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;
    }
  }

  // ===== COLLISION DETECTION =====
  checkCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = dx * dx + dy * dy;
    const radSum = (a.hitRadius || 5) + (b.hitRadius || 5);
    return dist < radSum * radSum;
  }

  checkCircleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (radius * radius);
  }
}

// Singleton instance
window.game = new Game();
