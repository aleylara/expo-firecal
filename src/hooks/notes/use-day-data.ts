/**
 * Hook for managing daily data (notes + timesheet)
 *
 * Provides:
 * - note: The note for the selected date
 * - timesheet: The timesheet for the selected date
 * - saveNote: Create or update note
 * - saveTimesheet: Create or update timesheet
 * - deleteNote: Soft delete note
 * - deleteTimesheet: Soft delete timesheet
 * - Loading and error states
 * - Auto-refresh when date changes
 */
import { useDatabase } from '@/contexts/notes/database-context';
import { useSubscription } from '@/contexts/subscription/subscription-context';
import type {
  CreateNoteInput,
  CreateTimesheetInput,
  Note,
  Timesheet,
  UpdateNoteInput,
  UpdateTimesheetInput,
} from '@/types/notes';
import { AppError, ErrorMessages, toAppError } from '@/utils/error-handling';
import { useCallback, useEffect, useState } from 'react';

const FREE_LIMIT = 10;

interface UseDayDataReturn {
  note: Note | null;
  timesheet: Timesheet | null;
  isLoading: boolean;
  error: AppError | null;

  // Note operations
  saveNote: (data: CreateNoteInput | UpdateNoteInput) => Promise<void>;
  deleteNote: () => Promise<void>;

  // Timesheet operations
  saveTimesheet: (
    data: CreateTimesheetInput | UpdateTimesheetInput,
  ) => Promise<void>;
  deleteTimesheet: () => Promise<void>;

  // Refresh data
  refresh: () => Promise<void>;
}

/**
 * Hook to manage daily data for a specific day (note + timesheet)
 * Notes and timesheets are now separate and can be managed independently
 */
export function useDayData(date: string | null): UseDayDataReturn {
  const db = useDatabase();
  const { hasFireCalPro, presentPaywall } = useSubscription();

  const [note, setNote] = useState<Note | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  // Load data for the selected date
  const loadData = useCallback(async () => {
    if (!date) {
      setNote(null);
      setTimesheet(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dayData = await db.getDayData(date);
      setNote(dayData.note);
      setTimesheet(dayData.timesheet);
    } catch (err) {
      setError(toAppError(err, ErrorMessages.NOTE_LOAD_FAILED, 'silent'));
      console.error('Error loading day data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [date, db]);

  // Load data when date changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create or update note
  const saveNote = useCallback(
    async (data: CreateNoteInput | UpdateNoteInput) => {
      if (!date) return;

      try {
        if (note) {
          await db.updateNote(note.id, data);
        } else {
          // Check limit for new notes
          if (!hasFireCalPro) {
            const count = await db.getNotesCount();
            if (count >= FREE_LIMIT) {
              presentPaywall();
              throw new Error('Free limit reached');
            }
          }
          await db.createNote(date, data);
        }
        await loadData();
      } catch (err) {
        setError(toAppError(err, ErrorMessages.NOTE_SAVE_FAILED, 'toast'));
        throw err;
      }
    },
    [date, note, db, loadData, hasFireCalPro, presentPaywall],
  );

  // Create or update timesheet
  const saveTimesheet = useCallback(
    async (data: CreateTimesheetInput | UpdateTimesheetInput) => {
      if (!date) return;

      try {
        if (timesheet) {
          await db.updateTimesheet(timesheet.id, data);
        } else {
          // Check limit for new timesheets
          if (!hasFireCalPro) {
            const count = await db.getTimesheetsCount();
            if (count >= FREE_LIMIT) {
              presentPaywall();
              throw new Error('Free limit reached');
            }
          }
          await db.createTimesheet(date, data);
        }
        await loadData();
      } catch (err) {
        setError(toAppError(err, ErrorMessages.NOTE_SAVE_FAILED, 'toast'));
        throw err;
      }
    },
    [date, timesheet, db, loadData, hasFireCalPro, presentPaywall],
  );

  // Delete note
  const deleteNoteCallback = useCallback(async () => {
    if (!note) return;

    try {
      await db.deleteNote(note.id);
      await loadData();
    } catch (err) {
      setError(toAppError(err, ErrorMessages.NOTE_DELETE_FAILED, 'toast'));
      throw err;
    }
  }, [note, db, loadData]);

  // Delete timesheet
  const deleteTimesheetCallback = useCallback(async () => {
    if (!timesheet) return;

    try {
      await db.deleteTimesheet(timesheet.id);
      await loadData();
    } catch (err) {
      setError(toAppError(err, ErrorMessages.NOTE_DELETE_FAILED, 'toast'));
      throw err;
    }
  }, [timesheet, db, loadData]);

  return {
    note,
    timesheet,
    isLoading,
    error,
    saveNote,
    saveTimesheet,
    deleteNote: deleteNoteCallback,
    deleteTimesheet: deleteTimesheetCallback,
    refresh: loadData,
  };
}
