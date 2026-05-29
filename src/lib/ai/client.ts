// AI 客户端：Claude + DeepSeek 双切换
import Anthropic from "@anthropic-ai/sdk";

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
  wechat_reply: { provider: "deepseek", model: "deepseek-chat", maxTokens: 1024 },
  followup_questions: { provider: "deepseek", model: "deepseek-chat", maxTokens: 1024 },
  chart_comparison: { provider: "deepseek", model: "deepseek-chat", maxTokens: 1024 },
};

// Claude 客户端
function getClaudeClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY ?? "",
  });
}

// DeepSeek 客户端（兼容 OpenAI 格式）
function getDeepSeekClient() {
  return {
    apiKey: process.env.DEEPSEEK_API_KEY ?? "",
    baseURL: "https://api.deepseek.com/v1",
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
  const config = MODEL_ROUTER[taskType] ?? {
    provider: "claude",
    model: "claude-sonnet-4-20250514",
    maxTokens: 2048,
  };

  const provider = options?.provider ?? config.provider;
  const model = options?.model ?? config.model;

  if (provider === "claude") {
    const client = getClaudeClient();
    const response = await client.messages.create({
      model,
      max_tokens: config.maxTokens,
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
        max_tokens: config.maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    const data = await response.json();
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
  const config = MODEL_ROUTER[taskType] ?? {
    provider: "claude",
    model: "claude-sonnet-4-20250514",
    maxTokens: 2048,
  };

  const provider = options?.provider ?? config.provider;
  const model = options?.model ?? config.model;

  if (provider === "claude") {
    const client = getClaudeClient();
    const stream = client.messages.stream({
      model,
      max_tokens: config.maxTokens,
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
        max_tokens: config.maxTokens,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });

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
