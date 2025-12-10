/**
 * Data Export Utility
 *
 * Exports notes and timesheets to CSV or TXT format.
 * Uses expo-sharing for file sharing functionality.
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { Note, Timesheet } from '@/types/notes';

export type ExportFormat = 'csv' | 'txt';

export interface ExportOptions {
  year: number;
  includeNotes: boolean;
  includeTimesheets: boolean;
  format: ExportFormat;
}

export interface ExportResult {
  success: boolean;
  filesShared: string[];
  error?: string;
}

/**
 * Format time from HHMM to HH:MM
 */
function formatTime(time: string | null | undefined): string {
  if (!time || time.length !== 4) return '';
  return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
}

/**
 * Format date to human-readable format
 * Example: "2025-01-15" -> "15 Jan 2025"
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Escape CSV field value
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV for notes
 */
export function generateNotesCSV(notes: Note[]): string {
  const headers = ['Date', 'Title', 'Content'];
  const rows = notes.map((note) => [
    escapeCSV(formatDate(note.date)),
    escapeCSV(note.title),
    escapeCSV(
      (note.action_required === 1 ? '(Follow-up Required) ' : '') +
      note.content,
    ),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Generate CSV for timesheets
 */
export function generateTimesheetsCSV(timesheets: Timesheet[]): string {
  const headers = [
    'Date',
    'Overtime',
    'Start Time',
    'Finish Time',
    'Total Hours',
    'From Station',
    'To Station',
    'Return KMs',
    'Stayback',
    'Taken Leave',
    'Action Required',
    'Comments',
  ];

  const rows = timesheets.map((ts) => [
    escapeCSV(formatDate(ts.date)),
    escapeCSV(ts.overtime_shift === 1 ? 'RECALL' : ''),
    escapeCSV(formatTime(ts.start_time)),
    escapeCSV(formatTime(ts.finish_time)),
    escapeCSV(ts.total_hours),
    escapeCSV(ts.from_station),
    escapeCSV(ts.to_station),
    escapeCSV(ts.return_kms),
    escapeCSV(formatTime(ts.stayback)),
    escapeCSV(ts.taken_leave),
    escapeCSV(ts.action_required === 1 ? 'Follow-up Required' : ''),
    escapeCSV(ts.comments),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Generate TXT for notes
 */
export function generateNotesTXT(notes: Note[], year: number): string {
  const lines = [`FireCal Notes Export - ${year}`, ''];

  notes.forEach((note, index) => {
    if (index > 0) lines.push('---', '');
    lines.push(`Date: ${formatDate(note.date)}`);
    lines.push(`Title: ${note.title || ''}`);
    lines.push(
      `Content: ${note.action_required === 1 ? '(Follow-up Required) ' : ''
      }${note.content || ''}`,
    );
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Generate TXT for timesheets
 */
export function generateTimesheetsTXT(
  timesheets: Timesheet[],
  year: number,
): string {
  const lines = [`FireCal Timesheets Export - ${year}`, ''];

  timesheets.forEach((ts, index) => {
    if (index > 0) lines.push('---', '');
    lines.push(`Date: ${formatDate(ts.date)}`);
    lines.push(`Start Time: ${formatTime(ts.start_time) || ''}`);
    lines.push(`Finish Time: ${formatTime(ts.finish_time) || ''}`);
    lines.push(`Total Hours: ${ts.total_hours || ''}`);
    lines.push(`From Station: ${ts.from_station || ''}`);
    lines.push(`To Station: ${ts.to_station || ''}`);
    lines.push(`Return KMs: ${ts.return_kms || ''}`);
    if (ts.stayback) {
      lines.push(`Stayback: ${formatTime(ts.stayback)}`);
    }
    if (ts.overtime_shift === 1) {
      lines.push(`Overtime: RECALL`);
    }
    lines.push(`Taken Leave: ${ts.taken_leave || ''}`);
    if (ts.action_required === 1) {
      lines.push(`Action Required: Follow-up Required`);
    }
    lines.push(`Comments: ${ts.comments || ''}`);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Share files using expo-sharing
 */
async function shareFiles(
  files: { name: string; content: string }[],
): Promise<void> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('Cache directory not available');
  }

  // Write files to cache
  const filePaths: string[] = [];
  for (const file of files) {
    const filePath = `${cacheDir}${file.name}`;
    await FileSystem.writeAsStringAsync(filePath, file.content);
    filePaths.push(filePath);
  }

  // Share first file (or all if platform supports)
  if (filePaths.length > 0) {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // Share the first file (most platforms only support single file)
    await Sharing.shareAsync(filePaths[0], {
      mimeType: files[0].name.endsWith('.csv') ? 'text/csv' : 'text/plain',
      dialogTitle: 'Export FireCal Data',
    });
  }
}

/**
 * Main export function
 */
export async function exportData(
  notes: Note[],
  timesheets: Timesheet[],
  options: ExportOptions,
): Promise<ExportResult> {
  try {
    const files: { name: string; content: string }[] = [];
    const { year, includeNotes, includeTimesheets, format } = options;

    // Filter by year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const yearNotes = notes.filter(
      (n) => n.date >= startDate && n.date <= endDate,
    );
    const yearTimesheets = timesheets.filter(
      (t) => t.date >= startDate && t.date <= endDate,
    );

    // Generate files based on format
    if (format === 'csv') {
      if (includeNotes && yearNotes.length > 0) {
        files.push({
          name: `firecal-notes-${year}.csv`,
          content: generateNotesCSV(yearNotes),
        });
      }
      if (includeTimesheets && yearTimesheets.length > 0) {
        files.push({
          name: `firecal-timesheets-${year}.csv`,
          content: generateTimesheetsCSV(yearTimesheets),
        });
      }
    } else {
      // TXT format
      if (includeNotes && yearNotes.length > 0) {
        files.push({
          name: `firecal-notes-${year}.txt`,
          content: generateNotesTXT(yearNotes, year),
        });
      }
      if (includeTimesheets && yearTimesheets.length > 0) {
        files.push({
          name: `firecal-timesheets-${year}.txt`,
          content: generateTimesheetsTXT(yearTimesheets, year),
        });
      }
    }

    if (files.length === 0) {
      return {
        success: false,
        filesShared: [],
        error: 'No data to export',
      };
    }

    await shareFiles(files);

    return {
      success: true,
      filesShared: files.map((f) => f.name),
    };
  } catch (error) {
    console.error('[ExportData] Export failed:', error);
    return {
      success: false,
      filesShared: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
