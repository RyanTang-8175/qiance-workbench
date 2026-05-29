import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "乾策工作台 — AI 命理师副脑",
  description: "命理师专用 AI 工作台：排盘、校验、断前事、话术生成、经验沉淀",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <header
            className="sticky top-0 z-50 border-b"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a href="/" className="flex items-center gap-2">
                  <span
                    className="text-xl font-semibold tracking-wider"
                    style={{ color: "var(--accent)" }}
                  >
                    乾策
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>|</span>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    AI 命理师副脑
                  </span>
                </a>
              </div>
              <nav className="flex items-center gap-6">
                <a
                  href="/"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  个案列表
                </a>
                <a
                  href="/style"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  风格库
                </a>
                <a
                  href="/settings"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  设置
                </a>
                <a
                  href="/cases/new"
                  className="btn-primary text-sm !py-1.5 !px-4"
                >
                  新建个案
                </a>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer
            className="border-t py-4 text-center text-xs"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            乾策工作台 v0.1 — AI 命理分析、验盘、话术与交付工作台
          </footer>
        </div>
      </body>
    </html>
  );
}
