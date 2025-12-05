/**
 * Calendar Constants
 *
 * Shared constants used across calendar components to ensure consistency
 * and eliminate magic numbers.
 */

// ============================================================================
// Days of Week
// ============================================================================

export const DAYS_OF_WEEK = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
] as const;

// ============================================================================
// Platoon Rotation
// ============================================================================

export const PLATOON_ROTATION = [
  'A',
  'D',
  'A',
  'D',
  'C',
  'B',
  'C',
  'B',
] as const;

export const PAY_DAY_INTERVAL = 14;

// Reference dates (timezone-aware dates set in use-calendar-data.ts)
export const ROTATION_START_YEAR = 2024;
export const ROTATION_START_MONTH = 0; // January
export const ROTATION_START_DAY = 5;

export const PAY_DAY_START_YEAR = 2024;
export const PAY_DAY_START_MONTH = 0; // January
export const PAY_DAY_START_DAY = 11;
