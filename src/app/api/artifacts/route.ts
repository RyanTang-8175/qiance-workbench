// 产物（话术/报告）API
import { NextRequest, NextResponse } from "next/server";
import { getDb, generateId } from "@/lib/db";

// GET: 获取个案的产物列表
export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("caseId");
  const type = searchParams.get("type");

  if (!caseId) {
    return NextResponse.json({ error: "缺少 caseId" }, { status: 400 });
  }

  let query = "SELECT * FROM artifacts WHERE case_id = ?";
  const params: unknown[] = [caseId];

  if (type) {
    query += " AND type = ?";
    params.push(type);
  }

  query += " ORDER BY created_at DESC";
  const artifacts = db.prepare(query).all(...params);

  return NextResponse.json({ artifacts });
}

// POST: 保存产物
export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { caseId, type, model, promptVersion, content, tags } = body;

  if (!caseId || !type || !content) {
    return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
  }

  const validTypes = [
    "chart_verification", "internal_analysis", "prevalidation",
    "wechat_reply", "long_report", "followup_questions", "style_revision",
  ];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "type 值无效" }, { status: 400 });
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO artifacts (id, case_id, type, model, prompt_version, content, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, caseId, type, model ?? "unknown", promptVersion, content, tags ? JSON.stringify(tags) : null);

  const newArtifact = db.prepare("SELECT * FROM artifacts WHERE id = ?").get(id);
  return NextResponse.json(newArtifact, { status: 201 });
}

// PATCH: 更新产物（编辑后保存）
export async function PATCH(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { id, yourEditedContent, rating, tags } = body;

  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (yourEditedContent !== undefined) {
    updates.push("your_edited_content = ?");
    values.push(yourEditedContent);
  }
  if (rating !== undefined) {
    updates.push("rating = ?");
    values.push(rating);
  }
  if (tags !== undefined) {
    updates.push("tags = ?");
    values.push(JSON.stringify(tags));
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "无更新字段" }, { status: 400 });
  }

  values.push(id);
  db.prepare(`UPDATE artifacts SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT * FROM artifacts WHERE id = ?").get(id);
  return NextResponse.json(updated);
}
