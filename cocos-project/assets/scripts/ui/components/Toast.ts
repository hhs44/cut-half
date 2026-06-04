/**
 * Toast — 顶部短暂提示（如 "⚡ 接近目标"）
 *
 * 使用：
 *   const toast = this.node.getComponent(Toast);
 *   toast.show('⚡ 接近目标', 1.5);  // 1.5 秒后自动隐藏
 */

import { _decorator, Component, Label, Node, Sprite, tween, Vec3 } from 'cc';
import { COLOR, FONT, RADIUS } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('Toast')
export class Toast extends Component {
    @property(Label) msgLabel: Label | null = null;
    @property(Node) bg: Node | null = null;

    onLoad() {
        this.node.active = false;
        if (this.bg) {
            const s = this.bg.getComponent(Sprite);
            if (s) s.color = COLOR.GOLD_SOFT;
        }
        if (this.msgLabel) {
            this.msgLabel.color = COLOR.ORANGE_DEEP;
            this.msgLabel.fontSize = FONT.SMALL;
        }
    }

    public show(message: string, seconds: number = 2.0) {
        if (this.msgLabel) this.msgLabel.string = message;
        this.node.active = true;
        this.node.setPosition(this.node.position.x, 40, 0);
        this.node.setScale(0.8, 0.8, 1);
        tween(this.node)
            .to(0.15, { scale: new Vec3(1, 1, 1), position: new Vec3(this.node.position.x, 20, 0) })
            .delay(seconds)
            .to(0.15, { scale: new Vec3(0.9, 0.9, 1) })
            .call(() => { this.node.active = false; })
            .start();
    }

    public hide() {
        this.node.active = false;
    }
}
