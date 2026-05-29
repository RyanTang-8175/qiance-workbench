// 单个个案 API
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: 获取单个个案
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const caseData = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);

  if (!caseData) {
    return NextResponse.json({ error: "个案不存在" }, { status: 404 });
  }

  return NextResponse.json(caseData);
}

// PATCH: 更新个案
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const allowedFields = new Set([
    "alias", "gender", "birth_solar", "birth_place", "question_type",
    "client_original_question", "status", "chart_data", "ziwei_data",
    "internal_analysis", "your_judgment",
  ]);

  const FIELD_RE = /^[a-z_]+$/;
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (allowedFields.has(key) && FIELD_RE.test(key)) {
      updates.push(`${key} = ?`);
      values.push(typeof value === "object" ? JSON.stringify(value) : value);
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "无有效更新字段" }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE cases SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);
  return NextResponse.json(updated);
}

// DELETE: 删除个案
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM cases WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
