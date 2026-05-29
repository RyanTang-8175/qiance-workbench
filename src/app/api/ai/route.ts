// AI 生成 API
import { NextRequest, NextResponse } from "next/server";
import { callAIStream } from "@/lib/ai/client";
import {
  getPrevalidationPrompt,
  getInternalAnalysisPrompt,
  getWeChatReplyPrompt,
  getLongReportPrompt,
  SYSTEM_ROLE,
  RULES_LAYER,
  SAFETY_LAYER,
} from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskType, chartData, analysis, feedback, styleGuide, provider: rawProvider } = body;

    // Provider 白名单校验
    const provider = rawProvider === "deepseek" ? "deepseek" : rawProvider === "claude" ? "claude" : undefined;

    const systemPrompt = `${SYSTEM_ROLE}\n\n${RULES_LAYER}\n\n${SAFETY_LAYER}`;

    let userPrompt = "";

    switch (taskType) {
      case "prevalidation":
        userPrompt = getPrevalidationPrompt(JSON.stringify(chartData), styleGuide);
        break;
      case "internal_analysis":
        userPrompt = getInternalAnalysisPrompt(JSON.stringify(chartData));
        break;
      case "wechat_reply":
        userPrompt = getWeChatReplyPrompt(analysis, styleGuide);
        break;
      case "long_report":
        userPrompt = getLongReportPrompt(
          JSON.stringify(chartData), analysis, feedback ?? "", styleGuide
        );
        break;
      default:
        return NextResponse.json({ error: "未知任务类型" }, { status: 400 });
    }

    // 流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await callAIStream(
            taskType,
            systemPrompt,
            [{ role: "user", content: userPrompt }],
            (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
            },
            provider ? { provider } : undefined
          );
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          const msg = error instanceof Error ? error.message : "AI 调用失败";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI API 错误:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "AI 生成失败" }, { status: 500 });
  }
}
