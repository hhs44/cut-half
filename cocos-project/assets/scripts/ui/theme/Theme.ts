/**
 * Theme.ts — 统一主题系统（来自 prototype-v0.4 的 CSS 变量 → TS 常量）
 *
 * 所有场景、组件的颜色 / 圆角 / 阴影 / 字号 均从此处获取，禁止在业务代码里散写魔法值。
 *
 * 用法：
 *   import { Theme, COLOR, RADIUS, SHADOW, FONT } from '../ui/theme/Theme';
 *   const btnColor = COLOR.ORANGE;                      // → { r, g, b, a }
 *   const hex = Theme.hex('#FF7F50');                   // → cc.Color
 *   Theme.labelStyle(label, COLOR.INK, FONT.H1);        // 应用一套样式
 */

import { Color, Label, Node, Sprite, UITransform, Vec2 } from 'cc';

/** 颜色：把 hex 转换为 cc.Color（Cocos 引擎可直接使用） */
export const COLOR = {
    // 主色
    ORANGE: new Color(0xFF, 0x7F, 0x50, 0xFF),      // #FF7F50
    ORANGE_DEEP: new Color(0xE6, 0x6A, 0x3D, 0xFF), // #E66A3D
    ORANGE_SOFT: new Color(0xFF, 0xE4, 0xD6, 0xFF), // #FFE4D6

    MINT: new Color(0x98, 0xFB, 0x98, 0xFF),        // #98FB98
    MINT_DEEP: new Color(0x5F, 0xCC, 0x73, 0xFF),   // #5FCC73
    MINT_SOFT: new Color(0xE5, 0xFC, 0xE5, 0xFF),   // #E5FCE5

    GOLD: new Color(0xFF, 0xD7, 0x00, 0xFF),        // #FFD700
    GOLD_DEEP: new Color(0xE0, 0xB8, 0x00, 0xFF),   // #E0B800
    GOLD_SOFT: new Color(0xFF, 0xF4, 0xC2, 0xFF),   // #FFF4C2

    CREAM: new Color(0xFF, 0xF8, 0xF0, 0xFF),       // #FFF8F0
    CREAM_DEEP: new Color(0xF5, 0xEB, 0xD9, 0xFF),  // #F5EBD9

    // 中性色 / 文本
    INK: new Color(0x14, 0x17, 0x1E, 0xFF),         // #14171E
    TEXT: new Color(0x1F, 0x25, 0x33, 0xFF),        // #1F2533
    TEXT_2: new Color(0x3A, 0x42, 0x56, 0xFF),      // #3A4256
    MUTED: new Color(0x7C, 0x7A, 0x72, 0xFF),       // #7C7A72
    LINE: new Color(0xE9, 0xE3, 0xD6, 0xFF),        // #E9E3D6
    LINE_SOFT: new Color(0xF0, 0xEB, 0xDF, 0xFF),   // #F0EBDF
    PANEL: new Color(0xFF, 0xFF, 0xFF, 0xFF),        // #FFFFFF
    BG: new Color(0xF7, 0xF5, 0xF0, 0xFF),          // #F7F5F0

    // 失败分级（4 档）
    TIER1: new Color(0xF5, 0x9E, 0x0B, 0xFF),       // #F59E0B 黄
    TIER1_BG: new Color(0xFE, 0xF3, 0xC7, 0xFF),    // #FEF3C7
    TIER2: new Color(0xEA, 0x58, 0x0C, 0xFF),       // #EA580C 橙
    TIER2_BG: new Color(0xFF, 0xED, 0xD5, 0xFF),    // #FFEDD5
    TIER3: new Color(0xDC, 0x26, 0x26, 0xFF),       // #DC2626 红
    TIER3_BG: new Color(0xFE, 0xE2, 0xE2, 0xFF),    // #FEE2E2
    TIER4: new Color(0x99, 0x1B, 0x1B, 0xFF),       // #991B1B 深红
    TIER4_BG: new Color(0xFE, 0xCA, 0xCA, 0xFF),    // #FECACA

    // 辅助
    WHITE: new Color(0xFF, 0xFF, 0xFF, 0xFF),
    BLACK: new Color(0x00, 0x00, 0x00, 0xFF),
    TRANSPARENT: new Color(0x00, 0x00, 0x00, 0x00),

    // GameOver 深色
    DARK_BG_TOP: new Color(0x2A, 0x18, 0x20, 0xFF),
    DARK_BG_BOTTOM: new Color(0x1A, 0x0E, 0x14, 0xFF),
};

/** 圆角（单位：像素） */
export const RADIUS = {
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    PILL: 999,   // 胶囊（只要高度的一半就会变成胶囊；此值作标记）
};

/** 阴影 —— Cocos 的 Sprite 不天然支持 box-shadow，此处提供常量给组件做视觉参考；
 *  实际"按下阴影"通过节点 translateY + 额外底色节点实现。 */
export const SHADOW = {
    BTN_OFFSET_Y: 4,        // 主按钮按下阴影向下 offset（px）
    BTN_COLOR: COLOR.ORANGE_DEEP,
    BTN_SM_OFFSET_Y: 3,
};

/** 字号 */
export const FONT = {
    H1: 40,
    H2: 30,
    H3: 22,
    BODY: 16,
    SMALL: 13,
    TINY: 11,
    PERCENT_BIG: 72,       // 结果页大百分比
    PERCENT_POP: 88,       // 切割动效弹出百分比
};

/** 辅助：hex → cc.Color（备用） */
export function hex(hex6: string, alpha: number = 255): Color {
    let h = hex6.trim();
    if (h.startsWith('#')) h = h.slice(1);
    if (h.length !== 6) return new Color(255, 255, 255, alpha);
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return new Color(r, g, b, alpha);
}

/** 辅助：给 Label 统一设置颜色与字号 */
export function styleLabel(label: Label, color: Color, fontSize: number) {
    if (!label) return;
    label.color = color;
    label.fontSize = fontSize;
}

/** 辅助：给 Node 设置 contentSize（若有 UITransform） */
export function setSize(node: Node, width: number, height: number) {
    const t = node.getComponent(UITransform);
    if (t) t.setContentSize(width, height);
}

/** 判断两个 Color 是否深 / 浅（用于决定按钮上的文字颜色） */
export function isLightColor(c: Color): boolean {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.55;
}

export const Theme = { hex, styleLabel, setSize };
