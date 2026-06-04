/**
 * GameConfig.ts — 游戏常量 & 失败分级
 *
 * 所有"可配置"的数值都集中在此文件，业务代码里不允许散落魔法数字。
 * 来源：PRD v0.4 + prototype-v0.4
 */

import { Color } from 'cc';
import { COLOR } from '../ui/theme/Theme';

/** 可切割物体配置 */
export interface CutObjectConfig {
    id: string;
    name: string;
    mainColor: Color;
    highlightColor: Color;
    description?: string;
}

/** 所有可用物体 */
export const OBJECTS: CutObjectConfig[] = [
    { id: 'orange', name: '橙子', mainColor: COLOR.ORANGE, highlightColor: new Color(230, 106, 61, 100), description: '新鲜橙子' },
    { id: 'mint', name: '薄荷糖', mainColor: COLOR.MINT, highlightColor: new Color(78, 205, 196, 100), description: '清凉薄荷' },
    { id: 'gold', name: '金币', mainColor: COLOR.GOLD, highlightColor: new Color(249, 215, 76, 100), description: '闪闪发光' },
    { id: 'watermelon', name: '西瓜', mainColor: new Color(94, 196, 86, 255), highlightColor: new Color(76, 157, 69, 100), description: '夏日西瓜' },
    { id: 'grape', name: '葡萄', mainColor: new Color(147, 112, 219, 255), highlightColor: new Color(123, 94, 183, 100), description: '紫葡萄串' },
    { id: 'strawberry', name: '草莓', mainColor: new Color(255, 99, 132, 255), highlightColor: new Color(230, 81, 109, 100), description: '甜蜜草莓' },
    { id: 'lemon', name: '柠檬', mainColor: new Color(255, 230, 109, 255), highlightColor: new Color(230, 207, 100, 100), description: '酸酸柠檬' },
    { id: 'blueberry', name: '蓝莓', mainColor: new Color(79, 129, 189, 255), highlightColor: new Color(65, 107, 157, 100), description: '蓝莓果粒' },
];

/** 切割判定 */
export const CUT = {
    TARGET_RATIO: 50,          // 目标比例 = 50%（严格命中才算通关）
    MIN_RATIO: 0,
    MAX_RATIO: 100,
};

/** 刀数 */
export const KNIVES = {
    MAX: 3,                    // 每关卡固定 3 刀
};

/** 倒计时（失败弹窗内的道具倒计时） */
export const COUNTDOWN = {
    TOTAL_SECONDS: 3,          // 3 秒
};

/** 失败文案分级（按"与 50% 的差距"分档） */
export type FailTier = 'tier1' | 'tier2' | 'tier3' | 'tier4' | 'win';

export interface FailTierInfo {
    tier: FailTier;
    diffMin: number;           // 最小差距（含）
    diffMax: number;           // 最大差距（不含）
    textColor: Color;
    bgColor: Color;
    message: (diff: number) => string;
}

/** 按比例返回对应的档信息（含"完美命中"的 win 档） */
export function tierFromRatio(ratio: number): FailTierInfo {
    const diff = Math.abs(ratio - CUT.TARGET_RATIO);
    if (diff === 0) return TIERS.win;
    if (diff <= 1) return TIERS.tier1;
    if (diff <= 5) return TIERS.tier2;
    if (diff <= 10) return TIERS.tier3;
    return TIERS.tier4;
}

/** 按刀数返回徽章色（UI 用） */
export function badgeTierFromKnives(knives: number, maxKnives: number = KNIVES.MAX): FailTier {
    if (knives >= maxKnives) return 'win';        // 满刀 → 绿色
    if (knives >= Math.ceil(maxKnives / 2)) return 'tier2'; // 中等 → 橙
    if (knives > 0) return 'tier3';                // 少 → 红
    return 'tier4';                                // 0 → 墨色
}

export const TIERS: Record<FailTier, FailTierInfo> = {
    win: {
        tier: 'win',
        diffMin: 0,
        diffMax: 0,
        textColor: COLOR.MINT_DEEP,
        bgColor: COLOR.MINT_SOFT,
        message: () => '完美！一刀 50%！',
    },
    tier1: {
        tier: 'tier1',
        diffMin: 0,
        diffMax: 1,
        textColor: COLOR.TIER1,
        bgColor: COLOR.TIER1_BG,
        message: (d) => `差 ${d}%！就差一点了～`,
    },
    tier2: {
        tier: 'tier2',
        diffMin: 1,
        diffMax: 5,
        textColor: COLOR.TIER2,
        bgColor: COLOR.TIER2_BG,
        message: (d) => `差 ${d}%，再来！`,
    },
    tier3: {
        tier: 'tier3',
        diffMin: 5,
        diffMax: 10,
        textColor: COLOR.TIER3,
        bgColor: COLOR.TIER3_BG,
        message: (d) => `差 ${d}%，再仔细看看`,
    },
    tier4: {
        tier: 'tier4',
        diffMin: 10,
        diffMax: 100,
        textColor: COLOR.TIER4,
        bgColor: COLOR.TIER4_BG,
        message: () => `差太远啦，物体中心在哪？`,
    },
};

/** 关卡（当前 MVP 仅 1 关：矩形） */
export const LEVELS = [
    { id: 1, name: '矩形', description: '精准切到中间' },
];

/** 道具 ID 常量（避免字符串魔法值） */
export const ITEM = {
    UNDO: 'undo',
    RECUT: 'recut',
} as const;

export type ItemId = typeof ITEM[keyof typeof ITEM];
