// 断前事 Skill — 基于命盘特征生成断语
import { callAIStream } from "../client";

export interface Prediction {
  statements: Array<{
    content: string;       // 客户可听的话术
    basis: string;         // 命理依据
    confidence: "高" | "中" | "低";
    followUp: string;      // 补问路径
    dimension: string;     // 维度
  }>;
  raw: string;
}

const PREDICTOR_SYSTEM = `你是一位经验丰富的命理师，擅长通过八字命盘断前事（验证性断语）。

你的任务：根据命盘特征，生成 3 条高置信度的断前事候选。

**核心原则**：
- 每条断语必须有命盘依据，不能凭空编造
- 优先断有把握的，不宁模棱两可的
- 断语要像命理师私下说话，不像 AI 列表
- 每条都带补问路径（如果客户说不准，该怎么追问）

**分析维度（按优先级）**：
1. 早年家庭环境（年柱、月柱看父母模式、家庭氛围）
2. 性格核心特征（日主、日支、月令看内在底色）
3. 人生重大转折（大运切换点看搬迁、变故、转折）
4. 事业/资源模式（官杀、印、财的组合看压力来源和资源获取方式）
5. 情感/亲密关系（日支、桃花、夫妻宫相关）

输出格式（严格 JSON）：
{
  "statements": [
    {
      "content": "客户可听的话术",
      "basis": "命理依据（引用具体字段）",
      "confidence": "高/中/低",
      "followUp": "如果客户说不准，应该追问什么",
      "dimension": "属于哪个维度"
    }
  ]
}

只输出 JSON，不要其他文字。`;

export async function predictPrevalidation(
  chartData: object,
  onChunk?: (chunk: string) => void
): Promise<Prediction> {
  const userPrompt = `请根据此命盘生成 3 条断前事候选：

${JSON.stringify(chartData, null, 2)}`;

  let raw = "";
  await callAIStream(
    "prevalidation",
    PREDICTOR_SYSTEM,
    [{ role: "user", content: userPrompt }],
    (chunk) => {
      raw += chunk;
      onChunk?.(chunk);
    }
  );

  // 解析 JSON
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        statements: parsed.statements?.map((s: Record<string, string>) => ({
          content: s.content ?? "",
          basis: s.basis ?? "",
          confidence: s.confidence ?? "中",
          followUp: s.followUp ?? "",
          dimension: s.dimension ?? "",
        })) ?? [],
        raw,
      };
    }
  } catch { /* fallback */ }

  return {
    statements: [{
      content: raw.slice(0, 500),
      basis: "AI 输出格式异常，需人工复核",
      confidence: "低",
      followUp: "需人工判断",
      dimension: "未知",
    }],
    raw,
  };
}
