/**
 * CutAnimator — 切割动画（订阅事件触发）
 *
 * 输入：GameEvent.CutAnimationRequested { objectNode, cutLineY }
 *   1) 刀光闪过（一条斜线从左上到右下）
 *   2) 物体在切割线处分裂：上半部分保持在上，下半部分向下掉落
 *   3) 大字百分比弹出（由外部 PercentageDisplay 负责，此组件只 emit 事件给 UI）
 *
 * 完成后 emit GameEvent.CutAnimationDone。
 */

import { _decorator, Component, Node, Sprite, tween, UITransform, Vec3 } from 'cc';
import { GameEvent, gameEventTarget } from '../core/GameManager';
import { Logger } from '../utils/Logger';
const { ccclass, property } = _decorator;

@ccclass('CutAnimator')
export class CutAnimator extends Component {
    @property(Node) slashFx: Node | null = null;    // 刀光特效节点（可选，若没有会创建一条临时线）

    onLoad() {
        Logger.info('CutAnimator', '组件初始化，订阅 CutAnimationRequested');
        gameEventTarget.on(GameEvent.CutAnimationRequested, this._onRequest, this);
    }

    onDestroy() {
        Logger.info('CutAnimator', '组件销毁，取消订阅');
        gameEventTarget.off(GameEvent.CutAnimationRequested, this._onRequest, this);
    }

    private _onRequest(data: { objectNode: Node; cutLineY: number; ratio: number }) {
        Logger.info('CutAnimator', `收到 CutAnimationRequested: cutLineY=${data.cutLineY} ratio=${data.ratio}%`);
        this.play(data.objectNode, data.cutLineY, () => {
            Logger.info('CutAnimator', `动画完成，emit CutAnimationDone ratio=${data.ratio}%`);
            gameEventTarget.emit(GameEvent.CutAnimationDone, { ratio: data.ratio });
        });
    }

    /** 播放切割动画 */
    public play(objectNode: Node, cutLineY: number, done: () => void) {
        if (!objectNode) {
            Logger.warn('CutAnimator', 'objectNode 为空，跳过动画直接回调 done');
            done && done();
            return;
        }
        Logger.info('CutAnimator', `play: cutLineY=${cutLineY}`);

        // 1) 刀光闪烁（如果没有特效节点就跳过）
        if (this.slashFx) {
            this.slashFx.active = true;
            this.slashFx.setScale(0.5, 1, 1);
            tween(this.slashFx)
                .to(0.1, { scale: new Vec3(1.2, 1, 1) })
                .delay(0.05)
                .to(0.1, { scale: new Vec3(0, 1, 1) })
                .call(() => { if (this.slashFx) this.slashFx.active = false; })
                .start();
            Logger.info('CutAnimator', '已启动刀光动画');
        } else {
            Logger.info('CutAnimator', '未配置 slashFx 节点，跳过刀光');
        }

        // 2) 简化下落动画
        const originalY = objectNode.position.y;
        Logger.debug('CutAnimator', `originalY=${originalY}，向下 80px 再复位`);
        tween(objectNode)
            .to(0.2, { position: new Vec3(objectNode.position.x, originalY - 80, 0) })
            .delay(0.1)
            .call(() => {
                objectNode.setPosition(objectNode.position.x, originalY, 0);
                done && done();
            })
            .start();
    }
}
