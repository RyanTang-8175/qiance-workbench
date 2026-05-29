"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

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
  const router = useRouter();
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchCases = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (search) params.set("search", search);
      params.set("limit", "100");

      const res = await fetch(`/api/cases?${params}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setCases(data.cases ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast("加载个案失败", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, search, router, toast]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  async function handleDeleteCase(e: React.MouseEvent, caseId: string, alias: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`确定删除"${alias}"？`)) return;
    try {
      const res = await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
      if (res.ok) {
        setCases(prev => prev.filter(c => c.id !== caseId));
        toast("已删除", "success");
      } else {
        toast("删除失败", "error");
      }
    } catch {
      toast("删除失败", "error");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl" style={{ color: "var(--text-primary)" }}>
            个案列表
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            共 {total} 个个案
          </p>
        </div>
        <Link href="/cases/new" className="btn-primary text-sm !py-2 !px-3 sm:!px-4">
          + 新建
        </Link>
      </div>

      {/* 搜索框 */}
      <div className="mb-4">
        <input
          type="text"
          className="input"
          placeholder="搜索姓名、代号..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2 mb-4 sm:mb-6 filter-scroll">
        <button
          onClick={() => setFilter("all")}
          className="text-xs sm:text-sm px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
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
            className="text-xs sm:text-sm px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
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

      {/* 列表 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse" style={{ height: 72 }} />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4" style={{ color: "var(--border-dark)" }}>&#x2630;</div>
          <p style={{ color: "var(--text-muted)" }}>
            {search ? "没有找到匹配的个案" : filter === "all" ? "还没有个案" : "没有符合条件的个案"}
          </p>
          {!search && filter === "all" && (
            <Link href="/cases/new" className="btn-primary mt-4 inline-block">
              创建第一个个案
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {cases.map((c, i) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="card block animate-fadeIn"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* 移动端：上下布局 */}
              <div className="sm:hidden">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--accent)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {c.alias?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {c.alias}
                    </div>
                    <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                      {c.birth_solar}{c.birth_place ? ` · ${c.birth_place}` : ""}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded shrink-0"
                    style={{
                      backgroundColor: `${STATUS_MAP[c.status]?.color ?? "var(--text-muted)"}15`,
                      color: STATUS_MAP[c.status]?.color ?? "var(--text-muted)",
                    }}
                  >
                    {STATUS_MAP[c.status]?.label ?? c.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pl-12">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {c.question_type && `${c.question_type} · `}{new Date(c.updated_at).toLocaleDateString("zh-CN")}
                  </span>
                  <button
                    onClick={(e) => handleDeleteCase(e, c.id, c.alias)}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: "var(--fire)" }}
                  >
                    删除
                  </button>
                </div>
              </div>

              {/* 桌面端：左右布局 */}
              <div className="hidden sm:flex items-center justify-between">
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
                      {c.birth_solar}{c.birth_place ? ` · ${c.birth_place}` : ""}
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
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ color: "var(--fire)" }}
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
