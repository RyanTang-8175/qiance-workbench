"use client";

import { useState, useEffect } from "react";

interface Settings {
  aiProvider: "claude" | "deepseek" | "auto";
  claudeApiKey: string;
  deepseekApiKey: string;
  defaultGender: "male" | "female";
  defaultTrueSolarTime: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  aiProvider: "auto",
  claudeApiKey: "",
  deepseekApiKey: "",
  defaultGender: "male",
  defaultTrueSolarTime: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("qiance_settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  function handleSave() {
    localStorage.setItem("qiance_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl mb-2" style={{ color: "var(--text-primary)" }}>设置</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        配置 API 和默认选项
      </p>

      <div className="space-y-6">
        {/* AI 提供商 */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>AI 提供商</h2>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Auto 模式：复杂任务（排盘、分析）用 Claude，简单任务（话术）用 DeepSeek，成本最优
          </p>
          <div className="flex gap-3">
            {[
              { value: "auto", label: "Auto（推荐）", desc: "智能切换，成本最优" },
              { value: "claude", label: "仅 Claude", desc: "质量最高，成本较高" },
              { value: "deepseek", label: "仅 DeepSeek", desc: "成本最低，中文能力强" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateSetting("aiProvider", opt.value as Settings["aiProvider"])}
                className="flex-1 p-3 rounded-lg text-left transition-all"
                style={{
                  backgroundColor: settings.aiProvider === opt.value ? "var(--accent)" : "var(--bg-secondary)",
                  color: settings.aiProvider === opt.value ? "white" : "var(--text-secondary)",
                  border: `1px solid ${settings.aiProvider === opt.value ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-xs mt-1 opacity-80">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>API Keys</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                Claude API Key
              </label>
              <input
                type="password"
                className="input"
                placeholder="sk-ant-..."
                value={settings.claudeApiKey}
                onChange={e => updateSetting("claudeApiKey", e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                用于 AI 自排盘、图片 OCR、深度分析。从 console.anthropic.com 获取
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                DeepSeek API Key
              </label>
              <input
                type="password"
                className="input"
                placeholder="sk-..."
                value={settings.deepseekApiKey}
                onChange={e => updateSetting("deepseekApiKey", e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                用于话术生成、简单任务。从 platform.deepseek.com 获取
              </p>
            </div>
          </div>
        </div>

        {/* 默认选项 */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>默认选项</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                默认性别
              </label>
              <div className="flex gap-3">
                {[
                  { value: "male", label: "男" },
                  { value: "female", label: "女" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSetting("defaultGender", opt.value as "male" | "female")}
                    className="flex-1 py-2 rounded-md text-sm transition-all"
                    style={{
                      backgroundColor: settings.defaultGender === opt.value ? "var(--accent)" : "var(--bg-secondary)",
                      color: settings.defaultGender === opt.value ? "white" : "var(--text-secondary)",
                      border: `1px solid ${settings.defaultGender === opt.value ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="trueSolarTime"
                checked={settings.defaultTrueSolarTime}
                onChange={e => updateSetting("defaultTrueSolarTime", e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <label htmlFor="trueSolarTime" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                默认启用真太阳时
              </label>
            </div>
          </div>
        </div>

        {/* 保存 */}
        <div className="flex gap-3">
          <button onClick={handleSave} className="btn-primary flex-1">
            {saved ? "已保存" : "保存设置"}
          </button>
          <a href="/" className="btn-secondary text-center">
            返回
          </a>
        </div>
      </div>
    </div>
  );
}
