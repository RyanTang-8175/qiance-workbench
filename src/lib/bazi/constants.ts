// 天干
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export type Stem = (typeof STEMS)[number];

// 地支
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export type Branch = (typeof BRANCHES)[number];

// 五行
export const ELEMENTS = ["木", "火", "土", "金", "水"] as const;
export type Element = (typeof ELEMENTS)[number];

// 天干五行映射
export const STEM_ELEMENT: Record<Stem, Element> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

// 天干阴阳
export const STEM_YINYANG: Record<Stem, "阳" | "阴"> = {
  甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳",
  己: "阴", 庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴",
};

// 地支五行映射
export const BRANCH_ELEMENT: Record<Branch, Element> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

// 地支藏干
export const BRANCH_HIDDEN_STEMS: Record<Branch, Stem[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

// 十神
export type TenGod =
  | "比肩" | "劫财"
  | "食神" | "伤官"
  | "偏财" | "正财"
  | "七杀" | "正官"
  | "偏印" | "正印";

// 十神计算：日干 vs 其他干
export function calculateTenGod(dayStem: Stem, otherStem: Stem): TenGod {
  const dayElement = STEM_ELEMENT[dayStem];
  const otherElement = STEM_ELEMENT[otherStem];
  const dayYinYang = STEM_YINYANG[dayStem];
  const otherYinYang = STEM_YINYANG[otherStem];
  const sameYinYang = dayYinYang === otherYinYang;

  if (dayElement === otherElement) return sameYinYang ? "比肩" : "劫财";

  const elementOrder: Element[] = ["木", "火", "土", "金", "水"];
  const dayIdx = elementOrder.indexOf(dayElement);
  const otherIdx = elementOrder.indexOf(otherElement);

  // 我生：食伤
  if (otherIdx === (dayIdx + 1) % 5) return sameYinYang ? "食神" : "伤官";
  // 生我：印
  if (otherIdx === (dayIdx + 4) % 5) return sameYinYang ? "偏印" : "正印";
  // 我克：财
  if (otherIdx === (dayIdx + 2) % 5) return sameYinYang ? "偏财" : "正财";
  // 克我：官杀
  if (otherIdx === (dayIdx + 3) % 5) return sameYinYang ? "七杀" : "正官";

  return "比肩"; // fallback
}

// 纳音表（简化版，按六十甲子序号）
const NAYIN_TABLE: Record<string, string> = {
  "甲子": "海中金", "乙丑": "海中金", "丙寅": "炉中火", "丁卯": "炉中火",
  "戊辰": "大林木", "己巳": "大林木", "庚午": "路旁土", "辛未": "路旁土",
  "壬申": "剑锋金", "癸酉": "剑锋金", "甲戌": "山头火", "乙亥": "山头火",
  "丙子": "涧下水", "丁丑": "涧下水", "戊寅": "城头土", "己卯": "城头土",
  "庚辰": "白蜡金", "辛巳": "白蜡金", "壬午": "杨柳木", "癸未": "杨柳木",
  "甲申": "泉中水", "乙酉": "泉中水", "丙戌": "屋上土", "丁亥": "屋上土",
  "戊子": "霹雳火", "己丑": "霹雳火", "庚寅": "松柏木", "辛卯": "松柏木",
  "壬辰": "长流水", "癸巳": "长流水", "甲午": "砂中金", "乙未": "砂中金",
  "丙申": "山下火", "丁酉": "山下火", "戊戌": "平地木", "己亥": "平地木",
  "庚子": "壁上土", "辛丑": "壁上土", "壬寅": "金箔金", "癸卯": "金箔金",
  "甲辰": "覆灯火", "乙巳": "覆灯火", "丙午": "天河水", "丁未": "天河水",
  "戊申": "大驿土", "己酉": "大驿土", "庚戌": "钗钏金", "辛亥": "钗钏金",
  "壬子": "桑柘木", "癸丑": "桑柘木", "甲寅": "大溪水", "乙卯": "大溪水",
  "丙辰": "沙中土", "丁巳": "沙中土", "戊午": "天上火", "己未": "天上火",
  "庚申": "石榴木", "辛酉": "石榴木", "壬戌": "大海水", "癸亥": "大海水",
};

export function getNaYin(stem: Stem, branch: Branch): string {
  return NAYIN_TABLE[stem + branch] ?? "未知";
}

// 时辰对照表
export const HOUR_BRANCH_MAP: Record<number, Branch> = {
  23: "子", 0: "子",
  1: "丑", 2: "丑",
  3: "寅", 4: "寅",
  5: "卯", 6: "卯",
  7: "辰", 8: "辰",
  9: "巳", 10: "巳",
  11: "午", 12: "午",
  13: "未", 14: "未",
  15: "申", 16: "申",
  17: "酉", 18: "酉",
  19: "戌", 20: "戌",
  21: "亥", 22: "亥",
};

// 时辰边界（半开区间）
export const HOUR_BOUNDARIES: Array<{ branch: Branch; start: number; end: number }> = [
  { branch: "子", start: 23, end: 1 },   // 23:00-01:00
  { branch: "丑", start: 1, end: 3 },    // 01:00-03:00
  { branch: "寅", start: 3, end: 5 },    // 03:00-05:00
  { branch: "卯", start: 5, end: 7 },    // 05:00-07:00
  { branch: "辰", start: 7, end: 9 },    // 07:00-09:00
  { branch: "巳", start: 9, end: 11 },   // 09:00-11:00
  { branch: "午", start: 11, end: 13 },  // 11:00-13:00
  { branch: "未", start: 13, end: 15 },  // 13:00-15:00
  { branch: "申", start: 15, end: 17 },  // 15:00-17:00
  { branch: "酉", start: 17, end: 19 },  // 17:00-19:00
  { branch: "戌", start: 19, end: 21 },  // 19:00-21:00
  { branch: "亥", start: 21, end: 23 },  // 21:00-23:00
];
