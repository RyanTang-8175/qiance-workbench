"use client";

import type { BranchRelation } from "@/lib/bazi/relations";

interface BranchRelationsProps {
  relations: BranchRelation[];
  stemRelations: Array<{ type: string; positions: number[]; description: string }>;
}

export default function BranchRelations({ relations, stemRelations }: BranchRelationsProps) {
  const allRelations = [
    ...stemRelations.map(r => ({ ...r, source: "天干" })),
    ...relations.map(r => ({ ...r, source: "地支" })),
  ];

  if (allRelations.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          刑冲合害
        </h3>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          四柱无明显刑冲合害关系
        </p>
      </div>
    );
  }

  const TYPE_COLORS: Record<string, string> = {
    合: "var(--wood)",
    三合: "var(--wood)",
    三会: "var(--wood)",
    冲: "var(--fire)",
    刑: "var(--fire)",
    害: "var(--earth)",
    破: "var(--earth)",
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        刑冲合害
      </h3>
      <div className="space-y-2">
        {allRelations.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-1.5 px-2 rounded"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <span
              className="text-xs px-1.5 py-0.5 rounded font-semibold"
              style={{
                backgroundColor: `${TYPE_COLORS[r.type] ?? "var(--text-muted)"}15`,
                color: TYPE_COLORS[r.type] ?? "var(--text-muted)",
              }}
            >
              {r.type}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {r.source}
            </span>
            <span className="text-sm flex-1" style={{ color: "var(--text-secondary)" }}>
              {r.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
