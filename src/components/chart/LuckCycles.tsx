"use client";

import type { LuckCycle } from "@/lib/bazi/luck-cycles";

interface LuckCyclesProps {
  cycles: LuckCycle[];
  dayStem: string;
}

const ELEMENT_CLASS: Record<string, string> = {
  木: "element-wood", 火: "element-fire", 土: "element-earth",
  金: "element-metal", 水: "element-water",
};

export default function LuckCycles({ cycles, dayStem }: LuckCyclesProps) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        大运
      </h3>
      <div className="luck-table">
        {cycles.map((cycle, i) => (
          <div
            key={i}
            className={`luck-cell ${cycle.isCurrent ? "current" : ""}`}
          >
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {cycle.startAge}-{cycle.endAge}岁
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {cycle.startYear}-{cycle.endYear}
            </div>
            <div className={`text-lg font-bold mt-1 ${ELEMENT_CLASS[cycle.element] ?? ""}`}>
              {cycle.pillar}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>
              {cycle.tenGod}
            </div>
            {cycle.isCurrent && (
              <div
                className="text-xs mt-1 font-semibold"
                style={{ color: "var(--accent)" }}
              >
                当前
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
