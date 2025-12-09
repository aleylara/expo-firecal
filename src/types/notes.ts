/**
 * Type definitions for notes and timesheets
 */

// Note types
export interface Note {
  id: string;
  date: string;
  title: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title?: string | null;
  content?: string | null;
}

export interface UpdateNoteInput {
  title?: string | null;
  content?: string | null;
}

// Timesheet types
export interface Timesheet {
  id: string;
  date: string;
  overtime_shift: number; // 0 or 1
  total_hours: number | null;
  taken_leave: string | null;
  from_station: string | null;
  to_station: string | null;
  return_kms: number | null;
  start_time: string | null;
  finish_time: string | null;
  comments: string | null;
  action_required: number; // 0 or 1
  stayback: string | null; // HHMM format
  created_at: string;
  updated_at: string;
}

export interface CreateTimesheetInput {
  overtime_shift?: boolean;
  total_hours?: number | null;
  taken_leave?: string | null;
  from_station?: string | null;
  to_station?: string | null;
  return_kms?: number | null;
  start_time?: string | null;
  finish_time?: string | null;
  comments?: string | null;
  action_required?: boolean;
  stayback?: string | null;
}

export interface UpdateTimesheetInput {
  overtime_shift?: boolean;
  total_hours?: number | null;
  taken_leave?: string | null;
  from_station?: string | null;
  to_station?: string | null;
  return_kms?: number | null;
  start_time?: string | null;
  finish_time?: string | null;
  comments?: string | null;
  action_required?: boolean;
  stayback?: string | null;
}

// Combined types
export interface DayData {
  note: Note | null;
  timesheet: Timesheet | null;
}

export interface DayIndicators {
  hasNote: boolean;
  hasTimesheet: boolean;
}
