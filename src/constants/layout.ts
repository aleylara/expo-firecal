import { Dimensions } from 'react-native';

/**
 * Application Layout Constants
 *
 * Centralized source of truth for layout dimensions and timing.
 * Prevents magic numbers and ensures consistency across the app.
 */

const { width } = Dimensions.get('window');
// Simple tablet detection (can be refined with expo-device if needed)
export const IS_TABLET = width > 700;
export const SCALE = IS_TABLET ? 1.5 : 1;

// Navigation
export const TAB_BAR_HEIGHT = 70;

// Calendar Layout
export const CALENDAR_FOOTER_HEIGHT = TAB_BAR_HEIGHT + 30; // Clear tab bar + padding
export const MONTH_CONTAINER_PADDING = 10;
export const DAYS_HEADER_MARGIN = 0; // Explicitly 0 now

// Date Cell Dimensions (Scaled)
export const DATE_CIRCLE_SIZE = 34 * SCALE;
export const DATE_CIRCLE_RADIUS = DATE_CIRCLE_SIZE / 2; // Fully rounded

// Indicator Positioning
// Note: Relative to the DayCell corner now
export const NOTE_INDICATOR_OFFSET_BOTTOM = 2;
export const NOTE_INDICATOR_OFFSET_RIGHT = 2;

// Timesheet: Relative to the Date Number (Negative to sit below)
export const TIMESHEET_INDICATOR_OFFSET_BOTTOM = -8 * SCALE;

// Animation & Interaction Timings (ms)
export const TIMING = {
  YEAR_TRANSITION_DELAY: 100,
  INDICATOR_LOAD_DELAY: 100,
  TRANSITION_STATE_DELAY: 50,
};

// Bottom Sheet Snap Points
export const SHEET_SNAP_POINTS = ['8%', '50%', '90%'];
