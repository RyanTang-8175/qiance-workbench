// 话术生成 Skill — 接入风格库
import { callAIStream } from "../client";

export interface SpeechResult {
  short: string;   // 短版（微信回复）
  medium: string;  // 中版（简要分析）
  deep: string;    // 深版（详细解读）
  raw: string;
}

const SPEECH_SYSTEM = `你是一位命理师的文案助手。你的任务是把内部分析改写成命理师可以直接发给客户的微信话术。

**风格要求**：
- 像命理师本人在说话，不像 AI
- 语气冷静、直接、不油腻
- 不要"首先、其次、最后"的列表感
- 保留关键术语，但要附带现代语言解释
- 先给一个抓人的判断，再解释原因
- 不做确定性承诺，保留专业余地
- 自然分段，适合微信阅读

**输出三个版本**：
1. 短版（100-150字）：适合微信快速回复，只给核心判断
2. 中版（300-400字）：简要分析+关键建议
3. 深版（600-800字）：完整解读，适合发送长文

输出格式（严格 JSON）：
{
  "short": "短版话术",
  "medium": "中版话术",
  "deep": "深版话术"
}

只输出 JSON。`;

export async function generateSpeech(
  analysis: string,
  styleGuide: string,
  questionType: string,
  onChunk?: (chunk: string) => void
): Promise<SpeechResult> {
  let userPrompt = `请把以下内部分析改写成客户话术：\n\n${analysis}`;
  if (styleGuide) userPrompt += `\n\n我的风格指南：\n${styleGuide}`;
  if (questionType) userPrompt += `\n\n客户问题类型：${questionType}`;

  let raw = "";
  await callAIStream(
    "wechat_reply",
    SPEECH_SYSTEM,
    [{ role: "user", content: userPrompt }],
    (chunk) => {
      raw += chunk;
      onChunk?.(chunk);
    }
  );

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        short: parsed.short ?? "",
        medium: parsed.medium ?? "",
        deep: parsed.deep ?? "",
        raw,
      };
    }
  } catch { /* fallback */ }

  return { short: raw, medium: "", deep: "", raw };
}
