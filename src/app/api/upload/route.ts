// 图片上传 API：接收排盘截图并进行 OCR 识别
import { NextRequest, NextResponse } from "next/server";
import { recognizeChartImage } from "@/lib/ai/chart-ocr";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未上传文件" }, { status: 400 });
    }

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "请上传图片文件" }, { status: 400 });
    }

    // 检查文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过 10MB" }, { status: 400 });
    }

    // 转为 base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // OCR 识别（传入实际 MIME 类型）
    const result = await recognizeChartImage(base64, file.type);

    return NextResponse.json({
      success: true,
      result,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("上传处理错误:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "图片处理失败" }, { status: 500 });
  }
}
