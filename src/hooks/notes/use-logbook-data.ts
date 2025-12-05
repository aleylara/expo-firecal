/**
 * Hook for fetching logbook data by year
 *
 * Provides notes and timesheets for a selected year
 */

import { useDatabase } from '@/contexts/notes/database-context';
import type { Note, Timesheet } from '@/types/notes';
import { AppError, ErrorMessages, toAppError } from '@/utils/error-handling';
import { exportData, type ExportFormat } from '@/utils/export-data';
import { useCallback, useEffect, useState } from 'react';

interface LogbookData {
  notes: Note[];
  timesheets: Timesheet[];
  availableYears: number[];
}

export function useLogbookData(year: number) {
  const db = useDatabase();
  const [data, setData] = useState<LogbookData>({
    notes: [],
    timesheets: [],
    availableYears: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch data for selected year only (optimized)
      const [yearData, availableYears] = await Promise.all([
        db.getLogbookSummaryByYear(year),
        db.getAvailableYears(),
      ]);

      setData({
        notes: yearData.notes,
        timesheets: yearData.timesheets,
        availableYears,
      });
    } catch (err) {
      setError(toAppError(err, ErrorMessages.NOTE_LOAD_FAILED, 'toast'));
    } finally {
      setIsLoading(false);
    }
  }, [year, db]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteNotesByYear = useCallback(
    async (targetYear: number) => {
      try {
        const count = await db.deleteNotesByYear(targetYear);
        await loadData();
        return count;
      } catch (err) {
        throw toAppError(err, 'Failed to delete notes', 'toast');
      }
    },
    [db, loadData],
  );

  const deleteTimesheetsByYear = useCallback(
    async (targetYear: number) => {
      try {
        const count = await db.deleteTimesheetsByYear(targetYear);
        await loadData();
        return count;
      } catch (err) {
        throw toAppError(err, 'Failed to delete timesheets', 'toast');
      }
    },
    [db, loadData],
  );

  const exportLogbookData = useCallback(
    async (
      includeNotes: boolean,
      includeTimesheets: boolean,
      format: ExportFormat,
    ) => {
      try {
        const allData = await db.getAllData();
        return await exportData(allData.notes, allData.timesheets, {
          year,
          includeNotes,
          includeTimesheets,
          format,
        });
      } catch (err) {
        throw toAppError(err, 'Failed to export data', 'toast');
      }
    },
    [db, year],
  );

  return {
    notes: data.notes,
    timesheets: data.timesheets,
    availableYears: data.availableYears,
    isLoading,
    error,
    refresh: loadData,
    deleteNotesByYear,
    deleteTimesheetsByYear,
    exportLogbookData,
  };
}
