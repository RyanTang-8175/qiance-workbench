// 数据库连接（SQLite + better-sqlite3）
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { CREATE_TABLES_SQL } from "./schema";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "qiance.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // 确保 data 目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // 初始化表
  db.exec(CREATE_TABLES_SQL);

  return db;
}

// ID 生成（加密安全）
export function generateId(): string {
  return crypto.randomUUID();
}
