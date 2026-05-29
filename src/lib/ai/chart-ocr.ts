// 排盘图 OCR 识别模块：Claude Vision 识别排盘截图
import Anthropic from "@anthropic-ai/sdk";

export interface ChartOCRResult {
  birthInfo: {
    solarDate?: string;
    lunarDate?: string;
    gender?: string;
    birthPlace?: string;
    trueSolarTime?: boolean;
  };
  pillars: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
  luckCycles: Array<{
    age?: number;
    pillar?: string;
  }>;
  elements?: {
    wood?: number;
    fire?: number;
    earth?: number;
    metal?: number;
    water?: number;
  };
  shenSha?: string[];
  software?: string;
  uncertainties: string[];
  rawResponse: string;
}

const OCR_SYSTEM = `你现在只做排盘图识别，不做命理分析。

任务：从图片中提取所有可见的八字排盘信息。

识别内容：
1. 出生信息（公历/农历、性别、出生地、是否真太阳时）
2. 四柱（年柱、月柱、日柱、时柱）
3. 大运（每步大运的干支和起始年龄）
4. 五行分布（木火土金水的数量）
5. 神煞（可见的神煞名称）
6. 排盘软件名称
7. 看不清或不确定的字段

输出格式（严格 JSON）：
{
  "birthInfo": {
    "solarDate": "1990-01-01",
    "lunarDate": "农历日期",
    "gender": "男/女",
    "birthPlace": "出生地",
    "trueSolarTime": false
  },
  "pillars": {
    "year": "年柱天干地支",
    "month": "月柱天干地支",
    "day": "日柱天干地支",
    "hour": "时柱天干地支"
  },
  "luckCycles": [
    {"age": 5, "pillar": "大运干支"}
  ],
  "elements": {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0},
  "shenSha": ["神煞名称"],
  "software": "排盘软件名称",
  "uncertainties": ["看不清的字段说明"]
}

如果看不清，请标记在 uncertainties 中，不要猜。只输出 JSON。`;

export async function recognizeChartImage(imageBase64: string, mediaType: string = "image/png"): Promise<ChartOCRResult> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY 未配置");
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
            data: imageBase64,
          },
        },
        {
          type: "text",
          text: "请识别这张八字排盘图片中的所有信息，输出 JSON 格式。",
        },
      ],
    }],
    system: OCR_SYSTEM,
  });

  const textBlock = response.content.find(b => b.type === "text");
  const rawResponse = textBlock?.text ?? "";

  // 解析 JSON
  try {
    const jsonMatch = rawResponse.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        birthInfo: parsed.birthInfo ?? {},
        pillars: parsed.pillars ?? {},
        luckCycles: parsed.luckCycles ?? [],
        elements: parsed.elements,
        shenSha: parsed.shenSha,
        software: parsed.software,
        uncertainties: parsed.uncertainties ?? [],
        rawResponse,
      };
    }
  } catch {
    // JSON 解析失败
  }

  return {
    birthInfo: {},
    pillars: {},
    luckCycles: [],
    uncertainties: ["图片识别结果解析失败，需人工复核"],
    rawResponse,
  };
}
