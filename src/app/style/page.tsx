"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StyleGuide {
  id: string;
  name: string;
  guide_content: string;
  version: number;
  is_active: number;
  created_at: string;
}

interface StyleSentence {
  id: string;
  sentence: string;
  type: "good" | "bad";
  source: string | null;
  tags: string | null;
  created_at: string;
}

export default function StylePage() {
  const [guides, setGuides] = useState<StyleGuide[]>([]);
  const [sentences, setSentences] = useState<StyleSentence[]>([]);
  const [activeTab, setActiveTab] = useState<"guides" | "good" | "bad">("guides");
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [showAddSentence, setShowAddSentence] = useState(false);
  const [newGuide, setNewGuide] = useState({ name: "", content: "" });
  const [newSentence, setNewSentence] = useState({ sentence: "", type: "good" as "good" | "bad" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [guidesRes, sentencesRes] = await Promise.all([
        fetch("/api/style?type=guides"),
        fetch("/api/style?type=sentences"),
      ]);
      if (guidesRes.ok) {
        const data = await guidesRes.json();
        setGuides(data.guides ?? []);
      }
      if (sentencesRes.ok) {
        const data = await sentencesRes.json();
        setSentences(data.sentences ?? []);
      }
    } catch (e) {
      console.error("加载风格库失败:", e);
    }
  }

  async function handleSaveGuide() {
    if (!newGuide.name || !newGuide.content) return;
    try {
      await fetch("/api/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_guide", name: newGuide.name, guideContent: newGuide.content }),
      });
      setNewGuide({ name: "", content: "" });
      setShowAddGuide(false);
      loadData();
    } catch (e) {
      console.error("保存失败:", e);
    }
  }

  async function handleAddSentence() {
    if (!newSentence.sentence) return;
    try {
      await fetch("/api/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_sentence", ...newSentence }),
      });
      setNewSentence({ sentence: "", type: "good" });
      setShowAddSentence(false);
      loadData();
    } catch (e) {
      console.error("添加失败:", e);
    }
  }

  async function handleDeleteSentence(id: string) {
    try {
      await fetch(`/api/style?id=${id}`, { method: "DELETE" });
      loadData();
    } catch (e) {
      console.error("删除失败:", e);
    }
  }

  const activeGuide = guides.find(g => g.is_active);
  const goodSentences = sentences.filter(s => s.type === "good");
  const badSentences = sentences.filter(s => s.type === "bad");

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl" style={{ color: "var(--text-primary)" }}>风格库</h1>
        <Link href="/" className="text-sm" style={{ color: "var(--text-muted)" }}>返回列表</Link>
      </div>

      {/* Tab */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {[
          { key: "guides", label: "风格指南" },
          { key: "good", label: `好句库 (${goodSentences.length})` },
          { key: "bad", label: `禁句库 (${badSentences.length})` },
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

      {/* 风格指南 */}
      {activeTab === "guides" && (
        <div className="space-y-4">
          {activeGuide && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="tag tag-hit">当前活跃</span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {activeGuide.name} v{activeGuide.version}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                {activeGuide.guide_content}
              </div>
            </div>
          )}

          {!activeGuide && (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
              尚未创建风格指南。点击下方按钮创建。
            </p>
          )}

          {showAddGuide ? (
            <div className="card animate-fadeIn">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                新建风格指南
              </h3>
              <div className="space-y-3">
                <input
                  className="input"
                  placeholder="指南名称（如：我的命理写作风格）"
                  value={newGuide.name}
                  onChange={e => setNewGuide(prev => ({ ...prev, name: e.target.value }))}
                />
                <textarea
                  className="input min-h-[200px]"
                  placeholder="粘贴你的语言风格画像..."
                  value={newGuide.content}
                  onChange={e => setNewGuide(prev => ({ ...prev, content: e.target.value }))}
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveGuide} className="btn-primary text-sm">保存</button>
                  <button onClick={() => setShowAddGuide(false)} className="btn-secondary text-sm">取消</button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddGuide(true)} className="btn-primary">
              + 新建风格指南
            </button>
          )}

          {/* 历史版本 */}
          {guides.length > 1 && (
            <div className="card">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                历史版本
              </h3>
              <div className="space-y-2">
                {guides.filter(g => !g.is_active).map(g => (
                  <div key={g.id} className="p-2 rounded" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      v{g.version} · {new Date(g.created_at).toLocaleDateString("zh-CN")}
                    </div>
                    <div className="text-sm mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {g.guide_content.slice(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 好句/禁句库 */}
      {(activeTab === "good" || activeTab === "bad") && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {activeTab === "good" ? "好句库：你觉得写得好的句子，AI 生成时会参考" : "禁句库：你不想看到的表达，AI 会避免使用"}
            </p>
            <button
              onClick={() => { setNewSentence({ sentence: "", type: activeTab }); setShowAddSentence(true); }}
              className="btn-secondary text-xs !py-1 !px-3"
            >
              + 添加
            </button>
          </div>

          {showAddSentence && (
            <div className="card animate-fadeIn">
              <textarea
                className="input min-h-[60px]"
                placeholder={activeTab === "good" ? "粘贴好句子..." : "粘贴禁用表达..."}
                value={newSentence.sentence}
                onChange={e => setNewSentence(prev => ({ ...prev, sentence: e.target.value }))}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={handleAddSentence} className="btn-primary text-sm">保存</button>
                <button onClick={() => setShowAddSentence(false)} className="btn-secondary text-sm">取消</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(activeTab === "good" ? goodSentences : badSentences).map(s => (
              <div key={s.id} className="card flex items-start justify-between">
                <div className="text-sm flex-1" style={{ color: "var(--text-secondary)" }}>
                  {s.sentence}
                </div>
                <button
                  onClick={() => handleDeleteSentence(s.id)}
                  className="text-xs ml-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  删除
                </button>
              </div>
            ))}
          </div>

          {(activeTab === "good" ? goodSentences : badSentences).length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
              暂无{activeTab === "good" ? "好句" : "禁句"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
