// 紫微斗数排盘引擎（基于 iztro）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { astro } from "iztro";

export type ZiWeiSchool = "sanhe" | "feixing";

export interface ZiWeiChartResult {
  solarDate: string;
  lunarDate: string;
  gender: "male" | "female";
  school: ZiWeiSchool;
  palaces: Array<{
    name: string;
    position: number;
    mainStars: string[];
    minorStars: string[];
    mutagens: string[];
    isBodyPalace: boolean;
  }>;
  fourMutagens: { lu: string; quan: string; ke: string; ji: string };
  majorLimits: Array<{
    startAge: number;
    endAge: number;
    palace: string;
    mainStars: string[];
    isCurrent: boolean;
  }>;
  source: "iztro";
  calculatedAt: string;
}

export function generateZiWeiChart(
  year: number,
  month: number,
  day: number,
  gender: "male" | "female",
  _isLunar: boolean = false,
  school: ZiWeiSchool = "sanhe"
): ZiWeiChartResult {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const genderNum = gender === "male" ? 1 : 2;
  const genderStr = gender === "male" ? "男" : "女";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const astrolabe = astro.bySolar(dateStr as any, genderNum, genderStr as any, true, "zh-CN" as any);

  const palaceNames = [
    "命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫",
    "迁移宫", "交友宫", "事业宫", "田宅宫", "福德宫", "父母宫",
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const palaces = palaceNames.map((name, position) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const palace = (astrolabe as any).palace(name);
      const mainStars = palace?.mainStars?.map((s: { name: string }) => s.name) ?? [];
      const minorStars = palace?.minorStars?.map((s: { name: string }) => s.name) ?? [];
      const mutagens = palace?.mutagens?.map((m: { name: string }) => m.name) ?? [];

      return {
        name,
        position,
        mainStars,
        minorStars,
        mutagens,
        isBodyPalace: palace?.isBodyPalace ?? false,
      };
    } catch {
      return { name, position, mainStars: [], minorStars: [], mutagens: [], isBodyPalace: false };
    }
  });

  const fourMutagens = { lu: "", quan: "", ke: "", ji: "" };
  for (const palace of palaces) {
    for (const mutagen of palace.mutagens) {
      if (mutagen === "禄" && palace.mainStars[0]) fourMutagens.lu = palace.mainStars[0];
      if (mutagen === "权" && palace.mainStars[0]) fourMutagens.quan = palace.mainStars[0];
      if (mutagen === "科" && palace.mainStars[0]) fourMutagens.ke = palace.mainStars[0];
      if (mutagen === "忌" && palace.mainStars[0]) fourMutagens.ji = palace.mainStars[0];
    }
  }

  const majorLimits = Array.from({ length: 10 }, (_, i) => ({
    startAge: i * 10 + 1,
    endAge: (i + 1) * 10,
    palace: palaceNames[i % 12],
    mainStars: [] as string[],
    isCurrent: false,
  }));

  return {
    solarDate: dateStr,
    lunarDate: "",
    gender,
    school,
    palaces,
    fourMutagens,
    majorLimits,
    source: "iztro",
    calculatedAt: new Date().toISOString(),
  };
}
