/**
 * STG Game - Player Entity
 * Handles input-driven movement, HP/shield, invincibility,
 * faction base stats, and skill stat modifiers.
 * Enhanced with 20 unique ship designs, shield visual, engine trails.
 *
 * Category: 'player', DrawLayer: 5
 * Exported as window.Player
 */

// ================================================================
//  SHIP DESIGN REGISTRY
//  20 unique ship designs drawn with Canvas paths, one per faction
//  Each function: drawShip_<factionId>(ctx, size, color, time)
//  Called with ctx already translated to player.x, player.y
// ================================================================
var ShipDesigns = {
  // 1. attackSpeed: Sharp arrow with wing streaks
  attackSpeed: function(ctx, s, color, time) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.2);
    ctx.lineTo(-s * 0.4, -s * 0.3);
    ctx.lineTo(-s * 1.1, s * 0.7);
    ctx.lineTo(-s * 0.35, s * 0.3);
    ctx.lineTo(0, s * 0.9);
    ctx.lineTo(s * 0.35, s * 0.3);
    ctx.lineTo(s * 1.1, s * 0.7);
    ctx.lineTo(s * 0.4, -s * 0.3);
    ctx.closePath();
    ctx.fill();
    // Wing streaks
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, s * 0.25);
    ctx.lineTo(-s * 1.1, s * 0.65);
    ctx.moveTo(s * 0.35, s * 0.25);
    ctx.lineTo(s * 1.1, s * 0.65);
    ctx.stroke();
    // Nose glow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -s * 0.6, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
  },

  // 2. counter: Wide shield-shaped hull
  counter: function(ctx, s, color, time) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.lineTo(-s * 1.2, -s * 0.1);
    ctx.lineTo(-s * 1.3, s * 0.5);
    ctx.lineTo(-s * 0.5, s * 1.0);
    ctx.lineTo(0, s * 0.85);
    ctx.lineTo(s * 0.5, s * 1.0);
    ctx.lineTo(s * 1.3, s * 0.5);
    ctx.lineTo(s * 1.2, -s * 0.1);
    ctx.closePath();
    ctx.fill();
    // Shield plate pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, s * 0.2, s * 0.7, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    // Center emblem
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  },

  // 3. crit: Angular aggressive shape with spikes
  crit: function(ctx, s, color, time) {
    ctx.fillStyle = color;
    ctx.beginPath();
    // Spiky aggressive hull
    ctx.moveTo(0, -s * 1.3);
    ctx.lineTo(-s * 0.2, -s * 0.5);
    ctx.lineTo(-s * 0.8, -s * 0.6);
    ctx.lineTo(-s * 0.3, -s * 0.1);
    ctx.lineTo(-s * 1.0, s * 0.3);
    ctx.lineTo(-s * 0.2, s * 0.1);
    ctx.lineTo(-s * 0.4, s * 0.9);
    ctx.lineTo(0, s * 0.4);
    ctx.lineTo(s * 0.4, s * 0.9);
    ctx.lineTo(s * 0.2, s * 0.1);
    ctx.lineTo(s * 1.0, s * 0.3);
    ctx.lineTo(s * 0.3, -s * 0.1);
    ctx.lineTo(s * 0.8, -s * 0.6);
    ctx.lineTo(s * 0.2, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    // Critical glow center
    var pulse = 0.8 + Math.sin(time * 8) * 0.2;
    ctx.fillStyle = 'rgba(255,255,255,' + pulse + ')';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(-s * 0.15, -s * 0.1);
    ctx.lineTo(s * 0.15, -s * 0.1);
    ctx.closePath();
    ctx.fill();
  },

  // 4. summon: Floating ring with orbiting dots
  summon: function(ctx, s, color, time) {
    // Central diamond
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(-s * 0.35, 0);
    ctx.lineTo(0, s * 0.6);
    ctx.lineTo(s * 0.35, 0);
    ctx.closePath();
    ctx.fill();
    // Orbiting ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = -time * 40;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Orbiting dots
    for (var i = 0; i < 3; i++) {
      var ang = time * 3 + (i / 3) * Math.PI * 2;
      var dx = Math.cos(ang) * s * 0.8;
      var dy = Math.sin(ang) * s * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dx, dy, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      // Dot glow
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dx, dy, s * 0.2, 0, Math.PI * 2);
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  // 5. elemental: Flame-shaped hull with flicker effect
  elemental: function(ctx, s, color, time) {
    // Flickering flame hull
    var flicker = 0.85 + Math.sin(time * 15 + 0.5) * 0.08 + Math.sin(time * 23) * 0.07;
    ctx.fillStyle = color;
    ctx.beginPath();
    // Flame-like wavy shape
    ctx.moveTo(0, -s * 1.1);
    ctx.quadraticCurveTo(-s * 0.6, -s * 0.5, -s * 0.5, s * 0.1);
    ctx.quadraticCurveTo(-s * 0.8, s * 0.4, -s * 0.3, s * 0.8);
    ctx.quadraticCurveTo(-s * 0.1, s * 0.5, 0, s * 0.9);
    ctx.quadraticCurveTo(s * 0.1, s * 0.5, s * 0.3, s * 0.8);
    ctx.quadraticCurveTo(s * 0.8, s * 0.4, s * 0.5, s * 0.1);
    ctx.quadraticCurveTo(s * 0.6, -s * 0.5, 0, -s * 1.1);
    ctx.fill();
    // Inner hot core
    ctx.fillStyle = 'rgba(255,200,50,' + (0.5 * flicker) + ')';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.1, -s * 0.15, s * 0.3);
    ctx.quadraticCurveTo(0, s * 0.15, s * 0.15, s * 0.3);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.1, 0, -s * 0.6);
    ctx.fill();
  },

  // 6. lifesteal: Curved organic shape with pulse
  lifesteal: function(ctx, s, color, time) {
    var pulse = 1 + Math.sin(time * 4) * 0.15;
    // Organic curved hull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.0 * pulse);
    ctx.bezierCurveTo(-s * 0.9, -s * 0.6, -s * 1.1, s * 0.3, -s * 0.2, s * 0.85);
    ctx.bezierCurveTo(-s * 0.05, s * 0.5, s * 0.05, s * 0.5, s * 0.2, s * 0.85);
    ctx.bezierCurveTo(s * 1.1, s * 0.3, s * 0.9, -s * 0.6, 0, -s * 1.0 * pulse);
    ctx.fill();
    // Pulsing veins
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    for (var i = 0; i < 3; i++) {
      var ty = -s * 0.4 + i * s * 0.35;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, ty - s * 0.05);
      ctx.quadraticCurveTo(0, ty + s * 0.08, s * 0.3, ty - s * 0.05);
      ctx.stroke();
    }
  },

  // 7. shield: Diamond with barrier ring
  shield: function(ctx, s, color, time) {
    // Diamond hull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(-s * 0.55, 0);
    ctx.lineTo(0, s * 0.9);
    ctx.lineTo(s * 0.55, 0);
    ctx.closePath();
    ctx.fill();
    // Inner facets
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.45);
    ctx.lineTo(-s * 0.25, 0);
    ctx.lineTo(0, s * 0.1);
    ctx.lineTo(s * 0.25, 0);
    ctx.closePath();
    ctx.fill();
    // Barrier ring (rotating)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.95, 0, Math.PI * 2);
    ctx.stroke();
    // Ring gaps (shield energy seams)
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.95, -0.3, 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.95, Math.PI - 0.3, Math.PI + 0.3);
    ctx.stroke();
  },

  // 8. poison: Jagged bio-organic shape
  poison: function(ctx, s, color, time) {
    // Jagged bio hull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.0);
    ctx.lineTo(-s * 0.2, -s * 0.5);
    ctx.lineTo(-s * 0.7, -s * 0.3);
    ctx.lineTo(-s * 0.35, -s * 0.05);
    ctx.lineTo(-s * 0.9, s * 0.35);
    ctx.lineTo(-s * 0.25, s * 0.15);
    ctx.lineTo(-s * 0.45, s * 0.85);
    ctx.lineTo(0, s * 0.4);
    ctx.lineTo(s * 0.45, s * 0.85);
    ctx.lineTo(s * 0.25, s * 0.15);
    ctx.lineTo(s * 0.9, s * 0.35);
    ctx.lineTo(s * 0.35, -s * 0.05);
    ctx.lineTo(s * 0.7, -s * 0.3);
    ctx.lineTo(s * 0.2, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    // Drip effect at bottom
    ctx.fillStyle = color;
    for (var i = 0; i < 3; i++) {
      var dx = (i - 1) * s * 0.3;
      var drop = Math.sin(time * 3 + i) * s * 0.2;
      ctx.beginPath();
      ctx.arc(dx, s * 0.85 + drop, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // 9. ice: Crystalline angular shape with frost particles
  ice: function(ctx, s, color, time) {
    // Angular crystal shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.1);
    ctx.lineTo(-s * 0.35, -s * 0.5);
    ctx.lineTo(-s * 0.75, -s * 0.2);
    ctx.lineTo(-s * 0.35, s * 0.1);
    ctx.lineTo(-s * 0.65, s * 0.65);
    ctx.lineTo(-s * 0.15, s * 0.35);
    ctx.lineTo(0, s * 0.85);
    ctx.lineTo(s * 0.15, s * 0.35);
    ctx.lineTo(s * 0.65, s * 0.65);
    ctx.lineTo(s * 0.35, s * 0.1);
    ctx.lineTo(s * 0.75, -s * 0.2);
    ctx.lineTo(s * 0.35, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    // Crystal facet lines
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(-s * 0.2, s * 0.1);
    ctx.lineTo(0, s * 0.4);
    ctx.lineTo(s * 0.2, s * 0.1);
    ctx.lineTo(0, -s * 0.6);
    ctx.stroke();
    // Frost particles (small dots near edges)
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (var i = 0; i < 5; i++) {
      var fx = Math.sin(time * 2 + i * 1.3) * s * 0.7;
      var fy = -s * 0.5 + Math.cos(time * 3 + i) * s * 0.4;
      ctx.beginPath();
      ctx.arc(fx, fy, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // 10. barrage: Wide spread wings
  barrage: function(ctx, s, color, time) {
    // Wide wing shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(-s * 1.3, s * 0.1);
    ctx.lineTo(-s * 0.9, s * 0.55);
    ctx.lineTo(-s * 0.2, s * 0.25);
    ctx.lineTo(0, s * 0.8);
    ctx.lineTo(s * 0.2, s * 0.25);
    ctx.lineTo(s * 0.9, s * 0.55);
    ctx.lineTo(s * 1.3, s * 0.1);
    ctx.closePath();
    ctx.fill();
    // Wing panel lines
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(-s * 1.0, s * 0.25);
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(s * 1.0, s * 0.25);
    ctx.stroke();
    // Nose
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -s * 0.35, s * 0.13, 0, Math.PI * 2);
    ctx.fill();
  },

  // 11. gravity: Circular with distortion rings
  gravity: function(ctx, s, color, time) {
    // Central orb
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // Distortion rings (expanding and contracting)
    for (var i = 0; i < 3; i++) {
      var ringPhase = time * 2 + i * 2.1;
      var ringRadius = s * 0.7 + Math.sin(ringPhase) * s * 0.2;
      var ringAlpha = 0.3 + Math.sin(ringPhase) * 0.2;
      ctx.strokeStyle = color;
      ctx.globalAlpha = ringAlpha;
      ctx.lineWidth = 1 + i * 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
  },

  // 12. void: Dark triangular with purple glow
  void: function(ctx, s, color, time) {
    // Dark triangular hull
    ctx.fillStyle = '#1a0a2e';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(-s * 0.7, s * 0.6);
    ctx.lineTo(-s * 0.15, s * 0.2);
    ctx.lineTo(0, s * 0.8);
    ctx.lineTo(s * 0.15, s * 0.2);
    ctx.lineTo(s * 0.7, s * 0.6);
    ctx.closePath();
    ctx.fill();
    // Purple rune lines inside
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(0, s * 0.4);
    ctx.moveTo(-s * 0.35, s * 0.05);
    ctx.lineTo(s * 0.35, s * 0.05);
    ctx.stroke();
    // Pulsing void center
    var voidPulse = 0.5 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = 'rgba(170,102,255,' + voidPulse + ')';
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Edge glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(-s * 0.7, s * 0.6);
    ctx.lineTo(s * 0.7, s * 0.6);
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  // 13. thunder: Lightning bolt shaped
  thunder: function(ctx, s, color, time) {
    // Lightning bolt shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 1.1);
    ctx.lineTo(-s * 0.5, -s * 0.1);
    ctx.lineTo(-s * 0.1, -s * 0.05);
    ctx.lineTo(-s * 0.6, s * 0.6);
    ctx.lineTo(s * 0.1, s * 0.05);
    ctx.lineTo(-s * 0.05, s * 0.1);
    ctx.lineTo(s * 0.3, s * 0.85);
    ctx.lineTo(s * 0.15, s * 0.1);
    ctx.lineTo(s * 0.5, -s * 0.2);
    ctx.lineTo(s * 0.05, -s * 0.05);
    ctx.lineTo(s * 0.4, -s * 0.7);
    ctx.lineTo(-s * 0.1, -s * 0.1);
    ctx.closePath();
    ctx.fill();
    // Branch sparks
    var sparkTime = time * 5;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 0.8;
    for (var i = 0; i < 4; i++) {
      if (Math.sin(sparkTime + i * 2) > 0.5) {
        var sx = (i - 1.5) * s * 0.4;
        ctx.beginPath();
        ctx.moveTo(sx, s * 0.1);
        ctx.lineTo(sx + s * 0.3 * (i % 2 === 0 ? 1 : -1), s * 0.15);
        ctx.stroke();
      }
    }
  },

  // 14. wind: Swept-back aerodynamic shape with trail lines
  wind: function(ctx, s, color, time) {
    // Aerodynamic swept hull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.0);
    ctx.bezierCurveTo(-s * 0.3, -s * 0.5, -s * 0.8, s * 0.15, -s * 0.35, s * 0.75);
    ctx.lineTo(0, s * 0.4);
    ctx.lineTo(s * 0.35, s * 0.75);
    ctx.bezierCurveTo(s * 0.8, s * 0.15, s * 0.3, -s * 0.5, 0, -s * 1.0);
    ctx.fill();
    // Wind trail lines
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    for (var i = 0; i < 3; i++) {
      var lx = (i - 1) * s * 0.3;
      var lineLen = s * 0.5 + Math.sin(time * 8 + i) * s * 0.15;
      ctx.beginPath();
      ctx.moveTo(lx, s * 0.3);
      ctx.lineTo(lx, s * 0.3 + lineLen);
      ctx.stroke();
    }
  },

  // 15. shadow: Semi-transparent flickering shape
  shadow: function(ctx, s, color, time) {
    var flickerAlpha = 0.5 + Math.sin(time * 6) * 0.15 + Math.sin(time * 11) * 0.1;
    // Ghostly hull - draws multiple times for flicker
    ctx.globalAlpha = flickerAlpha;
    // Main shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(-s * 0.6, s * 0.1);
    ctx.lineTo(-s * 0.3, s * 0.75);
    ctx.lineTo(0, s * 0.35);
    ctx.lineTo(s * 0.3, s * 0.75);
    ctx.lineTo(s * 0.6, s * 0.1);
    ctx.closePath();
    ctx.fill();
    // Offset ghost copy
    var ghostOffX = Math.sin(time * 5) * s * 0.2;
    var ghostOffY = Math.cos(time * 4) * s * 0.15;
    ctx.globalAlpha = flickerAlpha * 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(ghostOffX, -s * 0.85 + ghostOffY);
    ctx.lineTo(-s * 0.6 + ghostOffX, s * 0.1 + ghostOffY);
    ctx.lineTo(-s * 0.3 + ghostOffX, s * 0.75 + ghostOffY);
    ctx.lineTo(ghostOffX, s * 0.35 + ghostOffY);
    ctx.lineTo(s * 0.3 + ghostOffX, s * 0.75 + ghostOffY);
    ctx.lineTo(s * 0.6 + ghostOffX, s * 0.1 + ghostOffY);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  },

  // 16. holy: Cross/star shaped with radiant glow
  holy: function(ctx, s, color, time) {
    // Star-cross hull (4-point star)
    var radPulse = 0.7 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    // Top point
    ctx.moveTo(0, -s * 1.0);
    ctx.lineTo(s * 0.15, -s * 0.25);
    // Right point
    ctx.lineTo(s * 1.0, 0);
    ctx.lineTo(s * 0.15, s * 0.15);
    // Bottom point
    ctx.lineTo(0, s * 0.8);
    ctx.lineTo(-s * 0.15, s * 0.15);
    // Left point
    ctx.lineTo(-s * 1.0, 0);
    ctx.lineTo(-s * 0.15, -s * 0.25);
    ctx.closePath();
    ctx.fill();
    // Radiant center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25 * radPulse, 0, Math.PI * 2);
    ctx.fill();
    // Radiant rays
    ctx.fillStyle = 'rgba(255,255,255,' + (0.15 * radPulse) + ')';
    for (var i = 0; i < 8; i++) {
      var rayAng = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rayAng) * s * 1.1, Math.sin(rayAng) * s * 1.1);
      ctx.lineTo(Math.cos(rayAng + 0.1) * s * 0.5, Math.sin(rayAng + 0.1) * s * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  },

  // 17. blood: Aggressive spiked shape with drip effect
  blood: function(ctx, s, color, time) {
    // Aggressive spiked hull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.1);
    ctx.lineTo(-s * 0.25, -s * 0.4);
    ctx.lineTo(-s * 0.7, -s * 0.5);
    ctx.lineTo(-s * 0.2, 0);
    ctx.lineTo(-s * 0.9, s * 0.3);
    ctx.lineTo(-s * 0.15, s * 0.2);
    ctx.lineTo(-s * 0.5, s * 0.8);
    ctx.lineTo(0, s * 0.35);
    ctx.lineTo(s * 0.5, s * 0.8);
    ctx.lineTo(s * 0.15, s * 0.2);
    ctx.lineTo(s * 0.9, s * 0.3);
    ctx.lineTo(s * 0.2, 0);
    ctx.lineTo(s * 0.7, -s * 0.5);
    ctx.lineTo(s * 0.25, -s * 0.4);
    ctx.closePath();
    ctx.fill();
    // Blood drip drops
    for (var i = 0; i < 3; i++) {
      var bx = (i - 1) * s * 0.35;
      var by = s * 0.7 + i * s * 0.12;
      var dropY = by + Math.abs(Math.sin(time * 4 + i * 2)) * s * 0.3;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(bx - s * 0.06, by);
      ctx.quadraticCurveTo(bx, dropY + s * 0.1, bx + s * 0.06, by);
      ctx.fill();
    }
  },

  // 18. magnet: Ring with energy arcs
  magnet: function(ctx, s, color, time) {
    // Magnetic ring core
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    // Inner hub
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.4);
    ctx.lineTo(-s * 0.25, s * 0.1);
    ctx.lineTo(0, s * 0.4);
    ctx.lineTo(s * 0.25, s * 0.1);
    ctx.closePath();
    ctx.fill();
    // Energy arcs around the ring
    for (var i = 0; i < 4; i++) {
      var arcAngle = time * 3 + (i / 4) * Math.PI * 2;
      var arcStart = arcAngle;
      var arcEnd = arcAngle + 0.8 + Math.sin(time * 5 + i) * 0.3;
      var arcR = s * 0.7;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 + Math.sin(time * 4 + i) * 0.3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, arcR, arcStart, arcEnd);
      ctx.stroke();
    }
    // Center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  },

  // 19. mirror: Two overlapping translucent shapes
  mirror: function(ctx, s, color, time) {
    // Left half - upper
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(-s * 0.5, 0);
    ctx.lineTo(-s * 0.3, s * 0.7);
    ctx.lineTo(0, s * 0.2);
    ctx.closePath();
    ctx.fill();
    // Right half - lower (mirrored)
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(s * 0.3, -s * 0.7);
    ctx.lineTo(s * 0.5, 0);
    ctx.lineTo(0, s * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    // Mirror line
    var mirrorAngle = time * 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(mirrorAngle) * s * 0.8, Math.sin(mirrorAngle) * s * 0.8);
    ctx.lineTo(Math.cos(mirrorAngle + Math.PI) * s * 0.8, Math.sin(mirrorAngle + Math.PI) * s * 0.8);
    ctx.stroke();
  },

  // 20. time: Hourglass-inspired shape with clock-hand rotation
  time: function(ctx, s, color, time) {
    // Hourglass shape
    ctx.fillStyle = color;
    ctx.beginPath();
    // Upper chamber
    ctx.moveTo(-s * 0.6, -s * 0.85);
    ctx.lineTo(s * 0.6, -s * 0.85);
    ctx.lineTo(s * 0.15, -s * 0.05);
    ctx.lineTo(-s * 0.15, -s * 0.05);
    ctx.closePath();
    ctx.fill();
    // Lower chamber
    ctx.beginPath();
    ctx.moveTo(-s * 0.6, s * 0.85);
    ctx.lineTo(s * 0.6, s * 0.85);
    ctx.lineTo(s * 0.15, s * 0.05);
    ctx.lineTo(-s * 0.15, s * 0.05);
    ctx.closePath();
    ctx.fill();
    // Center neck
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.1);
    ctx.lineTo(s * 0.2, -s * 0.1);
    ctx.lineTo(s * 0.25, s * 0.1);
    ctx.lineTo(-s * 0.25, s * 0.1);
    ctx.closePath();
    ctx.fill();
    // Rotating clock hand
    var handAngle = time * 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(handAngle) * s * 0.5, Math.sin(handAngle) * s * 0.5);
    ctx.stroke();
    // Shorter hour hand
    var shortAngle = time * 0.5;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(shortAngle) * s * 0.3, Math.sin(shortAngle) * s * 0.3);
    ctx.stroke();
    // Center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ============ Player Class ============
class Player {
  constructor(x, y) {
    // Position
    this.x = x != null ? x : GAME_CONFIG.BALANCE.CANVAS_WIDTH / 2;
    this.y = y != null ? y : GAME_CONFIG.BALANCE.CANVAS_HEIGHT * 0.8;

    // Entity metadata (engine contract)
    this.category = 'player';
    this.drawLayer = 5;
    this.active = true;

    // Core stats (defaults, overridden by applyFaction)
    this.hp = GAME_CONFIG.BALANCE.PLAYER_BASE_HP;
    this.maxHp = GAME_CONFIG.BALANCE.PLAYER_BASE_HP;
    this.shield = 0;
    this.maxShield = 0;
    this.speed = GAME_CONFIG.BALANCE.PLAYER_BASE_SPEED;
    this.hitboxRadius = GAME_CONFIG.BALANCE.PLAYER_HITBOX_RADIUS;

    // Invincibility frames (ms remaining)
    this.invincibleTimer = 0;

    // Faction identity
    this.factionId = null;
    this.factionColor = '#00ddff';

    // Stat system internals
    this._baseStats = {};
    this._modifiers = {};   // { stat: [mod, ...] }
    this.stats = {};        // Computed — readable by weapons/skills/UI

    // Shield regen rate (per second, 0 unless faction grants it)
    this.shieldRegen = 0;

    // Engine trail timer
    this._engineTrailTimer = 0;
    this._engineTrailInterval = 0.04; // seconds between trail particles

    // Visual time accumulator for ship animations
    this._visualTime = 0;
  }

  // ====================================================================
  //  Core loop
  // ====================================================================

  update(dt) {
    // --- Smooth pointer follow ---
    // lerp factor ~0.15 gives responsive but not-teleport movement.
    // Scale by speed ratio so faster factions feel snappier.
    var lerp = 0.15;
    var speedRatio = this.speed / GAME_CONFIG.BALANCE.PLAYER_BASE_SPEED;

    var prevX = this.x;
    var prevY = this.y;

    this.x += (game.mouseX - this.x) * lerp * speedRatio;
    this.y += (game.mouseY - this.y) * lerp * speedRatio;

    // Clamp inside canvas bounds (hitbox radius keeps ship fully visible)
    var r = this.hitboxRadius;
    this.x = Math.max(r, Math.min(game.width - r, this.x));
    this.y = Math.max(r, Math.min(game.height - r, this.y));

    // --- Engine trail particles (spawn when moving) ---
    var dx = this.x - prevX;
    var dy = this.y - prevY;
    var moved = Math.sqrt(dx * dx + dy * dy);
    if (moved > 1) {
      this._engineTrailTimer += dt;
      while (this._engineTrailTimer >= this._engineTrailInterval) {
        this._engineTrailTimer -= this._engineTrailInterval;
        // Spawn trail behind ship (opposite to movement direction)
        var trailX = this.x - dx * 0.5 + (Math.random() - 0.5) * 6;
        var trailY = this.y - dy * 0.5 + (Math.random() - 0.5) * 6;
        ParticleSystem.engineTrail(trailX, trailY, this.factionColor);
      }
    } else {
      this._engineTrailTimer = 0;
    }

    // --- Invincibility countdown (dt is in seconds, timer in ms) ---
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt * 1000;
      if (this.invincibleTimer < 0) {
        this.invincibleTimer = 0;
      }
    }

    // --- Shield regeneration ---
    if (this.shieldRegen > 0 && this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRegen * dt);
    }

    // --- Visual time accumulator ---
    this._visualTime += dt;
  }

  // ====================================================================
  //  Rendering
  // ====================================================================

  draw(ctx) {
    // Invincibility flicker — skip every other 100 ms block (but still draw shield)
    var invFlicker = this.invincibleTimer > 0 && (Math.floor(this.invincibleTimer / 100) & 1) === 0;
    // Invincibility pulse scale
    var invPulse = this.invincibleTimer > 0 ? 1 + Math.sin(this._visualTime * 12) * 0.08 : 1;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(invPulse, invPulse);

    // --- Shield visual (translucent circle behind ship) ---
    if (this.shield > 0) {
      var shieldRatio = this.shield / Math.max(this.maxShield, 1);
      var shieldRadius = this.hitboxRadius + 8;
      var shieldAlpha = 0.15 + shieldRatio * 0.2;

      // Outer glow ring
      ctx.strokeStyle = this.factionColor;
      ctx.globalAlpha = shieldAlpha;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner fill
      ctx.fillStyle = this.factionColor;
      ctx.globalAlpha = shieldAlpha * 0.4;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.fill();

      // Shield regen pulse effect
      if (this.shieldRegen > 0 && this.shield < this.maxShield) {
        var pulseR = shieldRadius + Math.sin(this._visualTime * 3) * 3;
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.2 + Math.sin(this._visualTime * 3) * 0.1) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // --- Draw ship design (skip hull if invincibility flicker) ---
    if (!invFlicker) {
      // Outer glow
      ctx.shadowColor = this.factionColor;
      ctx.shadowBlur = 18;

      // Draw faction-specific ship design
      var s = 13; // base ship size
      var design = ShipDesigns[this.factionId];
      if (design) {
        design(ctx, s, this.factionColor, this._visualTime);
      } else {
        // Fallback: simple triangle for unknown factions
        ctx.fillStyle = this.factionColor;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(-s * 0.7, s * 0.8);
        ctx.lineTo(s * 0.7, s * 0.8);
        ctx.closePath();
        ctx.fill();
      }

      // Reset shadow
      ctx.shadowBlur = 0;
    }

    // --- Invincibility energy ring (draws even during flicker) ---
    if (this.invincibleTimer > 0) {
      var invRingRadius = this.hitboxRadius + 6 + Math.sin(this._visualTime * 8) * 3;
      var invAlpha = 0.3 + Math.sin(this._visualTime * 6) * 0.15;
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = invAlpha;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.lineDashOffset = -this._visualTime * 60;
      ctx.beginPath();
      ctx.arc(0, 0, invRingRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ====================================================================
  //  Faction application
  // ====================================================================

  applyFaction(factionId) {
    var faction = GAME_CONFIG.FACTIONS[factionId];
    if (!faction) return;

    this.factionId = factionId;
    this.factionColor = faction.color;
    this._baseStats = Object.assign({}, faction.baseStats);

    this._recalculateStats();
  }

  // ====================================================================
  //  Skill stat modifiers
  //  mods: array of { stat, op: 'multiply'|'add', value }
  // ====================================================================

  applyStatModifiers(mods) {
    if (!mods || !mods.length) return;

    for (var i = 0; i < mods.length; i++) {
      var mod = mods[i];
      if (!this._modifiers[mod.stat]) {
        this._modifiers[mod.stat] = [];
      }
      this._modifiers[mod.stat].push(mod);
    }

    this._recalculateStats();
  }

  // Rebuild `this.stats` from base + modifiers, then update derived properties
  _recalculateStats() {
    // Start with a clone of base stats
    var s = Object.assign({}, this._baseStats);

    // Apply each stat's accumulated modifiers
    for (var stat in this._modifiers) {
      if (!this._modifiers.hasOwnProperty(stat)) continue;
      var mods = this._modifiers[stat];
      var multSum = 0;
      var addSum = 0;

      for (var i = 0; i < mods.length; i++) {
        if (mods[i].op === 'multiply') {
          multSum += mods[i].value;
        } else if (mods[i].op === 'add') {
          addSum += mods[i].value;
        }
      }

      // Base value — fall back to 0 for stats not in baseStats
      var base = (s[stat] !== undefined) ? s[stat] : 0;
      s[stat] = base * (1 + multSum) + addSum;
    }

    // Publish computed stats for other systems (weapons, skills, UI)
    this.stats = s;

    // --- Pull player-relevant values out of stats ---

    // HP
    var oldMaxHp = this.maxHp;
    if (s.hp !== undefined) {
      this.maxHp = s.hp;
    } else {
      this.maxHp = GAME_CONFIG.BALANCE.PLAYER_BASE_HP;
    }
    if (oldMaxHp > 0 && this.maxHp !== oldMaxHp) {
      var hpPct = this.hp / oldMaxHp;
      this.hp = Math.floor(this.maxHp * hpPct);
    } else {
      this.hp = Math.min(this.hp, this.maxHp);
    }

    // Speed
    if (s.speed !== undefined) {
      this.speed = s.speed;
    } else {
      this.speed = GAME_CONFIG.BALANCE.PLAYER_BASE_SPEED;
    }

    // Shield
    if (s.shieldAmount !== undefined) {
      this.maxShield = s.shieldAmount;
    } else {
      this.maxShield = 0;
    }
    this.shield = Math.min(this.shield, this.maxShield);

    // Shield regen
    this.shieldRegen = s.shieldRegen || 0;
  }

  // ====================================================================
  //  Damage / Healing
  // ====================================================================

  /**
   * Take damage. Shield absorbs first, then HP.
   * Triggers invincibility frames when HP is reduced.
   * @param {number} amount  Raw damage
   * @returns {boolean}      true if still alive
   */
  takeDamage(amount) {
    if (this.invincibleTimer > 0) return true;
    if (amount <= 0) return this.hp > 0;

    var wasShieldActive = this.shield > 0;

    // Shield absorbs damage first
    if (this.shield > 0) {
      var absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;

      // Shield break effect
      if (this.shield <= 0 && wasShieldActive) {
        ParticleSystem.screenFlash('rgba(100,180,255,0.2)', 150);
        ParticleSystem.shieldBreak(this.x, this.y, this.factionColor);
      }
    }

    // Remaining damage hits HP
    if (amount > 0) {
      this.hp -= amount;
      this.invincibleTimer = GAME_CONFIG.BALANCE.PLAYER_INVINCIBLE_MS;

      // Damage feedback effects
      ParticleSystem.damageNumber(this.x, this.y - 20, Math.round(amount), '#ff4444');
      ParticleSystem.screenFlash('rgba(255,50,50,0.15)', 120);
      game.addShake(3);
    }

    return this.hp > 0;
  }

  /**
   * Restore HP, capped at maxHp.
   * @param {number} amount
   */
  heal(amount) {
    var before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    var actualHeal = this.hp - before;
    if (actualHeal > 0) {
      ParticleSystem.damageNumber(this.x, this.y - 20, '+' + Math.round(actualHeal), '#44ff44');
      ParticleSystem.healEffect(this.x, this.y);
    }
  }
}

// Expose globally for engine and other modules
window.Player = Player;
