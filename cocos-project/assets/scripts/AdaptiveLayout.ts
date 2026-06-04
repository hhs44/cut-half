/**
 * AdaptiveLayout.ts — 跨场景自适应工具类
 *
 * 提供：
 *   - applyFitWidth(designWidth): 锁定 FIXED_WIDTH 策略,所有屏幕宽度对齐设计稿
 *   - applyWidget(node, options): 给节点加 Widget 组件并配置锚定
 *   - getSafeAreaTopInset() / getSafeAreaBottomInset(): 安全区像素转逻辑像素
 *
 * 设计稿：720x1280（与 Cocos 编辑器分辨率对齐）
 * 抖音小游戏刘海屏/底部 Home Indicator 适配
 */

import { Node, Widget, view, screen, ResolutionPolicy, UITransform, sys } from 'cc';

/** 设计基准 */
export const DESIGN_WIDTH = 720;
export const DESIGN_HEIGHT = 1280;

/** 纯工具类（不挂节点），注意：跨场景自适应布局工具 */
export class AdaptiveLayout {

    /**
     * 设置 FIXED_WIDTH 分辨率策略，让所有屏幕宽度对齐 720。
     * 长屏上下超出被裁，无黑边。
     */
    public static applyFitWidth(designWidth: number = DESIGN_WIDTH): void {
        view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
    }

    /**
     * 给节点加 Widget 组件并配置对齐。
     * 不传 target 则默认对齐父节点。
     */
    public static applyWidget(node: Node, options: {
        isAlignLeft?: boolean,
        isAlignRight?: boolean,
        isAlignTop?: boolean,
        isAlignBottom?: boolean,
        isAlignHorizontalCenter?: boolean,
        isAlignVerticalCenter?: boolean,
        left?: number, right?: number, top?: number, bottom?: number,
        horizontalCenter?: number, verticalCenter?: number,
    }): Widget {
        let widget = node.getComponent(Widget);
        if (!widget) {
            widget = node.addComponent(Widget);
        }
        widget.isAlignLeft = options.isAlignLeft ?? false;
        widget.isAlignRight = options.isAlignRight ?? false;
        widget.isAlignTop = options.isAlignTop ?? false;
        widget.isAlignBottom = options.isAlignBottom ?? false;
        widget.isAlignHorizontalCenter = options.isAlignHorizontalCenter ?? false;
        widget.isAlignVerticalCenter = options.isAlignVerticalCenter ?? false;
        if (options.left !== undefined) widget.left = options.left;
        if (options.right !== undefined) widget.right = options.right;
        if (options.top !== undefined) widget.top = options.top;
        if (options.bottom !== undefined) widget.bottom = options.bottom;
        if (options.horizontalCenter !== undefined) widget.horizontalCenter = options.horizontalCenter;
        if (options.verticalCenter !== undefined) widget.verticalCenter = options.verticalCenter;
        widget.alignMode = 2; // ALWAYS：屏幕尺寸变化时自动重新对齐
        widget.updateAlignment();
        return widget;
    }

    /**
     * 顶部安全区像素转逻辑像素（FIXED_WIDTH 模式下，scale = designWidth/frameWidth）。
     * iPhone XR 等刘海屏顶部约 44px 物理像素，约 0.6cm。
     */
    public static getSafeAreaTopInset(): number {
        try {
            const safeArea = screen.windowSize;
            const frameWidth = safeArea.width;
            const scale = DESIGN_WIDTH / frameWidth;
            // 简化：刘海屏约 44px 物理像素，非刘海为 0
            const isNotch = this.detectNotch();
            return isNotch ? 44 * scale : 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * 底部安全区像素转逻辑像素（Home Indicator 约 34px 物理像素）。
     */
    public static getSafeAreaBottomInset(): number {
        try {
            const safeArea = screen.windowSize;
            const frameWidth = safeArea.width;
            const scale = DESIGN_WIDTH / frameWidth;
            // 简化：有 Home Indicator 约 34px 物理像素
            return 34 * scale;
        } catch (e) {
            return 0;
        }
    }

    private static detectNotch(): boolean {
        // 简化检测：iPhone XR/XS/11/12/13/14/15 等刘海屏
        // 通过 sys.platform + window.devicePixelRatio 推断
        try {
            if (sys.platform === sys.Platform.MOBILE_BROWSER) {
                return true;
            }
        } catch (e) { }
        return false;
    }
}
