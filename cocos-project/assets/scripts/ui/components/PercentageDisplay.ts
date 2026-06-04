/**
 * PercentageDisplay — 大字百分比（通关/失败结果页）
 *
 * 根据比例显示颜色与文案：
 *   - 50% → 橙色（完美）
 *   - 49-51% → 黄色
 *   - 45-49% / 51-55% → 橙色
 *   - 40-45% / 55-60% → 红色
 *   - <40% / >60% → 深红
 */

import { _decorator, Component, Label, Node, Sprite, tween, Vec3 } from 'cc';
import { tierFromRatio } from '../../core/GameConfig';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('PercentageDisplay')
export class PercentageDisplay extends Component {
    @property(Label) percentLabel: Label | null = null;
    @property(Node) bg: Node | null = null;

    /** 设置比例并改变颜色（0-100 整数） */
    public setRatio(ratio: number, withPop: boolean = true) {
        const tier = tierFromRatio(ratio);
        if (this.percentLabel) {
            this.percentLabel.string = `${ratio}%`;
            this.percentLabel.color = tier.tier === 'win' ? COLOR.ORANGE : tier.textColor;
            this.percentLabel.fontSize = FONT.PERCENT_BIG;
        }
        if (withPop) this.pop();
    }

    /** 弹出动画（pop in） */
    public pop() {
        this.node.setScale(0, 0, 1);
        tween(this.node)
            .to(0.15, { scale: new Vec3(1.15, 1.15, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    /** 快速设置 —— 数字颜色按分档 */
    public setText(text: string, color = COLOR.ORANGE, size: number = FONT.PERCENT_BIG) {
        if (this.percentLabel) {
            this.percentLabel.string = text;
            this.percentLabel.color = color;
            this.percentLabel.fontSize = size;
        }
    }
}
