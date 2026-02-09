import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

export type MemoryItem = {
  id?: number;
  timestamp: number;
  appName: string;
  windowTitle: string;
  textRedacted: string;
  summary: string;
  tagsJson: string;
  entitiesJson: string;
  embeddingJson: string;
  status: string;
  rawText?: string | null;
};

let db: Database.Database | null = null;

export const getDb = () => {
  if (db) return db;
  const dbPath = path.join(app.getPath("userData"), "seelo.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS memory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      app_name TEXT NOT NULL,
      window_title TEXT NOT NULL,
      text_redacted TEXT NOT NULL,
      summary TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      entities_json TEXT NOT NULL,
      embedding_json TEXT NOT NULL,
      status TEXT NOT NULL,
      raw_text TEXT
    );
  `);
  return db;
};

export const insertMemoryItem = (item: MemoryItem) => {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO memory_items
      (timestamp, app_name, window_title, text_redacted, summary, tags_json, entities_json, embedding_json, status, raw_text)
    VALUES
      (@timestamp, @appName, @windowTitle, @textRedacted, @summary, @tagsJson, @entitiesJson, @embeddingJson, @status, @rawText)
  `);
  const info = stmt.run(item);
  return info.lastInsertRowid as number;
};

export const getRecentMemoryItems = (sinceTimestamp: number) => {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT * FROM memory_items
    WHERE timestamp >= ?
    ORDER BY timestamp DESC
  `);
  return stmt.all(sinceTimestamp);
};

export const purgeOldMemoryItems = (olderThanTimestamp: number) => {
  const database = getDb();
  const stmt = database.prepare(`
    DELETE FROM memory_items
    WHERE timestamp < ?
  `);
  stmt.run(olderThanTimestamp);
};
