import { addDays as fnsAddDays } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

// Re-export for use in other modules
export { fromZonedTime };

/**
 * Date utilities for FireCal app
 * All dates are handled in Australia/Sydney timezone
 *
 * IMPORTANT: Always use these helpers to avoid timezone-related bugs
 */
export const TIMEZONE = 'Australia/Sydney';

/**
 * Gets the current date/time in Australia/Sydney timezone
 */
export function getCurrentDateInTimezone(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Formats a Date object to YYYY-MM-DD string for database storage
 * Always uses Sydney timezone
 */
export function formatDateToString(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Parses a YYYY-MM-DD string from database to Date object
 * Assumes the date string represents a date in Sydney timezone
 */
export function parseDateString(dateStr: string): Date {
  return fromZonedTime(`${dateStr} 00:00:00`, TIMEZONE);
}

/**
 * Checks if a date is in the future (compared to Sydney timezone "now")
 */
export function isDateInFuture(date: Date): boolean {
  const now = getCurrentDateInTimezone();
  return date > now;
}

/**
 * Adds days to a date while maintaining Sydney timezone
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 */
export function addDaysInSydney(date: Date, days: number): Date {
  return fnsAddDays(date, days);
}

/**
 * Creates a Date object for a specific date in Sydney timezone
 * @param year - Full year (e.g., 2025)
 * @param month - Month (0-11, where 0 = January)
 * @param day - Day of month (1-31)
 */
export function createTimezoneDate(
  year: number,
  month: number,
  day: number,
): Date {
  return fromZonedTime(new Date(year, month, day), TIMEZONE);
}

/**
 * Formats a date string (YYYY-MM-DD) for display
 * @param dateStr - Date string from database
 * @param format - date-fns format string (e.g., 'MMM d, yyyy')
 */
export function formatDateString(dateStr: string, format: string): string {
  const date = parseDateString(dateStr);
  return formatInTimeZone(date, TIMEZONE, format);
}

/**
 * Gets the start of day (00:00:00) in Sydney timezone for a given date
 */
export function getStartOfDayInSydney(date: Date): Date {
  const dateStr = formatDateToString(date);
  return parseDateString(dateStr);
}

/**
 * Checks if two dates are the same day in Sydney timezone
 */
export function isSameDayInSydney(date1: Date, date2: Date): boolean {
  return formatDateToString(date1) === formatDateToString(date2);
}

/**
 * Gets current timestamp as ISO 8601 string in Sydney timezone
 * @returns ISO 8601 string (e.g., "2025-11-15T14:30:00+11:00")
 */
export function getCurrentTimestamp(): string {
  return formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

/**
 * Converts Date to ISO 8601 string in Sydney timezone
 * @param date - Date object to convert
 * @returns ISO 8601 string (e.g., "2025-11-15T14:30:00+11:00")
 */
export function formatDateTimeToISO(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

/**
 * Parses ISO 8601 string to Date object
 * @param isoStr - ISO 8601 datetime string
 * @returns Date object
 */
export function parseISOString(isoStr: string): Date {
  return new Date(isoStr);
}

/**
 * Converts Date to HHMM format string
 * @param date - Date object
 * @returns Time in HHMM format (e.g., "0800", "1730")
 */
export function formatTimeToHHMM(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, 'HHmm');
}

/**
 * Combines date string and HHMM time string into Date object
 * @param dateStr - Date in YYYY-MM-DD format
 * @param timeStr - Time in HHMM format (e.g., "0800")
 * @returns Date object for that specific time in Sydney timezone
 */
export function parseHHMMToDate(dateStr: string, timeStr: string): Date {
  const hours = parseInt(timeStr.substring(0, 2), 10);
  const minutes = parseInt(timeStr.substring(2, 4), 10);
  const baseDate = parseDateString(dateStr);
  return fromZonedTime(
    new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hours,
      minutes,
    ),
    TIMEZONE,
  );
}

/**
 * Validates HHMM time format
 * @param timeStr - Time string to validate
 * @returns true if valid HHMM format (00:00-23:59)
 */
export function validateHHMMFormat(timeStr: string): boolean {
  const regex = /^([0-1][0-9]|2[0-3])[0-5][0-9]$/;
  return regex.test(timeStr);
}

/**
 * Formats HHMM string to display format HH:MM
 * @param timeStr - Time string in HHMM format
 * @returns Formatted string (e.g., "08:00") or empty string if invalid
 */
export function formatHHMMToDisplay(timeStr: string | null): string {
  if (!timeStr || timeStr.length !== 4) return '';
  return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
}

/**
 * Formats date string for display as "Today", "Yesterday", or "Nov 12, 2025"
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Formatted display string
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  const today = getCurrentDateInTimezone();
  const yesterday = addDaysInSydney(today, -1);

  if (isSameDayInSydney(date, today)) return 'Today';
  if (isSameDayInSydney(date, yesterday)) return 'Yesterday';
  return formatDateString(dateStr, 'MMM d, yyyy');
}

/**
 * Formats ISO datetime string for display
 * @param isoStr - ISO 8601 datetime string
 * @returns Formatted string (e.g., "Nov 12 at 2:30 PM")
 */
export function formatDisplayDateTime(isoStr: string): string {
  const date = parseISOString(isoStr);
  return formatInTimeZone(date, TIMEZONE, "MMM d 'at' h:mm a");
}
