/**
 * TutorialOverlay — 首次引导
 *
 * 流程：
 *   1) 进入 GameScene → 右上圆角气泡："切到中间试试～"（3 秒自动消失）
 *   2) 当用户首次拖动切割线 → 半透明蒙版 + 中央气泡 + 手指指示动画
 *   3) 完成一次切割 → 永久关闭（sys.localStorage 记录 'cut-half-tutorial-seen'）
 *
 * 订阅事件：
 *   - TutorialEvent.RequestTopBubble → 显示/隐藏右上气泡
 *   - TutorialEvent.RequestDragMask → 显示/隐藏拖动蒙版
 *   - TutorialEvent.Completed → 记录"已完成"
 */

import { _decorator, Component, Label, Node, Sprite, tween, Tween, Vec3, sys, Color } from 'cc';
import { COLOR, FONT } from '../theme/Theme';
import { Logger } from '../../utils/Logger';
const { ccclass, property } = _decorator;

export const TutorialEvent = {
    RequestTopBubble: 'tutorial-top-bubble',
    RequestDragMask: 'tutorial-drag-mask',
    Completed: 'tutorial-completed',
};

export const TUTORIAL_FLAG = 'cut-half-tutorial-seen';

@ccclass('TutorialOverlay')
export class TutorialOverlay extends Component {
    @property(Node) topBubble: Node | null = null;     // 右上气泡（带 label）
    @property(Label) topBubbleLabel: Label | null = null;
    @property(Node) dragMask: Node | null = null;      // 半透明蒙版（黑色，低 alpha）
    @property(Node) dragFinger: Node | null = null;    // 圆形手指
    @property(Label) dragLabel: Label | null = null;   // 中央提示文字

    private _enabled: boolean = true;

    onLoad() {
        // 若玩家已完成 → 整个 overlay 不渲染
        const seen = sys.localStorage.getItem(TUTORIAL_FLAG);
        if (seen === '1') {
            this._enabled = false;
            this.node.active = false;
            Logger.info('TutorialOverlay', '已完成，跳过引导');
            return;
        }

        this._enabled = true;
        this.node.active = true;

        if (this.topBubble) {
            const s = this.topBubble.getComponent(Sprite);
            if (s) s.color = COLOR.INK;
        }
        if (this.topBubbleLabel) {
            this.topBubbleLabel.color = COLOR.WHITE;
            this.topBubbleLabel.fontSize = FONT.SMALL;
            this.topBubbleLabel.string = '切到中间试试～';
        }
        if (this.dragMask) {
            const s = this.dragMask.getComponent(Sprite);
            if (s) s.color = new Color(0, 0, 0, 110);
            this.dragMask.active = false;
        }
        if (this.dragLabel) {
            this.dragLabel.color = COLOR.WHITE;
            this.dragLabel.fontSize = FONT.BODY;
            this.dragLabel.string = '拖动到这里试试';
        }

        // 显示 3 秒右上气泡后自动隐藏
        this._showTopBubble(3.0);
    }

    /** 外部调用：进入拖动阶段 */
    public showDragHint(seconds: number = 2.5) {
        if (!this._enabled) return;
        if (this.dragMask) {
            this.dragMask.active = true;
            this.dragMask.setScale(0.9, 0.9, 1);
            tween(this.dragMask)
                .to(0.15, { scale: new Vec3(1, 1, 1) })
                .delay(seconds)
                .call(() => { if (this.dragMask) this.dragMask.active = false; })
                .start();
        }
        if (this.dragFinger) {
            this.dragFinger.active = true;
            const basePos = new Vec3(this.dragFinger.position.x, this.dragFinger.position.y, 0);
            const loop = new Tween<Node>(this.dragFinger)
                .to(0.4, { position: new Vec3(basePos.x, basePos.y + 30, 0) })
                .to(0.4, { position: new Vec3(basePos.x, basePos.y - 30, 0) });
            tween(this.dragFinger)
                .then(loop)
                .repeat(3)
                .call(() => { if (this.dragFinger) this.dragFinger.active = false; })
                .start();
        }
    }

    /** 外部调用：玩家完成一次切割 */
    public markCompleted() {
        if (!this._enabled) return;
        sys.localStorage.setItem(TUTORIAL_FLAG, '1');
        this._enabled = false;
        this.node.active = false;
        Logger.info('TutorialOverlay', '标记为已完成');
    }

    private _showTopBubble(seconds: number) {
        if (!this._enabled || !this.topBubble) return;
        this.topBubble.active = true;
        this.topBubble.setScale(0.8, 0.8, 1);
        tween(this.topBubble)
            .to(0.15, { scale: new Vec3(1, 1, 1) })
            .delay(seconds)
            .to(0.15, { scale: new Vec3(0.85, 0.85, 1) })
            .call(() => { if (this.topBubble) this.topBubble.active = false; })
            .start();
    }
}
