import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, signToken, tokenCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "请输入手机号和密码" }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare("SELECT id, password_hash FROM users WHERE phone = ?").get(phone) as { id: string; password_hash: string } | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 });
    }

    const token = signToken(user.id);
    const cookieOpts = tokenCookieOptions();
    const res = NextResponse.json({ success: true, userId: user.id });
    res.cookies.set(cookieOpts.name, token, {
      maxAge: cookieOpts.maxAge,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
