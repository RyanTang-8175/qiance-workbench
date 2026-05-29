// AI 客户端：Claude + DeepSeek 双切换
import Anthropic from "@anthropic-ai/sdk";
import { getConfig } from "@/lib/config";

export type AIProvider = "claude" | "deepseek";

export interface AIConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
}

// 模型路由配置
export const MODEL_ROUTER: Record<string, AIConfig> = {
  internal_analysis: { provider: "claude", model: "claude-sonnet-4-20250514", maxTokens: 4096 },
  prevalidation: { provider: "claude", model: "claude-sonnet-4-20250514", maxTokens: 2048 },
  long_report: { provider: "claude", model: "claude-sonnet-4-20250514", maxTokens: 8192 },
  chart_recognition: { provider: "claude", model: "claude-sonnet-4-20250514", maxTokens: 4096 },
  ai_self_chart: { provider: "claude", model: "claude-sonnet-4-20250514", maxTokens: 2048 },
  wechat_reply: { provider: "deepseek", model: "deepseek-v4-flash", maxTokens: 1024 },
  followup_questions: { provider: "deepseek", model: "deepseek-v4-flash", maxTokens: 1024 },
  chart_comparison: { provider: "deepseek", model: "deepseek-v4-flash", maxTokens: 1024 },
};

function resolveProvider(taskType: string, override?: AIProvider): AIProvider {
  if (override) return override;
  const config = getConfig();
  if (config.aiProvider === "claude") return "claude";
  if (config.aiProvider === "deepseek") return "deepseek";
  // auto: 使用路由表
  return MODEL_ROUTER[taskType]?.provider ?? "deepseek";
}

// Claude 客户端
function getClaudeClient(): Anthropic {
  const config = getConfig();
  const key = config.claudeApiKey;
  if (!key) throw new Error("Claude API Key 未配置，请在设置页面填写");
  return new Anthropic({ apiKey: key });
}

// DeepSeek 客户端（兼容 OpenAI 格式）
function getDeepSeekClient() {
  const config = getConfig();
  const key = config.deepseekApiKey;
  if (!key) throw new Error("DeepSeek API Key 未配置，请在设置页面填写");
  return {
    apiKey: key,
    baseURL: "https://api.deepseek.com",
  };
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export async function callAI(
  taskType: string,
  systemPrompt: string,
  messages: AIMessage[],
  options?: { provider?: AIProvider; model?: string }
): Promise<AIResponse> {
  const routerConfig = MODEL_ROUTER[taskType] ?? {
    provider: "deepseek" as AIProvider,
    model: "deepseek-v4-flash",
    maxTokens: 2048,
  };

  const provider = resolveProvider(taskType, options?.provider);
  const model = options?.model ?? routerConfig.model;

  if (provider === "claude") {
    const client = getClaudeClient();
    const response = await client.messages.create({
      model,
      max_tokens: routerConfig.maxTokens,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find(b => b.type === "text");
    return {
      content: textBlock?.text ?? "",
      model,
      provider: "claude",
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } else {
    // DeepSeek（OpenAI 兼容格式）
    const dsConfig = getDeepSeekClient();
    const response = await fetch(`${dsConfig.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dsConfig.apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: routerConfig.maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      let errMsg = `DeepSeek API 错误 (${response.status})`;
      try {
        const errData = JSON.parse(errText);
        errMsg = errData.error?.message || errData.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "DeepSeek 返回错误");

    return {
      content: data.choices?.[0]?.message?.content ?? "",
      model,
      provider: "deepseek",
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      },
    };
  }
}

// 流式调用（用于前端实时显示）
export async function callAIStream(
  taskType: string,
  systemPrompt: string,
  messages: AIMessage[],
  onChunk: (chunk: string) => void,
  options?: { provider?: AIProvider; model?: string }
): Promise<AIResponse> {
  const routerConfig = MODEL_ROUTER[taskType] ?? {
    provider: "deepseek" as AIProvider,
    model: "deepseek-v4-flash",
    maxTokens: 2048,
  };

  const provider = resolveProvider(taskType, options?.provider);
  const model = options?.model ?? routerConfig.model;

  if (provider === "claude") {
    const client = getClaudeClient();
    const stream = client.messages.stream({
      model,
      max_tokens: routerConfig.maxTokens,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    let fullContent = "";
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullContent += event.delta.text;
        onChunk(event.delta.text);
      }
    }

    const finalMessage = await stream.finalMessage();
    return {
      content: fullContent,
      model,
      provider: "claude",
      usage: {
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
      },
    };
  } else {
    // DeepSeek 流式
    const dsConfig = getDeepSeekClient();
    const response = await fetch(`${dsConfig.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dsConfig.apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: routerConfig.maxTokens,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      let errMsg = `DeepSeek API 错误 (${response.status})`;
      try {
        const errData = JSON.parse(errText);
        errMsg = errData.error?.message || errData.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    let fullContent = "";
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content ?? "";
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch { /* skip malformed chunks */ }
        }
      }
    }

    return {
      content: fullContent,
      model,
      provider: "deepseek",
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }
}
