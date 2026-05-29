"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITY_COORDINATES } from "@/lib/bazi/true-solar-time";

const cities = Object.keys(CITY_COORDINATES);

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    alias: "",
    gender: "male" as "male" | "female",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    birthHour: "",
    birthMinute: "0",
    birthPlace: "",
    trueSolarTime: false,
    questionType: "",
    clientQuestion: "",
    hourKnown: true,
  });

  function updateForm(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.birthYear || !form.birthMonth || !form.birthDay) {
      alert("请填写完整的出生日期");
      return;
    }

    setLoading(true);
    try {
      const birthSolar = `${form.birthYear}-${String(form.birthMonth).padStart(2, "0")}-${String(form.birthDay).padStart(2, "0")}`;
      const hour = form.hourKnown ? parseInt(form.birthHour) || 0 : 0;
      const minute = parseInt(form.birthMinute) || 0;

      // 1. 创建个案
      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias: form.alias || "未命名",
          gender: form.gender,
          birthSolar: `${birthSolar} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
          birthPlace: form.birthPlace,
          birthLongitude: CITY_COORDINATES[form.birthPlace]?.lng,
          birthLatitude: CITY_COORDINATES[form.birthPlace]?.lat,
          trueSolarTimeEnabled: form.trueSolarTime,
          questionType: form.questionType,
          clientOriginalQuestion: form.clientQuestion,
          hourKnown: form.hourKnown,
        }),
      });

      const newCase = await caseRes.json();

      // 2. 排盘
      if (form.hourKnown) {
        const chartRes = await fetch("/api/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: parseInt(form.birthYear),
            month: parseInt(form.birthMonth),
            day: parseInt(form.birthDay),
            hour,
            minute,
            gender: form.gender,
            birthPlace: form.birthPlace,
            useTrueSolarTime: form.trueSolarTime,
          }),
        });

        if (chartRes.ok) {
          // 跳转到个案详情
          router.push(`/cases/${newCase.id}`);
          return;
        }
      }

      router.push(`/cases/${newCase.id}`);
    } catch (e) {
      console.error("创建个案失败:", e);
      alert("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
        新建个案
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        录入客户出生信息，系统将自动排盘
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>
            基本信息
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                客户代号
              </label>
              <input
                type="text"
                className="input"
                placeholder="如：张先生、客户A"
                value={form.alias}
                onChange={e => updateForm("alias", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                性别
              </label>
              <div className="flex gap-3">
                {[
                  { value: "male", label: "男" },
                  { value: "female", label: "女" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("gender", opt.value)}
                    className="flex-1 py-2 rounded-md text-sm transition-all"
                    style={{
                      backgroundColor: form.gender === opt.value ? "var(--accent)" : "var(--bg-secondary)",
                      color: form.gender === opt.value ? "white" : "var(--text-secondary)",
                      border: `1px solid ${form.gender === opt.value ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 出生信息 */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>
            出生信息
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                  出生年 *
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="1990"
                  value={form.birthYear}
                  onChange={e => updateForm("birthYear", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                  月 *
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="1-12"
                  min={1}
                  max={12}
                  value={form.birthMonth}
                  onChange={e => updateForm("birthMonth", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                  日 *
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="1-31"
                  min={1}
                  max={31}
                  value={form.birthDay}
                  onChange={e => updateForm("birthDay", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hourKnown"
                checked={form.hourKnown}
                onChange={e => updateForm("hourKnown", e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <label htmlFor="hourKnown" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                知道出生时辰
              </label>
            </div>

            {form.hourKnown && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                    出生时（24小时制）
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0-23"
                    min={0}
                    max={23}
                    value={form.birthHour}
                    onChange={e => updateForm("birthHour", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                    分
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0-59"
                    min={0}
                    max={59}
                    value={form.birthMinute}
                    onChange={e => updateForm("birthMinute", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                出生地
              </label>
              <select
                className="input"
                value={form.birthPlace}
                onChange={e => updateForm("birthPlace", e.target.value)}
              >
                <option value="">选择城市（可选）</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {form.birthPlace && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="trueSolarTime"
                  checked={form.trueSolarTime}
                  onChange={e => updateForm("trueSolarTime", e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <label htmlFor="trueSolarTime" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  启用真太阳时校正（根据出生地经度修正）
                </label>
              </div>
            )}
          </div>
        </div>

        {/* 问题类型 */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>
            客户问题
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                问题类型
              </label>
              <select
                className="input"
                value={form.questionType}
                onChange={e => updateForm("questionType", e.target.value)}
              >
                <option value="">选择类型（可选）</option>
                <option value="感情">感情/婚姻</option>
                <option value="事业">事业/工作</option>
                <option value="财运">财运/投资</option>
                <option value="健康">健康</option>
                <option value="学业">学业</option>
                <option value="综合">综合详批</option>
                <option value="试探">试探（先验盘）</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                客户原话
              </label>
              <textarea
                className="input min-h-[80px]"
                placeholder="记录客户的问题原文..."
                value={form.clientQuestion}
                onChange={e => updateForm("clientQuestion", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "创建中..." : "创建个案并排盘"}
          </button>
          <a href="/" className="btn-secondary text-center">
            取消
          </a>
        </div>
      </form>
    </div>
  );
}
