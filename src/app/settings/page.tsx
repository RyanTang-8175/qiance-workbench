"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ hasClaudeKey: boolean; hasDeepseekKey: boolean } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(data => {
      setSettings(prev => ({
        ...prev,
        aiProvider: data.aiProvider || "auto",
        claudeApiKey: data.claudeApiKey || "",
        deepseekApiKey: data.deepseekApiKey || "",
        defaultGender: data.defaultGender || "male",
        defaultTrueSolarTime: data.defaultTrueSolarTime ?? false,
      }));
      setKeyStatus({ hasClaudeKey: data.hasClaudeKey, hasDeepseekKey: data.hasDeepseekKey });
    }).catch(() => {});
  }, []);

  async function handleSave() {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setKeyStatus({ hasClaudeKey: data.hasClaudeKey, hasDeepseekKey: data.hasDeepseekKey });
        setSaved(true);
        toast("设置已保存", "success");
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast("保存失败", "error");
      }
    } catch {
      toast("保存失败", "error");
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: "wechat_reply", chartData: {}, analysis: "测试连接" }),
      });
      if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let gotChunk = false;
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value);
            if (text.includes('"chunk"')) gotChunk = true;
            if (text.includes("[DONE]") || text.includes('"error"')) break;
          }
        }
        toast(gotChunk ? "连接成功！AI 正常工作" : "连接失败，请检查 API Key", gotChunk ? "success" : "error");
      } else {
        toast("连接失败，请检查 API Key", "error");
      }
    } catch {
      toast("连接失败，请检查网络", "error");
    } finally {
      setTesting(false);
    }
  }

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl mb-2" style={{ color: "var(--text-primary)" }}>设置</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        配置 API 和默认选项
      </p>

      <div className="space-y-4 sm:space-y-6">
        {/* API Keys */}
        <div className="card">
          <h2 className="text-base sm:text-lg mb-3" style={{ color: "var(--text-primary)" }}>API Keys</h2>
          {keyStatus && (
            <div className="flex gap-3 mb-3 text-xs">
              <span style={{ color: keyStatus.hasClaudeKey ? "var(--wood)" : "var(--fire)" }}>
                Claude: {keyStatus.hasClaudeKey ? "已配置" : "未配置"}
              </span>
              <span style={{ color: keyStatus.hasDeepseekKey ? "var(--wood)" : "var(--fire)" }}>
                DeepSeek: {keyStatus.hasDeepseekKey ? "已配置" : "未配置"}
              </span>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Claude API Key</label>
              <input type="password" className="input" placeholder="sk-ant-..." value={settings.claudeApiKey} onChange={e => updateSetting("claudeApiKey", e.target.value)} />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>深度分析、OCR。从 console.anthropic.com 获取</p>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>DeepSeek API Key</label>
              <input type="password" className="input" placeholder="sk-..." value={settings.deepseekApiKey} onChange={e => updateSetting("deepseekApiKey", e.target.value)} />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>话术生成、简单任务。从 platform.deepseek.com 获取</p>
            </div>
            <button onClick={handleTestConnection} disabled={testing} className="btn-secondary text-sm w-full">
              {testing ? "测试中..." : "测试连接"}
            </button>
          </div>
        </div>

        {/* AI 提供商 */}
        <div className="card">
          <h2 className="text-base sm:text-lg mb-3" style={{ color: "var(--text-primary)" }}>AI 提供商</h2>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Auto：复杂任务用 Claude，简单任务用 DeepSeek
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {[
              { value: "auto", label: "Auto（推荐）", desc: "智能切换" },
              { value: "claude", label: "仅 Claude", desc: "质量最高" },
              { value: "deepseek", label: "仅 DeepSeek", desc: "成本最低" },
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
                <div className="text-xs mt-0.5 opacity-80">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 默认选项 */}
        <div className="card">
          <h2 className="text-base sm:text-lg mb-3" style={{ color: "var(--text-primary)" }}>默认选项</h2>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>新建个案时自动使用这些默认值</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>默认性别</label>
              <div className="flex gap-2">
                {[{ value: "male", label: "男" }, { value: "female", label: "女" }].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSetting("defaultGender", opt.value as "male" | "female")}
                    className="flex-1 py-2.5 rounded-md text-sm transition-all"
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
              <input type="checkbox" id="trueSolarTime" checked={settings.defaultTrueSolarTime} onChange={e => updateSetting("defaultTrueSolarTime", e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              <label htmlFor="trueSolarTime" className="text-sm" style={{ color: "var(--text-secondary)" }}>默认启用真太阳时</label>
            </div>
          </div>
        </div>

        {/* 保存 */}
        <div className="flex gap-3">
          <button onClick={handleSave} className="btn-primary flex-1">
            {saved ? "已保存" : "保存设置"}
          </button>
          <Link href="/" className="btn-secondary text-center">返回</Link>
        </div>
      </div>
    </div>
  );
}
