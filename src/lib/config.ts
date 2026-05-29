// 运行时配置（支持通过设置页动态更新）
import fs from "fs";
import path from "path";

interface RuntimeConfig {
  claudeApiKey: string;
  deepseekApiKey: string;
  aiProvider: "auto" | "claude" | "deepseek";
  defaultGender: "male" | "female";
  defaultTrueSolarTime: boolean;
}

const ENV_PATH = path.join(process.cwd(), ".env.local");

function loadEnvFile(): Record<string, string> {
  try {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    const env: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      env[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
    }
    return env;
  } catch {
    return {};
  }
}

// 运行时配置单例
let runtimeConfig: RuntimeConfig | null = null;

export function getConfig(): RuntimeConfig {
  if (runtimeConfig) return runtimeConfig;

  const env = loadEnvFile();
  runtimeConfig = {
    claudeApiKey: env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY || "",
    deepseekApiKey: env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || "",
    aiProvider: (env.AI_PROVIDER || process.env.AI_PROVIDER || "auto") as RuntimeConfig["aiProvider"],
    defaultGender: (env.DEFAULT_GENDER || process.env.DEFAULT_GENDER || "male") as "male" | "female",
    defaultTrueSolarTime: (env.DEFAULT_TRUE_SOLAR_TIME || process.env.DEFAULT_TRUE_SOLAR_TIME || "false") === "true",
  };
  return runtimeConfig;
}

export function updateConfig(updates: Partial<RuntimeConfig>): RuntimeConfig {
  const config = getConfig();
  Object.assign(config, updates);
  runtimeConfig = config;

  // 同步写入 .env.local
  try {
    let content = "";
    try {
      content = fs.readFileSync(ENV_PATH, "utf-8");
    } catch {
      // 文件不存在，创建新的
    }

    const lines = content.split("\n");
    const keys: Record<string, string> = {
      CLAUDE_API_KEY: config.claudeApiKey,
      DEEPSEEK_API_KEY: config.deepseekApiKey,
      AI_PROVIDER: config.aiProvider,
      DEFAULT_GENDER: config.defaultGender,
      DEFAULT_TRUE_SOLAR_TIME: String(config.defaultTrueSolarTime),
    };

    for (const [key, value] of Object.entries(keys)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
      } else {
        content += `\n${key}=${value}`;
      }
    }

    fs.writeFileSync(ENV_PATH, content.trim() + "\n", "utf-8");
  } catch (e) {
    console.error("写入 .env.local 失败:", e);
  }

  return config;
}
