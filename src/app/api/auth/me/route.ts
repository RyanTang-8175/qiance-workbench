import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare("SELECT id, phone, created_at FROM users WHERE id = ?").get(userId) as { id: string; phone: string; created_at: string } | undefined;

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}
