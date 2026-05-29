// 神煞系统
import type { Stem, Branch } from "./constants";

export interface ShenSha {
  name: string;
  position: number; // 在四柱中的位置（0=年，1=月，2=日，3=时）
  branch: Branch;
  description: string;
}

// 天乙贵人
function checkTianYi(dayStem: Stem, branches: Branch[]): ShenSha[] {
  const map: Record<string, Branch[]> = {
    甲: ["丑", "未"], 戊: ["丑", "未"],
    乙: ["子", "申"], 己: ["子", "申"],
    丙: ["亥", "酉"], 丁: ["亥", "酉"],
    庚: ["丑", "未"], 辛: ["寅", "午"],
    壬: ["卯", "巳"], 癸: ["卯", "巳"],
  };
  const targets = map[dayStem] ?? [];
  const results: ShenSha[] = [];
  branches.forEach((b, i) => {
    if (targets.includes(b)) {
      results.push({ name: "天乙贵人", position: i, branch: b, description: "贵人相助，逢凶化吉" });
    }
  });
  return results;
}

// 文昌贵人
function checkWenChang(dayStem: Stem, branches: Branch[]): ShenSha[] {
  const map: Record<string, Branch> = {
    甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申",
    己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯",
  };
  const target = map[dayStem];
  const results: ShenSha[] = [];
  branches.forEach((b, i) => {
    if (b === target) {
      results.push({ name: "文昌贵人", position: i, branch: b, description: "聪明好学，才华出众" });
    }
  });
  return results;
}

// 驿马
function checkYiMa(yearBranch: Branch, branches: Branch[]): ShenSha[] {
  const map: Record<string, Branch> = {
    申子辰: "寅", 寅午戌: "申", 亥卯未: "巳", 巳酉丑: "亥",
  };
  let target: Branch | null = null;
  for (const [group, horse] of Object.entries(map)) {
    if (group.includes(yearBranch)) { target = horse; break; }
  }
  const results: ShenSha[] = [];
  if (target) {
    branches.forEach((b, i) => {
      if (b === target) {
        results.push({ name: "驿马", position: i, branch: b, description: "主动、奔波、迁移" });
      }
    });
  }
  return results;
}

// 桃花（咸池）
function checkTaoHua(yearBranch: Branch, branches: Branch[]): ShenSha[] {
  const map: Record<string, Branch> = {
    申子辰: "酉", 寅午戌: "卯", 亥卯未: "子", 巳酉丑: "午",
  };
  let target: Branch | null = null;
  for (const [group, flower] of Object.entries(map)) {
    if (group.includes(yearBranch)) { target = flower; break; }
  }
  const results: ShenSha[] = [];
  if (target) {
    branches.forEach((b, i) => {
      if (b === target) {
        results.push({ name: "桃花", position: i, branch: b, description: "异性缘、魅力、感情" });
      }
    });
  }
  return results;
}

// 华盖
function checkHuaGai(yearBranch: Branch, branches: Branch[]): ShenSha[] {
  const map: Record<string, Branch> = {
    申子辰: "辰", 寅午戌: "戌", 亥卯未: "未", 巳酉丑: "丑",
  };
  let target: Branch | null = null;
  for (const [group, cover] of Object.entries(map)) {
    if (group.includes(yearBranch)) { target = cover; break; }
  }
  const results: ShenSha[] = [];
  if (target) {
    branches.forEach((b, i) => {
      if (b === target) {
        results.push({ name: "华盖", position: i, branch: b, description: "孤高、学术、宗教、艺术" });
      }
    });
  }
  return results;
}

// 羊刃
function checkYangRen(dayStem: Stem, branches: Branch[]): ShenSha[] {
  const map: Record<string, Branch> = {
    甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子",
    乙: "寅", 丁: "巳", 己: "巳", 辛: "申", 癸: "亥",
  };
  const target = map[dayStem];
  const results: ShenSha[] = [];
  branches.forEach((b, i) => {
    if (b === target) {
      results.push({ name: "羊刃", position: i, branch: b, description: "刚烈、果断、过刚则折" });
    }
  });
  return results;
}

// 将星
function checkJiangXing(yearBranch: Branch, branches: Branch[]): ShenSha[] {
  const map: Record<string, Branch> = {
    申子辰: "子", 寅午戌: "午", 亥卯未: "卯", 巳酉丑: "酉",
  };
  let target: Branch | null = null;
  for (const [group, star] of Object.entries(map)) {
    if (group.includes(yearBranch)) { target = star; break; }
  }
  const results: ShenSha[] = [];
  if (target) {
    branches.forEach((b, i) => {
      if (b === target) {
        results.push({ name: "将星", position: i, branch: b, description: "领导力、组织能力" });
      }
    });
  }
  return results;
}

// 天德/月德（MVP 简化版，后续完善）
function checkTianDeYueDe(_monthBranch: Branch, _branches: Branch[]): ShenSha[] {
  return [];
}

// 综合神煞分析
export function analyzeShenSha(
  dayStem: Stem,
  yearBranch: Branch,
  monthBranch: Branch,
  branches: Branch[]
): ShenSha[] {
  return [
    ...checkTianYi(dayStem, branches),
    ...checkWenChang(dayStem, branches),
    ...checkYiMa(yearBranch, branches),
    ...checkTaoHua(yearBranch, branches),
    ...checkHuaGai(yearBranch, branches),
    ...checkYangRen(dayStem, branches),
    ...checkJiangXing(yearBranch, branches),
  ];
}
