"use client";

import { useState, useEffect, use } from "react";
import BaziChart from "@/components/chart/BaziChart";
import LuckCycles from "@/components/chart/LuckCycles";
import ShenShaList from "@/components/chart/ShenSha";
import BranchRelations from "@/components/chart/BranchRelations";
import type { ChartResult } from "@/lib/bazi/chart";

interface CaseData {
  id: string;
  alias: string;
  gender: string;
  birth_solar: string;
  birth_place: string;
  question_type: string;
  client_original_question: string;
  status: string;
  chart_data: string;
  ziwei_data: string;
  internal_analysis: string;
  your_judgment: string;
  created_at: string;
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [layout, setLayout] = useState<"traditional" | "modern">("traditional");
  const [activeTab, setActiveTab] = useState<"chart" | "analysis" | "ai">("chart");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiTask, setAiTask] = useState<string | null>(null);

  useEffect(() => {
    loadCase();
  }, [id]);

  async function loadCase() {
    try {
      const res = await fetch(`/api/cases/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCaseData(data);
        if (data.chart_data) {
          setChart(JSON.parse(data.chart_data));
        }
      }
    } catch (e) {
      console.error("加载个案失败:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAITask(taskType: string) {
    if (!chart) return;
    setAiLoading(true);
    setAiTask(taskType);
    setAiResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType,
          chartData: chart,
          analysis: caseData?.internal_analysis,
        }),
      });

      if (!res.ok) throw new Error("AI 调用失败");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                fullText += parsed.chunk;
                setAiResult(fullText);
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (e) {
      console.error("AI 生成失败:", e);
      setAiResult("生成失败，请检查 API Key 配置");
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center" style={{ color: "var(--text-muted)" }}>
        加载中...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p style={{ color: "var(--text-muted)" }}>个案不存在</p>
        <a href="/" className="btn-secondary mt-4 inline-block">返回列表</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm" style={{ color: "var(--text-muted)" }}>
            &larr; 返回
          </a>
          <h1 className="text-xl" style={{ color: "var(--text-primary)" }}>
            {caseData.alias}
          </h1>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {caseData.birth_solar}
            {caseData.birth_place ? ` · ${caseData.birth_place}` : ""}
          </span>
          {caseData.question_type && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {caseData.question_type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayout(layout === "traditional" ? "modern" : "traditional")}
            className="btn-secondary text-xs !py-1 !px-3"
          >
            {layout === "traditional" ? "现代布局" : "传统布局"}
          </button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {[
          { key: "chart", label: "命盘" },
          { key: "analysis", label: "分析" },
          { key: "ai", label: "AI 工具" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className="px-4 py-2 text-sm transition-all border-b-2"
            style={{
              color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)",
              borderColor: activeTab === tab.key ? "var(--accent)" : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 命盘 Tab */}
      {activeTab === "chart" && chart && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <BaziChart chart={chart} layout={layout} />
            <LuckCycles cycles={chart.luckCycles} dayStem={chart.dayMaster} />
          </div>
          <div className="space-y-4">
            <BranchRelations
              relations={chart.branchRelations}
              stemRelations={chart.stemRelations}
            />
            <ShenShaList shenSha={chart.shenSha} />
          </div>
        </div>
      )}

      {/* 分析 Tab */}
      {activeTab === "analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              内部分析
            </h3>
            {caseData.internal_analysis ? (
              <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {caseData.internal_analysis}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                尚未生成。前往"AI 工具"标签页生成内部分析。
              </p>
            )}
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              最终判断
            </h3>
            {caseData.your_judgment ? (
              <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {caseData.your_judgment}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                尚未记录。
              </p>
            )}
          </div>
        </div>
      )}

      {/* AI 工具 Tab */}
      {activeTab === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              AI 生成工具
            </h3>
            {[
              { key: "internal_analysis", label: "生成内部分析", desc: "分析命局核心矛盾、喜忌、格局" },
              { key: "prevalidation", label: "生成断前事", desc: "3 条验盘断语 + 补问路径" },
              { key: "wechat_reply", label: "生成微信话术", desc: "短/中/深三档话术" },
              { key: "long_report", label: "生成长文报告", desc: "完整命理分析报告" },
            ].map(task => (
              <button
                key={task.key}
                onClick={() => handleAITask(task.key)}
                disabled={aiLoading}
                className="w-full text-left card hover:border-[var(--accent)] transition-colors"
                style={{
                  opacity: aiLoading && aiTask !== task.key ? 0.5 : 1,
                }}
              >
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {task.label}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {task.desc}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 card min-h-[400px]">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              {aiTask === "internal_analysis" && "内部分析"}
              {aiTask === "prevalidation" && "断前事候选"}
              {aiTask === "wechat_reply" && "微信话术"}
              {aiTask === "long_report" && "长文报告"}
              {!aiTask && "AI 生成结果"}
            </h3>
            {aiLoading && !aiResult && (
              <div className="animate-pulse-slow" style={{ color: "var(--text-muted)" }}>
                正在生成...
              </div>
            )}
            {aiResult && (
              <div
                className="text-sm whitespace-pre-wrap leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {aiResult}
              </div>
            )}
            {!aiLoading && !aiResult && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                选择左侧工具开始生成
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
