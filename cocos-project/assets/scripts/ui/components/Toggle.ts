/**
 * Toggle — 开关（设置页用）
 *
 * 点击切换开/关，带简单的横移动画。
 */

import { _decorator, Button, Component, Label, Node, Sprite, tween, Vec3 } from 'cc';
import { COLOR, FONT } from '../theme/Theme';
const { ccclass, property } = _decorator;

@ccclass('ToggleCustom')
export class ToggleCustom extends Component {
    @property(Node) track: Node | null = null;   // 开关背景（长圆形）
    @property(Node) thumb: Node | null = null;   // 圆形滑块
    @property(Label) titleLabel: Label | null = null;

    private _on: boolean = false;
    public onToggle: ((on: boolean) => void) | null = null;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this._onClick, this);
        this._applyVisual();
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_END, this._onClick, this);
    }

    public set(on: boolean, fireEvent: boolean = false) {
        this._on = on;
        this._applyVisual();
        if (fireEvent && this.onToggle) this.onToggle(on);
    }

    public get on(): boolean { return this._on; }

    private _onClick() {
        this._on = !this._on;
        this._applyVisual();
        if (this.onToggle) this.onToggle(this._on);
    }

    private _applyVisual() {
        if (this.track) {
            const s = this.track.getComponent(Sprite);
            if (s) s.color = this._on ? COLOR.MINT_DEEP : COLOR.LINE;
        }
        if (this.thumb) {
            const offset = this._on ? 10 : -10;
            tween(this.thumb)
                .to(0.15, { position: new Vec3(offset, 0, 0) })
                .start();
        }
        if (this.titleLabel) {
            this.titleLabel.color = this._on ? COLOR.MINT_DEEP : COLOR.MUTED;
            this.titleLabel.fontSize = FONT.BODY;
        }
    }
}
