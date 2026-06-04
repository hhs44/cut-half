/**
 * KnifeBadge — 刀数徽章（显示当前剩余刀数："🔪 2/3"）
 *
 * 根据剩余刀数变色：
 *   - 3/3 → 绿色（满刀）
 *   - 2/3 → 橙色
 *   - 1/3 → 红色
 *   - 0/3 → 深墨色（不可用）
 */

import { _decorator, Component, Label, Node, Sprite, Color } from 'cc';
import { badgeTierFromKnives, KNIVES } from '../../core/GameConfig';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('KnifeBadge')
export class KnifeBadge extends Component {
    @property(Label) countLabel: Label | null = null;  // "2/3"
    @property(Node) bg: Node | null = null;             // 背景色节点（胶囊形状）

    private _current: number = KNIVES.MAX;
    private _max: number = KNIVES.MAX;

    onLoad() {
        this.refresh();
    }

    public setKnives(current: number, max: number = KNIVES.MAX) {
        this._current = Math.max(0, Math.min(max, current));
        this._max = max;
        this.refresh();
    }

    public refresh() {
        if (this.countLabel) {
            this.countLabel.string = `${this._current}/${this._max}`;
            this.countLabel.fontSize = FONT.BODY;
        }

        const tier = badgeTierFromKnives(this._current, this._max);
        let textColor = COLOR.INK;
        let bgColor = COLOR.ORANGE_SOFT;
        let borderColor = COLOR.ORANGE;

        switch (tier) {
            case 'win':
                bgColor = COLOR.MINT_SOFT; borderColor = COLOR.MINT_DEEP; textColor = COLOR.MINT_DEEP; break;
            case 'tier1':
            case 'tier2':
                bgColor = COLOR.ORANGE_SOFT; borderColor = COLOR.ORANGE; textColor = COLOR.ORANGE_DEEP; break;
            case 'tier3':
                bgColor = COLOR.TIER3_BG; borderColor = COLOR.TIER3; textColor = COLOR.TIER3; break;
            case 'tier4':
                bgColor = new Color(0xE9, 0xE3, 0xD6, 0xFF); borderColor = COLOR.INK; textColor = COLOR.INK; break;
        }

        if (this.bg) {
            const s = this.bg.getComponent(Sprite);
            if (s) s.color = bgColor;
        }
        if (this.countLabel) this.countLabel.color = textColor;
    }
}
