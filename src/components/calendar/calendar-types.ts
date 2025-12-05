/**
 * Calendar Component Type Definitions
 *
 * Shared TypeScript types and interfaces for calendar components.
 */

import type { TextStyle, ViewStyle } from 'react-native';

// ============================================================================
// Core Data Types
// ============================================================================

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  key: string;
  platoon: PlatoonType;
  isPay: boolean;
}

export interface WeekData {
  key: string;
  days: DayData[];
}

export interface MonthData {
  monthStart: Date;
  rows: WeekData[];
}

export interface MonthItem {
  index: number;
  data: MonthData;
}

// ============================================================================
// Indicator Types
// ============================================================================

export interface DayIndicators {
  hasNote?: boolean;
  hasTimesheet?: boolean;
}

export interface LeaveInfo {
  isOnLeave?: boolean;
}

// ============================================================================
// Platoon Types
// ============================================================================

export type PlatoonType = 'A' | 'B' | 'C' | 'D';

export type PlatoonColors = Record<PlatoonType, string>;

// ============================================================================
// Color Types
// ============================================================================

export interface CalendarColors {
  text: string;
  background: string;
  border: string;
  borderLight: string;
  primary: string;
  leaveHighlight: string;
}

// ============================================================================
// Style Types
// ============================================================================

export interface CalendarStyles {
  monthContainer: ViewStyle;
  monthTitle: TextStyle;
  daysHeader: ViewStyle;
  dayHeader: TextStyle;
  weekRow: ViewStyle;
  dayCell: ViewStyle;
  dayText: TextStyle;
}
