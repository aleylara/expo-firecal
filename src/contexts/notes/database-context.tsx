/**
 * Database Context
 *
 * Central repository for all offline-first data operations.
 * Wraps expo-sqlite to provide async CRUD methods for Notes and Timesheets.
 * Memoized to ensure stable references for consuming components.
 */
import { initializeDatabase } from '@/utils/database';
import { getCurrentTimestamp } from '@/constants/timezone';
import type {
  CreateNoteInput,
  CreateTimesheetInput,
  DayData,
  DayIndicators,
  Note,
  Timesheet,
  UpdateNoteInput,
  UpdateTimesheetInput,
} from '@/types/notes';
import { useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useContext, useMemo } from 'react';

// Simple UUID generator (no need for crypto library)
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to build dynamic UPDATE queries
type SQLiteBindValue = string | number | boolean | null | Uint8Array;

function buildUpdateQuery(
  table: string,
  id: string,
  fields: Record<string, SQLiteBindValue | undefined>,
): { sql: string; values: SQLiteBindValue[] } {
  const updates: string[] = [];
  const values: SQLiteBindValue[] = [];

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  });

  updates.push('updated_at = ?');
  values.push(getCurrentTimestamp());
  values.push(id);

  return {
    sql: `UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`,
    values,
  };
}

export type { DayIndicators };

interface DatabaseContextType {
  // Note operations
  getNote: (date: string) => Promise<Note | null>;
  getNoteById: (id: string) => Promise<Note | null>;
  createNote: (date: string, data: CreateNoteInput) => Promise<string>;
  updateNote: (id: string, data: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNotesCount: () => Promise<number>;

  // Timesheet operations
  getTimesheet: (date: string) => Promise<Timesheet | null>;
  getTimesheetById: (id: string) => Promise<Timesheet | null>;
  createTimesheet: (
    date: string,
    data: CreateTimesheetInput,
  ) => Promise<string>;
  updateTimesheet: (id: string, data: UpdateTimesheetInput) => Promise<void>;
  deleteTimesheet: (id: string) => Promise<void>;
  getTimesheetsCount: () => Promise<number>;

  // Combined operations
  getDayData: (date: string) => Promise<DayData>;
  getDayIndicators: (date: string) => Promise<DayIndicators>;
  getMonthIndicators: (
    year: number,
    month: number,
  ) => Promise<Map<string, DayIndicators>>;
  getYearIndicators: (year: number) => Promise<Map<string, DayIndicators>>;

  // Data export
  getAllData: () => Promise<{ notes: Note[]; timesheets: Timesheet[] }>;
  getDataByYear: (
    year: number,
  ) => Promise<{ notes: Note[]; timesheets: Timesheet[] }>;
  getLogbookSummaryByYear: (
    year: number,
  ) => Promise<{ notes: Note[]; timesheets: Timesheet[] }>;
  getAvailableYears: () => Promise<number[]>;

  // Bulk operations
  deleteNotesByYear: (year: number) => Promise<number>;
  deleteTimesheetsByYear: (year: number) => Promise<number>;
  resetDatabase: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();

  const value = useMemo(() => {
    // ===== NOTE OPERATIONS =====

    // Get note for specific date
    const getNote = async (date: string): Promise<Note | null> => {
      const result = await db.getFirstAsync<Note>(
        'SELECT * FROM notes WHERE date = ?',
        [date],
      );
      return result || null;
    };

    // Get note by UUID
    const getNoteById = async (id: string): Promise<Note | null> => {
      const result = await db.getFirstAsync<Note>(
        'SELECT * FROM notes WHERE id = ?',
        [id],
      );
      return result || null;
    };

    // Create new note
    const createNote = async (
      date: string,
      data: CreateNoteInput,
    ): Promise<string> => {
      const id = generateId();
      const now = getCurrentTimestamp();

      const actionRequiredValue = data.action_required ? 1 : 0;

      await db.runAsync(
        `INSERT INTO notes (
          id, date, title, content, action_required,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, date, data.title || null, data.content || null, actionRequiredValue, now, now],
      );

      // Verify the insert
      // const inserted = await db.getFirstAsync<Note>('SELECT * FROM notes WHERE id = ?', [id]);

      return id;
    };

    // Update note
    const updateNote = async (
      id: string,
      data: UpdateNoteInput,
    ): Promise<void> => {
      const dbData = {
        ...data,
        action_required: data.action_required !== undefined ? (data.action_required ? 1 : 0) : undefined,
      };
      const { sql, values } = buildUpdateQuery(
        'notes',
        id,
        dbData as Record<string, SQLiteBindValue | undefined>,
      );
      await db.runAsync(sql, values);
    };

    // Hard delete note
    const deleteNote = async (id: string): Promise<void> => {
      await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    };

    // Get total notes count
    const getNotesCount = async (): Promise<number> => {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM notes',
      );
      return result?.count || 0;
    };

    // ===== TIMESHEET OPERATIONS =====

    // Get timesheet for specific date
    const getTimesheet = async (date: string): Promise<Timesheet | null> => {
      const result = await db.getFirstAsync<Timesheet>(
        'SELECT * FROM timesheets WHERE date = ?',
        [date],
      );
      return result || null;
    };

    // Get timesheet by UUID
    const getTimesheetById = async (id: string): Promise<Timesheet | null> => {
      const result = await db.getFirstAsync<Timesheet>(
        'SELECT * FROM timesheets WHERE id = ?',
        [id],
      );
      return result || null;
    };

    // Create new timesheet
    const createTimesheet = async (
      date: string,
      data: CreateTimesheetInput,
    ): Promise<string> => {
      const id = generateId();
      const now = getCurrentTimestamp();

      await db.runAsync(
        `INSERT INTO timesheets (
          id, date, overtime_shift, total_hours, taken_leave,
          from_station, to_station, return_kms,
          start_time, finish_time, comments, action_required,
          stayback,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          date,
          data.overtime_shift ? 1 : 0,
          data.total_hours || null,
          data.taken_leave || null,
          data.from_station || null,
          data.to_station || null,
          data.return_kms || null,
          data.start_time || null,
          data.finish_time || null,
          data.comments || null,
          data.action_required ? 1 : 0,
          data.stayback || null,
          now,
          now,
        ],
      );

      return id;
    };

    // Update timesheet
    const updateTimesheet = async (
      id: string,
      data: UpdateTimesheetInput,
    ): Promise<void> => {
      const fields = {
        overtime_shift:
          data.overtime_shift !== undefined
            ? data.overtime_shift
              ? 1
              : 0
            : undefined,
        total_hours: data.total_hours,
        taken_leave: data.taken_leave,
        from_station: data.from_station,
        to_station: data.to_station,
        return_kms: data.return_kms,
        start_time: data.start_time,
        finish_time: data.finish_time,
        comments: data.comments,
        action_required:
          data.action_required !== undefined
            ? data.action_required
              ? 1
              : 0
            : undefined,
        stayback: data.stayback,
      };

      const { sql, values } = buildUpdateQuery(
        'timesheets',
        id,
        fields as Record<string, SQLiteBindValue | undefined>,
      );
      await db.runAsync(sql, values);
    };

    // Hard delete timesheet
    const deleteTimesheet = async (id: string): Promise<void> => {
      await db.runAsync('DELETE FROM timesheets WHERE id = ?', [id]);
    };

    // Get total timesheets count
    const getTimesheetsCount = async (): Promise<number> => {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM timesheets',
      );
      return result?.count || 0;
    };

    // ===== COMBINED OPERATIONS =====

    // Get both note and timesheet for a date
    const getDayData = async (date: string): Promise<DayData> => {
      const note = await getNote(date);
      const timesheet = await getTimesheet(date);
      return { note, timesheet };
    };

    // Get indicators for date range (optimized with single query)
    const getIndicatorsForDateRange = async (
      startDate: string,
      endDate: string,
    ): Promise<Map<string, DayIndicators>> => {
      const results = await db.getAllAsync<{
        date: string;
        has_note: number;
        has_timesheet: number;
      }>(
        `SELECT 
          date,
          MAX(has_note) as has_note,
          MAX(has_timesheet) as has_timesheet
        FROM (
          SELECT 
            date, 
            CASE WHEN content IS NOT NULL AND LENGTH(TRIM(content)) > 0 THEN 1 ELSE 0 END as has_note, 
            0 as has_timesheet 
          FROM notes
          WHERE date >= ? AND date <= ?
          
          UNION ALL
          
          SELECT 
            date, 
            0 as has_note, 
            1 as has_timesheet 
          FROM timesheets
          WHERE date >= ? AND date <= ?
        )
        GROUP BY date`,
        [startDate, endDate, startDate, endDate],
      );


      const indicators = new Map<string, DayIndicators>();
      results.forEach(({ date, has_note, has_timesheet }) => {
        indicators.set(date, {
          hasNote: has_note === 1,
          hasTimesheet: has_timesheet === 1,
        });
      });

      return indicators;
    };

    // Get day indicators
    const getDayIndicators = async (date: string): Promise<DayIndicators> => {
      const indicators = await getIndicatorsForDateRange(date, date);
      return indicators.get(date) || { hasNote: false, hasTimesheet: false };
    };

    // Get month indicators
    const getMonthIndicators = async (
      year: number,
      month: number,
    ): Promise<Map<string, DayIndicators>> => {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return getIndicatorsForDateRange(startDate, endDate);
    };

    // Get year indicators
    const getYearIndicators = async (
      year: number,
    ): Promise<Map<string, DayIndicators>> => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      return getIndicatorsForDateRange(startDate, endDate);
    };

    // ===== DATA EXPORT =====

    // Get data by year (optimized for logbook)
    const getDataByYear = async (
      year: number,
    ): Promise<{ notes: Note[]; timesheets: Timesheet[] }> => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const notes = await db.getAllAsync<Note>(
        'SELECT * FROM notes WHERE date >= ? AND date <= ? ORDER BY date DESC',
        [startDate, endDate],
      );

      const timesheets = await db.getAllAsync<Timesheet>(
        'SELECT * FROM timesheets WHERE date >= ? AND date <= ? ORDER BY date DESC',
        [startDate, endDate],
      );

      return { notes, timesheets };
    };

    // Get logbook summary by year (optimized for list view)
    const getLogbookSummaryByYear = async (
      year: number,
    ): Promise<{ notes: Note[]; timesheets: Timesheet[] }> => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      // Only select first 150 chars of content
      const notes = await db.getAllAsync<Note>(
        `SELECT id, date, title, SUBSTR(content, 1, 150) as content, action_required, created_at, updated_at 
         FROM notes WHERE date >= ? AND date <= ? ORDER BY date DESC`,
        [startDate, endDate],
      );

      const timesheets = await db.getAllAsync<Timesheet>(
        'SELECT * FROM timesheets WHERE date >= ? AND date <= ? ORDER BY date DESC',
        [startDate, endDate],
      );

      return { notes, timesheets };
    };

    // Get all data (for export)
    const getAllData = async (): Promise<{
      notes: Note[];
      timesheets: Timesheet[];
    }> => {
      const notes = await db.getAllAsync<Note>(
        'SELECT * FROM notes ORDER BY date DESC',
      );

      const timesheets = await db.getAllAsync<Timesheet>(
        'SELECT * FROM timesheets ORDER BY date DESC',
      );

      return { notes, timesheets };
    };

    // Get available years (for logbook year picker)
    const getAvailableYears = async (): Promise<number[]> => {
      const results = await db.getAllAsync<{ year: number }>(
        `SELECT DISTINCT CAST(SUBSTR(date, 1, 4) AS INTEGER) as year
         FROM (
           SELECT date FROM notes
           UNION
           SELECT date FROM timesheets
         )
         ORDER BY year DESC`,
      );

      return results.map((r) => r.year);
    };

    // Bulk delete by year
    const deleteNotesByYear = async (year: number): Promise<number> => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const result = await db.runAsync(
        'DELETE FROM notes WHERE date >= ? AND date <= ?',
        [startDate, endDate],
      );

      return result.changes;
    };

    const deleteTimesheetsByYear = async (year: number): Promise<number> => {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const result = await db.runAsync(
        'DELETE FROM timesheets WHERE date >= ? AND date <= ?',
        [startDate, endDate],
      );

      return result.changes;
    };

    // Reset database
    const resetDatabase = async (): Promise<void> => {
      await db.execAsync(
        'DROP TABLE IF EXISTS notes; DROP TABLE IF EXISTS timesheets;',
      );
      await initializeDatabase(db);
    };

    return {
      getNote,
      getNoteById,
      createNote,
      updateNote,
      deleteNote,
      getNotesCount,
      getTimesheet,
      getTimesheetById,
      createTimesheet,
      updateTimesheet,
      deleteTimesheet,
      getTimesheetsCount,
      getDayData,
      getDayIndicators,
      getMonthIndicators,
      getYearIndicators,
      getAllData,
      getDataByYear,
      getLogbookSummaryByYear,
      getAvailableYears,
      deleteNotesByYear,
      deleteTimesheetsByYear,
      resetDatabase,
    };
  }, [db]);

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
}
