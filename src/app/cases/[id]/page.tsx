"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BaziChart from "@/components/chart/BaziChart";
import LuckCycles from "@/components/chart/LuckCycles";
import ShenShaList from "@/components/chart/ShenSha";
import BranchRelations from "@/components/chart/BranchRelations";
import VerificationTable from "@/components/chart/VerificationTable";
import FeedbackPanel from "@/components/case/FeedbackPanel";
import { useToast } from "@/components/ui/Toast";
import type { ChartResult } from "@/lib/bazi/chart";
import type { VerificationResult } from "@/lib/bazi/verification";
import type { AISelfChartResult } from "@/lib/ai/chart-ai";
import type { ChartOCRResult } from "@/lib/ai/chart-ocr";

interface CaseData {
  id: string; alias: string; gender: string; birth_solar: string;
  birth_place: string; question_type: string; client_original_question: string;
  status: string; chart_data: string; ziwei_data: string;
  internal_analysis: string; your_judgment: string; created_at: string;
}

type TabKey = "chart" | "verify" | "analysis" | "feedback" | "ai";

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [layout, setLayout] = useState<"traditional" | "modern">("modern");
  const [activeTab, setActiveTab] = useState<TabKey>("chart");
  const [loading, setLoading] = useState(true);
  const [tokenUsage, setTokenUsage] = useState<{ input: number; output: number; cost: string } | null>(null);
  const [showTokenDetail, setShowTokenDetail] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiTask, setAiTask] = useState<string | null>(null);

  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [workflowStep, setWorkflowStep] = useState("");
  const [workflowResults, setWorkflowResults] = useState<Record<string, unknown>>({});

  const [deleting, setDeleting] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [aiChartResult, setAiChartResult] = useState<AISelfChartResult | null>(null);
  const [imageChartResult, setImageChartResult] = useState<ChartOCRResult | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCase = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${id}`);
      if (res.status === 401) { router.push("/login"); return; }
      if (res.ok) {
        const data = await res.json();
        setCaseData(data);
        if (data.chart_data) setChart(JSON.parse(data.chart_data));
      }
    } catch {
      toast("加载个案失败", "error");
    } finally { setLoading(false); }
  }, [id, router, toast]);

  useEffect(() => { loadCase(); }, [loadCase]);

  async function handleDelete() {
    if (!caseData) return;
    if (!confirm(`确定删除"${caseData.alias}"？`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      if (res.ok) { toast("已删除", "success"); router.push("/"); }
      else toast("删除失败", "error");
    } catch { toast("删除失败", "error"); }
    finally { setDeleting(false); }
  }

  async function handleVerify() {
    if (!chart || !caseData) return;
    setVerifyLoading(true); setVerifyResult(null);
    try {
      const datePart = caseData.birth_solar.split(" ")[0];
      const timePart = caseData.birth_solar.split(" ")[1] ?? "00:00";
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      const res = await fetch("/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, day, hour, minute, gender: caseData.gender, birthPlace: caseData.birth_place }),
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyResult(data.verification);
        setAiChartResult(data.aiResult);
        if (data.imageResult) setImageChartResult(data.imageResult);
      }
    } catch { toast("校验失败", "error"); }
    finally { setVerifyLoading(false); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) { const data = await res.json(); setImageChartResult(data.result); }
    } catch { toast("图片上传失败", "error"); }
    finally { setImageUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  async function handleAITask(taskType: string) {
    if (!chart) return;
    setAiLoading(true); setAiTask(taskType); setAiResult(""); setTokenUsage(null);
    const startTime = Date.now();
    let fullText = ""; let errorMsg = "";
    try {
      let styleGuide = "";
      try {
        const styleRes = await fetch("/api/style");
        if (styleRes.ok) {
          const styleData = await styleRes.json();
          const activeGuide = styleData.guides?.find((g: { is_active: number }) => g.is_active);
          if (activeGuide?.guide_content) styleGuide = activeGuide.guide_content;
        }
      } catch {}

      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType, chartData: chart, analysis: caseData?.internal_analysis, styleGuide }),
      });
      if (!res.ok) { const err = await res.json().catch(() => null); throw new Error(err?.error || "请求失败"); }
      const reader = res.body?.getReader(); const decoder = new TextDecoder();
      if (reader) {
        let done = false;
        while (!done) {
          const { done: d, value } = await reader.read(); if (d) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n").filter(l => l.startsWith("data: "))) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") { done = true; break; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) errorMsg = parsed.error;
              if (parsed.chunk) { fullText += parsed.chunk; setAiResult(fullText); }
            } catch {}
          }
        }
      }
      if (errorMsg) setAiResult(`生成失败：${errorMsg}`);
      else if (!fullText) setAiResult("未收到输出，请检查 API Key");
    } catch (e) { setAiResult(`生成失败：${e instanceof Error ? e.message : "未知错误"}`); }
    finally {
      setAiLoading(false);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const outputTokens = Math.round(fullText.length * 1.5);
      const inputTokens = Math.round(JSON.stringify(chart).length * 0.5);
      const cost = (inputTokens * 0.14 + outputTokens * 0.28) / 1_000_000;
      setTokenUsage({ input: inputTokens, output: outputTokens, cost: `~$${cost.toFixed(4)} · ${elapsed}s` });
    }
  }

  async function handleWorkflow() {
    if (!chart) return;
    setWorkflowRunning(true); setWorkflowStep("准备中..."); setWorkflowResults({});
    try {
      let styleGuide = "";
      try {
        const styleRes = await fetch("/api/style");
        if (styleRes.ok) {
          const styleData = await styleRes.json();
          const activeGuide = styleData.guides?.find((g: { is_active: number }) => g.is_active);
          if (activeGuide?.guide_content) styleGuide = activeGuide.guide_content;
        }
      } catch {}

      const res = await fetch("/api/ai/workflow", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartData: chart, questionType: caseData?.question_type, styleGuide }),
      });
      if (!res.ok) throw new Error("流程启动失败");

      const reader = res.body?.getReader(); const decoder = new TextDecoder();
      const results: Record<string, unknown> = {};
      if (reader) {
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          const text = decoder.decode(value);
          for (const line of text.split("\n").filter(l => l.startsWith("data: "))) {
            try {
              const data = JSON.parse(line.replace("data: ", "").trim());
              if (data.step && data.status === "running") setWorkflowStep(data.message || data.step);
              if (data.step && data.status === "done") results[data.step] = data.data;
              if (data.step && data.status === "error") setWorkflowStep(`错误：${data.message}`);
              if (data.done) Object.assign(results, data.results);
            } catch {}
          }
        }
      }
      setWorkflowResults(results);
      // 保存分析结果到个案
      if (results.analyze) {
        const analysis = results.analyze as { raw: string };
        await fetch(`/api/cases/${id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ internal_analysis: analysis.raw, status: "prevalidated" }),
        });
      }
      toast("全流程完成", "success");
    } catch (e) { toast(`流程失败：${e instanceof Error ? e.message : "未知错误"}`, "error"); }
    finally { setWorkflowRunning(false); setWorkflowStep(""); }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast("已复制", "success")).catch(() => toast("复制失败", "error"));
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center" style={{ color: "var(--text-muted)" }}>加载中...</div>;
  if (!caseData) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <p style={{ color: "var(--text-muted)" }}>个案不存在</p>
      <Link href="/" className="btn-secondary mt-4 inline-block">返回</Link>
    </div>
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: "chart", label: "命盘" }, { key: "verify", label: "校验" },
    { key: "analysis", label: "分析" }, { key: "feedback", label: "反馈" }, { key: "ai", label: "AI" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* 头部 */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-sm shrink-0" style={{ color: "var(--text-muted)" }}>&larr; 返回</Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold truncate" style={{ color: "var(--text-primary)" }}>{caseData.alias}</h1>
            <p className="text-xs sm:text-sm truncate" style={{ color: "var(--text-secondary)" }}>
              {caseData.birth_solar}{caseData.birth_place ? ` · ${caseData.birth_place}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setLayout(layout === "traditional" ? "modern" : "traditional")} className="btn-secondary text-xs !py-2 !px-3">
            {layout === "traditional" ? "现代" : "传统"}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="text-xs px-3 py-2 rounded" style={{ color: "var(--fire)", backgroundColor: "rgba(220,38,38,0.08)" }}>
            {deleting ? "..." : "删除"}
          </button>
        </div>
      </div>

      {/* Tab 栏 */}
      <div className="flex gap-1 mb-4 border-b tabs-scroll" style={{ borderColor: "var(--border)" }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="px-3 sm:px-4 py-2.5 text-sm whitespace-nowrap transition-all border-b-2" style={{ color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)", borderColor: activeTab === tab.key ? "var(--accent)" : "transparent" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 命盘 Tab */}
      {activeTab === "chart" && chart && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>命盘</span>
            <button onClick={() => handleCopy(`${chart.yearPillar.stem}${chart.yearPillar.branch} ${chart.monthPillar.stem}${chart.monthPillar.branch} ${chart.dayPillar.stem}${chart.dayPillar.branch} ${chart.hourPillar.stem}${chart.hourPillar.branch}`)} className="btn-secondary text-xs !py-1.5 !px-3">
              复制四柱
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <BaziChart chart={chart} layout={layout} />
              <LuckCycles cycles={chart.luckCycles} dayStem={chart.dayMaster} />
            </div>
            <div className="space-y-4">
              <BranchRelations relations={chart.branchRelations} stemRelations={chart.stemRelations} />
              <ShenShaList shenSha={chart.shenSha} />
            </div>
          </div>
        </div>
      )}

      {/* 校验 Tab */}
      {activeTab === "verify" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card"><h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>系统盘</h3>{chart ? <div className="text-sm" style={{ color: "var(--wood)" }}>{chart.yearPillar.stem}{chart.yearPillar.branch} {chart.monthPillar.stem}{chart.monthPillar.branch} {chart.dayPillar.stem}{chart.dayPillar.branch} {chart.hourPillar.stem}{chart.hourPillar.branch}</div> : <p className="text-sm" style={{ color: "var(--text-muted)" }}>尚未排盘</p>}</div>
            <div className="card"><h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>AI 自排</h3>{aiChartResult ? <div><div className="text-sm" style={{ color: "var(--water)" }}>{aiChartResult.pillars.year} {aiChartResult.pillars.month} {aiChartResult.pillars.day} {aiChartResult.pillars.hour}</div>{aiChartResult.uncertainties.length > 0 && <div className="text-xs mt-1" style={{ color: "var(--earth)" }}>不确定：{aiChartResult.uncertainties.join("；")}</div>}</div> : <p className="text-sm" style={{ color: "var(--text-muted)" }}>点击校验生成</p>}</div>
            <div className="card"><h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>图片识别</h3>{imageChartResult ? <div><div className="text-sm" style={{ color: "var(--gold)" }}>{imageChartResult.pillars.year} {imageChartResult.pillars.month} {imageChartResult.pillars.day} {imageChartResult.pillars.hour}</div></div> : <div><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /><button onClick={() => fileInputRef.current?.click()} disabled={imageUploading} className="btn-secondary text-xs !py-1.5 !px-3">{imageUploading ? "识别中..." : "上传图片"}</button></div>}</div>
          </div>
          <button onClick={handleVerify} disabled={verifyLoading || !chart} className="btn-primary">{verifyLoading ? "校验中..." : "执行三盘校验"}</button>
          {verifyResult && <div className="table-scroll"><VerificationTable result={verifyResult} /></div>}
        </div>
      )}

      {/* 分析 Tab */}
      {activeTab === "analysis" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>内部分析</h3>
              {caseData.internal_analysis ? <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-secondary)" }}>{caseData.internal_analysis}</div> : <div><p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>尚未生成</p><button onClick={() => handleAITask("internal_analysis")} disabled={aiLoading} className="btn-primary text-sm">生成分析</button></div>}
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>最终判断</h3>
              {caseData.your_judgment ? <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{caseData.your_judgment}</div> : <p className="text-sm" style={{ color: "var(--text-muted)" }}>尚未记录</p>}
            </div>
          </div>
          {/* 一键全流程 */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>一键全流程</h3>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>分析 → 断前事 → 话术</span>
            </div>
            <button onClick={handleWorkflow} disabled={workflowRunning || !chart} className="btn-gold w-full">
              {workflowRunning ? workflowStep || "执行中..." : "开始全流程分析"}
            </button>
            {Object.keys(workflowResults).length > 0 && (
              <div className="mt-3 space-y-2">
                {"analyze" in workflowResults && <div className="text-xs p-2 rounded" style={{ backgroundColor: "var(--bg-secondary)" }}>结构化分析已完成</div>}
                {"predict" in workflowResults && <div className="text-xs p-2 rounded" style={{ backgroundColor: "var(--bg-secondary)" }}>断前事已生成</div>}
                {"speech" in workflowResults && <div className="text-xs p-2 rounded" style={{ backgroundColor: "var(--bg-secondary)" }}>话术已生成</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 反馈 Tab */}
      {activeTab === "feedback" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div><h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>反馈记录</h3><FeedbackPanel caseId={id} /></div>
          <div className="card"><h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>断前事候选</h3>{aiResult && aiTask === "prevalidation" ? <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{aiResult}</div> : <p className="text-sm" style={{ color: "var(--text-muted)" }}>前往 AI 标签生成</p>}</div>
        </div>
      )}

      {/* AI Tab */}
      {activeTab === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>AI 工具</h3>
            {[{ key: "internal_analysis", label: "内部分析", desc: "格局/喜忌/核心矛盾" }, { key: "prevalidation", label: "断前事", desc: "3条验盘断语" }, { key: "wechat_reply", label: "微信话术", desc: "短/中/深三档" }, { key: "long_report", label: "长文报告", desc: "完整命理分析" }].map(task => (
              <button key={task.key} onClick={() => handleAITask(task.key)} disabled={aiLoading} className="w-full text-left card !p-3" style={{ opacity: aiLoading && aiTask !== task.key ? 0.5 : 1 }}>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{task.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{task.desc}</div>
              </button>
            ))}
          </div>
          <div className="lg:col-span-2 space-y-3">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {aiTask === "internal_analysis" && "内部分析"}{aiTask === "prevalidation" && "断前事"}{aiTask === "wechat_reply" && "微信话术"}{aiTask === "long_report" && "长文报告"}{!aiTask && "AI 结果"}
                </h3>
                {tokenUsage && (
                  <button onClick={() => setShowTokenDetail(!showTokenDetail)} className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {showTokenDetail ? "隐藏详情" : tokenUsage.cost}
                  </button>
                )}
              </div>
              {showTokenDetail && tokenUsage && (
                <div className="flex gap-3 text-xs mb-2 p-2 rounded" style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Input: ~{tokenUsage.input.toLocaleString()}</span>
                  <span style={{ color: "var(--text-muted)" }}>Output: ~{tokenUsage.output.toLocaleString()}</span>
                  <span style={{ color: "var(--gold)" }}>{tokenUsage.cost}</span>
                </div>
              )}
              {aiLoading && !aiResult && <div className="animate-pulse-slow" style={{ color: "var(--text-muted)" }}>正在生成...</div>}
              {aiResult && <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-secondary)" }}>{aiResult}</div>}
              {!aiLoading && !aiResult && <p className="text-sm" style={{ color: "var(--text-muted)" }}>选择左侧工具开始</p>}
            </div>
            {aiResult && !aiLoading && (
              <div className="flex gap-2">
                <button onClick={async () => { await fetch("/api/artifacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseId: id, type: aiTask, content: aiResult, model: "auto" }) }); toast("已保存", "success"); }} className="btn-primary text-xs !py-2">保存到个案</button>
                <button onClick={() => handleCopy(aiResult)} className="btn-gold text-xs !py-2">复制到微信</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
