// 刑冲合害破关系分析
import type { Branch, Stem } from "./constants";
import { STEM_YINYANG } from "./constants";

export type RelationType = "合" | "冲" | "刑" | "害" | "破" | "三合" | "三会";

export interface BranchRelation {
  type: RelationType;
  positions: number[];
  branches: string;
  description: string;
}

// 六合
const SIX_HARMONY: Record<string, string> = {
  子丑: "土", 寅亥: "木", 卯戌: "火", 辰酉: "金", 巳申: "水", 午未: "火/土",
};

// 六冲
const SIX_CLASH: Record<string, string> = {
  子午: "水火冲", 丑未: "土冲", 寅申: "金木冲", 卯酉: "金木冲", 辰戌: "土冲", 巳亥: "水火冲",
};

// 三刑
const THREE_PUNISHMENTS: Array<[string, string, string, string]> = [
  ["寅", "巳", "申", "无恩之刑"],
  ["丑", "戌", "未", "恃势之刑"],
];

// 自刑
const SELF_PUNISHMENT: Record<string, string> = {
  辰辰: "自刑", 午午: "自刑", 酉酉: "自刑", 亥亥: "自刑",
};

// 相刑（子卯）
const MUTUAL_PUNISHMENT: Record<string, string> = {
  子卯: "无礼之刑", 卯子: "无礼之刑",
};

// 六害
const SIX_HARM: Record<string, string> = {
  子未: "害", 丑午: "害", 寅巳: "害", 卯辰: "害", 申亥: "害", 酉戌: "害",
};

// 六破
const SIX_BREAK: Record<string, string> = {
  子酉: "破", 丑辰: "破", 寅亥: "破", 卯午: "破", 巳申: "破", 未戌: "破",
};

// 三合局
const THREE_HARMONY: Array<[string, string, string, string, string]> = [
  ["申", "子", "辰", "合水局", "水"],
  ["寅", "午", "戌", "合火局", "火"],
  ["亥", "卯", "未", "合木局", "木"],
  ["巳", "酉", "丑", "合金局", "金"],
];

// 三会局（方局）
const THREE_DIRECTION: Array<[string, string, string, string, string]> = [
  ["寅", "卯", "辰", "会东方木局", "木"],
  ["巳", "午", "未", "会南方火局", "火"],
  ["申", "酉", "戌", "会西方金局", "金"],
  ["亥", "子", "丑", "会北方水局", "水"],
];

export function analyzeBranchRelations(branches: Branch[]): BranchRelation[] {
  const relations: BranchRelation[] = [];

  // 两两关系
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const key = branches[i] + branches[j];
      const rkey = branches[j] + branches[i];

      if (SIX_HARMONY[key] || SIX_HARMONY[rkey]) {
        relations.push({
          type: "合", positions: [i, j], branches: key,
          description: `${branches[i]}${branches[j]}六合，合化${SIX_HARMONY[key] ?? SIX_HARMONY[rkey]}`,
        });
      }
      if (SIX_CLASH[key] || SIX_CLASH[rkey]) {
        relations.push({
          type: "冲", positions: [i, j], branches: key,
          description: `${branches[i]}${branches[j]}六冲：${SIX_CLASH[key] ?? SIX_CLASH[rkey]}`,
        });
      }
      if (SIX_HARM[key] || SIX_HARM[rkey]) {
        relations.push({
          type: "害", positions: [i, j], branches: key,
          description: `${branches[i]}${branches[j]}六害`,
        });
      }
      if (SIX_BREAK[key] || SIX_BREAK[rkey]) {
        relations.push({
          type: "破", positions: [i, j], branches: key,
          description: `${branches[i]}${branches[j]}六破`,
        });
      }
      if (MUTUAL_PUNISHMENT[key]) {
        relations.push({
          type: "刑", positions: [i, j], branches: key,
          description: `${branches[i]}${branches[j]}${MUTUAL_PUNISHMENT[key]}`,
        });
      }
      if (SELF_PUNISHMENT[key]) {
        relations.push({
          type: "刑", positions: [i, j], branches: key,
          description: `${branches[i]}${branches[j]}自刑`,
        });
      }
    }
  }

  // 三刑（寅巳申、丑戌未）
  for (const [a, b, c, name] of THREE_PUNISHMENTS) {
    const ia = branches.indexOf(a as Branch);
    const ib = branches.indexOf(b as Branch);
    const ic = branches.indexOf(c as Branch);
    if (ia !== -1 && ib !== -1 && ic !== -1) {
      relations.push({
        type: "刑", positions: [ia, ib, ic], branches: `${a}${b}${c}`,
        description: `${a}${b}${c}三刑（${name}）`,
      });
    }
  }

  // 三合局
  for (const [a, b, c, name, element] of THREE_HARMONY) {
    const found = [a, b, c].filter(x => branches.includes(x as Branch));
    if (found.length === 3) {
      const positions = found.map(x => branches.indexOf(x as Branch));
      relations.push({
        type: "三合", positions, branches: `${a}${b}${c}`,
        description: `${a}${b}${c}${name}`,
      });
    } else if (found.length === 2) {
      const positions = found.map(x => branches.indexOf(x as Branch));
      relations.push({
        type: "三合", positions, branches: found.join(""),
        description: `${found.join("")}半合${element}局`,
      });
    }
  }

  // 三会局
  for (const [a, b, c, name, element] of THREE_DIRECTION) {
    const found = [a, b, c].filter(x => branches.includes(x as Branch));
    if (found.length === 3) {
      const positions = found.map(x => branches.indexOf(x as Branch));
      relations.push({
        type: "三会", positions, branches: `${a}${b}${c}`,
        description: `${name}`,
      });
    } else if (found.length === 2) {
      const positions = found.map(x => branches.indexOf(x as Branch));
      relations.push({
        type: "三会", positions, branches: found.join(""),
        description: `${found.join("")}半会${element}局`,
      });
    }
  }

  return relations;
}

// 天干五合
const STEM_FIVE_HARMONY: Record<string, string> = {
  甲己: "土", 乙庚: "金", 丙辛: "水", 丁壬: "木", 戊癸: "火",
};

// 天干相冲
const STEM_CLASH: Record<string, string> = {
  甲庚: "冲", 乙辛: "冲", 壬丙: "冲", 癸丁: "冲",
};

export function analyzeStemRelations(stems: Stem[]): Array<{
  type: "合" | "冲";
  positions: number[];
  description: string;
}> {
  const relations: Array<{ type: "合" | "冲"; positions: number[]; description: string }> = [];

  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const key = stems[i] + stems[j];
      const rkey = stems[j] + stems[i];

      if (STEM_FIVE_HARMONY[key] || STEM_FIVE_HARMONY[rkey]) {
        relations.push({
          type: "合", positions: [i, j],
          description: `${stems[i]}${stems[j]}天干五合，合化${STEM_FIVE_HARMONY[key] ?? STEM_FIVE_HARMONY[rkey]}`,
        });
      }
      if (STEM_CLASH[key] || STEM_CLASH[rkey]) {
        relations.push({
          type: "冲", positions: [i, j],
          description: `${stems[i]}${stems[j]}天干相冲`,
        });
      }
    }
  }

  return relations;
}
