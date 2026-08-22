import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'node:path'

export interface StoryRow {
  id: string
  title: string
  cover_path: string | null
  cover_source: string | null
  created_at: string
  updated_at: string
  last_good_draft_id: string | null
}

export interface DraftRow {
  id: string
  story_id: string
  file_path: string
  session_started_at: string
  updated_at: string
  has_content: number
}

export interface VersionRow {
  id: string
  story_id: string
  file_path: string
  created_at: string
}

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'bileog.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      cover_path TEXT,
      cover_source TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_good_draft_id TEXT
    );

    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL REFERENCES stories(id),
      file_path TEXT NOT NULL,
      session_started_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      has_content INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL REFERENCES stories(id),
      file_path TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_drafts_story_id ON drafts(story_id);
    CREATE INDEX IF NOT EXISTS idx_versions_story_id ON versions(story_id);
  `)

  const storyColumns = db.prepare('PRAGMA table_info(stories)').all() as Array<{ name: string }>
  if (!storyColumns.some((column) => column.name === 'cover_source')) {
    db.exec('ALTER TABLE stories ADD COLUMN cover_source TEXT')
  }

  return db
}
