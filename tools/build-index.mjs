import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split(/\r?\n/);
const headStart = lines.slice(0, 12).join('\n');
const bodyStart = lines.findIndex((l) => l.trim() === '<body>');
const bodyEnd = lines.findIndex((l) => l.trim().startsWith('<!-- Loading screen'));

let body = lines.slice(bodyStart, bodyEnd).join('\n');

if (!body.includes('id="btn-season-pass"')) {
  body = body.replace(
    '<button class="menu-btn" id="btn-meta-shop">🛒 商店</button>',
    `<button class="menu-btn" id="btn-season-pass">🎫 赛季通行证</button>
    <button class="menu-btn" id="btn-meta-shop">🛒 商店</button>`
  );
}

if (!body.includes('id="season-pass-screen"')) {
  const seasonScreen = `
  <!-- Season Pass (免费) -->
  <div class="menu-screen" id="season-pass-screen" style="display:none">
    <div class="season-pass-header">
      <div class="season-pass-free-badge">100% 免费 · 无付费</div>
      <h1>🎫 赛季通行证</h1>
      <div class="subtitle">SEASON PASS</div>
      <div class="season-pass-progress">
        <div class="season-pass-progress-bar"><div class="season-pass-progress-fill" id="season-pass-bar-fill"></div></div>
        <div class="season-pass-stats">
          <span>等级 <b id="season-pass-level">1</b></span>
          <span>赛季经验 <b id="season-pass-xp">0</b></span>
        </div>
      </div>
    </div>
    <div id="season-pass-list"></div>
    <button class="menu-btn" id="btn-back-from-season" style="margin-top:16px">返回</button>
  </div>
`;
  body = body.replace('  <!-- Settings (设置) -->', `${seasonScreen}\n  <!-- Settings (设置) -->`);
}

const out = `${headStart}
</head>
${body}
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`;

fs.writeFileSync('index.html', out);
