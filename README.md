# 🎮 星域战机 (Star Domain STG)

> HTML5 Canvas 弹幕飞行射击游戏 | 无尽波次 | 87流派 × 200+技能 × 50+武器 × 融合系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-HTML5-orange.svg)]()

🕹️ **在线试玩**: [https://game1.the37777777.top](https://game1.the37777777.top)

**当前版本：v2.0.0** — TypeScript + Vite 全量重构，Cloudflare Pages 纯静态部署。

---

## 🎯 游戏特色

### 87 种流派
每个流派拥有核心被动、3 个专属技能、终极被动；缺失配置的流派会在运行时自动补全。

### 天赋树（3 通用 + 2 流派专属）
- **战斗 / 生存 / 功能** 三条通用主干
- **流派攻击链 / 流派终极链** 随所选流派变色联动

### 武器升级与融合
- 重复选择同一武器可升级至 **Lv.8**（里程碑 3/5/8）
- 两把武器 Lv.5+ 消耗融合核心可融合进化
- 技能融合、商店/波次奖励/升级三选一 统一升级轨道

### 赛季通行证（v2 新增，100% 免费）
- 主菜单「赛季通行证」入口
- 对局结束自动结算赛季经验
- 无付费、无内购，纯本地进度

### 性能优化
- 单 RAF 游戏循环（HUD 降频更新）
- 追踪弹共享寻敌 + 碰撞空间网格
- 导弹/爆炸对象池与拖尾降频
- 低性能模式自动降级
- Vite 代码分包（config / enemies / core / main）

### 敌人系统
- 16+ 敌人类型、4 种 BOSS
- 波次制：每 5 关精英波，每 10 关 BOSS

---

## 🚀 快速开始

### 开发

```bash
npm install
npm run dev
# 浏览器打开 http://localhost:5173
```

### 构建与校验

```bash
npm run verify   # 迁移完整性检查
npm run build    # 输出 dist/
npm run preview  # 预览 dist/
```

### 本地静态服务（构建后）

```bash
npm run build
npm run preview   # 预览 dist/，默认 http://localhost:4173
```

---

## 🎮 操作说明

| 操作 | 按键 |
|------|------|
| 移动战机 | 鼠标移动 / 触摸滑动 |
| 射击 | 自动 |
| 暂停/恢复 | `P` 或 `ESC` |
| 全屏切换 | `F` |
| 选择技能 | 点击技能卡片 |

---

## 📁 项目结构（v2）

```
stg-game/
├── index.html              # 精简 HTML 壳（DOM + Vite 入口）
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   ├── manifest.json       # PWA 清单
│   ├── icon.svg
│   └── _headers            # Cloudflare Pages 缓存头
├── src/
│   ├── main.ts             # 入口：样式、legacy 模块、引擎补丁
│   ├── loading.ts
│   ├── engine/
│   │   ├── balance.ts      # 平衡参数补丁
│   │   └── bootstrap.ts    # 性能启动补丁
│   ├── features/
│   │   └── season-pass.ts  # 免费赛季通行证
│   ├── styles/
│   │   ├── main.css
│   │   └── season-pass.css
│   └── legacy/             # 游戏逻辑（原 js/，19 个模块）
│       ├── config.js       # 数据配置
│       ├── core.js         # 引擎循环/碰撞/Canvas
│       ├── main.js         # 集成入口
│       └── …
├── tools/
│   ├── verify-migration.mjs
│   ├── verify-content-ext.mjs
│   └── validate-factions.js
└── wrangler.toml             # Cloudflare Pages 本地预览（可选）
```

> **注意**：v1 的 `js/` 与根目录 `sw.js` 已移除。Service Worker 由 `vite-plugin-pwa` 在构建时生成至 `dist/sw.js`。

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 构建 | TypeScript 5 · Vite 6 · vite-plugin-pwa |
| 运行时 | HTML5 Canvas 2D · Web Audio API · localStorage |
| 部署 | Cloudflare Pages（纯静态 `dist/`，无 Worker） |
| 游戏逻辑 | `src/legacy/*.js`（逐步 TS 化） |

---

## 📊 游戏数据

| 类别 | 数量 |
|------|------|
| 流派 | 87（配置驱动，部分自动补全） |
| 技能 | 200+ |
| 武器/弹道 | 50+ |
| 敌人类型 | 16+ |
| BOSS | 4 |

---

## ✅ v2 功能迁移清单

| 功能 | 状态 |
|------|------|
| 主菜单 / 开始游戏 | ✅ |
| 每日挑战 / 无尽 / 挑战模式 | ✅ |
| 角色选择 / 天赋树 | ✅ |
| 图鉴 / 元商店 / 排行榜 | ✅ |
| 设置 / 重置数据 | ✅ |
| 对局 HUD / 暂停 / 局内商店 | ✅ |
| 升级三选一 / 波次商店 | ✅ |
| 武器融合 / 背包 | ✅ |
| 教程 / 倒计时 | ✅ |
| 结算 / 分享 | ✅ |
| 赛季通行证（免费） | ✅ v2 新增 |
| PWA 离线缓存 | ✅ Workbox |
| 性能补丁（导弹/碰撞/HUD） | ✅ |
| 回放 / 成就 / 每日任务扩展 | ⏳ 后续迭代 |

运行 `npm run verify` 可自动检查模块、DOM、赛季钩子与目录结构。

---

## 🌐 Cloudflare Pages 部署（推荐）

> v2 是 **Vite 项目**，必须先 `npm run build` 生成 `dist/`，**不能只上传仓库根目录**。  
> 若控制台出现 `main.ts` MIME 为 `video/mp2t`，说明部署了源码而非 `dist/`。

### 在 CF 控制台连接 GitHub（无需 GitHub API Token）

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择仓库 `WXFffff666/stg-game`
3. 构建设置：

| 配置项 | 值 |
|--------|-----|
| Production branch | `master` |
| Framework preset | **Vite**（或 None） |
| Build command | `npm ci && npm run build` |
| Build output directory | **`dist`** |
| Environment variable | `NODE_VERSION` = `20` |

4. **Save and Deploy**，等构建日志显示成功

5. 自定义域名：项目 → **Custom domains** → 添加 `game1.the37777777.top`

### 手动上传（不连 Git）

```bash
npm install
npm run build
```

CF → **Upload assets** → 只拖入 **`dist` 文件夹里的内容**（含 `index.html`、`assets/`、`sw.js`）。

### 本地 Wrangler 上传

```bash
npm run build
npx wrangler login
npx wrangler pages deploy dist --project-name=stg-game
```

### 故障排查

| 现象 | 原因 | 解决 |
|------|------|------|
| `main.ts` MIME `video/mp2t` | 部署了源码 | 输出目录改为 **`dist`** |
| 界面无样式、按钮无效 | JS/CSS 未加载 | 同上，确认构建成功 |
| `kaspersky-labs.com` 404 | 杀毒插件注入 | 可忽略，或换浏览器试 |
| `cloudflareinsights` blocked | 广告拦截插件 | 可忽略 |

---

## 📝 License

MIT

---

**Enjoy the bullet hell! 🎆**
