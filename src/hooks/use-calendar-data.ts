/**
 * Hook for calendar data and platoon rotation logic
 *
 * Provides:
 * - Calendar grid generation (weeks/days for a month)
 * - Platoon rotation calculation (4-platoon 8-day cycle)
 * - Pay day calculation (14-day intervals)
 * - Current date tracking in Sydney timezone
 * - Navigation state management via reducer
 */
import type { Platoon } from '@/constants/theme';
import { TIMEZONE } from '@/constants/timezone';
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfWeek,
} from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { useCallback, useEffect, useMemo, useReducer, useRef, startTransition } from 'react';

import {
  PLATOON_ROTATION,
  PAY_DAY_INTERVAL,
  ROTATION_START_YEAR,
  ROTATION_START_MONTH,
  ROTATION_START_DAY,
  PAY_DAY_START_YEAR,
  PAY_DAY_START_MONTH,
  PAY_DAY_START_DAY,
} from '@/components/calendar/calendar-constants';

// Create timezone-aware start dates
const ROTATION_START_DATE = fromZonedTime(
  new Date(ROTATION_START_YEAR, ROTATION_START_MONTH, ROTATION_START_DAY),
  TIMEZONE,
);
const PAY_DAY_START_DATE = fromZonedTime(
  new Date(PAY_DAY_START_YEAR, PAY_DAY_START_MONTH, PAY_DAY_START_DAY),
  TIMEZONE,
);

interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  key: string;
  platoon: Platoon;
  isPay: boolean;
}

interface WeekRow {
  days: DayData[];
  key: string;
}

interface MonthData {
  rows: WeekRow[];
  monthStart: Date;
}

// Navigation state managed by reducer
type NavAction =
  | { type: 'START_NAV'; direction: 'prev' | 'next' | 'today'; targetYear?: number; targetMonth?: number }
  | { type: 'APPLY_YEAR'; year: number; scrollTarget: number }
  | { type: 'SCROLL_TO_MONTH'; month: number }
  | { type: 'YEAR_LOADED' }
  | { type: 'SCROLL_COMPLETE' };

interface NavState {
  year: number;
  scrollTarget: number | null;
  isNavigating: boolean;
  pendingNav: { year: number; scrollTarget: number } | null;
}

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'START_NAV': {
      // Just set loading state, don't change year yet
      let targetYear = state.year;
      let targetMonth = 0;
      
      if (action.direction === 'prev') {
        targetYear = state.year - 1;
      } else if (action.direction === 'next') {
        targetYear = state.year + 1;
      } else if (action.direction === 'today') {
        targetYear = action.targetYear!;
        targetMonth = action.targetMonth!;
        // Same year? Just scroll, no loading needed
        if (targetYear === state.year) {
          return { ...state, scrollTarget: targetMonth };
        }
      }
      
      return { 
        ...state, 
        isNavigating: true, 
        pendingNav: { year: targetYear, scrollTarget: targetMonth } 
      };
    }
    case 'APPLY_YEAR':
      return { 
        year: action.year, 
        scrollTarget: action.scrollTarget, 
        isNavigating: true,
        pendingNav: null 
      };
    case 'SCROLL_TO_MONTH':
      return { ...state, scrollTarget: action.month };
    case 'YEAR_LOADED':
      return { ...state, isNavigating: false };
    case 'SCROLL_COMPLETE':
      return { ...state, scrollTarget: null };
    default:
      return state;
  }
}

interface CalendarData {
  months: { index: number; data: MonthData }[];
  currentYear: number;
  scrollTarget: number | null;
  isNavigating: boolean;
  handlePrevYear: () => void;
  handleNextYear: () => void;
  handleTodayPress: () => void;
  onScrollComplete: () => void;
}

// Utility functions
function getCurrentDateInTimezone(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

function createTimezoneDate(year: number, month: number, day: number): Date {
  const zonedDate = new Date(year, month, day);
  return fromZonedTime(zonedDate, TIMEZONE);
}

function isDateToday(date: Date): boolean {
  const today = getCurrentDateInTimezone();
  const dateInTimezone = toZonedTime(date, TIMEZONE);
  return (
    dateInTimezone.getDate() === today.getDate() &&
    dateInTimezone.getMonth() === today.getMonth() &&
    dateInTimezone.getFullYear() === today.getFullYear()
  );
}

function getPlatoonForDate(date: Date): Platoon {
  const timezoneDate = toZonedTime(date, TIMEZONE);
  const normalizedDate = createTimezoneDate(
    timezoneDate.getFullYear(),
    timezoneDate.getMonth(),
    timezoneDate.getDate(),
  );
  const diffDays = differenceInCalendarDays(normalizedDate, ROTATION_START_DATE);
  let rotationIndex = diffDays % 8;
  if (rotationIndex < 0) rotationIndex += 8;
  return PLATOON_ROTATION[rotationIndex];
}

function isPayDay(date: Date): boolean {
  const timezoneDate = toZonedTime(date, TIMEZONE);
  const normalizedDate = createTimezoneDate(
    timezoneDate.getFullYear(),
    timezoneDate.getMonth(),
    timezoneDate.getDate(),
  );
  const diffDays = differenceInCalendarDays(normalizedDate, PAY_DAY_START_DATE);
  return diffDays % PAY_DAY_INTERVAL === 0;
}

function getMonthDays(monthIndex: number, year: number): MonthData {
  const monthStart = createTimezoneDate(year, monthIndex, 1);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const rows: WeekRow[] = [];
  let days: DayData[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isDateToday(day);
      const currentDay = new Date(day);

      days.push({
        date: currentDay,
        isCurrentMonth,
        isToday,
        key: formatInTimeZone(day, TIMEZONE, 'yyyy-MM-dd'),
        platoon: getPlatoonForDate(currentDay),
        isPay: isPayDay(currentDay),
      });
      day = addDays(day, 1);
    }

    rows.push({
      days: [...days],
      key: formatInTimeZone(day, TIMEZONE, 'yyyy-MM-dd-week'),
    });
    days = [];
  }

  return { rows, monthStart };
}

export function useCalendarData(): CalendarData {
  const [state, dispatch] = useReducer(navReducer, null, () => {
    const today = getCurrentDateInTimezone();
    return {
      year: today.getFullYear(),
      scrollTarget: today.getMonth(),
      isNavigating: false,
      pendingNav: null,
    };
  });

  // Cache for pre-computed year data
  const yearCache = useRef<Map<number, { index: number; data: MonthData }[]>>(new Map());

  // Generate months data - use cache if available
  const months = useMemo(() => {
    const cached = yearCache.current.get(state.year);
    if (cached) return cached;

    const computed = Array.from({ length: 12 }, (_, i) => ({
      index: i,
      data: getMonthDays(i, state.year),
    }));
    yearCache.current.set(state.year, computed);
    return computed;
  }, [state.year]);

  // Pre-compute adjacent years in background after initial render
  useEffect(() => {
    const prevYear = state.year - 1;
    const nextYear = state.year + 1;

    // Don't block - use requestIdleCallback or setTimeout
    const precompute = (year: number) => {
      if (yearCache.current.has(year)) return;
      const data = Array.from({ length: 12 }, (_, i) => ({
        index: i,
        data: getMonthDays(i, year),
      }));
      yearCache.current.set(year, data);
    };

    // Stagger the precomputation
    const timer1 = setTimeout(() => precompute(nextYear), 500);
    const timer2 = setTimeout(() => precompute(prevYear), 1000);

    // Cleanup old cache entries (keep only current ±1)
    const cleanup = setTimeout(() => {
      yearCache.current.forEach((_, year) => {
        if (Math.abs(year - state.year) > 1) {
          yearCache.current.delete(year);
        }
      });
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(cleanup);
    };
  }, [state.year]);

  // Apply pending navigation after loading indicator shows
  useEffect(() => {
    if (state.pendingNav) {
      // Use startTransition to mark year change as non-urgent
      // This lets React show loading state before heavy computation
      startTransition(() => {
        dispatch({ 
          type: 'APPLY_YEAR', 
          year: state.pendingNav!.year, 
          scrollTarget: state.pendingNav!.scrollTarget 
        });
      });
    }
  }, [state.pendingNav]);

  // Reset navigating state when year data is ready
  useEffect(() => {
    if (state.isNavigating && !state.pendingNav) {
      const timer = setTimeout(() => {
        dispatch({ type: 'YEAR_LOADED' });
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [state.year, state.isNavigating, state.pendingNav]);

  const handlePrevYear = useCallback(() => {
    dispatch({ type: 'START_NAV', direction: 'prev' });
  }, []);

  const handleNextYear = useCallback(() => {
    dispatch({ type: 'START_NAV', direction: 'next' });
  }, []);

  const handleTodayPress = useCallback(() => {
    const now = getCurrentDateInTimezone();
    dispatch({ 
      type: 'START_NAV', 
      direction: 'today', 
      targetYear: now.getFullYear(), 
      targetMonth: now.getMonth() 
    });
  }, []);

  const onScrollComplete = useCallback(() => {
    dispatch({ type: 'SCROLL_COMPLETE' });
  }, []);

  return {
    months,
    currentYear: state.year,
    scrollTarget: state.scrollTarget,
    isNavigating: state.isNavigating,
    handlePrevYear,
    handleNextYear,
    handleTodayPress,
    onScrollComplete,
  };
}

// Export utility functions for use by components
export { getCurrentDateInTimezone, getPlatoonForDate, isDateToday, isPayDay };
