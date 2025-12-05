import React from 'react';
import { Text, View } from 'react-native';

import { TIMEZONE } from '@/constants/timezone';
import { DAYS_OF_WEEK } from './calendar-constants';
import type {
  CalendarColors,
  CalendarStyles,
  DayIndicators,
  MonthItem,
  PlatoonColors,
} from './calendar-types';
import { WeekRow } from './week-row';

// ============================================================================
// Types
// ============================================================================

interface MonthViewProps {
  month: MonthItem;
  onDatePress: (date: Date) => void;
  styles: CalendarStyles;
  colors: CalendarColors;
  platoonColors: PlatoonColors;
  monthIndicators: Map<string, DayIndicators>;
  isYearTransitioning: boolean;
  getUserLeaveInfo: (dateStr: string) => { isOnLeave?: boolean };
}

// ============================================================================
// Component
// ============================================================================

/**
 * MonthView - Renders a single month in the calendar
 *
 * Displays the month title, days of week header, and all week rows.
 */
const monthFormatter = new Intl.DateTimeFormat('en-AU', {
  month: 'long',
  year: 'numeric',
  timeZone: TIMEZONE,
});

export const MonthView = React.memo<MonthViewProps>((props) => {
  const {
    month,
    onDatePress,
    styles,
    colors,
    platoonColors,
    monthIndicators,
    isYearTransitioning,
    getUserLeaveInfo,
  } = props;

  return (
    <View style={styles.monthContainer}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {monthFormatter.format(month.data.monthStart)}
        </Text>
        <View style={styles.daysHeader}>
          {DAYS_OF_WEEK.map((day) => (
            <Text key={day} style={[styles.dayHeader, { color: colors.text }]}>
              {day}
            </Text>
          ))}
        </View>
      {month.data.rows.map((week) => (
        <WeekRow
          key={week.key}
          week={week}
          onDatePress={onDatePress}
          styles={styles}
          platoonColors={platoonColors}
          monthIndicators={monthIndicators}
          isYearTransitioning={isYearTransitioning}
          getUserLeaveInfo={getUserLeaveInfo}
          colors={colors}
        />
      ))}
    </View>
  );
});

MonthView.displayName = 'MonthView';
