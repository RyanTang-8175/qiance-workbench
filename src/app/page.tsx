"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Case {
  id: string;
  alias: string;
  gender: string;
  birth_solar: string;
  birth_place: string;
  question_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "待排盘", color: "var(--text-muted)" },
  charted: { label: "已排盘", color: "var(--gold)" },
  verified: { label: "已校验", color: "var(--wood)" },
  needs_review: { label: "需复核", color: "var(--fire)" },
  prevalidated: { label: "已验盘", color: "var(--water)" },
  delivered: { label: "已交付", color: "var(--accent)" },
  archived: { label: "已归档", color: "var(--text-muted)" },
};

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    try {
      const res = await fetch("/api/cases");
      const data = await res.json();
      setCases(data.cases ?? []);
    } catch (e) {
      console.error("加载个案失败:", e);
    } finally {
      setLoading(false);
    }
  }

  const filteredCases = filter === "all"
    ? cases
    : cases.filter(c => c.status === filter);

  async function handleDeleteCase(e: React.MouseEvent, caseId: string, alias: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`确定要删除个案"${alias}"吗？此操作不可撤销。`)) return;
    try {
      const res = await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
      if (res.ok) {
        setCases(prev => prev.filter(c => c.id !== caseId));
      }
    } catch (e) {
      console.error("删除失败:", e);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl" style={{ color: "var(--text-primary)" }}>
            个案列表
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            共 {cases.length} 个个案
          </p>
        </div>
        <Link href="/cases/new" className="btn-primary">
          + 新建个案
        </Link>
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`text-sm px-3 py-1 rounded-full transition-all ${
            filter === "all" ? "font-semibold" : ""
          }`}
          style={{
            backgroundColor: filter === "all" ? "var(--accent)" : "var(--bg-secondary)",
            color: filter === "all" ? "white" : "var(--text-secondary)",
            border: `1px solid ${filter === "all" ? "var(--accent)" : "var(--border)"}`,
          }}
        >
          全部
        </button>
        {Object.entries(STATUS_MAP).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-sm px-3 py-1 rounded-full transition-all ${
              filter === key ? "font-semibold" : ""
            }`}
            style={{
              backgroundColor: filter === key ? color : "var(--bg-secondary)",
              color: filter === key ? "white" : color,
              border: `1px solid ${filter === key ? color : "var(--border)"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 个案列表 */}
      {loading ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          加载中...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4" style={{ color: "var(--border-dark)" }}>
            &#x2630;
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            {filter === "all" ? "还没有个案，点击右上角新建" : "没有符合条件的个案"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCases.map((c, i) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="card animate-fadeIn block hover:translate-y-[-1px] transition-transform"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--accent)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {c.alias?.[0] ?? "?"}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {c.alias}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {c.birth_solar}
                      {c.birth_place ? ` · ${c.birth_place}` : ""}
                      {c.question_type ? ` · ${c.question_type}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${STATUS_MAP[c.status]?.color ?? "var(--text-muted)"}15`,
                      color: STATUS_MAP[c.status]?.color ?? "var(--text-muted)",
                    }}
                  >
                    {STATUS_MAP[c.status]?.label ?? c.status}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(c.updated_at).toLocaleDateString("zh-CN")}
                  </span>
                  <button
                    onClick={(e) => handleDeleteCase(e, c.id, c.alias)}
                    className="text-xs px-2 py-0.5 rounded transition-colors hover:opacity-80"
                    style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "var(--fire)" }}
                    title="删除个案"
                  >
                    删除
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
