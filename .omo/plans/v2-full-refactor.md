# STG v2 全量重构方案（已完成）

## 语言选型：TypeScript（非 Rust）

| 方案 | CF Pages 部署 | 浏览器性能 | 维护成本 | 结论 |
|------|---------------|------------|----------|------|
| **TypeScript + Vite** | 静态 dist/ | 高（优化后等同原生 JS） | 低 | **选用** |
| Rust → WASM | 静态 .wasm | Canvas 需 JS 桥接 | 高 | 不选 |

## 架构

```
Vite build → dist/ → Wrangler pages deploy dist/
├── 代码分包：game-config / game-enemies / game-core / game-main
├── PWA：vite-plugin-pwa（Workbox，非 CF Worker）
├── 引擎补丁：src/engine/balance.ts + bootstrap.ts
├── 赛季通行证：src/features/season-pass.ts（100% 免费）
└── 游戏逻辑：src/legacy/*（唯一源码，已删除根 js/）
```

## 约束（用户要求）

- ✅ 仅 CF Pages 纯静态
- ✅ 无 Cloudflare Worker / KV / R2
- ✅ 全免费
- ✅ 赛季通行证（免费）
- ❌ 导弹预览（不做）
- ❌ 云端排行（需后端）

## 平衡调整（balance.ts）

- 后期难度缩放 0.08 → 0.05
- Boss 递增 12% → 8%，上限 4×
- 导弹每帧发射上限 4
- 融合武器伤害系数 0.88

## 审计修复（v2.0.0 收尾）

| 项 | 处理 |
|----|------|
| 双份 `js/` 与 `src/legacy/` | 删除根 `js/`，以 legacy 为唯一源码 |
| 根 `sw.js` / `_headers` | 删除；PWA 与头文件走 `public/` + 构建产物 |
| `#ui-overlay` 缺失 | index.html 添加 + ui.js `_getUiOverlay()` |
| 融合确认 append/remove 不一致 | 统一挂载到 ui-overlay |
| CI `build-index.mjs` 破坏 HTML | 移除，改为 `npm run verify` |
| manifest 被 Vite hash | 改由 main.ts 动态注入 |
| 版本号 | index.html `v2.0.0` |
| tools 路径 | 指向 `src/legacy/` |

## 验证

```bash
npm run verify   # 模块、DOM、赛季钩子、无重复目录
npm run build
npm run preview
```

## 后续（同语言内迭代）

1. 将 legacy/*.js 逐文件改写为 .ts 模块
2. config 拆为 JSON 懒加载
3. 绘制层合并、OffscreenCanvas 背景
4. 回放、成就、每日任务、量子流派等扩展功能
