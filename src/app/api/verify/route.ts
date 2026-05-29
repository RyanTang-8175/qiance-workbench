// 三盘校验 API：对比系统盘、AI自排、图片识别
import { NextRequest, NextResponse } from "next/server";
import { generateChart } from "@/lib/bazi/chart";
import { aiSelfChart } from "@/lib/ai/chart-ai";
import { verifyCharts } from "@/lib/bazi/verification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, minute, gender, birthPlace, useTrueSolarTime, imageData } = body;

    // 参数校验
    if (year === undefined || month === undefined || day === undefined || hour === undefined || !gender) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const y = Math.floor(Number(year));
    const m = Math.floor(Number(month));
    const d = Math.floor(Number(day));
    const h = Math.floor(Number(hour));
    const mi = Math.floor(Number(minute ?? 0));

    // 1. 系统盘
    const systemChart = generateChart(y, m, d, h, mi, gender, birthPlace, useTrueSolarTime);

    // 2. AI 自排盘（并行）
    let aiResult = null;
    try {
      aiResult = await aiSelfChart(y, m, d, h, mi, gender, birthPlace, useTrueSolarTime);
    } catch (e) {
      console.error("AI 自排盘失败:", e instanceof Error ? e.message : "unknown");
    }

    // 3. 图片识别（如果有图片，限制 base64 大小约 7.5MB = 10MB 原始文件）
    let imageResult = null;
    if (imageData && typeof imageData === "string" && imageData.length < 10_000_000) {
      try {
        const { recognizeChartImage } = await import("@/lib/ai/chart-ocr");
        imageResult = await recognizeChartImage(imageData);
      } catch (e) {
        console.error("图片识别失败:", e instanceof Error ? e.message : "unknown");
      }
    }

    // 4. 三盘校验
    const verification = verifyCharts(systemChart, aiResult ?? undefined, imageResult ?? undefined);

    return NextResponse.json({
      systemChart,
      aiResult,
      imageResult,
      verification,
    });
  } catch (error) {
    console.error("校验错误:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "校验计算失败" }, { status: 500 });
  }
}
