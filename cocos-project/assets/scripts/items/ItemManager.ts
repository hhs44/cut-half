/**
 * ItemManager — 道具系统（纯逻辑，事件驱动 UI）
 *
 * 当前 MVP 支持：
 *   - undo: 撤销上一刀（+1 刀），失败弹窗可点
 *   - recut: 再切一刀（+1 刀），失败弹窗可点
 *
 * 每个道具被点击后会启动 **3 秒倒计时**。
 *   - 若玩家完成一次成功切割 → 消耗道具（由 GameManager 内部处理）
 *   - 倒计时结束 → 自动撤销（自动用掉道具，视作"玩家没来得及切"）
 *
 * 发出的事件：
 *   - 'item-available': { itemId, owned } — 道具槽更新
 *   - 'item-countdown-tick': { itemId, sec }
 *   - 'item-expired': { itemId }
 *   - 'item-used': { itemId }
 */

import { _decorator, Component, Node, sys } from 'cc';
import { GameEvent, gameEventTarget } from '../core/GameManager';
import { ITEM, ItemId } from '../core/GameConfig';
import { Logger } from '../utils/Logger';
const { ccclass } = _decorator;

export const ItemEvent = {
    Available: 'item-available',
    CountdownTick: 'item-countdown-tick',
    Expired: 'item-expired',
    Used: 'item-used',
};

type Timer = { itemId: ItemId; remaining: number; interval: number | null };

@ccclass('ItemManager')
export class ItemManager extends Component {
    private static _instance: ItemManager | null = null;
    public static get instance(): ItemManager { return ItemManager._instance!; }

    private _timers: Timer[] = [];

    onLoad() {
        if (ItemManager._instance && ItemManager._instance !== this) {
            Logger.warn('ItemManager', '重复实例被销毁');
            this.node.destroy();
            return;
        }
        ItemManager._instance = this;
        Logger.info('ItemManager', '单例初始化完成，订阅 JudgeResult / GameOver / Reset');

        // 每次判定后：如果失败 → 显示可用道具；胜利/结束 → 隐藏
        gameEventTarget.on(GameEvent.JudgeResult, (data: any) => this._onJudge(data), this);
        gameEventTarget.on(GameEvent.GameOver, () => this._resetAll(), this);
        gameEventTarget.on(GameEvent.Reset, () => this._resetAll(), this);
    }

    onDestroy() {
        Logger.info('ItemManager', '组件销毁，取消事件订阅');
        gameEventTarget.off(GameEvent.JudgeResult, this._onJudge, this);
        gameEventTarget.off(GameEvent.GameOver, () => this._resetAll(), this);
        gameEventTarget.off(GameEvent.Reset, () => this._resetAll(), this);
        this._clearAllTimers();
    }

    /** 让失败场景调用：标记 undo / recut 可被玩家点击 */
    private _onJudge(data: { pass: boolean; gameOver?: boolean }) {
        Logger.info('ItemManager', `_onJudge: pass=${data.pass} gameOver=${data.gameOver}`);
        if (data.pass || data.gameOver) {
            this._emitAvailable(ITEM.UNDO, false);
            this._emitAvailable(ITEM.RECUT, false);
            this._clearAllTimers();
            return;
        }
        // 失败但还有刀数 → 可点击这两个道具
        this._emitAvailable(ITEM.UNDO, true);
        this._emitAvailable(ITEM.RECUT, true);
        // 启动 3 秒倒计时（共用一个倒计时视觉）
        this._startCountdownTick();
    }

    private _resetAll() {
        Logger.info('ItemManager', '_resetAll: 所有道具归位');
        this._emitAvailable(ITEM.UNDO, false);
        this._emitAvailable(ITEM.RECUT, false);
        this._clearAllTimers();
    }

    /** 玩家点击道具槽后调用 */
    public useItem(itemId: ItemId) {
        Logger.info('ItemManager', `使用道具: ${itemId}`);
        this._emitAvailable(itemId, false); // 消费 → 不可再点

        // 触发 GameManager 逻辑
        if (itemId === ITEM.UNDO) {
            // undo: 让 GameManager 撤销上一刀
            Logger.info('ItemManager', 'emit GameEvent.Reset (undo)');
            gameEventTarget.emit(GameEvent.Reset);
            // 由 GameSceneUI 订阅 Reset → 重置物体与切割线
        } else if (itemId === ITEM.RECUT) {
            // recut: 额外 +1
            Logger.info('ItemManager', 'emit item-recut-granted');
            gameEventTarget.emit('item-recut-granted');
        }

        gameEventTarget.emit(ItemEvent.Used, { itemId });
        this._clearAllTimers();
    }

    private _emitAvailable(itemId: ItemId, owned: boolean) {
        Logger.debug('ItemManager', `emit ItemAvailable: ${itemId} owned=${owned}`);
        gameEventTarget.emit(ItemEvent.Available, { itemId, owned });
    }

    private _startCountdownTick() {
        this._clearAllTimers();
        let sec = 3;
        Logger.info('ItemManager', `启动 3 秒道具倒计时`);
        gameEventTarget.emit(ItemEvent.CountdownTick, { sec });
        const interval = setInterval(() => {
            sec -= 1;
            if (sec <= 0) {
                clearInterval(interval);
                Logger.info('ItemManager', '道具倒计时结束，emit Expired');
                gameEventTarget.emit(ItemEvent.CountdownTick, { sec: 0 });
                gameEventTarget.emit(ItemEvent.Expired, {});
                return;
            }
            gameEventTarget.emit(ItemEvent.CountdownTick, { sec });
        }, 1000);
        this._timers.push({ itemId: 'undo', remaining: sec, interval: interval as unknown as number });
    }

    private _clearAllTimers() {
        for (const t of this._timers) {
            if (t.interval) clearInterval(t.interval);
        }
        if (this._timers.length > 0) {
            Logger.debug('ItemManager', `清理 ${this._timers.length} 个倒计时 timer`);
        }
        this._timers = [];
    }
}
