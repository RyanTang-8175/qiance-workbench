import { NextRequest, NextResponse } from "next/server";
import { getDb, generateId } from "@/lib/db";
import { hashPassword, signToken, tokenCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "请输入手机号和密码" }, { status: 400 });
    }
    if (!/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE phone = ?").get(phone);
    if (existing) {
      return NextResponse.json({ error: "该手机号已注册" }, { status: 409 });
    }

    const id = generateId();
    const passwordHash = hashPassword(password);
    db.prepare("INSERT INTO users (id, phone, password_hash) VALUES (?, ?, ?)").run(id, phone, passwordHash);

    const token = signToken(id);
    const cookieOpts = tokenCookieOptions();
    const res = NextResponse.json({ success: true, userId: id });
    res.cookies.set(cookieOpts.name, token, {
      maxAge: cookieOpts.maxAge,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
