// 大运计算
import { Solar } from "lunar-javascript";
import type { Stem, Branch } from "./constants";
import { STEMS, BRANCHES, calculateTenGod, STEM_ELEMENT, type TenGod } from "./constants";

export interface LuckCycle {
  index: number;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  pillar: string;
  stem: Stem;
  branch: Branch;
  tenGod: TenGod;
  element: string;
  isCurrent: boolean;
}

// 判断天干阴阳
function isYangStem(stem: Stem): boolean {
  return ["甲", "丙", "戊", "庚", "壬"].includes(stem);
}

// 获取下一个干支
function nextPillar(stem: Stem, branch: Branch): [Stem, Branch] {
  const si = (STEMS.indexOf(stem) + 1) % 10;
  const bi = (BRANCHES.indexOf(branch) + 1) % 12;
  return [STEMS[si], BRANCHES[bi]];
}

// 获取上一个干支
function prevPillar(stem: Stem, branch: Branch): [Stem, Branch] {
  const si = (STEMS.indexOf(stem) + 9) % 10;
  const bi = (BRANCHES.indexOf(branch) + 11) % 12;
  return [STEMS[si], BRANCHES[bi]];
}

// 计算两个日期之间的天数差
function daysBetween(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): number {
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  return Math.round(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

// 计算起运岁数（基于节气间隔，3天折1年）
function calculateStartAge(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  isForward: boolean
): number {
  const solar = Solar.fromYmd(birthYear, birthMonth, birthDay);
  const lunar = solar.getLunar();

  // 顺排用下一个节气，逆排用上一个节气
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jieQi = isForward ? (lunar as any).getNextJieQi() : (lunar as any).getPrevJieQi();
  if (!jieQi) return 1; // fallback

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jieQiSolar = (jieQi as any).getSolar();
  const jqYear = jieQiSolar.getYear();
  const jqMonth = jieQiSolar.getMonth();
  const jqDay = jieQiSolar.getDay();

  // 使用精确的日期差计算
  const daysDiff = daysBetween(birthYear, birthMonth, birthDay, jqYear, jqMonth, jqDay);

  // 3天折1年，四舍五入
  const age = Math.round(daysDiff / 3);
  return Math.max(1, age);
}

export function calculateLuckCycles(
  gender: "male" | "female",
  yearStem: Stem,
  monthStem: Stem,
  monthBranch: Branch,
  dayStem: Stem,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  currentYear: number
): LuckCycle[] {
  // 阳年男/阴年女顺排，反之逆排
  const isYangYear = isYangStem(yearStem);
  const isForward = (isYangYear && gender === "male") || (!isYangYear && gender === "female");

  const startAge = calculateStartAge(birthYear, birthMonth, birthDay, isForward);

  const cycles: LuckCycle[] = [];
  let currentStem = monthStem;
  let currentBranch = monthBranch;

  for (let i = 0; i < 10; i++) {
    if (isForward) {
      [currentStem, currentBranch] = nextPillar(currentStem, currentBranch);
    } else {
      [currentStem, currentBranch] = prevPillar(currentStem, currentBranch);
    }

    const cycleStartAge = startAge + i * 10;
    const cycleStartYear = birthYear + cycleStartAge;
    const cycleEndYear = cycleStartYear + 9;
    const currentAge = currentYear - birthYear;
    const isCurrent = currentAge >= cycleStartAge && currentAge < cycleStartAge + 10;

    cycles.push({
      index: i,
      startAge: cycleStartAge,
      endAge: cycleStartAge + 9,
      startYear: cycleStartYear,
      endYear: cycleEndYear,
      pillar: currentStem + currentBranch,
      stem: currentStem,
      branch: currentBranch,
      tenGod: calculateTenGod(dayStem, currentStem),
      element: STEM_ELEMENT[currentStem],
      isCurrent,
    });
  }

  return cycles;
}
