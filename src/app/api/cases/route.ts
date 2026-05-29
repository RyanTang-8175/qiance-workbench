// 个案 CRUD API
import { NextRequest, NextResponse } from "next/server";
import { getDb, generateId } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";

// GET: 列表
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "50") || 50, 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0") || 0, 0);

    let query = "SELECT * FROM cases WHERE user_id = ?";
    const params: unknown[] = [userId];

    if (status && status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }
    if (search) {
      query += " AND (alias LIKE ? OR client_original_question LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as count");
    const total = db.prepare(countQuery).get(...params) as { count: number };

    query += " ORDER BY updated_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const cases = db.prepare(query).all(...params);
    return NextResponse.json({ cases, total: total.count });
  } catch {
    return NextResponse.json({ error: "加载失败" }, { status: 500 });
  }
}

// POST: 新建
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const db = getDb();
    const body = await req.json();

    const id = generateId();
    const {
      alias, gender, birthSolar, birthLunar, birthPlace,
      birthLongitude, birthLatitude, timezone, trueSolarTimeEnabled,
      questionType, clientOriginalQuestion, hourKnown,
    } = body;

    db.prepare(`
      INSERT INTO cases (id, user_id, alias, gender, birth_solar, birth_lunar, birth_place,
        birth_longitude, birth_latitude, timezone, true_solar_time_enabled,
        question_type, client_original_question, hour_known)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, alias ?? "未命名", gender ?? "unknown", birthSolar, birthLunar,
      birthPlace, birthLongitude, birthLatitude,
      timezone ?? "Asia/Shanghai", trueSolarTimeEnabled ? 1 : 0,
      questionType, clientOriginalQuestion, hourKnown ? 1 : 0
    );

    const newCase = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);
    return NextResponse.json(newCase, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
