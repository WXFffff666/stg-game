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
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(-s * 0.7, s * 0.6);
    ctx.lineTo(s * 0.7, s * 0.6);
    ctx.closePath();
    ctx.stroke();
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
  },

  // 21. fury: Aggressive angular shape with rage flames
  fury: function(ctx, s, color, time) {
    // Aggressive angular hull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.2);
    ctx.lineTo(-s * 0.3, -s * 0.4);
    ctx.lineTo(-s * 0.9, -s * 0.2);
    ctx.lineTo(-s * 0.4, s * 0.1);
    ctx.lineTo(-s * 0.7, s * 0.7);
    ctx.lineTo(0, s * 0.4);
    ctx.lineTo(s * 0.7, s * 0.7);
    ctx.lineTo(s * 0.4, s * 0.1);
    ctx.lineTo(s * 0.9, -s * 0.2);
    ctx.lineTo(s * 0.3, -s * 0.4);
    ctx.closePath();
    ctx.fill();
    // Rage flame effect at tips
    var flameFlicker = 0.6 + Math.sin(time * 12) * 0.2 + Math.sin(time * 18) * 0.15;
    ctx.fillStyle = 'rgba(255,0,68,' + flameFlicker + ')';
    for (var i = 0; i < 3; i++) {
      var fx = (i - 1) * s * 0.35;
      var fy = s * 0.7 + Math.sin(time * 8 + i * 2) * s * 0.15;
      ctx.beginPath();
      ctx.moveTo(fx - s * 0.08, fy);
      ctx.quadraticCurveTo(fx, fy + s * 0.2, fx + s * 0.08, fy);
      ctx.fill();
    }
    // Central rage core
    var corePulse = 0.7 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = 'rgba(255,255,255,' + corePulse + ')';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
  },

  // 22. luck: Four-leaf clover shape with sparkle
  luck: function(ctx, s, color, time) {
    // Four-leaf clover shape
    ctx.fillStyle = color;
    var leafSize = s * 0.55;
    for (var i = 0; i < 4; i++) {
      var angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
      var lx = Math.cos(angle) * s * 0.35;
      var ly = Math.sin(angle) * s * 0.35;
      ctx.beginPath();
      ctx.arc(lx, ly, leafSize * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center connector
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Stem
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.2);
    ctx.quadraticCurveTo(s * 0.15, s * 0.6, 0, s * 0.9);
    ctx.stroke();
    // Sparkle effect
    ctx.fillStyle = '#ffffff';
    for (var j = 0; j < 5; j++) {
      var sparkAngle = time * 3 + j * 1.26;
      var sparkR = s * 0.7 + Math.sin(time * 4 + j) * s * 0.15;
      var sx = Math.cos(sparkAngle) * sparkR;
      var sy = Math.sin(sparkAngle) * sparkR;
      var sparkSize = s * 0.06 + Math.sin(time * 8 + j * 2) * s * 0.03;
      ctx.beginPath();
      ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    }
    // Lucky star in center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  },

  // 23. sonic: Sound wave emitter with concentric rings
  sonic: function(ctx, s, color, time) {
    // Central speaker body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
    ctx.fill();
    // Inner cone
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Sound wave rings (expanding outward)
    for (var i = 0; i < 3; i++) {
      var wavePhase = (time * 3 + i * 2.1) % (Math.PI * 2);
      var waveRadius = s * 0.5 + Math.sin(wavePhase) * s * 0.35;
      var waveAlpha = 0.4 - (i * 0.1) + Math.sin(wavePhase) * 0.2;
      ctx.strokeStyle = color;
      ctx.globalAlpha = Math.max(0, waveAlpha);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Wing fins (left and right)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.15);
    ctx.lineTo(-s * 1.0, -s * 0.5);
    ctx.lineTo(-s * 1.1, s * 0.2);
    ctx.lineTo(-s * 0.5, s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.15);
    ctx.lineTo(s * 1.0, -s * 0.5);
    ctx.lineTo(s * 1.1, s * 0.2);
    ctx.lineTo(s * 0.5, s * 0.3);
    ctx.closePath();
    ctx.fill();
    // Nose tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.8);
    ctx.lineTo(-s * 0.12, -s * 0.45);
    ctx.lineTo(s * 0.12, -s * 0.45);
    ctx.closePath();
    ctx.fill();
  },

  // 24. nature: Organic leaf shape with vine tendrils
  nature: function(ctx, s, color, time) {
    // Main leaf body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.1);
    ctx.quadraticCurveTo(-s * 0.8, -s * 0.3, -s * 0.5, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.6, 0, s * 0.9);
    ctx.quadraticCurveTo(s * 0.2, s * 0.6, s * 0.5, s * 0.3);
    ctx.quadraticCurveTo(s * 0.8, -s * 0.3, 0, -s * 1.1);
    ctx.fill();
    // Leaf vein (center line)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(0, s * 0.7);
    ctx.stroke();
    // Side veins
    for (var i = 0; i < 3; i++) {
      var vy = -s * 0.5 + i * s * 0.4;
      var vx = s * 0.3 + i * s * 0.05;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(vx * 0.5, vy - s * 0.1, vx, vy - s * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(-vx * 0.5, vy - s * 0.1, -vx, vy - s * 0.15);
      ctx.stroke();
    }
    // Vine tendrils (animated)
    for (var j = 0; j < 2; j++) {
      var side = j === 0 ? -1 : 1;
      var tendrilPhase = time * 2 + j * 1.5;
      var tx = side * s * 0.6 + Math.sin(tendrilPhase) * s * 0.15;
      var ty = s * 0.3 + Math.cos(tendrilPhase) * s * 0.1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(side * s * 0.4, s * 0.1);
      ctx.quadraticCurveTo(tx, ty, tx + side * s * 0.2, ty + s * 0.15);
      ctx.stroke();
    }
    // Life glow core
    var glowPulse = 0.6 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = 'rgba(255,255,255,' + glowPulse + ')';
    ctx.beginPath();
    ctx.arc(0, -s * 0.3, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
  },

  // 25. psychic: Ethereal eye shape with orbiting marks
  psychic: function(ctx, s, color, time) {
    // Eye-shaped hull
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, -s * 0.8, s * 0.1);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.6, 0, s * 0.8);
    ctx.quadraticCurveTo(s * 0.5, s * 0.6, s * 0.8, s * 0.1);
    ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, -s * 0.9);
    ctx.fill();
    // Inner iris
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Pupil
    ctx.fillStyle = '#220022';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
    // Psychic marks (orbiting symbols)
    for (var i = 0; i < 4; i++) {
      var markAngle = time * 2 + (i / 4) * Math.PI * 2;
      var markR = s * 0.65 + Math.sin(time * 3 + i) * s * 0.1;
      var mx = Math.cos(markAngle) * markR;
      var my = Math.sin(markAngle) * markR;
      var markPulse = 0.5 + Math.sin(time * 5 + i * 1.5) * 0.3;
      ctx.fillStyle = 'rgba(255,68,255,' + markPulse + ')';
      ctx.beginPath();
      // Small diamond marks
      ctx.moveTo(mx, my - s * 0.1);
      ctx.lineTo(mx + s * 0.07, my);
      ctx.lineTo(mx, my + s * 0.1);
      ctx.lineTo(mx - s * 0.07, my);
      ctx.closePath();
      ctx.fill();
    }
    // Psychic aura rings
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3 + Math.sin(time * 4) * 0.15;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.9 + Math.sin(time * 2) * s * 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  },

  // 27. minion: Demon horned shape with orbiting minions
  minion: function(ctx, s, color, time) {
    // Main demon body with horns
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.lineTo(-s * 0.35, -s * 0.2);
    ctx.lineTo(-s * 0.5, -s * 0.7);
    ctx.lineTo(-s * 0.25, -s * 0.3);
    ctx.lineTo(-s * 0.7, s * 0.1);
    ctx.lineTo(-s * 0.2, s * 0.0);
    ctx.lineTo(-s * 0.4, s * 0.7);
    ctx.lineTo(0, s * 0.4);
    ctx.lineTo(s * 0.4, s * 0.7);
    ctx.lineTo(s * 0.2, s * 0.0);
    ctx.lineTo(s * 0.7, s * 0.1);
    ctx.lineTo(s * 0.25, -s * 0.3);
    ctx.lineTo(s * 0.5, -s * 0.7);
    ctx.lineTo(s * 0.35, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    // Demon horns
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.4);
    ctx.lineTo(-s * 0.55, -s * 0.95);
    ctx.lineTo(-s * 0.15, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.4);
    ctx.lineTo(s * 0.55, -s * 0.95);
    ctx.lineTo(s * 0.15, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    // Blood orb glow
    var orbPulse = 0.5 + Math.sin(time * 5) * 0.3;
    ctx.fillStyle = 'rgba(255,68,136,' + orbPulse + ')';
    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    // Orbiting minion spirits
    for (var i = 0; i < 3; i++) {
      var ang = time * 2.5 + (i / 3) * Math.PI * 2;
      var ox = Math.cos(ang) * s * 0.85;
      var oy = Math.sin(ang) * s * 0.85;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(ox, oy, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  // 28. data: Hexagonal scanner with data streams
  data: function(ctx, s, color, time) {
    // Hexagonal body
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      var hx = Math.cos(angle) * s * 0.7;
      var hy = Math.sin(angle) * s * 0.7;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    // Inner hexagon (darker)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    for (var j = 0; j < 6; j++) {
      var innerAngle = (j / 6) * Math.PI * 2 - Math.PI / 2;
      var ix = Math.cos(innerAngle) * s * 0.45;
      var iy = Math.sin(innerAngle) * s * 0.45;
      if (j === 0) ctx.moveTo(ix, iy);
      else ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    // Scanning line (rotating)
    var scanAngle = time * 4;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(scanAngle) * s * 0.65, Math.sin(scanAngle) * s * 0.65);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Data stream particles
    for (var k = 0; k < 4; k++) {
      var streamAngle = time * 3 + (k / 4) * Math.PI * 2;
      var sr = s * 0.3 + Math.sin(time * 5 + k) * s * 0.15;
      var sx = Math.cos(streamAngle) * sr;
      var sy = Math.sin(streamAngle) * sr;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(sx, sy, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Center data core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
  },

  // 24. rune: Mystical rune-carved hull with glowing symbols
  rune: function(ctx, s, color, time) {
    // Octagonal rune hull
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      var r = (i % 2 === 0) ? s * 1.0 : s * 0.7;
      var px = Math.cos(angle) * r;
      var py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    // Rune symbol lines
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.2;
    // Inner triangle
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.45);
    ctx.lineTo(-s * 0.35, s * 0.2);
    ctx.lineTo(s * 0.35, s * 0.2);
    ctx.closePath();
    ctx.stroke();
    // Cross bars
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.1);
    ctx.lineTo(s * 0.25, -s * 0.1);
    ctx.moveTo(0, -s * 0.45);
    ctx.lineTo(0, s * 0.2);
    ctx.stroke();
    // Pulsing rune glow
    var runeGlow = 0.4 + Math.sin(time * 5) * 0.3;
    ctx.fillStyle = 'rgba(255,170,68,' + runeGlow + ')';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
  },

  // 25. star: Star-shaped hull with radiating points
  star: function(ctx, s, color, time) {
    // Five-pointed star shape
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
      var r = (i % 2 === 0) ? s * 1.1 : s * 0.5;
      var px = Math.cos(angle) * r;
      var py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    // Inner star detail
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    for (var j = 0; j < 10; j++) {
      var a2 = (j / 10) * Math.PI * 2 - Math.PI / 2;
      var r2 = (j % 2 === 0) ? s * 0.6 : s * 0.25;
      var px2 = Math.cos(a2) * r2;
      var py2 = Math.sin(a2) * r2;
      if (j === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.fill();
    // Radiating glow
    var starPulse = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = 'rgba(255,255,170,' + starPulse + ')';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Orbiting sparkle
    var sparkAngle = time * 3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(Math.cos(sparkAngle) * s * 0.8, Math.sin(sparkAngle) * s * 0.8, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },

  // 26. darkGold: Coin-shaped hull with golden shimmer
  darkGold: function(ctx, s, color, time) {
    // Circular coin body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.9, 0, Math.PI * 2);
    ctx.fill();
    // Inner ring
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    // Dollar sign / gold symbol
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = 'bold ' + Math.round(s * 0.9) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    // Rotating golden shimmer
    var shimmerAngle = time * 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.05, shimmerAngle, shimmerAngle + Math.PI * 0.6);
    ctx.stroke();
    // Wing fins for propulsion
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, s * 0.3);
    ctx.lineTo(-s * 1.2, s * 0.8);
    ctx.lineTo(-s * 0.5, s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.7, s * 0.3);
    ctx.lineTo(s * 1.2, s * 0.8);
    ctx.lineTo(s * 0.5, s * 0.7);
    ctx.closePath();
    ctx.fill();
  },

  // 29. storm: Swirling spiral shape with wind trails
  storm: function(ctx, s, color, time) {
    // Spiral wind hull
    ctx.fillStyle = color;
    ctx.beginPath();
    var spiralPoints = 8;
    for (var i = 0; i < spiralPoints; i++) {
      var angle = (i / spiralPoints) * Math.PI * 2 + time * 3;
      var r = s * (0.4 + (i / spiralPoints) * 0.6);
      var px = Math.cos(angle) * r * 0.6;
      var py = Math.sin(angle) * r - s * 0.3;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    // Central vortex core
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(0, -s * 0.2, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Wind trail lines (animated)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    for (var j = 0; j < 4; j++) {
      var trailAngle = time * 4 + (j / 4) * Math.PI * 2;
      var trailR = s * 0.8 + Math.sin(time * 3 + j) * s * 0.2;
      var tx = Math.cos(trailAngle) * trailR * 0.5;
      var ty = Math.sin(trailAngle) * trailR * 0.5 + s * 0.2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      var curve = Math.sin(time * 5 + j * 1.5) * s * 0.3;
      ctx.quadraticCurveTo(tx + curve, ty + s * 0.2, tx, ty + s * 0.5);
      ctx.stroke();
    }
    // Nose glow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -s * 0.7, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  },

  // 30. soul: Ghostly ethereal shape with floating soul orbs
  soul: function(ctx, s, color, time) {
    // Ghostly translucent hull
    var ghostAlpha = 0.6 + Math.sin(time * 3) * 0.15;
    ctx.globalAlpha = ghostAlpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.quadraticCurveTo(-s * 0.8, -s * 0.3, -s * 0.6, s * 0.2);
    ctx.quadraticCurveTo(-s * 0.7, s * 0.6, -s * 0.3, s * 0.85);
    ctx.quadraticCurveTo(0, s * 0.6, s * 0.3, s * 0.85);
    ctx.quadraticCurveTo(s * 0.7, s * 0.6, s * 0.6, s * 0.2);
    ctx.quadraticCurveTo(s * 0.8, -s * 0.3, 0, -s * 0.9);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Soul core (glowing orb)
    var corePulse = 0.6 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = 'rgba(255,255,255,' + corePulse + ')';
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Orbiting soul orbs
    for (var i = 0; i < 5; i++) {
      var orbAngle = time * 2 + (i / 5) * Math.PI * 2;
      var orbR = s * 0.7 + Math.sin(time * 3 + i * 1.2) * s * 0.15;
      var ox = Math.cos(orbAngle) * orbR;
      var oy = Math.sin(orbAngle) * orbR * 0.6;
      var orbAlpha = 0.4 + Math.sin(time * 5 + i * 2) * 0.3;
      ctx.fillStyle = color;
      ctx.globalAlpha = orbAlpha;
      ctx.beginPath();
      ctx.arc(ox, oy, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  // 31. genesis: Cosmic nebula shape with random particle effects
  genesis: function(ctx, s, color, time) {
    // Nebula cloud body
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (var i = 0; i < 12; i++) {
      var angle = (i / 12) * Math.PI * 2;
      var r = s * (0.6 + Math.sin(time * 2 + i * 0.8) * 0.25);
      var px = Math.cos(angle) * r;
      var py = Math.sin(angle) * r - s * 0.1;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    // Inner cosmos layers
    for (var j = 0; j < 3; j++) {
      var layerAlpha = 0.3 - j * 0.08;
      var layerR = s * (0.5 - j * 0.12);
      var layerAngle = time * (1.5 + j * 0.5);
      ctx.fillStyle = j === 0 ? '#ffffff' : (j === 1 ? '#aaaaff' : '#ffaaaa');
      ctx.globalAlpha = layerAlpha;
      ctx.beginPath();
      ctx.arc(Math.cos(layerAngle) * s * 0.1, Math.sin(layerAngle) * s * 0.1 - s * 0.1, layerR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Random sparkle particles
    for (var k = 0; k < 8; k++) {
      var sparkAngle = time * 3 + k * 0.8;
      var sparkR = s * 0.9 + Math.sin(time * 4 + k * 1.5) * s * 0.3;
      var sx = Math.cos(sparkAngle) * sparkR;
      var sy = Math.sin(sparkAngle) * sparkR;
      var sparkSize = s * 0.04 + Math.sin(time * 6 + k * 2) * s * 0.02;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.5 + Math.sin(time * 5 + k) * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Central creation core
    var coreGlow = 0.7 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = 'rgba(255,255,255,' + coreGlow + ')';
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
  },

  // 32. explosive: Bomb-shaped hull with fuse spark, explosion accents
  explosive: function(ctx, s, color, time) {
    // Round bomb body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.65, 0, Math.PI * 2);
    ctx.fill();
    // Fuse stalk
    ctx.strokeStyle = '#ccaa66';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.65);
    ctx.quadraticCurveTo(s * 0.15, -s * 0.85, s * 0.1, -s * 1.05);
    ctx.stroke();
    // Fuse spark (animated)
    var sparkPulse = 0.6 + Math.sin(time * 12) * 0.4;
    ctx.fillStyle = 'rgba(255,220,50,' + sparkPulse + ')';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 1.1, s * 0.12 * sparkPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,0,0.3)';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 1.1, s * 0.25 * sparkPulse, 0, Math.PI * 2);
    ctx.fill();
    // Bottom fins
    ctx.fillStyle = '#cc6600';
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.5);
    ctx.lineTo(-s * 0.6, s * 0.85);
    ctx.lineTo(-s * 0.15, s * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.3, s * 0.5);
    ctx.lineTo(s * 0.6, s * 0.85);
    ctx.lineTo(s * 0.15, s * 0.55);
    ctx.closePath();
    ctx.fill();
    // Explosion crack arcs (animated)
    var crackAlpha = 0.3 + Math.sin(time * 8) * 0.2;
    ctx.strokeStyle = 'rgba(255,255,100,' + crackAlpha + ')';
    ctx.lineWidth = 1.5;
    for (var i = 0; i < 4; i++) {
      var crackAngle = time * 5 + i * 1.6;
      var crackLen = s * 0.25 + Math.sin(time * 7 + i) * s * 0.1;
      var cx = Math.cos(crackAngle) * s * 0.65;
      var cy = Math.sin(crackAngle) * s * 0.65;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(crackAngle) * crackLen, cy + Math.sin(crackAngle) * crackLen);
      ctx.stroke();
    }
    // Heat core
    var corePulse = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = 'rgba(255,200,50,' + corePulse + ')';
    ctx.beginPath();
    ctx.arc(0, s * 0.05, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
  },

  // 33. mech: Robotic angular shape with gear details
  mech: function(ctx, s, color, time) {
    // Angular mech body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(-s * 0.5, -s * 0.5);
    ctx.lineTo(-s * 0.7, 0);
    ctx.lineTo(-s * 0.5, s * 0.5);
    ctx.lineTo(-s * 0.2, s * 0.75);
    ctx.lineTo(s * 0.2, s * 0.75);
    ctx.lineTo(s * 0.5, s * 0.5);
    ctx.lineTo(s * 0.7, 0);
    ctx.lineTo(s * 0.5, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    // Shoulder armor plates
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, -s * 0.1);
    ctx.lineTo(-s * 0.85, -s * 0.2);
    ctx.lineTo(-s * 0.8, s * 0.1);
    ctx.lineTo(-s * 0.4, s * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.45, -s * 0.1);
    ctx.lineTo(s * 0.85, -s * 0.2);
    ctx.lineTo(s * 0.8, s * 0.1);
    ctx.lineTo(s * 0.4, s * 0.05);
    ctx.closePath();
    ctx.fill();
    // Visor eye slit (pulsing)
    var visorPulse = 0.7 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = 'rgba(255,255,255,' + visorPulse + ')';
    ctx.fillRect(-s * 0.25, -s * 0.3, s * 0.5, s * 0.1);
    // Mechanical joint circles
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-s * 0.3, s * 0.6, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.3, s * 0.6, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
    // Rotating gear emblem
    var gearAngle = time * 2;
    ctx.save();
    ctx.translate(0, s * 0.15);
    ctx.rotate(gearAngle);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // Vent glow
    var ventAlpha = 0.3 + Math.sin(time * 5) * 0.2;
    ctx.fillStyle = 'rgba(200,220,255,' + ventAlpha + ')';
    ctx.beginPath();
    ctx.arc(-s * 0.15, s * 0.45, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.15, s * 0.45, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  },

  // 34. tech: Circuit-board hexagonal design with data streams
  tech: function(ctx, s, color, time) {
    // Hexagonal hull
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      var hx = Math.cos(angle) * s * 0.8;
      var hy = Math.sin(angle) * s * 0.8;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    // Inner hex circuit traces
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var j = 0; j < 6; j++) {
      var ia = (j / 6) * Math.PI * 2 - Math.PI / 2;
      var ix = Math.cos(ia) * s * 0.45;
      var iy = Math.sin(ia) * s * 0.45;
      if (j === 0) ctx.moveTo(ix, iy);
      else ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.stroke();
    // Radial circuit lines
    for (var k = 0; k < 6; k++) {
      var ca = (k / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ca) * s * 0.45, Math.sin(ca) * s * 0.45);
      ctx.lineTo(Math.cos(ca) * s * 0.15, Math.sin(ca) * s * 0.15);
      ctx.stroke();
    }
    // Scanning line (horizontal sweep)
    var scanY = Math.sin(time * 3) * s * 0.65;
    ctx.strokeStyle = 'rgba(100,220,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s * 0.65, scanY);
    ctx.lineTo(s * 0.65, scanY);
    ctx.stroke();
    // Data node dots (rotating)
    for (var n = 0; n < 4; n++) {
      var nodeAngle = time * 2.5 + (n / 4) * Math.PI * 2;
      var nx = Math.cos(nodeAngle) * s * 0.65;
      var ny = Math.sin(nodeAngle) * s * 0.65;
      var nodeAlpha = 0.5 + Math.sin(time * 6 + n) * 0.4;
      ctx.fillStyle = 'rgba(255,255,255,' + nodeAlpha + ')';
      ctx.beginPath();
      ctx.arc(nx, ny, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
    // Central data core
    var corePulse = 0.6 + Math.sin(time * 5) * 0.3;
    ctx.fillStyle = 'rgba(255,255,255,' + corePulse + ')';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    // Tech wing extenders
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, -s * 0.1);
    ctx.lineTo(-s * 1.0, -s * 0.35);
    ctx.lineTo(-s * 0.95, s * 0.15);
    ctx.lineTo(-s * 0.45, s * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.5, -s * 0.1);
    ctx.lineTo(s * 1.0, -s * 0.35);
    ctx.lineTo(s * 0.95, s * 0.15);
    ctx.lineTo(s * 0.45, s * 0.15);
    ctx.closePath();
    ctx.fill();
  },

  // 35. chaos: Shifting geometric shape with chaotic effects
  chaos: function(ctx, s, color, time) {
    // Unstable shifting hull - vertices oscillate
    var numPoints = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var i = 0; i < numPoints; i++) {
      var baseAngle = (i / numPoints) * Math.PI * 2 - Math.PI / 2;
      var wobble = Math.sin(time * 4 + i * 1.3) * 0.2 + Math.sin(time * 7 + i * 0.7) * 0.15;
      var r = s * (0.5 + 0.5 * (0.6 + wobble));
      var px = Math.cos(baseAngle) * r;
      var py = Math.sin(baseAngle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    // Chaotic inner shards (rotating fragments)
    var shardAngle = time * 3.5;
    for (var j = 0; j < 4; j++) {
      var sa = shardAngle + (j / 4) * Math.PI * 2;
      var sr = s * 0.35;
      var sx = Math.cos(sa) * sr;
      var sy = Math.sin(sa) * sr;
      var shardPulse = 0.4 + Math.sin(time * 6 + j * 1.7) * 0.3;
      ctx.fillStyle = 'rgba(255,255,255,' + shardPulse + ')';
      ctx.beginPath();
      ctx.moveTo(sx, sy - s * 0.08);
      ctx.lineTo(sx + s * 0.1, sy + s * 0.04);
      ctx.lineTo(sx - s * 0.1, sy + s * 0.04);
      ctx.closePath();
      ctx.fill();
    }
    // Disintegration particles (swirling outward)
    for (var k = 0; k < 6; k++) {
      var pAngle = time * 5 + k * 1.05;
      var pR = s * 0.8 + Math.sin(time * 4 + k * 1.3) * s * 0.3;
      var px2 = Math.cos(pAngle) * pR;
      var py2 = Math.sin(pAngle) * pR;
      var pSize = s * 0.05 + Math.sin(time * 8 + k * 2) * s * 0.03;
      var pAlpha = 0.3 + Math.sin(time * 6 + k * 1.5) * 0.3;
      ctx.fillStyle = color;
      ctx.globalAlpha = pAlpha;
      ctx.beginPath();
      ctx.arc(px2, py2, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Chaotic energy flash
    var flashFreq = Math.sin(time * 11) * Math.sin(time * 13);
    var flashAlpha = Math.max(0, flashFreq * 0.35);
    ctx.fillStyle = 'rgba(255,255,255,' + flashAlpha + ')';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Unstable wandering core
    var coreShiftX = Math.sin(time * 5) * s * 0.08;
    var coreShiftY = Math.cos(time * 7) * s * 0.08;
    ctx.fillStyle = '#ff88cc';
    ctx.beginPath();
    ctx.arc(coreShiftX, coreShiftY, s * 0.13, 0, Math.PI * 2);
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
    this.hitRadius = this.hitboxRadius;

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

    // Shield timer (护盾流 passive: new shield every N ms)
    this.shieldTimer = 0;
    this.shieldTimerInterval = 15000; // 15 seconds default
    this.shieldTimerAmount = 0; // shield amount granted per tick

    // Vampire aura (吸血光环) on-kill heal percent
    this.characterId = null;
    this.characterColor = null;

    // Engine trail timer
    this._engineTrailTimer = 0;
    this._engineTrailInterval = 0.14; // seconds between trail particles

    // Visual time accumulator for ship animations
    this._visualTime = 0;

    // SkillManager reference (set via linkSkillManager)
    this._skillManager = null;

    // --- 触摸/拖动跟随模式（按住即跟手，子弹直线向前） ---
    this._touchActive = false;
    this._touchX = 0;
    this._touchY = 0;
    this._pointerFollowOffsetY = 35;

    // Lifesteal per-second cap tracking (C8)
    this._lifestealThisSecond = 0;
    this._lifestealSecondTimer = 0;
  }

  // ====================================================================
  //  Core loop
  // ====================================================================

  update(dt) {
    var prevX = this.x;
    var prevY = this.y;

    // --- 按住拖动：飞机跟手；未按住：平滑跟随指针 ---
    if (this._touchActive && this._touchX !== undefined) {
      this.x = this._touchX;
      this.y = this._touchY - this._pointerFollowOffsetY;
      // 边界检查
      var r = this.hitboxRadius;
      this.x = Math.max(r, Math.min(game.width - r, this.x));
      this.y = Math.max(r, Math.min(game.height - r, this.y));
    } else {
      var b = GAME_CONFIG.BALANCE;
      var lerp = (window.game && window.game.isMobile)
        ? (b.PLAYER_POINTER_LERP_MOBILE || 0.72)
        : (b.PLAYER_POINTER_LERP || 0.62);
      var speedRatio = this.speed / GAME_CONFIG.BALANCE.PLAYER_BASE_SPEED;
      var follow = Math.min(1, lerp * speedRatio);

      this.x += (game.mouseX - this.x) * follow;
      this.y += (game.mouseY - this.y) * follow;

      // Clamp inside canvas bounds (hitbox radius keeps ship fully visible)
      var r = this.hitboxRadius;
      this.x = Math.max(r, Math.min(game.width - r, this.x));
      this.y = Math.max(r, Math.min(game.height - r, this.y));
    }

    // --- Engine trail particles (spawn when moving) ---
    var dx = this.x - prevX;
    var dy = this.y - prevY;
    var moved = Math.sqrt(dx * dx + dy * dy);
    if (moved > 3) {
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

    // --- Lifesteal per-second cap tracking (C8) ---
    this._lifestealSecondTimer += dt;
    if (this._lifestealSecondTimer >= 1.0) {
      this._lifestealSecondTimer -= 1.0;
      this._lifestealThisSecond = 0;
    }

    // --- Shield regeneration ---
    if (this.shieldRegen > 0 && this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRegen * dt);
    }

    // --- Shield timer (护盾流 passive: periodic shield grant) ---
    if (this.shieldTimerAmount > 0) {
      this.shieldTimer += dt * 1000;
      if (this.shieldTimer >= this.shieldTimerInterval) {
        this.shieldTimer -= this.shieldTimerInterval;
        // Grant shield (stacks up to maxShield)
        var newShield = Math.min(this.maxShield, this.shield + this.shieldTimerAmount);
        if (newShield > this.shield) {
          this.shield = newShield;
          ParticleSystem.shieldBreak(this.x, this.y, 'rgba(100,180,255,0.6)');
        }
      }
    }

    // --- 狂怒流派: 低血加攻效果 ---
    if (this.stats.lowHpBonus && this.stats.rageThreshold) {
      var hpPct = this.hp / Math.max(this.maxHp, 1);
      var threshold = this.stats.rageThreshold;
      if (hpPct <= threshold && !this._furyActive) {
        // 进入狂怒状态：临时增加攻击力
        this._furyActive = true;
        this._furyMod = { stat: 'attack', op: 'multiply', value: this.stats.lowHpBonus };
        this._addModifier(this._furyMod);
        // 狂怒视觉效果
        if (window.ParticleSystem) {
          window.ParticleSystem.damageNumber(this.x, this.y - 30, '💢 狂怒!', '#ff0044');
        }
      } else if (hpPct > threshold && this._furyActive) {
        // 退出狂怒状态：移除临时加成
        this._furyActive = false;
        if (this._furyMod) {
          this._removeModifier(this._furyMod);
          this._furyMod = null;
        }
      }
    }

    // --- 幸运流派: 掉落率加成 ---
    if (this.stats.dropRateBonus && !this._luckApplied) {
      this._luckApplied = true;
      this._luckMod = { stat: 'dropRate', op: 'add', value: this.stats.dropRateBonus };
      this._addModifier(this._luckMod);
    }

    // --- 血祭流派: HP再生 ---
    if (this.stats.hpRegen && this.stats.hpRegen > 0) {
      if (!this._hpRegenTimer) this._hpRegenTimer = 0;
      this._hpRegenTimer += dt;
      if (this._hpRegenTimer >= 1.0) { // heal every 1 second
        this._hpRegenTimer = 0;
        if (this.hp < this.maxHp) {
          this.heal(this.stats.hpRegen);
        }
      }
    }

    // --- 血祭流派: 低血量攻击力加成 (bloodRage) ---
    if (this.stats.bloodRageThreshold && this.stats.bloodRageDamage) {
      var _bloodHpPct = this.hp / Math.max(this.maxHp, 1);
      if (_bloodHpPct <= this.stats.bloodRageThreshold && !this._bloodRageActive) {
        this._bloodRageActive = true;
        this._bloodRageMod = { stat: 'attack', op: 'multiply', value: this.stats.bloodRageDamage };
        this._addModifier(this._bloodRageMod);
        if (window.ParticleSystem) {
          window.ParticleSystem.damageNumber(this.x, this.y - 30, '🩸 血怒!', '#cc0000');
        }
      } else if (_bloodHpPct > this.stats.bloodRageThreshold && this._bloodRageActive) {
        this._bloodRageActive = false;
        if (this._bloodRageMod) {
          this._removeModifier(this._bloodRageMod);
          this._bloodRageMod = null;
        }
      }
    }

    // --- 暗影流派: 隐身机制 (受击后触发) ---
    if (this.stats.stealthDuration && this.stats.stealthCooldown) {
      if (this._stealthCooldownTimer > 0) {
        this._stealthCooldownTimer -= dt * 1000;
      }
      if (this._stealthActive) {
        this._stealthTimer -= dt * 1000;
        if (this._stealthTimer <= 0) {
          this._stealthActive = false;
          this._stealthDamageMult = 1;
          // Fire onStealthEnd conditional trigger
          if (this._skillManager && typeof this._skillManager.onStealthEnd === 'function') {
            this._skillManager.onStealthEnd();
          }
        }
      }
    }

    // --- Visual time accumulator ---
    this._visualTime += dt;
  }

  // ====================================================================
  //  Rendering
  // ====================================================================

  draw(ctx) {
    // 受击无敌：半透明闪烁，不再整架消失
    var invAlpha = 1;
    if (this.invincibleTimer > 0) {
      invAlpha = 0.75 + Math.sin(this._visualTime * 10) * 0.12;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = invAlpha;

    // --- Shadow stealth visual (semi-transparent when stealthed) ---
    if (this._stealthActive) {
      ctx.globalAlpha = 0.4 + Math.sin(this._visualTime * 6) * 0.1;
    }

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

    // --- Draw ship design ---
    {
      var s = 13;
      var design = ShipDesigns[this.factionId];
      if (design) {
        design(ctx, s, this.factionColor, this._visualTime);
      } else {
        ctx.fillStyle = this.factionColor;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(-s * 0.7, s * 0.8);
        ctx.lineTo(s * 0.7, s * 0.8);
        ctx.closePath();
        ctx.fill();
      }
    }

    // --- Invincibility ring (subtle) ---
    if (this.invincibleTimer > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.globalAlpha = 0.25 * invAlpha;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.hitboxRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
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

    // Apply faction core passive via SkillManager if available
    if (this._skillManager && typeof this._skillManager.applyFactionPassive === 'function') {
      this._skillManager.applyFactionPassive();
    }
  }

  /**
   * Link a SkillManager instance (called after SkillManager is created).
   * Also triggers faction passive if not yet applied.
   */
  linkSkillManager(sm) {
    this._skillManager = sm;
  }

  /**
   * Apply character stat modifiers on top of faction base stats.
   * Characters are selected before factions and modify base stats multiplicatively.
   * @param {string} characterId - 'vanguard' | 'ironWall' | 'agile'
   */
  applyCharacter(characterId) {
    var char = GAME_CONFIG.CHARACTERS[characterId];
    if (!char || !char.statModifiers) return;

    this.characterId = characterId;
    var mods = char.statModifiers;

    // Apply multiplicative modifiers to base stats
    if (mods.attack && mods.attack !== 1.0) {
      this._baseStats.attack = (this._baseStats.attack || 1.0) * mods.attack;
    }
    if (mods.hp && mods.hp !== 1.0) {
      this._baseStats.hp = (this._baseStats.hp || GAME_CONFIG.BALANCE.PLAYER_BASE_HP) * mods.hp;
    }
    if (mods.speed && mods.speed !== 1.0) {
      this._baseStats.speed = (this._baseStats.speed || GAME_CONFIG.BALANCE.PLAYER_BASE_SPEED) * mods.speed;
    }
    if (mods.critRate) {
      this._baseStats.critRate = (this._baseStats.critRate || 0) + mods.critRate;
    }
    if (mods.defense) {
      this._baseStats.defense = (this._baseStats.defense || 0) + mods.defense;
    }
    if (mods.dodgeChance) {
      this._baseStats.dodgeChance = (this._baseStats.dodgeChance || 0) + mods.dodgeChance;
    }

    // Set character color tint
    this.characterColor = char.color;

    this._recalculateStats();
  }

  /**
   * Apply permanent upgrades from UpgradeManager.
   * Only applies stat-based upgrades (attackPower, maxHp, moveSpeed).
   * @param {Object} upgradeLevels - { upgradeId: level, ... }
   */
  applyPermanentUpgrades(upgradeLevels) {
    if (!upgradeLevels) return;

    var upgrades = GAME_CONFIG.UPGRADES;
    var mods = [];

    // Attack Power: +10% per level
    if (upgradeLevels.attackPower > 0 && upgrades.attackPower.statMod) {
      mods.push(upgrades.attackPower.statMod(upgradeLevels.attackPower));
    }

    // Max HP: +15 per level
    if (upgradeLevels.maxHp > 0 && upgrades.maxHp.statMod) {
      mods.push(upgrades.maxHp.statMod(upgradeLevels.maxHp));
    }

    // Move Speed: +5% per level
    if (upgradeLevels.moveSpeed > 0 && upgrades.moveSpeed.statMod) {
      mods.push(upgrades.moveSpeed.statMod(upgradeLevels.moveSpeed));
    }

    if (mods.length > 0) {
      this.applyStatModifiers(mods);
    }
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

  /**
   * Add a single modifier and recalculate stats.
   * @param {Object} mod - { stat, op: 'multiply'|'add', value }
   */
  _addModifier(mod) {
    if (!mod) return;
    if (!this._modifiers[mod.stat]) {
      this._modifiers[mod.stat] = [];
    }
    this._modifiers[mod.stat].push(mod);
    this._recalculateStats();
  }

  /**
   * Remove a specific modifier and recalculate stats.
   * @param {Object} mod - The exact mod object to remove
   */
  _removeModifier(mod) {
    if (!mod || !this._modifiers[mod.stat]) return;
    var mods = this._modifiers[mod.stat];
    var idx = mods.indexOf(mod);
    if (idx !== -1) {
      mods.splice(idx, 1);
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

    // Armor penetration stat (default 0 if not set by faction/talent)
    if (s.armorPenetration === undefined) {
      s.armorPenetration = 0;
    }

    // Base lifesteal for sustain — always add global baseline on top of faction bonuses
    var baseLs = GAME_CONFIG.BALANCE.PLAYER_BASE_LIFESTEAL || 0.05;
    s.lifesteal = (s.lifesteal || 0) + baseLs;

    // Collision uses hitRadius (alias hitboxRadius)
    this.hitRadius = this.hitboxRadius;

    // Publish computed stats for other systems (weapons, skills, UI)
    this.stats = s;

    // --- Pull player-relevant values out of stats ---

    // HP — clamp so talents cannot drive maxHp/hp negative
    var oldMaxHp = this.maxHp;
    var baseHp = GAME_CONFIG.BALANCE.PLAYER_BASE_HP;
    var rawHp = (s.hp !== undefined) ? s.hp : baseHp;
    // Values <= 3 are treated as multipliers (e.g. 0.85 = 85% base HP)
    if (rawHp > 0 && rawHp <= 3) {
      rawHp = Math.floor(baseHp * rawHp);
    }
    this.maxHp = Math.max(30, Math.floor(rawHp));
    if (oldMaxHp > 0 && this.maxHp !== oldMaxHp) {
      var hpPct = Math.max(0, this.hp / oldMaxHp);
      this.hp = Math.floor(this.maxHp * hpPct);
    } else {
      this.hp = Math.max(0, Math.min(this.hp, this.maxHp));
    }
    if (this.hp <= 0) {
      this.hp = this.maxHp;
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

    // Shield timer (护盾流 passive)
    this.shieldTimerAmount = s.shieldTimerAmount || 0;

    // Vampire aura on-kill heal percent (吸血光环)
    // s.vampireAuraOnKill is read directly from stats in main.js handleEnemyKilled
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

    var rawAmount = amount;
    var afterDefense = amount;
    var afterRedirect = amount;
    var afterCap = amount;
    var afterShield = amount;

    // Counter: defense damage reduction
    if (this.stats.defense && this.stats.defense > 0) {
      amount = Math.floor(amount * (1 - Math.min(this.stats.defense, 0.8))); // cap at 80%
    }
    afterDefense = amount;

    // Mirror: damage redirect - chance to redirect damage away
    if (this.stats.damageRedirect && Math.random() < this.stats.damageRedirect) {
      amount = Math.floor(amount * 0.5); // redirect halves damage
      if (window.ParticleSystem) {
        ParticleSystem.spark(this.x, this.y);
      }
    }
    afterRedirect = amount;

    // Shadow: stealth trigger on hit (enter stealth when taking damage)
    if (this.stats.stealthDuration && this.stats.stealthCooldown) {
      if (!this._stealthActive && this._stealthCooldownTimer <= 0) {
        this._stealthActive = true;
        this._stealthTimer = this.stats.stealthDuration;
        this._stealthCooldownTimer = this.stats.stealthCooldown;
        this._stealthDamageMult = this.stats.stealthDamageBonus || 1.5;
        if (window.ParticleSystem) {
          ParticleSystem.damageNumber(this.x, this.y - 30, '🌑 隐身!', '#111166');
        }
      }
    }

    // Hard damage cap: no single hit should exceed 40% of max HP.
    // Enemies that call takeDamage() directly (explosions, latch, boss
    // reflection, etc.) bypass the per-enemy-type caps in playerTakeDamage()
    // in main.js.  This safety net prevents huge one-shots from those paths.
    var hardCap = Math.floor(this.maxHp * 0.4);
    if (amount > hardCap) amount = hardCap;
    afterCap = amount;

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
    afterShield = amount;

    // Remaining damage hits HP
    if (amount > 0) {
      this.hp -= amount;
      this.invincibleTimer = GAME_CONFIG.BALANCE.PLAYER_INVINCIBLE_MS;

      // Damage feedback effects
      ParticleSystem.damageNumber(this.x, this.y - 20, Math.round(amount), '#ff4444');
      ParticleSystem.screenFlash('rgba(255,50,50,0.15)', 120);
      game.addShake(3);
    } else if (rawAmount > 0 && wasShieldActive) {
      // Shield-only hits still need brief i-frames — otherwise laser / reflect / blood
      // can drain shield or HP one point per frame with no visible gap between hits.
      var shieldIFrame = GAME_CONFIG.BALANCE.PLAYER_SHIELD_INVINCIBLE_MS || 300;
      this.invincibleTimer = Math.max(this.invincibleTimer, shieldIFrame);
    }

    // Debug logging: trace the full damage pipeline
    if (window.DEBUG) {
      console.log('DAMAGE:', {
        raw: rawAmount,
        afterDefense: afterDefense,
        afterRedirect: afterRedirect,
        afterCap: afterCap,
        afterShield: afterShield,
        finalHp: this.hp,
        invTimer: this.invincibleTimer,
        maxHp: this.maxHp,
        shield: this.shield
      });
    }

    return this.hp > 0;
  }

  /**
   * Restore HP, capped at maxHp.
   * @param {number} amount
   */
  heal(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return;
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
