// 命盘结构化分析 Skill
import { callAIStream } from "../client";

export interface ChartAnalysis {
  geju: string;         // 格局判定
  qiangruo: string;     // 强弱分析
  xiji: string;         // 喜忌判断
  tiaohou: string;      // 调候需求
  maodun: string;       // 核心矛盾
  dayunJiedian: string; // 大运关键节点
  nengduan: string;     // 能断什么
  bunengshuo: string;   // 什么不能说太满
  zhuiwen: string;      // 需要追问什么
  raw: string;          // 原始输出
}

const ANALYZER_SYSTEM = `你是一位精通传统命理学的分析师。你的任务是对八字命盘做结构化分析。

分析框架（必须逐一回答）：

1. **格局判定**：判断此命属于什么格局（正官格/七杀格/正印格/偏印格/食神格/伤官格/正财格/偏财格/建禄格/月刃格/专旺格/从格等）。说明依据（月令透干、格局成立条件）。

2. **强弱分析**：日主旺衰判断。得令？得地？得生？得助？综合判断偏旺/偏弱/中和/太旺/太弱。

3. **喜忌判断**：基于格局和强弱，给出用神、喜神、忌神、仇神。说明推理过程。

4. **调候需求**：是否需要调候？调候用神是什么？参考《穷通宝鉴》。

5. **核心矛盾提炼**：这个命局最大的矛盾点是什么？（如：身强无泄、官杀混杂、食伤泄秀太过、财多身弱等）用一两句话概括。

6. **大运关键节点**：哪几步大运是关键转折？为什么？（换运年份、冲合变化）

7. **能断什么**：基于命盘，能明确断出什么？（性格特征、人生模式、六亲关系等）

8. **什么不能说太满**：哪些方面命盘信息不足或矛盾，需要谨慎？

9. **需要追问什么**：要验证此命盘，应该问客户什么问题？

输出格式：每个部分用"## 标题"开头，内容要具体、有依据、不空洞。引用命盘中的具体字段。`;

export async function analyzeChart(
  chartData: object,
  onChunk?: (chunk: string) => void
): Promise<ChartAnalysis> {
  const userPrompt = `请对此命盘做结构化分析：

${JSON.stringify(chartData, null, 2)}`;

  let raw = "";
  const response = await callAIStream(
    "internal_analysis",
    ANALYZER_SYSTEM,
    [{ role: "user", content: userPrompt }],
    (chunk) => {
      raw += chunk;
      onChunk?.(chunk);
    }
  );

  // 提取各部分
  const extract = (title: string): string => {
    const regex = new RegExp(`##\\s*${title}[\\s\\S]*?(?=##|$)`);
    const match = raw.match(regex);
    return match?.[0]?.replace(`## ${title}`, "").trim() ?? "";
  };

  return {
    geju: extract("格局判定") || extract("格局"),
    qiangruo: extract("强弱分析") || extract("强弱"),
    xiji: extract("喜忌判断") || extract("喜忌"),
    tiaohou: extract("调候") || extract("调候需求"),
    maodun: extract("核心矛盾") || extract("矛盾"),
    dayunJiedian: extract("大运关键") || extract("大运"),
    nengduan: extract("能断"),
    bunengshuo: extract("不能说") || extract("谨慎"),
    zhuiwen: extract("追问") || extract("需要追问"),
    raw: response.content,
  };
}
