// 设置 API：读取/保存配置
import { NextRequest, NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/config";

export async function GET() {
  const config = getConfig();
  return NextResponse.json({
    claudeApiKey: config.claudeApiKey ? "***已配置***" : "",
    deepseekApiKey: config.deepseekApiKey ? "***已配置***" : "",
    aiProvider: config.aiProvider,
    defaultGender: config.defaultGender,
    defaultTrueSolarTime: config.defaultTrueSolarTime,
    hasClaudeKey: !!config.claudeApiKey,
    hasDeepseekKey: !!config.deepseekApiKey,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updates: Record<string, string> = {};

    if (body.claudeApiKey !== undefined && body.claudeApiKey !== "***已配置***") {
      updates.claudeApiKey = body.claudeApiKey;
    }
    if (body.deepseekApiKey !== undefined && body.deepseekApiKey !== "***已配置***") {
      updates.deepseekApiKey = body.deepseekApiKey;
    }
    if (body.aiProvider !== undefined) {
      updates.aiProvider = body.aiProvider;
    }
    if (body.defaultGender !== undefined) {
      updates.defaultGender = body.defaultGender;
    }
    if (body.defaultTrueSolarTime !== undefined) {
      updates.defaultTrueSolarTime = body.defaultTrueSolarTime;
    }

    const config = updateConfig(updates);
    return NextResponse.json({
      success: true,
      hasClaudeKey: !!config.claudeApiKey,
      hasDeepseekKey: !!config.deepseekApiKey,
    });
  } catch (error) {
    return NextResponse.json({ error: "保存设置失败" }, { status: 500 });
  }
}
