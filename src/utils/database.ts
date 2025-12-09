/**
 * Database initialization and schema management
 *
 * Creates separate notes and timesheets tables:
 * - notes: title, content
 * - timesheets: hours, stations, kms, times, overtime, leave, more_info
 * - Both have metadata (created_at, updated_at, synced_at)
 *
 * Uses WAL mode for better concurrency
 */
import * as SQLite from 'expo-sqlite';

export async function initializeDatabase(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    
    -- Create notes table
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      title TEXT,
      content TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(date);
    
    -- Create timesheets table
    CREATE TABLE IF NOT EXISTS timesheets (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      overtime_shift INTEGER DEFAULT 0,
      total_hours REAL,
      taken_leave TEXT,
      from_station TEXT,
      to_station TEXT,
      return_kms REAL,
      start_time TEXT,
      finish_time TEXT,
      comments TEXT,
      action_required INTEGER DEFAULT 0,
      stayback TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_timesheets_date ON timesheets(date);
  `);
}
