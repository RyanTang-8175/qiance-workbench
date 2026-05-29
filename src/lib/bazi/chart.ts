// 八字排盘核心引擎
import { Solar } from "lunar-javascript";
import type { Stem, Branch, Element, TenGod } from "./constants";
import {
  STEMS, BRANCHES, STEM_ELEMENT, BRANCH_ELEMENT, STEM_YINYANG,
  BRANCH_HIDDEN_STEMS, calculateTenGod, getNaYin,
} from "./constants";
import { analyzeBranchRelations, analyzeStemRelations, type BranchRelation } from "./relations";
import { analyzeShenSha, type ShenSha } from "./shensha";
import { calculateLuckCycles, type LuckCycle } from "./luck-cycles";

export interface PillarData {
  stem: Stem;
  branch: Branch;
  tenGod: TenGod;
  element: Element;
  yinYang: "阴" | "阳";
  hiddenStems: Stem[];
  naYin: string;
}

export interface ChartResult {
  // 基础信息
  solarDate: string;
  lunarDate: string;
  gender: "male" | "female";
  birthPlace?: string;

  // 四柱
  yearPillar: PillarData;
  monthPillar: PillarData;
  dayPillar: PillarData;
  hourPillar: PillarData;

  // 日主
  dayMaster: Stem;
  dayMasterElement: Element;

  // 五行统计
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  elementAnalysis: string;

  // 大运
  luckCycles: LuckCycle[];
  currentLuckCycle: LuckCycle | null;

  // 关系
  branchRelations: BranchRelation[];
  stemRelations: ReturnType<typeof analyzeStemRelations>;

  // 神煞
  shenSha: ShenSha[];

  // 元数据
  source: "system";
  calculatedAt: string;
}

function makePillarData(stem: Stem, branch: Branch, dayMaster: Stem): PillarData {
  return {
    stem,
    branch,
    tenGod: calculateTenGod(dayMaster, stem),
    element: STEM_ELEMENT[stem],
    yinYang: STEM_YINYANG[stem],
    hiddenStems: BRANCH_HIDDEN_STEMS[branch],
    naYin: getNaYin(stem, branch),
  };
}

function countElements(stems: Stem[], branches: Branch[]): ChartResult["elements"] {
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const elemMap: Record<Element, keyof typeof counts> = {
    木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water",
  };
  for (const s of stems) {
    counts[elemMap[STEM_ELEMENT[s]]]++;
  }
  for (const b of branches) {
    counts[elemMap[BRANCH_ELEMENT[b]]]++;
  }
  return counts;
}

function analyzeElements(elements: ChartResult["elements"]): string {
  const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
  const entries = Object.entries(elements) as [keyof typeof elements, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const elemNames: Record<string, string> = {
    wood: "木", fire: "火", earth: "土", metal: "金", water: "水",
  };

  let analysis = `五行分布：`;
  analysis += entries.map(([k, v]) => `${elemNames[k]}${v}`).join("、");
  analysis += `。`;
  analysis += `${elemNames[strongest[0]]}最旺（${strongest[1]}），${elemNames[weakest[0]]}最弱（${weakest[1]}）。`;

  if (weakest[1] === 0) {
    analysis += `${elemNames[weakest[0]]}缺，需注意补益。`;
  }

  return analysis;
}

export function generateChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: "male" | "female",
  birthPlace?: string,
  useTrueSolarTime: boolean = false,
  longitude?: number
): ChartResult {
  // 使用 lunar-javascript 排盘
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 四柱
  const yearStem = eightChar.getYear()[0] as Stem;
  const yearBranch = eightChar.getYear()[1] as Branch;
  const monthStem = eightChar.getMonth()[0] as Stem;
  const monthBranch = eightChar.getMonth()[1] as Branch;
  const dayStem = eightChar.getDay()[0] as Stem;
  const dayBranch = eightChar.getDay()[1] as Branch;
  const hourStem = eightChar.getTime()[0] as Stem;
  const hourBranch = eightChar.getTime()[1] as Branch;

  const dayMaster = dayStem;

  // 构建四柱数据
  const yearPillar = makePillarData(yearStem, yearBranch, dayMaster);
  const monthPillar = makePillarData(monthStem, monthBranch, dayMaster);
  const dayPillar = makePillarData(dayStem, dayBranch, dayMaster);
  const hourPillar = makePillarData(hourStem, hourBranch, dayMaster);

  // 五行统计
  const allStems = [yearStem, monthStem, dayStem, hourStem];
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
  const elements = countElements(allStems, allBranches);

  // 大运
  const currentYear = new Date().getFullYear();
  const luckCycles = calculateLuckCycles(
    gender, yearStem, monthStem, monthBranch, dayStem,
    year, month, day, currentYear
  );
  const currentLuckCycle = luckCycles.find(c => c.isCurrent) ?? null;

  // 关系分析
  const branchRelations = analyzeBranchRelations(allBranches);
  const stemRelations = analyzeStemRelations(allStems);

  // 神煞
  const shenSha = analyzeShenSha(dayStem, yearBranch, monthBranch, allBranches);

  return {
    solarDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    lunarDate: lunar.toFullString(),
    gender,
    birthPlace,
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    dayMasterElement: STEM_ELEMENT[dayMaster],
    elements,
    elementAnalysis: analyzeElements(elements),
    luckCycles,
    currentLuckCycle,
    branchRelations,
    stemRelations,
    shenSha,
    source: "system",
    calculatedAt: new Date().toISOString(),
  };
}
