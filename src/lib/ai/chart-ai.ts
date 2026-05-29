// AI 自排盘模块：让 Claude 根据出生信息独立排盘
import { callAI } from "./client";

export interface AISelfChartResult {
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  assumptions: {
    lichun换年: boolean;
    jieqi定月: boolean;
    trueSolarTime: boolean;
    hourBoundaryRisk: boolean;
  };
  uncertainties: string[];
  rawResponse: string;
}

// AI 自排盘 Prompt
const AI_SELF_CHART_SYSTEM = `你现在只做八字排盘复核，不做命理分析。

任务：根据出生信息，按八字常规口径自行排出四柱。

规则：
1. 严格按立春换年（不是农历正月初一）
2. 严格按节气定月（不是农历月份）
3. 时柱按北京时间（除非明确说明真太阳时）
4. 如果出生时间在时辰交界附近（±20分钟），必须标注风险
5. 子时（23:00-01:00）需说明是否按 23:00 换日

输出格式（严格 JSON）：
{
  "pillars": {
    "year": "天干地支",
    "month": "天干地支",
    "day": "天干地支",
    "hour": "天干地支"
  },
  "assumptions": {
    "lichun换年": true,
    "jieqi定月": true,
    "trueSolarTime": false,
    "hourBoundaryRisk": false
  },
  "uncertainties": ["不确定点1", "不确定点2"]
}

不得生成事业、婚姻、财运等分析。只输出 JSON，不要其他文字。`;

export async function aiSelfChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: "male" | "female",
  birthPlace?: string,
  useTrueSolarTime?: boolean
): Promise<AISelfChartResult> {
  const userPrompt = `请根据以下出生信息排八字四柱：

出生日期：${year}年${month}月${day}日
出生时间：${hour}时${minute}分
性别：${gender === "male" ? "男" : "女"}
${birthPlace ? `出生地：${birthPlace}` : ""}
${useTrueSolarTime ? "已启用真太阳时校正" : "使用北京时间"}

请输出 JSON 格式的排盘结果。`;

  const response = await callAI(
    "ai_self_chart",
    AI_SELF_CHART_SYSTEM,
    [{ role: "user", content: userPrompt }],
    { provider: "claude" }
  );

  // 解析 JSON
  try {
    const jsonMatch = response.content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        pillars: parsed.pillars ?? { year: "", month: "", day: "", hour: "" },
        assumptions: parsed.assumptions ?? {
          lichun换年: true, jieqi定月: true, trueSolarTime: false, hourBoundaryRisk: false,
        },
        uncertainties: parsed.uncertainties ?? [],
        rawResponse: response.content,
      };
    }
  } catch {
    // JSON 解析失败，返回原始响应
  }

  return {
    pillars: { year: "", month: "", day: "", hour: "" },
    assumptions: { lichun换年: true, jieqi定月: true, trueSolarTime: false, hourBoundaryRisk: false },
    uncertainties: ["AI 输出格式异常，需人工复核"],
    rawResponse: response.content,
  };
}
