"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "操作失败");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold tracking-wider mb-2"
            style={{ color: "var(--accent)", fontFamily: "serif" }}
          >
            乾策
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            AI 命理师副脑
          </p>
        </div>

        <div className="card">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className="flex-1 py-2 text-sm font-medium transition-all border-b-2"
              style={{
                color: mode === "login" ? "var(--accent)" : "var(--text-muted)",
                borderColor: mode === "login" ? "var(--accent)" : "transparent",
              }}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className="flex-1 py-2 text-sm font-medium transition-all border-b-2"
              style={{
                color: mode === "register" ? "var(--accent)" : "var(--text-muted)",
                borderColor: mode === "register" ? "var(--accent)" : "transparent",
              }}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                手机号
              </label>
              <input
                type="tel"
                className="input"
                placeholder="请输入手机号"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={11}
                required
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                密码
              </label>
              <input
                type="password"
                className="input"
                placeholder={mode === "register" ? "至少 6 位" : "请输入密码"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <div className="text-sm py-2 px-3 rounded" style={{ color: "var(--fire)", backgroundColor: "rgba(194,59,34,0.08)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          {mode === "login" ? "没有账号？点击上方注册" : "已有账号？点击上方登录"}
        </p>
      </div>
    </div>
  );
}
