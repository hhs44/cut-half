# 切一半 — 道具系统（ITEMS-DESIGN）

> 适用版本：v0.4（MVP）
> 核心原则：**道具只为玩家保留 1 次机会，不增加游戏难度**。

---

## 1. 道具总览（MVP 2 个 + M4 4 个）

| ID | 中文名 | 触发场景 | 效果 | 解锁时机 | 所属阶段 |
|----|--------|---------|------|---------|---------|
| `undo` | 撤回（撤销一刀） | 切失败后 + 剩余刀 ≥ 1 | 恢复最后一刀 → 玩家可再拖再切 | 默认拥有 | MVP v0.4 |
| `recut` | 重切（重切一刀） | 切失败后 + 剩余刀 = 0 | 补一刀 → 延长生命，避免直接 GameOver | 默认拥有 | MVP v0.4 |
| `hint` | 精确提示 | 任意失败 | 临时高亮中心线 ±2% 区域 2 秒 | M4 解锁 | M4 |
| `slowmo` | 慢动作 | 拖动切割线时 | 动画减速 50%（0.5x）3 秒 | 通关第 5 关解锁 | M4 |
| `shield` | 免死金牌 | 任意失败 | 直接跳过本局判定 → 视作通关（标记 "★"） | 关卡 10 解锁 | M4 |
| `timer-saver` | 时间储蓄 | 在倒计时结束前点击 | 把剩余时间转化为下一关 bonus（简化为装饰） | 关卡 8 解锁 | M4 |

**注意**：M4 道具在 v0.4 中**未实现**。本文档记录的是 M4 设计；实现时将在 `items/ItemManager.ts` 的 `useItem()` switch 中新增分支。

---

## 2. 道具触发条件 & 可用性矩阵

| 情景 | 剩余刀数 | `undo` | `recut` |
|------|---------|--------|---------|
| 切到完美 50% | — | ❌（隐藏） | ❌（隐藏） |
| 切到 45-49 或 51-55 | ≥ 1 | ✅（3 秒倒计时） | ❌（不需要——还有刀） |
| 切到 45-49 或 51-55 | 0 | ❌（没刀可撤销） | ✅（3 秒倒计时，补 1 刀） |
| 切到 ≥40 或 ≥60（差距大） | ≥ 1 | ✅（建议玩家撤销重来） | ❌ |
| 切到 ≥40 或 ≥60 | 0 | ❌ | ✅（补刀） |

**规则口诀**：
- **还有刀 → 只能 undo**（撤销重来）
- **没刀 → 只能 recut**（再给你一刀）
- **完美 → 两个都隐藏**（不需要）

---

## 3. 3 秒倒计时机制

```
玩家切失败 → FailScene 打开
│
├─ ItemManager.emit(ItemEvent.Available, { undo:true, recut:false })
│
├─ ItemManager.startCountdown(3)
│   ├─ tick(3) → ItemEvent.CountdownTick(sec=3)
│   ├─ tick(2) → ItemEvent.CountdownTick(sec=2)
│   ├─ tick(1) → ItemEvent.CountdownTick(sec=1)
│   └─ tick(0) → ItemEvent.Expired → 进入 GameOver
│
└─ 玩家在倒计时内点击道具按钮
       │
       ├─ ItemManager.useItem('undo') → 消耗库存 = 1 → emit(ItemEvent.Used, 'undo')
       │                              → emit(GameEvent.Reset)
       │                              → GameManager._knives += 0（undo 不消耗刀）
       │                              → SceneRouter.navigateTo('GameScene')
       │
       └─ ItemManager.useItem('recut') → emit(ItemEvent.Used, 'recut')
                                    → GameManager._knives += 1（补一刀）
                                    → SceneRouter.navigateTo('GameScene')
```

**技术要点**：
- ItemManager 用 `scheduleOnce(..., 1)` 驱动每秒 tick。
- 玩家点按钮时调用 `unschedule(...)` 停止倒计时。
- ItemEvent.Expired 由 FailSceneUI 监听 → 展示「时间到！」Toast → 2 秒后跳转 GameOverScene。

---

## 4. 库存模型（MVP 简化版）

```ts
// ItemManager.ts — 实际代码（简化）
export class ItemManager extends Component {
    undoUsed: boolean = false;      // MVP：undo 每局用 1 次
    recutUsed: boolean = false;     // MVP：recut 每局用 1 次
    // 没有金币、没有道具数量上限——MVP 保持极简
}
```

**M4 版本（未实现）**：
```ts
// M4 计划：改成 Map 存数量
private _inventory: Map<string, number> = new Map([
    ['undo', 3],
    ['recut', 2],
    ['hint', 0],       // M4 解锁前为 0
    ['slowmo', 0],
    ['shield', 0],
    ['timer-saver', 0],
]);
```

---

## 5. 视觉与交互规范

| 元素 | 设计规范 |
|------|---------|
| 道具按钮（ItemSlot） | 圆角 24px，56×56 px；图标 emoji 🎯/♻️/💡/⏱️/🛡️/⏳ |
| 倒计时胶囊 | 橙色背景 + 白色数字 + "剩余 N 秒"，位置 FailScene 右侧或底部居中 |
| 倒计时圆环 | 橙色描边，随秒数收缩；可选替代胶囊 |
| 道具提示 Toast | "切得再准一点哦～" — emoji 风格，不超过 2 行，2 秒自动消失 |
| 失效状态 | 倒计时结束后按钮变灰 + opacity 0.4 + disabled |
| 使用动画 | 点击道具后按钮淡出 → 场景滑回 GameScene → 0.3s 过渡 |

---

## 6. 事件接口参考

### 6.1 ItemManager 发射的事件

在 `ItemManager.ts` 中：

```ts
export const ItemEvent = {
    Available: 'item-available',
    CountdownTick: 'item-countdown-tick',
    Expired: 'item-expired',
    Used: 'item-used',
};
```

| 事件 | 监听者 | 处理逻辑 |
|------|--------|---------|
| `ItemEvent.Available` | `FailSceneUI` | 显示对应 ItemSlot 按钮（从 inactive → active） |
| `ItemEvent.CountdownTick` | `FailSceneUI` → `CountdownPill` / `CountdownRing` | 更新数字显示 |
| `ItemEvent.Expired` | `FailSceneUI` | Toast "时间到！" + 2s 后 → GameOverScene |
| `ItemEvent.Used` | `FailSceneUI` | 按钮淡出动画 → 导航回 GameScene |

### 6.2 ItemManager 监听的事件

| 事件 | 触发来源 | 处理逻辑 |
|------|---------|---------|
| `GameEvent.JudgeResult` | `GameManager` | pass=true → `_resetAll()`（按钮隐藏）<br>pass=false → `_showItems(knives)`（显示对应按钮 + 开倒计时） |
| `GameEvent.Reset` | 任意（道具使用/新局） | `_resetAll()` — 清空倒计时 + 标记未使用 |
| `GameEvent.GameOver` | `GameManager` | `_resetAll()` — GameOver 不展示道具 |

---

## 7. 核心文件位置

| 文件 | 职责 |
|------|------|
| [`items/ItemManager.ts`](file:///Users/huanghaoshu/apps/切一半/cocos-project/assets/scripts/items/ItemManager.ts) | 道具库存 + 倒计时 + 事件桥接 |
| [`ui/components/ItemSlot.ts`](file:///Users/huanghaoshu/apps/切一半/cocos-project/assets/scripts/ui/components/ItemSlot.ts) | 可复用道具按钮（图标 + emoji + 可用性切换） |
| [`ui/components/CountdownPill.ts`](file:///Users/huanghaoshu/apps/切一半/cocos-project/assets/scripts/ui/components/CountdownPill.ts) | 橙色胶囊倒计时显示 |
| [`ui/components/CountdownRing.ts`](file:///Users/huanghaoshu/apps/切一半/cocos-project/assets/scripts/ui/components/CountdownRing.ts) | 圆环式倒计时（视觉备选） |
| [`ui/scenes/FailSceneUI.ts`](file:///Users/huanghaoshu/apps/切一半/cocos-project/assets/scripts/ui/scenes/FailSceneUI.ts) | 失败场景：绑定道具 + 监听 Item 事件 |
| [`core/GameConfig.ts`](file:///Users/huanghaoshu/apps/切一半/cocos-project/assets/scripts/core/GameConfig.ts) | 道具 ID 常量（`ITEM = { UNDO:'undo', RECUT:'recut' }`） |

---

## 8. M4 道具扩展计划（未实现，仅记录）

### 8.1 hint（精确提示）
- **用法**：失败后点击 → 回到 GameScene → 接下来 2 秒，cutLine 进入 ±2% 范围时立即变金色（near=true）。
- **实现思路**：`ItemManager.useItem('hint')` → `GameManager.setHintEnabled(true, 2000)` → `CutLine` 在拖动时若 `hintEnabled && near` → 切换 spriteFrame 为金色高亮。

### 8.2 slowmo（慢动作）
- **用法**：拖动切割线期间按下 → 3 秒内 `director.getAnimationManager().setSpeed(0.5)`。
- **风险**：可能影响 BGM 节奏；需验证 Cocos `AnimationManager.setSpeed` 对 `AudioSource` 是否生效。若不生效，改成对 CutLine 动画单独 slow。

### 8.3 shield（免死金牌）
- **用法**：失败后点击 → 直接 ResultScene，标记 `★`（非完美通关）。
- **设计意图**：给高压力关卡一个容错；平衡「通关」与「完美通关」的成就感差异。

### 8.4 timer-saver（时间储蓄）
- **用法**：点击后剩余时间 → 下一关 +0.5 刀（装饰）。
- **简化设计**：MVP 没有时间压力，本道具仅作为 M4 装饰存在。如果后续加入「限时模式」，再补齐真正机制。

### 8.5 激励视频接入点（M5）
- 在 `ItemManager.useItem('recut')` 分支替换为：
  ```ts
  if (sys.platform === 'wechatgame') {
      this._showRewardedAd(() => {
          // 视频看完 → 真正 +1 刀
          GameManager.instance.giveKnife(1);
          SceneRouter.navigateTo('GameScene');
      });
  }
  ```

---

## 9. 道具扩展实现 Checklist

新增任意一个道具需做的事情：

- [ ] 在 `core/GameConfig.ts` 的 `ITEM` 对象加一行常量
- [ ] 在 `items/ItemManager.ts` 的 `useItem(itemId)` 加 `case 'newItem': ... break;`
- [ ] 如果有倒计时副作用：在 `_resetAll()` 中加对应清理逻辑
- [ ] 在 `FailSceneUI.ts` 中新增一个 ItemSlot 节点并绑定
- [ ] 在 `ui/components/ItemSlot.ts` 中可复用；如需特殊 UI 就新写一个 component
- [ ] 更新本文档（`docs/ITEMS-DESIGN.md`）第 1 节总览 + 第 7 节文件表
- [ ] 在 `decisions.md` 中记录"新增道具 X 的权衡"（如果是重要决策）
- [ ] 跑一次 `npx tsc --noEmit -p cocos-project/tsconfig.json` 确认无类型错误

---

*最后更新：2026-06-04 — 同步 MVP 道具逻辑；M4 扩展计划为设计草稿。*
