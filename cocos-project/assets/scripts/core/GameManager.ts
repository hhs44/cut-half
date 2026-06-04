/**
 * GameManager — 全局游戏逻辑（单例；通过事件与 UI 交互，不直接调 UI）
 *
 * 状态机：
 *   IDLE → CUTTING → JUDGING → [WIN | FAIL]
 *
 * 事件（订阅：gameEventTarget.on(GameEvent.X, fn, this)）：
 *   - KnivesChanged: { remaining, max }
 *   - RatioChanged: { ratio }
 *   - JudgeResult: { pass, ratio }
 *   - CutAnimationRequested: { objectNode, cutLineY, ratio }
 *   - CutAnimationDone: { ratio }
 *   - GameOver: {}
 *   - Reset: {}
 *
 * 注意：本文件**不**做任何 UI 操作；只改变状态，发事件。
 */

import { _decorator, Component, Node, sys } from 'cc';
import { computeRatio, isPerfectCut, isNearTarget, selfCheckPerfect } from './CutValidator';
import { KNIVES, COUNTDOWN } from './GameConfig';
import { Logger } from '../utils/Logger';
const { ccclass, property } = _decorator;

export const GameEvent = {
    KnivesChanged: 'gm-knives-changed',
    RatioChanged: 'gm-ratio-changed',
    JudgeResult: 'gm-judge-result',
    CutAnimationRequested: 'gm-cut-animation-requested',
    CutAnimationDone: 'gm-cut-animation-done',
    GameOver: 'gm-game-over',
    Reset: 'gm-reset',
};

/** 全局事件中心（单例） */
export const gameEventTarget: Node = new Node('__GameEventTarget__');

type State = 'IDLE' | 'CUTTING' | 'JUDGING' | 'WIN' | 'FAIL';

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;
    public static get instance(): GameManager { return GameManager._instance!; }

    private _state: State = 'IDLE';
    private _knives: number = KNIVES.MAX;
    private _objectHeight: number = 240;  // 默认 240px；由场景赋值

    onLoad() {
        if (GameManager._instance && GameManager._instance !== this) {
            Logger.warn('GameManager', '重复实例被销毁');
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        Logger.info('GameManager', '单例初始化完成，初始刀数:', KNIVES.MAX);

        // 自检：确保数学正确
        if (!selfCheckPerfect()) {
            Logger.warn('GameManager', '自检失败：computeRatio(120,240)!==50');
        } else {
            Logger.info('GameManager', '自检通过：50% 命中数学模型正确');
        }
    }

    /** 场景告知物体高度 */
    public setObjectHeight(h: number) {
        const prev = this._objectHeight;
        this._objectHeight = Math.max(1, Math.round(h));
        Logger.info('GameManager', `物体高度变更: ${prev} -> ${this._objectHeight}`);
    }

    /** 当玩家移动切割线 — 由 GameSceneUI 调用 */
    public onCutLineMoved(cutLineY: number) {
        if (this._state !== 'IDLE' && this._state !== 'CUTTING') {
            Logger.warn('GameManager', `忽略切割线移动，当前状态: ${this._state}`);
            return;
        }
        if (this._state !== 'CUTTING') {
            Logger.info('GameManager', `进入 CUTTING 状态，cutLineY=${cutLineY}`);
            this._state = 'CUTTING';
        }
        const ratio = computeRatio(cutLineY, this._objectHeight);
        Logger.debug('GameManager', `cutLineY=${cutLineY} ratio=${ratio}%`);
        gameEventTarget.emit(GameEvent.RatioChanged, { ratio, near: isNearTarget(ratio) });
    }

    /** 玩家按下"切"按钮 — 由 GameSceneUI 调用 */
    public requestCut(cutLineY: number, objectNode: Node) {
        if (this._state === 'WIN' || this._state === 'JUDGING') {
            Logger.warn('GameManager', `忽略切请求，当前状态: ${this._state}`);
            return;
        }

        this._knives -= 1;
        Logger.info('GameManager', `收到切请求，扣刀后剩余: ${this._knives}，cutLineY=${cutLineY}`);
        gameEventTarget.emit(GameEvent.KnivesChanged, { remaining: this._knives, max: KNIVES.MAX });

        const ratio = computeRatio(cutLineY, this._objectHeight);
        this._state = 'JUDGING';
        Logger.info('GameManager', `进入 JUDGING，计算比例 ratio=${ratio}%`);

        // 请求播放切割动画 → 动画完成后再判定
        gameEventTarget.emit(GameEvent.CutAnimationRequested, {
            objectNode, cutLineY, ratio,
        });

        // 动画完成事件由 CutAnimator 触发；本单例也订阅一次
        const handler = () => {
            Logger.info('GameManager', `收到 CutAnimationDone，开始判定 ratio=${ratio}%`);
            gameEventTarget.off(GameEvent.CutAnimationDone, handler, this);
            this._doJudge(ratio);
        };
        gameEventTarget.on(GameEvent.CutAnimationDone, handler, this);
    }

    private _doJudge(ratio: number) {
        const pass = isPerfectCut(ratio);
        if (pass) {
            this._state = 'WIN';
            Logger.info('GameManager', `判定 PASS ratio=${ratio}% -> 通关`);
            gameEventTarget.emit(GameEvent.JudgeResult, { pass: true, ratio });
        } else {
            if (this._knives <= 0) {
                this._state = 'FAIL';
                Logger.warn('GameManager', `判定 FAIL ratio=${ratio}%，剩余刀数 ${this._knives}，游戏结束`);
                gameEventTarget.emit(GameEvent.JudgeResult, { pass: false, ratio, gameOver: true });
                gameEventTarget.emit(GameEvent.GameOver);
            } else {
                this._state = 'IDLE';
                Logger.info('GameManager', `判定 FAIL ratio=${ratio}%，剩余 ${this._knives} 刀，返回 IDLE`);
                gameEventTarget.emit(GameEvent.JudgeResult, { pass: false, ratio, gameOver: false });
            }
        }
    }

    /** 撤销上一刀（道具） — 加回一把刀，状态重置到 IDLE */
    public undoLastCut() {
        if (this._knives >= KNIVES.MAX) {
            Logger.warn('GameManager', `忽略 undoLastCut：当前刀数已达上限 ${KNIVES.MAX}`);
            return;
        }
        this._knives += 1;
        this._state = 'IDLE';
        Logger.info('GameManager', `执行 undoLastCut，刀数恢复到 ${this._knives}`);
        gameEventTarget.emit(GameEvent.KnivesChanged, { remaining: this._knives, max: KNIVES.MAX });
        gameEventTarget.emit(GameEvent.Reset);
    }

    /** 再切一刀（道具） — 额外赠送一刀 */
    public grantExtraKnife() {
        this._knives += 1;
        this._state = 'IDLE';
        Logger.info('GameManager', `执行 grantExtraKnife，新刀数: ${this._knives}`);
        gameEventTarget.emit(GameEvent.KnivesChanged, { remaining: this._knives, max: KNIVES.MAX });
        gameEventTarget.emit(GameEvent.Reset);
    }

    /** 开始/重置一局 */
    public startRound() {
        this._knives = KNIVES.MAX;
        this._state = 'IDLE';
        Logger.info('GameManager', `startRound：重置刀数=${KNIVES.MAX}，进入 IDLE`);
        gameEventTarget.emit(GameEvent.KnivesChanged, { remaining: this._knives, max: KNIVES.MAX });
        gameEventTarget.emit(GameEvent.Reset);
    }

    public get knives(): number { return this._knives; }
    public get state(): State { return this._state; }
}
