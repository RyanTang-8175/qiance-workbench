"use client";

import type { ChartResult } from "@/lib/bazi/chart";

interface BaziChartProps {
  chart: ChartResult;
  layout?: "traditional" | "modern";
}

const ELEMENT_CLASS: Record<string, string> = {
  木: "element-wood", 火: "element-fire", 土: "element-earth",
  金: "element-metal", 水: "element-water",
};

const ELEMENT_BG: Record<string, string> = {
  木: "element-bg-wood", 火: "element-bg-fire", 土: "element-bg-earth",
  金: "element-bg-metal", 水: "element-bg-water",
};

function PillarCell({ label, stem, branch, tenGod, hiddenStems, naYin }: {
  label: string; stem: string; branch: string; tenGod: string;
  hiddenStems: string[]; naYin: string;
}) {
  return (
    <div className="flex flex-col items-center min-w-[100px]">
      <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{label}</div>
      <div
        className={`text-2xl font-bold mb-1 ${ELEMENT_CLASS[stem[0]] ?? ""}`}
        style={{ fontFamily: "serif" }}
      >
        {stem}
      </div>
      <div
        className={`text-2xl font-bold mb-2 ${ELEMENT_CLASS[branch[0]] ?? ""}`}
        style={{ fontFamily: "serif" }}
      >
        {branch}
      </div>
      <div className="divider-zhu !my-1 !w-12" />
      <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>{tenGod}</div>
      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        藏：{hiddenStems.join(" ")}
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        {naYin}
      </div>
    </div>
  );
}

export default function BaziChart({ chart, layout = "traditional" }: BaziChartProps) {
  const pillars = [
    { label: "年柱", ...chart.yearPillar },
    { label: "月柱", ...chart.monthPillar },
    { label: "日柱", ...chart.dayPillar },
    { label: "时柱", ...chart.hourPillar },
  ];

  if (layout === "modern") {
    return (
      <div className="space-y-4">
        {/* 现代卡片布局 */}
        <div className="grid grid-cols-4 gap-3">
          {pillars.map((p, i) => (
            <div
              key={i}
              className={`card text-center ${ELEMENT_BG[p.element]}`}
            >
              <div className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                {p.label}
              </div>
              <div className={`text-3xl font-bold ${ELEMENT_CLASS[p.stem]}`}>
                {p.stem}
              </div>
              <div className={`text-3xl font-bold mt-1 ${ELEMENT_CLASS[p.branch]}`}>
                {p.branch}
              </div>
              <div className="divider-zhu !my-2" />
              <div className="text-sm" style={{ color: "var(--gold)" }}>
                {p.tenGod}
              </div>
              <div className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                {p.hiddenStems.join(" · ")}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {p.naYin}
              </div>
            </div>
          ))}
        </div>

        {/* 日主信息 */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div
              className={`text-4xl font-bold ${ELEMENT_CLASS[chart.dayMaster]}`}
              style={{ fontFamily: "serif" }}
            >
              {chart.dayMaster}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                日主：{chart.dayMaster}（{chart.dayMasterElement}）
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {chart.elementAnalysis}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 传统格子布局
  return (
    <div className="space-y-4">
      <table className="chart-table">
        <thead>
          <tr>
            <th></th>
            <th>年柱</th>
            <th>月柱</th>
            <th>日柱</th>
            <th>时柱</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>十神</th>
            {pillars.map((p, i) => (
              <td key={i} style={{ color: "var(--gold)" }}>{p.tenGod}</td>
            ))}
          </tr>
          <tr>
            <th>天干</th>
            {pillars.map((p, i) => (
              <td key={i} className={ELEMENT_CLASS[p.stem]}>{p.stem}</td>
            ))}
          </tr>
          <tr>
            <th>地支</th>
            {pillars.map((p, i) => (
              <td key={i} className={ELEMENT_CLASS[p.branch]}>{p.branch}</td>
            ))}
          </tr>
          <tr>
            <th>藏干</th>
            {pillars.map((p, i) => (
              <td key={i} className="text-xs">{p.hiddenStems.join(" ")}</td>
            ))}
          </tr>
          <tr>
            <th>纳音</th>
            {pillars.map((p, i) => (
              <td key={i} className="text-xs">{p.naYin}</td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* 五行统计 */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          五行分布
        </h3>
        <div className="flex gap-4">
          {[
            { name: "木", count: chart.elements.wood, cls: "element-wood" },
            { name: "火", count: chart.elements.fire, cls: "element-fire" },
            { name: "土", count: chart.elements.earth, cls: "element-earth" },
            { name: "金", count: chart.elements.metal, cls: "element-metal" },
            { name: "水", count: chart.elements.water, cls: "element-water" },
          ].map(e => (
            <div key={e.name} className="flex-1 text-center">
              <div className={`text-2xl font-bold ${e.cls}`}>{e.count}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{e.name}</div>
            </div>
          ))}
        </div>
        <div className="text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
          {chart.elementAnalysis}
        </div>
      </div>
    </div>
  );
}
