"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOCATION_DB, getProvinces, getCities, getDistricts, searchLocations } from "@/lib/bazi/locations";

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [form, setForm] = useState({
    name: "",           // 客户姓名
    alias: "",          // 客户代号
    gender: "male" as "male" | "female",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    birthHour: "",
    birthMinute: "0",
    birthPlace: "",     // 完整地名 如 "杭州-西湖区"
    trueSolarTime: false,
    questionType: "",
    clientQuestion: "",
    hourKnown: true,
    provideOwnChart: false,  // 是否自己提供排盘数据
    ownChartData: "",        // 自己提供的排盘数据
  });

  // 出生地选择器状态
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  function updateForm(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // 省份列表
  const provinces = useMemo(() => getProvinces(), []);
  // 城市列表
  const cities = useMemo(() => selectedProvince ? getCities(selectedProvince) : [], [selectedProvince]);
  // 区县列表
  const districts = useMemo(() => selectedCity ? getDistricts(selectedCity) : [], [selectedCity]);
  // 搜索结果
  const searchResults = useMemo(() => locationSearch.length >= 1 ? searchLocations(locationSearch) : [], [locationSearch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.birthYear || !form.birthMonth || !form.birthDay) {
      alert("请填写完整的出生日期");
      return;
    }

    setLoading(true);
    setProgress("创建个案...");

    try {
      const birthSolar = `${form.birthYear}-${String(form.birthMonth).padStart(2, "0")}-${String(form.birthDay).padStart(2, "0")}`;
      const hour = form.hourKnown ? parseInt(form.birthHour) || 0 : 0;
      const minute = parseInt(form.birthMinute) || 0;

      // 获取经纬度
      const locationData = form.birthPlace ? LOCATION_DB[form.birthPlace] : null;

      // 1. 创建个案
      setProgress("保存个案信息...");
      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias: form.name || form.alias || "未命名",
          gender: form.gender,
          birthSolar: `${birthSolar} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
          birthPlace: form.birthPlace,
          birthLongitude: locationData?.lng,
          birthLatitude: locationData?.lat,
          trueSolarTimeEnabled: form.trueSolarTime,
          questionType: form.questionType,
          clientOriginalQuestion: form.clientQuestion,
          hourKnown: form.hourKnown,
        }),
      });

      const newCase = await caseRes.json();

      // 2. 排盘
      if (form.hourKnown && !form.provideOwnChart) {
        setProgress("正在排盘（八字+紫微）...");
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
          const chartData = await chartRes.json();
          setProgress("排盘完成，保存结果...");
          // 更新个案的排盘数据
          await fetch(`/api/cases/${newCase.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chart_data: JSON.stringify(chartData.bazi),
              ziwei_data: chartData.ziwei ? JSON.stringify(chartData.ziwei) : null,
              status: "charted",
            }),
          });
        }
      }

      setProgress("完成！");
      router.push(`/cases/${newCase.id}`);
    } catch (e) {
      console.error("创建个案失败:", e);
      alert("创建失败，请重试");
      setProgress("");
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

      {/* 进度提示 */}
      {loading && progress && (
        <div className="card mb-4 animate-fadeIn" style={{ backgroundColor: "rgba(143, 29, 24, 0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="animate-pulse-slow" style={{ color: "var(--accent)" }}>●</div>
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>{progress}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 客户信息 */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>客户信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                客户姓名
              </label>
              <input
                type="text"
                className="input"
                placeholder="如：张三"
                value={form.name}
                onChange={e => updateForm("name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                客户代号（可选）
              </label>
              <input
                type="text"
                className="input"
                placeholder="如：张先生（用于隐私保护）"
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
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>出生信息</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>年 *</label>
                <input type="number" className="input" placeholder="1990" value={form.birthYear} onChange={e => updateForm("birthYear", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>月 *</label>
                <input type="number" className="input" placeholder="1-12" min={1} max={12} value={form.birthMonth} onChange={e => updateForm("birthMonth", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>日 *</label>
                <input type="number" className="input" placeholder="1-31" min={1} max={31} value={form.birthDay} onChange={e => updateForm("birthDay", e.target.value)} required />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="hourKnown" checked={form.hourKnown} onChange={e => updateForm("hourKnown", e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              <label htmlFor="hourKnown" className="text-sm" style={{ color: "var(--text-secondary)" }}>知道出生时辰</label>
            </div>

            {form.hourKnown && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>时（24小时制）</label>
                  <input type="number" className="input" placeholder="0-23" min={0} max={23} value={form.birthHour} onChange={e => updateForm("birthHour", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>分</label>
                  <input type="number" className="input" placeholder="0-59" min={0} max={59} value={form.birthMinute} onChange={e => updateForm("birthMinute", e.target.value)} />
                </div>
              </div>
            )}

            {/* 出生地选择器 */}
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>出生地</label>
              <input
                type="text"
                className="input mb-2"
                placeholder="搜索省份、城市、区县..."
                value={locationSearch}
                onChange={e => { setLocationSearch(e.target.value); setSelectedProvince(""); setSelectedCity(""); }}
              />

              {/* 搜索结果 */}
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
                  {searchResults.map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => { updateForm("birthPlace", r.key); setLocationSearch(r.key); setSelectedProvince(""); setSelectedCity(""); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {r.key}
                    </button>
                  ))}
                </div>
              )}

              {/* 级联选择 */}
              {!locationSearch && (
                <div className="grid grid-cols-3 gap-2">
                  <select
                    className="input text-sm"
                    value={selectedProvince}
                    onChange={e => { setSelectedProvince(e.target.value); setSelectedCity(""); updateForm("birthPlace", ""); }}
                  >
                    <option value="">省份</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select
                    className="input text-sm"
                    value={selectedCity}
                    onChange={e => { setSelectedCity(e.target.value); updateForm("birthPlace", ""); }}
                  >
                    <option value="">城市</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    className="input text-sm"
                    value={form.birthPlace}
                    onChange={e => updateForm("birthPlace", e.target.value)}
                  >
                    <option value="">区县</option>
                    {districts.map(d => <option key={d} value={`${selectedCity}-${d}`}>{d}</option>)}
                  </select>
                </div>
              )}

              {form.birthPlace && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>已选：</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{form.birthPlace}</span>
                  <button type="button" onClick={() => { updateForm("birthPlace", ""); setLocationSearch(""); setSelectedProvince(""); setSelectedCity(""); }} className="text-xs" style={{ color: "var(--text-muted)" }}>清除</button>
                </div>
              )}
            </div>

            {form.birthPlace && (
              <div className="flex items-center gap-3">
                <input type="checkbox" id="trueSolarTime" checked={form.trueSolarTime} onChange={e => updateForm("trueSolarTime", e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
                <label htmlFor="trueSolarTime" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  启用真太阳时校正（根据出生地经度修正）
                </label>
              </div>
            )}
          </div>
        </div>

        {/* 排盘选项 */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>排盘选项</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="provideOwnChart"
                checked={form.provideOwnChart}
                onChange={e => updateForm("provideOwnChart", e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <label htmlFor="provideOwnChart" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                我自己提供排盘数据（不使用系统排盘）
              </label>
            </div>
            {form.provideOwnChart && (
              <div>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="粘贴你的排盘数据（四柱、大运等）..."
                  value={form.ownChartData}
                  onChange={e => updateForm("ownChartData", e.target.value)}
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  可以从文墨天机、元亨利贞等排盘软件复制
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 问题类型 */}
        <div className="card">
          <h2 className="text-lg mb-4" style={{ color: "var(--text-primary)" }}>客户问题</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>问题类型</label>
              <select className="input" value={form.questionType} onChange={e => updateForm("questionType", e.target.value)}>
                <option value="">选择类型（可选）</option>
                <option value="感情">感情/婚姻</option>
                <option value="事业">事业/工作</option>
                <option value="财运">财运/投资</option>
                <option value="健康">健康</option>
                <option value="学业">学业</option>
                <option value="姓名">姓名/取名</option>
                <option value="择日">择日/良辰吉日</option>
                <option value="方位">方位/风水</option>
                <option value="综合">综合详批</option>
                <option value="试探">试探（先验盘）</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>客户原话</label>
              <textarea className="input min-h-[80px]" placeholder="记录客户的问题原文..." value={form.clientQuestion} onChange={e => updateForm("clientQuestion", e.target.value)} />
            </div>
          </div>
        </div>

        {/* 提交 */}
        <div className="flex gap-4">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "处理中..." : "创建个案并排盘"}
          </button>
          <Link href="/" className="btn-secondary text-center">取消</Link>
        </div>
      </form>
    </div>
  );
}
