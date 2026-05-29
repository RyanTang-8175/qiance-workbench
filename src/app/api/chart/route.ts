// 排盘 API
import { NextRequest, NextResponse } from "next/server";
import { generateChart } from "@/lib/bazi/chart";
import { generateZiWeiChart } from "@/lib/ziwei/chart";
import { calculateTrueSolarTime } from "@/lib/bazi/true-solar-time";
import { LOCATION_DB } from "@/lib/bazi/locations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      year, month, day, hour, minute,
      gender, birthPlace, useTrueSolarTime, school,
    } = body;

    // 参数校验
    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 类型和范围校验
    const y = Math.floor(Number(year));
    const m = Math.floor(Number(month));
    const d = Math.floor(Number(day));
    const h = Math.floor(Number(hour));
    const mi = Math.floor(Number(minute ?? 0));

    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31 || h < 0 || h > 23 || mi < 0 || mi > 59) {
      return NextResponse.json({ error: "日期时间参数超出范围" }, { status: 400 });
    }

    if (gender !== "male" && gender !== "female") {
      return NextResponse.json({ error: "性别参数无效" }, { status: 400 });
    }

    let finalHour = h;
    let finalMinute = mi;
    let trueSolarTimeResult = null;

    // 真太阳时校正
    if (useTrueSolarTime && birthPlace) {
      const coords = LOCATION_DB[birthPlace];
      if (coords) {
        trueSolarTimeResult = calculateTrueSolarTime(
          y, m, d, h, mi, coords.lng
        );
        finalHour = trueSolarTimeResult.correctedTime.getHours();
        finalMinute = trueSolarTimeResult.correctedTime.getMinutes();
      }
    }

    // 八字排盘
    const baziChart = generateChart(
      y, m, d, finalHour, finalMinute,
      gender, birthPlace, useTrueSolarTime
    );

    // 紫微排盘
    let ziweiChart = null;
    try {
      ziweiChart = generateZiWeiChart(
        y, m, d, gender, false, school ?? "sanhe"
      );
    } catch (e) {
      console.error("紫微排盘失败:", e);
    }

    return NextResponse.json({
      bazi: baziChart,
      ziwei: ziweiChart,
      trueSolarTime: trueSolarTimeResult,
    });
  } catch (error) {
    console.error("排盘错误:", error);
    return NextResponse.json({ error: "排盘计算失败" }, { status: 500 });
  }
}
