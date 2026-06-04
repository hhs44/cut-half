/**
 * ItemSlot — 道具槽（"↩ 撤销" / "🔪 再切一刀"）
 *
 * 拥有态：橙色高亮背景 + 彩色图标 + 可点击
 * 禁用态：灰底 + 灰图标 + 不可点击
 */

import { _decorator, Button, Component, Label, Node, Sprite } from 'cc';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('ItemSlot')
export class ItemSlot extends Component {
    @property(Label) iconLabel: Label | null = null;   // 图标（emoji 或符号）
    @property(Label) nameLabel: Label | null = null;   // 名称（"撤销"）
    @property(Node) bg: Node | null = null;

    public onClick: (() => void) | null = null;

    public setOwned(owned: boolean, icon: string = '', name: string = '') {
        if (this.iconLabel) {
            this.iconLabel.string = icon;
            this.iconLabel.color = owned ? COLOR.ORANGE_DEEP : COLOR.MUTED;
            this.iconLabel.fontSize = 22;
        }
        if (this.nameLabel) {
            this.nameLabel.string = name;
            this.nameLabel.color = owned ? COLOR.ORANGE_DEEP : COLOR.MUTED;
            this.nameLabel.fontSize = FONT.TINY;
        }
        if (this.bg) {
            const s = this.bg.getComponent(Sprite);
            if (s) s.color = owned ? COLOR.ORANGE_SOFT : COLOR.LINE_SOFT;
        }

        // 可点击性：只有"拥有"时才响应
        const btn = this.node.getComponent(Button) || this.node.addComponent(Button);
        btn.interactable = owned;
    }

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this._onClick, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_END, this._onClick, this);
    }

    private _onClick() {
        if (this.onClick) this.onClick();
    }
}
