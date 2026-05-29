// 断前事 API
import { NextRequest, NextResponse } from "next/server";
import { predictPrevalidation } from "@/lib/ai/skills/predictor";

export async function POST(req: NextRequest) {
  try {
    const { chartData } = await req.json();
    if (!chartData) return NextResponse.json({ error: "缺少命盘数据" }, { status: 400 });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await predictPrevalidation(chartData, (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, result })}\n\n`));
          controller.close();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "断前事生成失败";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch {
    return NextResponse.json({ error: "请求处理失败" }, { status: 500 });
  }
}
