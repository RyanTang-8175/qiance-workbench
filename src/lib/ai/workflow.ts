// 全流程自动化：排盘 → 校验 → 分析 → 断前事 → 话术
import { analyzeChart } from "./skills/chart-analyzer";
import { predictPrevalidation } from "./skills/predictor";
import { generateSpeech } from "./skills/speech-writer";

export type WorkflowStep = "chart" | "verify" | "analyze" | "predict" | "speech";

export interface WorkflowProgress {
  step: WorkflowStep;
  status: "running" | "done" | "error";
  message?: string;
  data?: unknown;
}

const STEP_ORDER: WorkflowStep[] = ["analyze", "predict", "speech"];
const STEP_LABELS: Record<WorkflowStep, string> = {
  chart: "排盘",
  verify: "校验",
  analyze: "结构化分析",
  predict: "断前事",
  speech: "话术生成",
};

export async function runWorkflow(
  chartData: object,
  questionType: string,
  styleGuide: string,
  onProgress: (progress: WorkflowProgress) => void
) {
  const results: Record<string, unknown> = {};
  let analysisRaw = "";

  for (const step of STEP_ORDER) {
    onProgress({ step, status: "running", message: `正在${STEP_LABELS[step]}...` });

    try {
      switch (step) {
        case "analyze": {
          const analysis = await analyzeChart(chartData, (chunk) => {
            onProgress({ step: "analyze", status: "running", message: chunk });
          });
          analysisRaw = analysis.raw;
          results.analyze = analysis;
          onProgress({ step: "analyze", status: "done", data: analysis });
          break;
        }
        case "predict": {
          const prediction = await predictPrevalidation(chartData, (chunk) => {
            onProgress({ step: "predict", status: "running", message: chunk });
          });
          results.predict = prediction;
          onProgress({ step: "predict", status: "done", data: prediction });
          break;
        }
        case "speech": {
          if (!analysisRaw) {
            onProgress({ step: "speech", status: "error", message: "无分析内容，跳过话术生成" });
            break;
          }
          const speech = await generateSpeech(analysisRaw, styleGuide, questionType, (chunk) => {
            onProgress({ step: "speech", status: "running", message: chunk });
          });
          results.speech = speech;
          onProgress({ step: "speech", status: "done", data: speech });
          break;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      onProgress({ step, status: "error", message: msg });
    }
  }

  return results;
}
