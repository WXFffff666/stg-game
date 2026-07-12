# STG v2 全量重构方案（已实施基线）

## 语言选型：TypeScript（非 Rust）

| 方案 | CF Pages 部署 | 浏览器性能 | 维护成本 | 结论 |
|------|---------------|------------|----------|------|
| **TypeScript + Vite** | 静态 dist/ | 高（优化后等同原生 JS） | 低 | **选用** |
| Rust → WASM | 静态 .wasm | 计算快但 Canvas 绘制需 JS 桥接，整体未必更快 | 高 | 不选 |
| 纯 Rust 服务端 | 需 Worker | 不适用本游戏 | — | 不选 |

**说明**：CF Pages 只托管静态文件，游戏在**用户浏览器**运行。Rust 编译的 WASM 仍需 JS 调用 Canvas API，每帧数百次 FFI 调用反而可能更慢。TypeScript 编译为 JS 后性能与现网一致，但具备模块化和构建优化。

## 架构

```
Vite build → dist/ → Wrangler pages deploy dist/
├── 代码分包：game-config / game-enemies / game-core / game-main
├── PWA：vite-plugin-pwa（Workbox，非 CF Worker）
├── 引擎补丁：src/engine/balance.ts + bootstrap.ts
├── 赛季通行证：src/features/season-pass.ts（100% 免费）
└── 游戏逻辑：src/legacy/*（原 js/ 迁入，逐步 TS 化）
```

## 约束（用户要求）

- ✅ 仅 CF Pages
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

## 后续（同语言内迭代）

1. 将 legacy/*.js 逐文件改写为 .ts 模块
2. config 拆为 JSON 懒加载
3. 绘制层合并、OffscreenCanvas 背景
4. 用户点名的功能批次（成就、每日、量子流派等）
