/**
 * CountdownRing — 倒计时圆环（空心圆，从满到空）
 *
 * 使用 Sprite 的 fillRange 属性做环形动画（type=FILLED, fillType=RADIAL）。
 */

import { _decorator, Component, Label, Node, Sprite, tween, UITransform } from 'cc';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('CountdownRing')
export class CountdownRing extends Component {
    @property(Sprite) ringSprite: Sprite | null = null;   // 前景圆环（橙色）
    @property(Label) centerLabel: Label | null = null;    // 中间数字

    private _total: number = 3;
    private _remaining: number = 3;

    onLoad() {
        if (this.ringSprite) this.ringSprite.color = COLOR.ORANGE;
        if (this.centerLabel) {
            this.centerLabel.color = COLOR.INK;
            this.centerLabel.fontSize = FONT.H2;
        }
        this._apply();
    }

    /** 启动圆环动画（改名避免与 Component.start 冲突） */
    public begin(totalSeconds: number) {
        this._total = totalSeconds;
        this._remaining = totalSeconds;
        this._apply();
        this.node.active = true;
    }

    public setRemaining(sec: number) {
        this._remaining = Math.max(0, sec);
        this._apply();
    }

    public hide() { this.node.active = false; }

    private _apply() {
        const ratio = this._total > 0 ? this._remaining / this._total : 0;
        if (this.ringSprite) {
            // fillRange 0 → 全空；1 → 全满
            this.ringSprite.fillRange = ratio;
        }
        if (this.centerLabel) {
            this.centerLabel.string = Math.ceil(this._remaining).toString();
        }
    }
}
