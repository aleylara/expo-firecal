/**
 * Hooks for fetching calendar indicators (note/timesheet presence)
 *
 * Provides:
 * - useDayIndicators: Get indicators for a single date
 * - useMonthIndicators: Batch fetch indicators for a month
 * - useYearIndicators: Batch fetch indicators for a year
 *
 * Used by calendar to show 📝 (note), ⏱️ (timesheet) icons
 */
import { useDatabase } from '@/contexts/notes/database-context';
import type { DayIndicators } from '@/types/notes';
import { useEffect, useState } from 'react';

export function useDayIndicators(date: string | null) {
  const [indicators, setIndicators] = useState<DayIndicators>({
    hasNote: false,
    hasTimesheet: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getDayIndicators } = useDatabase();

  useEffect(() => {
    if (!date) {
      setIndicators({ hasNote: false, hasTimesheet: false });
      return;
    }

    let cancelled = false;

    const loadIndicators = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getDayIndicators(date);
        if (!cancelled) {
          setIndicators(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Failed to load indicators'),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadIndicators();

    return () => {
      cancelled = true;
    };
  }, [date, getDayIndicators]);

  return { indicators, loading, error };
}

export function useMonthIndicators(
  year: number,
  month: number,
  refreshKey?: number,
) {
  const [indicators, setIndicators] = useState<Map<string, DayIndicators>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getMonthIndicators } = useDatabase();

  useEffect(() => {
    let cancelled = false;

    const loadIndicators = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMonthIndicators(year, month);
        if (!cancelled) {
          setIndicators(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error('Failed to load month indicators'),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadIndicators();

    return () => {
      cancelled = true;
    };
  }, [year, month, getMonthIndicators, refreshKey]);

  return { indicators, loading, error };
}

export function useYearIndicators(year: number, refreshKey?: number) {
  const [indicators, setIndicators] = useState<Map<string, DayIndicators>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getYearIndicators } = useDatabase();

  useEffect(() => {
    let cancelled = false;

    const loadIndicators = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getYearIndicators(year);
        if (!cancelled) {
          setIndicators(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error('Failed to load year indicators'),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadIndicators();

    return () => {
      cancelled = true;
    };
  }, [year, getYearIndicators, refreshKey]);

  return { indicators, loading, error };
}
