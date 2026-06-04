/**
 * CutLine — 切割线（白色发光 + 两端圆点 + 拖动整数吸附 + 接近 50% 变金色）
 *
 * 对外：
 *   - getCutY(): 切割线在物体本地坐标系内的 Y（整数像素）
 *   - onCutLineChanged: (y: number) => void 回调（给 GameSceneUI 订阅）
 *   - setNearTarget(on): 接近 50% 时切金色，否则白色
 *   - reset(): 归位到正中
 *
 * 交互：拖动 cutLineNode 上下移动，约束在物体范围内。
 */

import { _decorator, Component, EventTouch, Node, Sprite, UITransform, Vec3 } from 'cc';
import { COLOR } from '../ui/theme/Theme';
import { Logger } from '../utils/Logger';
const { ccclass, property } = _decorator;

@ccclass('CutLine')
export class CutLine extends Component {
    @property(Node) lineBody: Node | null = null;       // 中间白线
    @property(Node) dotLeft: Node | null = null;        // 左端点圆
    @property(Node) dotRight: Node | null = null;       // 右端点圆
    @property(Node) objectRef: Node | null = null;      // 物体节点（用于计算高度约束）

    /** 切割线位置变化回调（给 UI/逻辑层订阅） */
    public onCutLineChanged: ((yLocal: number) => void) | null = null;

    private _dragging: boolean = false;
    private _startY: number = 0;
    private _limitTop: number = 0;
    private _limitBottom: number = 0;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

        Logger.info('CutLine', '切割线组件初始化完成');
        // 默认白色
        this._applyColor(COLOR.WHITE);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
        Logger.info('CutLine', '组件销毁，解绑触摸事件');
    }

    /** 让调用方设置物体的可移动范围（像素） */
    public setRange(top: number, bottom: number) {
        this._limitTop = top;
        this._limitBottom = bottom;
        Logger.info('CutLine', `设置可移动范围: bottom=${bottom} top=${top}`);
    }

    /** 获取当前切割线的本地 Y（像素，整数） */
    public getCutY(): number {
        return Math.round(this.node.position.y);
    }

    /** 设为"接近 50%" 的金色状态 */
    public setNearTarget(on: boolean) {
        Logger.info('CutLine', `setNearTarget(on=${on})：${on ? '金色' : '白色'}`);
        this._applyColor(on ? COLOR.GOLD : COLOR.WHITE);
    }

    /** 归位 */
    public reset() {
        Logger.info('CutLine', '切割线归位到中心');
        this.node.setPosition(0, 0, 0);
        this._applyColor(COLOR.WHITE);
    }

    private _applyColor(c: { r: number; g: number; b: number; a: number }) {
        for (const n of [this.lineBody, this.dotLeft, this.dotRight]) {
            if (!n) continue;
            const s = n.getComponent(Sprite);
            if (s) s.color = c;
        }
    }

    private _onTouchStart(e: EventTouch) {
        this._dragging = true;
        this._startY = this.node.position.y;
        Logger.info('CutLine', `_onTouchStart: startY=${this._startY}`);
    }

    private _onTouchMove(e: EventTouch) {
        if (!this._dragging) return;
        const delta = e.getDelta();
        let next = this.node.position.y + delta.y;
        // 约束在范围内
        next = Math.max(this._limitBottom, Math.min(this._limitTop, next));
        // 整数吸附
        next = Math.round(next);
        this.node.setPosition(this.node.position.x, next, 0);
        Logger.debug('CutLine', `_onTouchMove: deltaY=${delta.y.toFixed(2)} nextY=${next}`);
        if (this.onCutLineChanged) this.onCutLineChanged(next);
    }

    private _onTouchEnd(e: EventTouch) {
        if (this._dragging) {
            Logger.info('CutLine', `_onTouchEnd: 切割线停在 y=${this.node.position.y}`);
        }
        this._dragging = false;
    }
}
