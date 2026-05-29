// 三盘校验引擎：对比系统盘、AI自排、图片识别
import type { ChartResult } from "./chart";
import type { AISelfChartResult } from "@/lib/ai/chart-ai";
import type { ChartOCRResult } from "@/lib/ai/chart-ocr";

export type ChartSource = "system" | "ai" | "image";

export interface PillarComparison {
  position: "year" | "month" | "day" | "hour";
  positionName: string;
  system: string;
  ai: string;
  image: string;
  status: "一致" | "冲突" | "部分一致" | "缺失";
  possibleReason?: string;
  suggestion?: string;
}

export interface VerificationResult {
  overallStatus: "一致" | "有差异" | "严重冲突";
  pillars: PillarComparison[];
  summary: string;
  recommendations: string[];
}

// 单柱对比
function comparePillar(
  position: "year" | "month" | "day" | "hour",
  positionName: string,
  systemValue: string,
  aiValue: string,
  imageValue: string
): PillarComparison {
  const values = [systemValue, aiValue, imageValue].filter(v => v && v !== "");
  const uniqueValues = [...new Set(values)];

  let status: PillarComparison["status"];
  let possibleReason: string | undefined;
  let suggestion: string | undefined;

  if (uniqueValues.length <= 1) {
    status = "一致";
  } else if (imageValue && imageValue !== systemValue && imageValue !== aiValue) {
    status = "冲突";
    possibleReason = getPossibleReason(position, systemValue, aiValue, imageValue);
    suggestion = getSuggestion(position, systemValue, aiValue, imageValue);
  } else if (aiValue && aiValue !== systemValue) {
    status = "冲突";
    possibleReason = "AI 排盘口径与系统盘不同";
    suggestion = "以系统盘为准，AI 仅作复核参考";
  } else {
    status = "部分一致";
  }

  return { position, positionName, system: systemValue, ai: aiValue, image: imageValue, status, possibleReason, suggestion };
}

// 差异原因分析
function getPossibleReason(position: string, system: string, ai: string, image: string): string {
  switch (position) {
    case "year":
      return "年柱不同：可能是立春换年口径不同（立春前出生，部分软件按农历正月换年）";
    case "month":
      return "月柱不同：可能是节气切换点差异，或历法库版本不同";
    case "day":
      return "日柱不同：可能是时区、日期录入或跨日问题";
    case "hour":
      return "时柱不同：可能是真太阳时校正、出生地经度、或时辰边界（如 13:00 午/未交界）";
    default:
      return "口径差异";
  }
}

// 修正建议
function getSuggestion(position: string, system: string, ai: string, image: string): string {
  const hasImage = image && image !== "";
  const hasAi = ai && ai !== "";

  if (hasImage && image !== system) {
    return `系统盘为 ${system}，图片识别为 ${image}。建议核实图片排盘软件的口径，或生成两个时辰假设盘用前事验盘。`;
  }
  if (hasAi && ai !== system) {
    return `系统盘为 ${system}，AI 自排为 ${ai}。以系统盘为准。`;
  }
  return "以系统盘为准";
}

// 综合校验
export function verifyCharts(
  systemChart: ChartResult,
  aiChart?: AISelfChartResult,
  imageChart?: ChartOCRResult
): VerificationResult {
  const pillars: PillarComparison[] = [
    comparePillar(
      "year", "年柱",
      systemChart.yearPillar.stem + systemChart.yearPillar.branch,
      aiChart?.pillars.year ?? "",
      imageChart?.pillars.year ?? ""
    ),
    comparePillar(
      "month", "月柱",
      systemChart.monthPillar.stem + systemChart.monthPillar.branch,
      aiChart?.pillars.month ?? "",
      imageChart?.pillars.month ?? ""
    ),
    comparePillar(
      "day", "日柱",
      systemChart.dayPillar.stem + systemChart.dayPillar.branch,
      aiChart?.pillars.day ?? "",
      imageChart?.pillars.day ?? ""
    ),
    comparePillar(
      "hour", "时柱",
      systemChart.hourPillar.stem + systemChart.hourPillar.branch,
      aiChart?.pillars.hour ?? "",
      imageChart?.pillars.hour ?? ""
    ),
  ];

  const conflictCount = pillars.filter(p => p.status === "冲突").length;
  const missingCount = pillars.filter(p => p.status === "缺失").length;

  let overallStatus: VerificationResult["overallStatus"];
  let summary: string;
  const recommendations: string[] = [];

  if (conflictCount === 0 && missingCount === 0) {
    overallStatus = "一致";
    summary = "三盘一致，排盘结果可信度高。";
    recommendations.push("可直接进入断前事环节");
  } else if (conflictCount <= 1) {
    overallStatus = "有差异";
    summary = `有 ${conflictCount} 项存在差异，需人工复核。`;
    const conflictPillars = pillars.filter(p => p.status === "冲突");
    for (const p of conflictPillars) {
      recommendations.push(`${p.positionName}：${p.suggestion}`);
    }
    recommendations.push("如有差异柱，建议用断前事验盘确认");
  } else {
    overallStatus = "严重冲突";
    summary = `有 ${conflictCount} 项严重冲突，排盘结果不可信，需重新核实出生信息。`;
    recommendations.push("请核实客户出生信息是否准确");
    recommendations.push("检查是否有真太阳时、时辰边界等问题");
    for (const p of pillars.filter(p => p.status === "冲突")) {
      recommendations.push(`${p.positionName}：${p.possibleReason}`);
    }
  }

  // AI 不确定点
  if (aiChart?.uncertainties && aiChart.uncertainties.length > 0) {
    recommendations.push(`AI 不确定点：${aiChart.uncertainties.join("；")}`);
  }

  // 图片不确定点
  if (imageChart?.uncertainties && imageChart.uncertainties.length > 0) {
    recommendations.push(`图片识别不确定：${imageChart.uncertainties.join("；")}`);
  }

  return { overallStatus, pillars, summary, recommendations };
}
