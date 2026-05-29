// 个案 CRUD API
import { NextRequest, NextResponse } from "next/server";
import { getDb, generateId } from "@/lib/db";

// GET: 列表
export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "50") || 50, 1), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0") || 0, 0);

  let query = "SELECT * FROM cases ORDER BY updated_at DESC";
  const params: unknown[] = [];

  if (status) {
    query = "SELECT * FROM cases WHERE status = ? ORDER BY updated_at DESC";
    params.push(status);
  }

  query += " LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const cases = db.prepare(query).all(...params);
  const total = db.prepare("SELECT COUNT(*) as count FROM cases").get() as { count: number };

  return NextResponse.json({ cases, total: total.count });
}

// POST: 新建
export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();

  const id = generateId();
  const {
    alias, gender, birthSolar, birthLunar, birthPlace,
    birthLongitude, birthLatitude, timezone, trueSolarTimeEnabled,
    questionType, clientOriginalQuestion, hourKnown,
  } = body;

  db.prepare(`
    INSERT INTO cases (id, alias, gender, birth_solar, birth_lunar, birth_place,
      birth_longitude, birth_latitude, timezone, true_solar_time_enabled,
      question_type, client_original_question, hour_known)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, alias ?? "未命名", gender ?? "unknown", birthSolar, birthLunar,
    birthPlace, birthLongitude, birthLatitude,
    timezone ?? "Asia/Shanghai", trueSolarTimeEnabled ? 1 : 0,
    questionType, clientOriginalQuestion, hourKnown ? 1 : 0
  );

  const newCase = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);
  return NextResponse.json(newCase, { status: 201 });
}
