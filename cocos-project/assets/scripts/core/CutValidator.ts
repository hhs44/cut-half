/**
 * CutValidator.ts — 切割比例计算（纯数学函数，无副作用，单测友好）
 *
 * 约定：所有输入均为整数像素坐标，避免浮点比较。
 *   ratio = round(cutLineY * 100 / objectHeight)
 *   isPass = ratio === TARGET_RATIO(50)
 */

import { CUT } from './GameConfig';

/** 根据切割线 Y 和物体高度（都应为整数像素）计算比例（0-100 整数） */
export function computeRatio(cutLineY: number, objectHeight: number): number {
    const y = Math.round(cutLineY);
    const h = Math.round(objectHeight);
    if (h <= 0) return 0;
    return Math.round((y * 100) / h);
}

/** 是否严格命中 50% */
export function isPerfectCut(ratio: number): boolean {
    return ratio === CUT.TARGET_RATIO;
}

/** "接近 50%" 阈值 —— 切割线变金色的判定 */
export const NEAR_THRESHOLD = 2; // 48-52 算"接近"

export function isNearTarget(ratio: number): boolean {
    return Math.abs(ratio - CUT.TARGET_RATIO) <= NEAR_THRESHOLD;
}

/** 自检：确认 50% 命中在数学上成立（例如 cutLineY=120, objectHeight=240 → 50） */
export function selfCheckPerfect(): boolean {
    return computeRatio(120, 240) === CUT.TARGET_RATIO;
}
