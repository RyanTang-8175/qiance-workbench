"use client";

import type { ShenSha as ShenShaType } from "@/lib/bazi/shensha";

interface ShenShaProps {
  shenSha: ShenShaType[];
}

const POS_NAMES = ["年", "月", "日", "时"];

export default function ShenShaList({ shenSha }: ShenShaProps) {
  if (shenSha.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          神煞
        </h3>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          未查到明显神煞
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        神煞
      </h3>
      <div className="space-y-2">
        {shenSha.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-1.5 px-2 rounded"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              {s.name}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {POS_NAMES[s.position]}柱 · {s.branch}
            </span>
            <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>
              {s.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
