// 真太阳时校正
// 基于出生地经纬度和时区，将北京时间转换为真太阳时

// 均时差计算（Equation of Time）
// 基于一年中第N天的近似公式
function equationOfTime(dayOfYear: number): number {
  // 返回分钟数
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

// 获取一年中的第几天
function getDayOfYear(year: number, month: number, day: number): number {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[2] = 29;
  }
  let total = day;
  for (let i = 1; i < month; i++) {
    total += daysInMonth[i];
  }
  return total;
}

export interface TrueSolarTimeResult {
  originalTime: Date;
  correctedTime: Date;
  longitudeCorrection: number; // 分钟
  eotCorrection: number;       // 分钟（均时差）
  totalCorrection: number;     // 分钟
  originalHour: number;
  correctedHour: number;
  originalBranch: string;
  correctedBranch: string;
  isBoundary: boolean;         // 是否在时辰边界
  boundaryMinutes: number;     // 距离边界多少分钟
}

// 时辰名
const HOUR_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function getHourBranch(hour: number, minute: number = 0): string {
  // 23:00-01:00 子时, 01:00-03:00 丑时, ...
  const totalMinutes = hour * 60 + minute;
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) return "子";
  const idx = Math.floor((totalMinutes - 60) / 120);
  return HOUR_NAMES[Math.min(idx + 1, 11)];
}

function getHourBranchWithBoundary(hour: number, minute: number = 0): { branch: string; isBoundary: boolean; boundaryMinutes: number } {
  const totalMinutes = hour * 60 + minute;

  // 每个时辰的边界（分钟）
  const boundaries = [
    { start: 23 * 60, end: 1 * 60, branch: "子" },    // 23:00-01:00
    { start: 1 * 60, end: 3 * 60, branch: "丑" },     // 01:00-03:00
    { start: 3 * 60, end: 5 * 60, branch: "寅" },     // 03:00-05:00
    { start: 5 * 60, end: 7 * 60, branch: "卯" },     // 05:00-07:00
    { start: 7 * 60, end: 9 * 60, branch: "辰" },     // 07:00-09:00
    { start: 9 * 60, end: 11 * 60, branch: "巳" },    // 09:00-11:00
    { start: 11 * 60, end: 13 * 60, branch: "午" },   // 11:00-13:00
    { start: 13 * 60, end: 15 * 60, branch: "未" },   // 13:00-15:00
    { start: 15 * 60, end: 17 * 60, branch: "申" },   // 15:00-17:00
    { start: 17 * 60, end: 19 * 60, branch: "酉" },   // 17:00-19:00
    { start: 19 * 60, end: 21 * 60, branch: "戌" },   // 19:00-21:00
    { start: 21 * 60, end: 23 * 60, branch: "亥" },   // 21:00-23:00
  ];

  // 处理跨日
  let normalizedMinutes = totalMinutes;
  if (normalizedMinutes < 0) normalizedMinutes += 24 * 60;
  if (normalizedMinutes >= 24 * 60) normalizedMinutes -= 24 * 60;

  for (const b of boundaries) {
    let start = b.start;
    let end = b.end;
    if (start > end) { // 跨日（子时）
      if (normalizedMinutes >= start || normalizedMinutes < end) {
        const distToStart = normalizedMinutes >= start
          ? normalizedMinutes - start
          : normalizedMinutes + 24 * 60 - start;
        const distToEnd = normalizedMinutes < end
          ? end - normalizedMinutes
          : end + 24 * 60 - normalizedMinutes;
        const minDist = Math.min(distToStart, distToEnd);
        return { branch: b.branch, isBoundary: minDist <= 20, boundaryMinutes: minDist };
      }
    } else {
      if (normalizedMinutes >= start && normalizedMinutes < end) {
        const distToStart = normalizedMinutes - start;
        const distToEnd = end - normalizedMinutes;
        const minDist = Math.min(distToStart, distToEnd);
        return { branch: b.branch, isBoundary: minDist <= 20, boundaryMinutes: minDist };
      }
    }
  }

  return { branch: "子", isBoundary: false, boundaryMinutes: 0 };
}

export function calculateTrueSolarTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  longitude: number,   // 出生地经度（东经为正）
  timezoneOffset: number = 8 // 时区偏移（东八区 = 8）
): TrueSolarTimeResult {
  const originalTime = new Date(year, month - 1, day, hour, minute);

  // 1. 经度时差修正
  // 标准经度 = 时区 * 15
  const standardLongitude = timezoneOffset * 15;
  const lngCorrection = (longitude - standardLongitude) * 4; // 每度4分钟

  // 2. 均时差修正
  const dayOfYear = getDayOfYear(year, month, day);
  const eot = equationOfTime(dayOfYear);

  // 3. 合并修正
  const totalCorrection = lngCorrection + eot;
  const correctedTime = new Date(originalTime.getTime() + totalCorrection * 60 * 1000);

  const originalResult = getHourBranchWithBoundary(hour, minute);
  const correctedResult = getHourBranchWithBoundary(correctedTime.getHours(), correctedTime.getMinutes());

  return {
    originalTime,
    correctedTime,
    longitudeCorrection: Math.round(lngCorrection * 100) / 100,
    eotCorrection: Math.round(eot * 100) / 100,
    totalCorrection: Math.round(totalCorrection * 100) / 100,
    originalHour: hour,
    correctedHour: correctedTime.getHours() + correctedTime.getMinutes() / 60,
    originalBranch: originalResult.branch,
    correctedBranch: correctedResult.branch,
    isBoundary: correctedResult.isBoundary,
    boundaryMinutes: correctedResult.boundaryMinutes,
  };
}

// 常见城市经纬度
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "北京": { lat: 39.9, lng: 116.4 },
  "上海": { lat: 31.2, lng: 121.5 },
  "广州": { lat: 23.1, lng: 113.3 },
  "深圳": { lat: 22.5, lng: 114.1 },
  "成都": { lat: 30.6, lng: 104.1 },
  "杭州": { lat: 30.3, lng: 120.2 },
  "武汉": { lat: 30.6, lng: 114.3 },
  "南京": { lat: 32.1, lng: 118.8 },
  "重庆": { lat: 29.6, lng: 106.5 },
  "西安": { lat: 34.3, lng: 108.9 },
  "天津": { lat: 39.1, lng: 117.2 },
  "苏州": { lat: 31.3, lng: 120.6 },
  "长沙": { lat: 28.2, lng: 113.0 },
  "沈阳": { lat: 41.8, lng: 123.4 },
  "哈尔滨": { lat: 45.8, lng: 126.5 },
  "昆明": { lat: 25.0, lng: 102.7 },
  "福州": { lat: 26.1, lng: 119.3 },
  "厦门": { lat: 24.5, lng: 118.1 },
  "济南": { lat: 36.7, lng: 117.0 },
  "青岛": { lat: 36.1, lng: 120.4 },
  "大连": { lat: 38.9, lng: 121.6 },
  "郑州": { lat: 34.7, lng: 113.7 },
  "合肥": { lat: 31.8, lng: 117.3 },
  "南昌": { lat: 28.7, lng: 115.9 },
  "贵阳": { lat: 26.6, lng: 106.7 },
  "兰州": { lat: 36.1, lng: 103.8 },
  "太原": { lat: 37.9, lng: 112.6 },
  "石家庄": { lat: 38.0, lng: 114.5 },
  "乌鲁木齐": { lat: 43.8, lng: 87.6 },
  "拉萨": { lat: 29.6, lng: 91.1 },
  "呼和浩特": { lat: 40.8, lng: 111.7 },
  "南宁": { lat: 22.8, lng: 108.4 },
  "海口": { lat: 20.0, lng: 110.3 },
  "银川": { lat: 38.5, lng: 106.3 },
  "西宁": { lat: 36.6, lng: 101.8 },
  "台北": { lat: 25.0, lng: 121.5 },
  "香港": { lat: 22.3, lng: 114.2 },
  "澳门": { lat: 22.2, lng: 113.5 },
};
