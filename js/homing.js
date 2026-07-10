/**
 * Shared homing target manager — one global search per interval, all homing bullets reuse result.
 * Uses collision grid when available for O(1) nearby queries.
 */
class HomingTargetManager {
  constructor() {
    this._timer = 0;
    this._interval = 10; // frames between searches
    this._target = null;
    this._searchX = 0;
    this._searchY = 0;
  }

  /**
   * Call once per frame from game loop (before bullet updates).
   * @param {number} dt - delta seconds
   * @param {number} px - player x
   * @param {number} py - player y
   */
  tick(dt, px, py) {
    this._timer++;
    if (this._timer < this._interval) return;
    this._timer = 0;
    this._searchX = px;
    this._searchY = py;
    this._target = this._findNearest(px, py);
  }

  getTarget() {
    if (this._target && this._target.active) return this._target;
    return null;
  }

  /**
   * Find nearest enemy to a point (for per-bullet offset searches).
   */
  findNearestTo(x, y, maxRange) {
    var g = window.game;
    if (!g || !g.enemies) return null;
    maxRange = maxRange || 500;
    var maxR2 = maxRange * maxRange;
    var best = null;
    var bestD = maxR2;

    if (g._buildCollisionGrid && g.gridCols) {
      var col = Math.floor(x / g.gridCellW);
      var row = Math.floor(y / g.gridCellH);
      var nearby = g._getNearbyEntities ? g._getNearbyEntities(col, row) : [];
      for (var i = 0; i < nearby.length; i++) {
        var e = nearby[i];
        if (!e.active || e.category !== 'enemy') continue;
        var dx = e.x - x, dy = e.y - y;
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = e; }
      }
      if (best) return best;
    }

    var limit = Math.min(g.enemies.length, 30);
    for (var j = 0; j < limit; j++) {
      var en = g.enemies[j];
      if (!en.active) continue;
      var dx2 = en.x - x, dy2 = en.y - y;
      var d2 = dx2 * dx2 + dy2 * dy2;
      if (d2 < bestD) { bestD = d2; best = en; }
    }
    return best;
  }

  _findNearest(x, y) {
    return this.findNearestTo(x, y, 600);
  }

  reset() {
    this._timer = 0;
    this._target = null;
  }
}

window.HomingTargetManager = HomingTargetManager;
window.homingTargets = new HomingTargetManager();
