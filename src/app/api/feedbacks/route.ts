// 客户反馈 API
import { NextRequest, NextResponse } from "next/server";
import { getDb, generateId } from "@/lib/db";

// GET: 获取个案的反馈列表
export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("caseId");

  if (!caseId) {
    return NextResponse.json({ error: "缺少 caseId" }, { status: 400 });
  }

  const feedbacks = db.prepare(
    "SELECT * FROM feedbacks WHERE case_id = ? ORDER BY created_at DESC"
  ).all(caseId);

  return NextResponse.json({ feedbacks });
}

// POST: 新建反馈
export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { caseId, artifactId, statement, feedback, clientText, yourNote, shouldReuse } = body;

  if (!caseId || !statement || !feedback) {
    return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
  }

  const validFeedbacks = ["hit", "partial", "miss", "unknown"];
  if (!validFeedbacks.includes(feedback)) {
    return NextResponse.json({ error: "feedback 值无效" }, { status: 400 });
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO feedbacks (id, case_id, artifact_id, statement, feedback, client_text, your_note, should_reuse)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, caseId, artifactId, statement, feedback, clientText, yourNote, shouldReuse ? 1 : 0);

  const newFeedback = db.prepare("SELECT * FROM feedbacks WHERE id = ?").get(id);
  return NextResponse.json(newFeedback, { status: 201 });
}
