// 风格库 API（风格指南 + 好句/禁句）
import { NextRequest, NextResponse } from "next/server";
import { getDb, generateId } from "@/lib/db";

// GET: 获取风格指南列表
export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "guides" | "sentences"

  if (type === "sentences") {
    const sentences = db.prepare(
      "SELECT * FROM style_sentences ORDER BY created_at DESC LIMIT 100"
    ).all();
    return NextResponse.json({ sentences });
  }

  const guides = db.prepare(
    "SELECT * FROM style_guides ORDER BY version DESC LIMIT 10"
  ).all();
  return NextResponse.json({ guides });
}

// POST: 创建风格指南或添加句子
export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { action } = body;

  if (action === "add_sentence") {
    const { sentence, type, source, tags } = body;
    if (!sentence || !type) {
      return NextResponse.json({ error: "缺少句子内容或类型" }, { status: 400 });
    }

    const id = generateId();
    db.prepare(`
      INSERT INTO style_sentences (id, sentence, type, source, tags)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, sentence, type, source, tags ? JSON.stringify(tags) : null);

    return NextResponse.json({ id, success: true }, { status: 201 });
  }

  if (action === "save_guide") {
    const { name, guideContent } = body;
    if (!name || !guideContent) {
      return NextResponse.json({ error: "缺少指南名称或内容" }, { status: 400 });
    }

    // 获取当前最大版本号
    const maxVersion = db.prepare(
      "SELECT MAX(version) as max FROM style_guides"
    ).get() as { max: number | null };

    const nextVersion = (maxVersion?.max ?? 0) + 1;
    const id = generateId();

    // 将旧版本设为非活跃
    db.prepare("UPDATE style_guides SET is_active = 0").run();

    db.prepare(`
      INSERT INTO style_guides (id, name, guide_content, version, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(id, name, guideContent, nextVersion);

    return NextResponse.json({ id, version: nextVersion, success: true }, { status: 201 });
  }

  return NextResponse.json({ error: "未知 action" }, { status: 400 });
}

// DELETE: 删除句子
export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  db.prepare("DELETE FROM style_sentences WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
