// 数据库 Schema（SQLite + better-sqlite3）
// 后续可迁移到 PostgreSQL + pgvector

export const CREATE_TABLES_SQL = `
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 个案表
CREATE TABLE IF NOT EXISTS cases (
  user_id TEXT,
  id TEXT PRIMARY KEY,
  alias TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'unknown' CHECK(gender IN ('male', 'female', 'unknown')),
  birth_solar TEXT NOT NULL,
  birth_lunar TEXT,
  birth_place TEXT,
  birth_longitude REAL,
  birth_latitude REAL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  true_solar_time_enabled INTEGER NOT NULL DEFAULT 0,
  question_type TEXT,
  client_original_question TEXT,
  hour_known INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN (
    'draft', 'charted', 'verified', 'needs_review',
    'prevalidated', 'delivered', 'archived'
  )),
  chart_data TEXT,          -- JSON: 八字排盘结果
  ziwei_data TEXT,          -- JSON: 紫微排盘结果
  internal_analysis TEXT,   -- 内部分析
  your_judgment TEXT,       -- 最终判断
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 排盘记录表（三盘校验用）
CREATE TABLE IF NOT EXISTS charts (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK(source IN ('system', 'ai', 'image', 'manual')),
  pillars TEXT NOT NULL,    -- JSON: 四柱数据
  full_data TEXT NOT NULL,  -- JSON: 完整排盘结果
  confidence REAL,          -- 置信度 (0-1)
  uncertainties TEXT,       -- JSON: 不确定字段列表
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 生成产物表（话术、报告等）
CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN (
    'chart_verification', 'internal_analysis', 'prevalidation',
    'wechat_reply', 'long_report', 'followup_questions', 'style_revision'
  )),
  model TEXT NOT NULL,
  prompt_version TEXT,
  content TEXT NOT NULL,
  your_edited_content TEXT,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  tags TEXT,                -- JSON: 标签数组
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 客户反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  artifact_id TEXT REFERENCES artifacts(id),
  statement TEXT NOT NULL,
  feedback TEXT NOT NULL CHECK(feedback IN ('hit', 'partial', 'miss', 'unknown')),
  client_text TEXT,
  your_note TEXT,
  should_reuse INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 风格指南表
CREATE TABLE IF NOT EXISTS style_guides (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  guide_content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  based_on_revisions INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 好句/禁句库
CREATE TABLE IF NOT EXISTS style_sentences (
  id TEXT PRIMARY KEY,
  sentence TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('good', 'bad')),
  source TEXT,              -- 来源个案 ID
  tags TEXT,                -- JSON: 标签
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Prompt 版本表
CREATE TABLE IF NOT EXISTS prompt_versions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  variables TEXT,           -- JSON: 模板变量列表
  tags TEXT,                -- JSON: 标签
  avg_rating REAL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  hit_rate REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_charts_case ON charts(case_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_case ON artifacts(case_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_feedbacks_case ON feedbacks(case_id);
`;
