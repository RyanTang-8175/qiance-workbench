import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "乾策工作台 — AI 命理师副脑",
  description: "命理师专用 AI 工作台：排盘、校验、断前事、话术生成、经验沉淀",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "乾策",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f14",
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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen">
      <ToastProvider>
        <div className="flex flex-col min-h-screen">
          <header
            className="sticky top-0 z-50 border-b safe-top"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <span
                  className="text-xl font-semibold tracking-wider"
                  style={{ color: "var(--accent)" }}
                >
                  乾策
                </span>
                <span className="hidden sm:inline" style={{ color: "var(--text-muted)" }}>|</span>
                <span
                  className="hidden sm:inline text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  AI 命理师副脑
                </span>
              </Link>
              <nav className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/"
                  className="text-xs sm:text-sm hover:opacity-80 transition-opacity px-2 py-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  个案
                </Link>
                <Link
                  href="/style"
                  className="hidden sm:block text-sm hover:opacity-80 transition-opacity px-2 py-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  风格库
                </Link>
                <Link
                  href="/settings"
                  className="text-xs sm:text-sm hover:opacity-80 transition-opacity px-2 py-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  设置
                </Link>
                <Link
                  href="/cases/new"
                  className="btn-primary text-xs sm:text-sm !py-2 !px-3 sm:!px-4"
                >
                  + 新建
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer
            className="border-t py-3 text-center text-xs safe-bottom"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            乾策工作台 v2.0
          </footer>
        </div>
      </ToastProvider>
      </body>
    </html>
  );
}
