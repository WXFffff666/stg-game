/**
 * STG Game Core Engine
 * Game loop, object pool, canvas management, scene system, entity management.
 * 
 * Global: window.game = Game instance
 * Other modules access engine via window.game
 */

// ============================================================
//  OBJECT POOL
// ============================================================

/**
 * Pre-allocated reusable object pool.
 * Expands dynamically on demand, never shrinks (no GC pressure).
 * Compatible with game.getFromPool / game.returnToPool via array-like interface.
 */
class ObjectPool {
  /**
   * @param {Function} factory - Creates a new object: factory()
   * @param {number}   initialSize - Number of objects to pre-allocate
   */
  constructor(factory, initialSize) {
    this._items = [];
    this._factory = factory;
    for (var i = 0; i < (initialSize || 0); i++) {
      this._items.push(factory());
    }
  }

  /** Number of available (inactive) objects in pool. */
  get length() { return this._items.length; }

  /**
   * Remove and return an object from the pool.
   * If pool is empty, creates a new one via factory (dynamic expansion).
   */
  pop() {
    if (this._items.length > 0) {
      return this._items.pop();
    }
    return this._factory();
  }

  /**
   * Return an object to the pool.
   * Always accepted — pool never shrinks.
   */
  push(obj) {
    this._items.push(obj);
  }
}

// Expose globally so other modules can use it
window.ObjectPool = ObjectPool;

// ============================================================
//  EVENT EMITTER
// ============================================================

/**
 * 简单事件发射器，为流派效果系统提供事件驱动架构。
 * 支持 on/off/emit 基本事件订阅与触发。
 */
class EventEmitter {
  constructor() {
    this._listeners = {};
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }

  /**
   * 取消订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 要移除的回调函数
   */
  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(function(cb) { return cb !== callback; });
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (!this._listeners[event]) return;
    for (var i = 0; i < this._listeners[event].length; i++) {
      this._listeners[event][i](data);
    }
  }
}

// Expose globally
window.EventEmitter = EventEmitter;

class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = GAME_CONFIG.BALANCE.CANVAS_WIDTH;
    this.height = GAME_CONFIG.BALANCE.CANVAS_HEIGHT;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Canvas design resolution (16:9 letterbox)
    this.canvasW = 1280;
    this.canvasH = 720;
    this.gameScale = 1;
    this.gameOffsetX = 0;
    this.gameOffsetY = 0;

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

    // 设备检测：宽度<768px判定为手机
    this.isMobile = window.innerWidth < 768;

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

    // Object pools (pre-allocated in _initPools after all classes load)
    this.bulletPool = [];
    this.particlePool = [];
    this.itemPool = [];
    this.enemyPool = [];
    this.damageNumberPool = [];

    // Entity limits per category (从配置读取)
    this.ENTITY_LIMITS = {
      enemies: GAME_CONFIG.BALANCE.POOL_ENEMIES,
      bullets: GAME_CONFIG.BALANCE.POOL_BULLETS,
      particles: GAME_CONFIG.BALANCE.POOL_PARTICLES,
      items: 30,
    };

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
    this._initPools();
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
    // Per-category entity limits
    var cat = entity.category;
    var limits = this.ENTITY_LIMITS;
    if (cat === 'enemy' && this.enemies.length >= limits.enemies) return;
    if ((cat === 'playerBullet' || cat === 'enemyBullet') &&
        (this.playerBullets.length + this.enemyBullets.length) >= limits.bullets) return;
    if (cat === 'particle' && this.particles.length >= limits.particles) return;
    if (cat === 'item' && this.items.length >= limits.items) return;

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

  // ===== POOL PRE-ALLOCATION =====
  /**
   * Pre-allocate all object pools. Called once after all entity classes are loaded.
   * Pools expand dynamically if exhausted, but never shrink (no GC).
   */
  _initPools() {
    if (this._poolsInitialized) return;
    this._poolsInitialized = true;

    // 对象池大小从配置读取
    var poolBullets = GAME_CONFIG.BALANCE.POOL_BULLETS;
    var poolParticles = GAME_CONFIG.BALANCE.POOL_PARTICLES;
    var poolEnemies = GAME_CONFIG.BALANCE.POOL_ENEMIES;

    // Bullet pool: 从配置读取
    this.bulletPool = new ObjectPool(function() {
      if (typeof Bullet !== 'undefined') {
        var b = new Bullet();
        b.active = false;
        return b;
      }
      return { active: false };
    }, poolBullets);

    // Particle pool: 从配置读取
    this.particlePool = new ObjectPool(function() {
      if (typeof Particle !== 'undefined') return new Particle();
      return { active: false };
    }, poolParticles);

    // Enemy pool: 从配置读取
    this.enemyPool = new ObjectPool(function() {
      if (typeof Enemy !== 'undefined' && typeof GAME_CONFIG !== 'undefined') {
        var template = GAME_CONFIG.ENEMIES.small;
        var e = new Enemy({ x: 0, y: -200 }, template, 0);
        e.active = false;
        return e;
      }
      return { active: false, category: 'enemy' };
    }, poolEnemies);

    // Item pool: 30 pre-allocated
    this.itemPool = new ObjectPool(function() {
      if (typeof Item !== 'undefined') {
        var item = new Item(0, -200, { size: 12, color: '#ffffff', shape: 'circle', type: 'buff' });
        item.active = false;
        return item;
      }
      return { active: false, category: 'item' };
    }, 30);

    // Damage number pool: 50 pre-allocated
    this.damageNumberPool = new ObjectPool(function() {
      if (typeof _createDamageNumber !== 'undefined') return _createDamageNumber();
      return { active: false };
    }, 50);

    console.log('Object pools initialized: bullets=' + this.bulletPool.length +
      ', particles=' + this.particlePool.length +
      ', enemies=' + this.enemyPool.length +
      ', items=' + this.itemPool.length +
      ', damageNumbers=' + this.damageNumberPool.length);

    // 初始化空间网格
    this._initSpatialGrid();

    // 初始化低性能检测
    this._initLowPerfDetection();
  }

  // ===== 空间网格碰撞检测 (4x4网格优化) =====
  _initSpatialGrid() {
    var cols = GAME_CONFIG.BALANCE.COLLISION_GRID_COLS;
    var rows = GAME_CONFIG.BALANCE.COLLISION_GRID_ROWS;
    this.gridCols = cols;
    this.gridRows = rows;
    this.gridCellW = this.width / cols;
    this.gridCellH = this.height / rows;
    this.collisionGrid = [];
    for (var i = 0; i < cols * rows; i++) {
      this.collisionGrid.push([]);
    }
  }

  /**
   * 将实体分配到空间网格
   * @param {Array} entities - 实体数组
   */
  _buildCollisionGrid(entities) {
    // 清空网格
    for (var i = 0; i < this.collisionGrid.length; i++) {
      this.collisionGrid[i].length = 0;
    }
    // 将活跃实体分配到对应网格
    for (var j = 0; j < entities.length; j++) {
      var entity = entities[j];
      if (!entity.active) continue;
      var col = Math.floor(entity.x / this.gridCellW);
      var row = Math.floor(entity.y / this.gridCellH);
      // 边界检查
      if (col < 0) col = 0;
      if (col >= this.gridCols) col = this.gridCols - 1;
      if (row < 0) row = 0;
      if (row >= this.gridRows) row = this.gridRows - 1;
      var gridIndex = row * this.gridCols + col;
      this.collisionGrid[gridIndex].push(entity);
    }
  }

  /**
   * 获取指定网格及相邻网格中的实体
   * @param {number} col - 网格列
   * @param {number} row - 网格行
   * @returns {Array} 相邻网格中的实体
   */
  _getNearbyEntities(col, row) {
    var result = [];
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        var r = row + dr;
        var c = col + dc;
        if (r < 0 || r >= this.gridRows || c < 0 || c >= this.gridCols) continue;
        var gridIndex = r * this.gridCols + c;
        var cell = this.collisionGrid[gridIndex];
        for (var i = 0; i < cell.length; i++) {
          result.push(cell[i]);
        }
      }
    }
    return result;
  }

  /**
   * 使用空间网格优化的碰撞检测
   * @param {Object} entity - 要检测碰撞的实体
   * @param {Array} targets - 目标实体数组
   * @returns {Array} 碰撞的目标实体列表
   */
  checkCollisionWithGrid(entity, targets) {
    if (!entity.active) return [];
    var col = Math.floor(entity.x / this.gridCellW);
    var row = Math.floor(entity.y / this.gridCellH);
    if (col < 0) col = 0;
    if (col >= this.gridCols) col = this.gridCols - 1;
    if (row < 0) row = 0;
    if (row >= this.gridRows) row = this.gridRows - 1;
    var nearby = this._getNearbyEntities(col, row);
    var hits = [];
    for (var i = 0; i < nearby.length; i++) {
      var target = nearby[i];
      if (!target.active) continue;
      if (this.checkCollision(entity, target)) {
        hits.push(target);
      }
    }
    return hits;
  }

  // ===== 低性能模式检测 =====
  _initLowPerfDetection() {
    this.lowPerfMode = false;
    this._fpsBuffer = [];
    this._fpsBufferTime = 0;
    this._lowFpsStartTime = 0;
    this._lowFpsDetected = false;
  }

  /**
   * 检测并更新低性能模式状态
   * @param {number} rawDt - 原始帧间隔(毫秒)
   */
  _checkLowPerformance(rawDt) {
    var now = this.gameTime;
    var fps = rawDt > 0 ? 1000 / rawDt : 60;

    // 收集FPS样本
    this._fpsBuffer.push(fps);
    this._fpsBufferTime += rawDt;

    // 每隔一段时间检查一次
    var checkInterval = GAME_CONFIG.BALANCE.LOW_FPS_CHECK_INTERVAL;
    if (this._fpsBufferTime < checkInterval) return;
    this._fpsBufferTime = 0;

    // 计算平均FPS
    var sum = 0;
    for (var i = 0; i < this._fpsBuffer.length; i++) {
      sum += this._fpsBuffer[i];
    }
    var avgFps = sum / this._fpsBuffer.length;
    this._fpsBuffer.length = 0;

    var threshold = GAME_CONFIG.BALANCE.LOW_FPS_THRESHOLD;
    var duration = GAME_CONFIG.BALANCE.LOW_FPS_DURATION;

    if (avgFps < threshold) {
      if (!this._lowFpsDetected) {
        this._lowFpsDetected = true;
        this._lowFpsStartTime = now;
      } else if (now - this._lowFpsStartTime >= duration) {
        // 连续低帧率超过阈值，启用低性能模式
        if (!this.lowPerfMode) {
          this._enableLowPerfMode();
        }
      }
    } else {
      // 帧率恢复正常，重置检测
      this._lowFpsDetected = false;
      this._lowFpsStartTime = 0;
    }
  }

  /**
   * 启用低性能模式
   */
  _enableLowPerfMode() {
    this.lowPerfMode = true;
    console.log('低性能模式已启用：粒子减少50%，敌人上限25，子弹上限120');

    // 更新实体限制
    this.ENTITY_LIMITS.enemies = GAME_CONFIG.BALANCE.LOW_PERF_MAX_ENEMIES;
    this.ENTITY_LIMITS.bullets = GAME_CONFIG.BALANCE.LOW_PERF_MAX_BULLETS;
    this.ENTITY_LIMITS.particles = Math.floor(this.ENTITY_LIMITS.particles * GAME_CONFIG.BALANCE.LOW_PERF_PARTICLE_REDUCTION);

    // 触发事件通知其他系统
    if (window.eventBus) {
      window.eventBus.emit('lowPerfMode', { enabled: true });
    }
  }

  /**
   * 禁用低性能模式（可选，供调试用）
   */
  disableLowPerfMode() {
    if (!this.lowPerfMode) return;
    this.lowPerfMode = false;
    console.log('低性能模式已禁用');

    // 恢复实体限制
    this.ENTITY_LIMITS.enemies = GAME_CONFIG.BALANCE.POOL_ENEMIES;
    this.ENTITY_LIMITS.bullets = GAME_CONFIG.BALANCE.POOL_BULLETS;
    this.ENTITY_LIMITS.particles = GAME_CONFIG.BALANCE.POOL_PARTICLES;

    if (window.eventBus) {
      window.eventBus.emit('lowPerfMode', { enabled: false });
    }
  }

  // ===== SCREEN SHAKE =====
  addShake(intensity) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  // ===== COORDINATE CONVERSION =====
  canvasToGame(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    // Client → canvas coordinates
    const canvasX = (clientX - rect.left) / this.scale;
    const canvasY = (clientY - rect.top) / this.scale;
    // Canvas → game coordinates
    return {
      x: (canvasX - this.gameOffsetX) / this.gameScale,
      y: (canvasY - this.gameOffsetY) / this.gameScale,
    };
  }

  // ===== MAIN GAME LOOP =====
  _loop(timestamp) {
    if (!this.isRunning) return;

    const rawDt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Cap delta time to prevent spiral of death
    const dt = Math.min(rawDt, 50) * 0.001 * this.timeScale;

    // 低性能检测（仅在游戏运行时检测）
    if (!this.isPaused && this.scene === GAME_CONFIG.SCENES.GAMEPLAY) {
      this._checkLowPerformance(rawDt);
    }

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

    // 构建空间网格（用于碰撞检测优化）
    this._buildCollisionGrid(this.enemies);
    // 也将子弹加入网格（用于子弹vs敌人碰撞）
    for (var bi = 0; bi < this.playerBullets.length; bi++) {
      var bullet = this.playerBullets[bi];
      if (!bullet.active) continue;
      var col = Math.floor(bullet.x / this.gridCellW);
      var row = Math.floor(bullet.y / this.gridCellH);
      if (col < 0) col = 0;
      if (col >= this.gridCols) col = this.gridCols - 1;
      if (row < 0) row = 0;
      if (row >= this.gridRows) row = this.gridRows - 1;
      this.collisionGrid[row * this.gridCols + col].push(bullet);
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
    const dpr = window.devicePixelRatio || 1;

    // Clear full canvas (reset to DPR-only transform, then restore)
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvasW, this.canvasH);
    ctx.restore();

    // Persistent game transform is now active
    ctx.save();

    // Apply screen shake (in game coordinates)
    if (this.shakeIntensity > 0) {
      ctx.translate(this.shakeX, this.shakeY);
    }

    // Fill game area background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw entities by layer
    // Layer 0: background effects (particles behind)
    // Layer 1: items
    // Layer 2: enemy bullets
    // Layer 3: enemies
    // Layer 4: player bullets
    // Layer 5: player
    // Layer 6: foreground particles
    // Layer 7: damage numbers

    const drawLayer = (list, layer) => {
      for (const entity of list) {
        if (entity.active && entity.draw && (entity.drawLayer || 0) === layer) {
          entity.draw(ctx);
        }
      }
    };

    for (let layer = 0; layer <= 7; layer++) {
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
    // 更新设备检测
    this.isMobile = window.innerWidth < 768;

    // 手机端使用竖屏canvas尺寸
    if (this.isMobile) {
      this.canvasW = 720;
      this.canvasH = 1280;
    } else {
      this.canvasW = 1280;
      this.canvasH = 720;
    }

    const container = this.canvas.parentElement || document.body;
    const vpW = container.clientWidth || window.innerWidth;
    const vpH = container.clientHeight || window.innerHeight;

    // Step 1: Enforce 16:9 letterbox envelope on viewport
    const targetAspect = this.canvasW / this.canvasH; // 16/9
    let envW, envH;
    if (vpW / vpH > targetAspect) {
      // Wider than 16:9 → black bars on sides
      envH = vpH;
      envW = envH * targetAspect;
    } else {
      // Taller than 16:9 → black bars on top/bottom
      envW = vpW;
      envH = envW / targetAspect;
    }

    // Step 2: Scale for CSS display (canvas pixels → CSS pixels)
    this.scale = envW / this.canvasW;

    // Step 3: Game-to-canvas coordinate mapping
    this.gameScale = Math.min(this.canvasW / this.width, this.canvasH / this.height);
    this.gameOffsetX = (this.canvasW - this.width * this.gameScale) / 2;
    this.gameOffsetY = (this.canvasH - this.height * this.gameScale) / 2;

    // Step 4: Viewport centering offset
    this.offsetX = (vpW - envW) / 2;
    this.offsetY = (vpH - envH) / 2;

    // Step 5: Apply canvas element sizing and persistent transform
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = envW + 'px';
    this.canvas.style.height = envH + 'px';
    this.canvas.width = this.canvasW * dpr;
    this.canvas.height = this.canvasH * dpr;

    // Persistent transform: game coordinates → canvas device pixels
    // All draw calls using game coords (0,0)-(600,900) map correctly
    this.ctx.setTransform(
      dpr * this.gameScale, 0, 0,
      dpr * this.gameScale,
      dpr * this.gameOffsetX, dpr * this.gameOffsetY
    );
  }

  _onPointerMove(e) {
    e.preventDefault();
    this.pointerActive = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = this.canvasToGame(clientX, clientY);
    this.mouseX = pos.x;
    this.mouseY = pos.y;
    // 触摸跟随：更新玩家触摸坐标
    if (e.touches && this.player) {
      this.player._touchX = pos.x;
      this.player._touchY = pos.y;
    }
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
    // 触摸跟随：激活触摸模式
    if (e.touches && this.player) {
      this.player._touchActive = true;
      this.player._touchX = pos.x;
      this.player._touchY = pos.y;
    }
  }

  _onPointerUp(e) {
    e.preventDefault();
    this.isPointerDown = false;
    // 触摸跟随：停用触摸模式
    if (e.changedTouches && this.player) {
      this.player._touchActive = false;
    }
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
      case 'F11':
        e.preventDefault();
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

// 全局事件总线，供流派效果系统使用
window.eventBus = new EventEmitter();
