"use client";

import { useState, useEffect } from "react";

interface Feedback {
  id: string;
  case_id: string;
  artifact_id: string | null;
  statement: string;
  feedback: "hit" | "partial" | "miss" | "unknown";
  client_text: string | null;
  your_note: string | null;
  should_reuse: number;
  created_at: string;
}

interface FeedbackPanelProps {
  caseId: string;
}

const FEEDBACK_LABELS: Record<string, { label: string; color: string }> = {
  hit: { label: "命中", color: "var(--wood)" },
  partial: { label: "部分命中", color: "var(--earth)" },
  miss: { label: "未命中", color: "var(--fire)" },
  unknown: { label: "待验证", color: "var(--text-muted)" },
};

export default function FeedbackPanel({ caseId }: FeedbackPanelProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    statement: "",
    feedback: "unknown" as Feedback["feedback"],
    clientText: "",
    yourNote: "",
  });

  useEffect(() => {
    loadFeedbacks();
  }, [caseId]);

  async function loadFeedbacks() {
    try {
      const res = await fetch(`/api/feedbacks?caseId=${caseId}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks ?? []);
      }
    } catch (e) {
      console.error("加载反馈失败:", e);
    }
  }

  async function handleAddFeedback() {
    if (!newFeedback.statement) return;

    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          statement: newFeedback.statement,
          feedback: newFeedback.feedback,
          clientText: newFeedback.clientText || undefined,
          yourNote: newFeedback.yourNote || undefined,
          shouldReuse: newFeedback.feedback !== "miss",
        }),
      });

      if (res.ok) {
        setNewFeedback({ statement: "", feedback: "unknown", clientText: "", yourNote: "" });
        setShowAdd(false);
        loadFeedbacks();
      }
    } catch (e) {
      console.error("添加反馈失败:", e);
    }
  }

  // 统计命中率
  const hitCount = feedbacks.filter(f => f.feedback === "hit").length;
  const partialCount = feedbacks.filter(f => f.feedback === "partial").length;
  const missCount = feedbacks.filter(f => f.feedback === "miss").length;
  const totalCount = hitCount + partialCount + missCount;
  const hitRate = totalCount > 0 ? Math.round(((hitCount + partialCount * 0.5) / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 统计 */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            断前事命中率
          </h3>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-secondary text-xs !py-1 !px-3"
          >
            {showAdd ? "取消" : "+ 添加反馈"}
          </button>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "var(--wood)" }}>{hitCount}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>命中</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "var(--earth)" }}>{partialCount}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>部分</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "var(--fire)" }}>{missCount}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>未中</div>
          </div>
          <div className="text-center ml-auto">
            <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{hitRate}%</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>命中率</div>
          </div>
        </div>
      </div>

      {/* 添加反馈表单 */}
      {showAdd && (
        <div className="card animate-fadeIn">
          <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            添加反馈
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                断语内容 *
              </label>
              <textarea
                className="input min-h-[60px]"
                placeholder="记录断前事的内容..."
                value={newFeedback.statement}
                onChange={e => setNewFeedback(prev => ({ ...prev, statement: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                客户反馈
              </label>
              <div className="flex gap-2">
                {Object.entries(FEEDBACK_LABELS).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => setNewFeedback(prev => ({ ...prev, feedback: key as Feedback["feedback"] }))}
                    className="text-xs px-3 py-1 rounded-full transition-all"
                    style={{
                      backgroundColor: newFeedback.feedback === key ? color : "var(--bg-secondary)",
                      color: newFeedback.feedback === key ? "white" : color,
                      border: `1px solid ${newFeedback.feedback === key ? color : "var(--border)"}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                客户原话
              </label>
              <input
                className="input"
                placeholder="客户怎么回复的..."
                value={newFeedback.clientText}
                onChange={e => setNewFeedback(prev => ({ ...prev, clientText: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                你的笔记
              </label>
              <input
                className="input"
                placeholder="你的分析备注..."
                value={newFeedback.yourNote}
                onChange={e => setNewFeedback(prev => ({ ...prev, yourNote: e.target.value }))}
              />
            </div>
            <button onClick={handleAddFeedback} className="btn-primary text-sm">
              保存反馈
            </button>
          </div>
        </div>
      )}

      {/* 反馈列表 */}
      {feedbacks.length > 0 && (
        <div className="space-y-2">
          {feedbacks.map(f => {
            const fb = FEEDBACK_LABELS[f.feedback] ?? FEEDBACK_LABELS.unknown;
            return (
              <div key={f.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {f.statement}
                    </div>
                    {f.client_text && (
                      <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        客户：{f.client_text}
                      </div>
                    )}
                    {f.your_note && (
                      <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>
                        笔记：{f.your_note}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${fb.color}15`, color: fb.color }}
                  >
                    {fb.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {feedbacks.length === 0 && !showAdd && (
        <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
          暂无反馈记录
        </p>
      )}
    </div>
  );
}
