"use client";

import type { VerificationResult, PillarComparison } from "@/lib/bazi/verification";

interface VerificationTableProps {
  result: VerificationResult;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  "一致": { bg: "rgba(45, 122, 58, 0.1)", color: "var(--wood)", label: "一致" },
  "冲突": { bg: "rgba(194, 59, 34, 0.1)", color: "var(--fire)", label: "冲突" },
  "部分一致": { bg: "rgba(184, 134, 11, 0.1)", color: "var(--earth)", label: "部分一致" },
  "缺失": { bg: "rgba(139, 139, 139, 0.1)", color: "var(--metal)", label: "缺失" },
};

const OVERALL_STYLES: Record<string, { bg: string; color: string }> = {
  "一致": { bg: "rgba(45, 122, 58, 0.08)", color: "var(--wood)" },
  "有差异": { bg: "rgba(184, 134, 11, 0.08)", color: "var(--earth)" },
  "严重冲突": { bg: "rgba(194, 59, 34, 0.08)", color: "var(--fire)" },
};

function PillarRow({ pillar }: { pillar: PillarComparison }) {
  const style = STATUS_STYLES[pillar.status] ?? STATUS_STYLES["缺失"];

  return (
    <tr>
      <td className="font-semibold" style={{ color: "var(--text-primary)" }}>
        {pillar.positionName}
      </td>
      <td className="font-mono-zh">{pillar.system || "—"}</td>
      <td className="font-mono-zh">{pillar.ai || "—"}</td>
      <td className="font-mono-zh">{pillar.image || "—"}</td>
      <td>
        <span
          className="text-xs px-2 py-0.5 rounded font-semibold"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {style.label}
        </span>
      </td>
    </tr>
  );
}

export default function VerificationTable({ result }: VerificationTableProps) {
  const overallStyle = OVERALL_STYLES[result.overallStatus] ?? OVERALL_STYLES["有差异"];

  return (
    <div className="space-y-4">
      {/* 总体状态 */}
      <div
        className="card flex items-center gap-4"
        style={{ backgroundColor: overallStyle.bg }}
      >
        <div
          className="text-2xl font-bold"
          style={{ color: overallStyle.color }}
        >
          {result.overallStatus === "一致" ? "✓" : result.overallStatus === "有差异" ? "⚠" : "✗"}
        </div>
        <div>
          <div className="font-semibold" style={{ color: overallStyle.color }}>
            三盘校验：{result.overallStatus}
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {result.summary}
          </div>
        </div>
      </div>

      {/* 对比表格 */}
      <table className="chart-table">
        <thead>
          <tr>
            <th>柱位</th>
            <th>系统盘</th>
            <th>AI 自排</th>
            <th>图片识别</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {result.pillars.map((pillar) => (
            <PillarRow key={pillar.position} pillar={pillar} />
          ))}
        </tbody>
      </table>

      {/* 差异详情 */}
      {result.pillars.some(p => p.status === "冲突") && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--accent)" }}>
            差异分析
          </h3>
          <div className="space-y-3">
            {result.pillars
              .filter(p => p.status === "冲突")
              .map(p => (
                <div
                  key={p.position}
                  className="p-3 rounded"
                  style={{ backgroundColor: "rgba(194, 59, 34, 0.05)" }}
                >
                  <div className="font-semibold text-sm" style={{ color: "var(--fire)" }}>
                    {p.positionName}冲突：{p.system} vs {p.ai || p.image}
                  </div>
                  {p.possibleReason && (
                    <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      可能原因：{p.possibleReason}
                    </div>
                  )}
                  {p.suggestion && (
                    <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>
                      建议：{p.suggestion}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 建议 */}
      {result.recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            建议操作
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: "var(--gold)" }}>·</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
