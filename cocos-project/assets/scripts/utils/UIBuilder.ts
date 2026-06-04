/**
 * UIBuilder — 程序化构建 UI 节点树（纯代码，零编辑器依赖）
 *
 * 每个场景只需：Canvas + Camera + 一个挂载 UI 控制器脚本的节点 → 其余全由这里构建。
 *
 * 主要方法：
 *   - node(parent, name, x, y, w, h)          → 创建普通节点（含 UITransform）
 *   - sprite(parent, name, color, x, y, w, h)  → 创建带 Sprite 的节点（纯色矩形）
 *   - label(parent, name, text, color, fontSize, x, y, w, h) → 创建带 Label 的节点
 *   - button(parent, name, bodyColor, labelText, labelColor, fontSize, x, y, w, h) → 创建按钮（body+shadow+label）
 *   - setSize(node, w, h) / setPos(node, x, y) → 调整节点
 */

import { Color, Label, Node, Sprite, UITransform, Vec3 } from 'cc';

export class UIBuilder {
    /** 创建一个空节点（自动加 UITransform） */
    public static node(parent: Node, name: string, x: number = 0, y: number = 0, w: number = 0, h: number = 0): Node {
        const n = new Node(name);
        parent.addChild(n);
        n.addComponent(UITransform);
        n.setPosition(x, y, 0);
        if (w > 0 || h > 0) {
            n.getComponent(UITransform)!.setContentSize(w, h);
        }
        return n;
    }

    /** 创建带 Sprite 组件的纯色节点（UI 背景/按钮体等） */
    public static sprite(parent: Node, name: string, color: Color, x: number = 0, y: number = 0, w: number = 100, h: number = 50): Node {
        const n = this.node(parent, name, x, y, w, h);
        const sprite = n.addComponent(Sprite);
        sprite.color = color;
        sprite.type = Sprite.Type.SLICED;
        // 没有 spriteFrame 时，用默认的白色圆片；Cocos 3.x 会自动生成一个占位
        return n;
    }

    /** 创建带 Label 的节点（纯文字） */
    public static label(parent: Node, name: string, text: string, color: Color, fontSize: number = 24, x: number = 0, y: number = 0, w: number = 0, h: number = 0): Node {
        const n = this.node(parent, name, x, y, Math.max(w, text.length * fontSize * 0.6), Math.max(h, fontSize + 10));
        const label = n.addComponent(Label);
        label.string = text;
        label.color = color;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 4;
        return n;
    }

    /** 创建按钮节点（root + body + shadow + label），返回 root */
    public static button(parent: Node, name: string, bodyColor: Color, labelText: string, labelColor: Color, fontSize: number = 22, x: number = 0, y: number = 0, w: number = 360, h: number = 100): Node {
        const root = this.node(parent, name, x, y, w, h);
        // shadow（比 body 低 4px，模拟按下阴影）
        const shadow = this.sprite(root, 'shadow', new Color(0, 0, 0, 50), 0, -4, w, h);
        // body（在 shadow 上方）
        const body = this.sprite(root, 'body', bodyColor, 0, 0, w, h);
        body.setSiblingIndex(shadow.getSiblingIndex() + 1);
        // label（在 body 上）
        const label = this.label(body, 'label', labelText, labelColor, fontSize, 0, 0, w, h);
        return root;
    }

    /** 设置节点位置 */
    public static setPos(n: Node, x: number, y: number) {
        n.setPosition(x, y, 0);
    }

    /** 设置节点大小 */
    public static setSize(n: Node, w: number, h: number) {
        const ui = n.getComponent(UITransform);
        if (ui) ui.setContentSize(w, h);
    }

    /** 设置 Sprite 颜色 */
    public static setSpriteColor(n: Node, c: Color) {
        const s = n.getComponent(Sprite);
        if (s) s.color = c;
    }

    /** 设置 Label 文字 */
    public static setLabelText(n: Node, text: string) {
        const l = n.getComponent(Label);
        if (l) l.string = text;
    }
}
