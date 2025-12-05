import React from 'react';
import { View } from 'react-native';

import type {
  CalendarColors,
  CalendarStyles,
  DayData,
  DayIndicators,
  PlatoonColors,
  WeekData,
} from './calendar-types';
import { DayCell } from './day-cell';

// ============================================================================
// Types
// ============================================================================

interface WeekRowProps {
  week: WeekData;
  onDatePress: (date: Date) => void;
  styles: CalendarStyles;
  platoonColors: PlatoonColors;
  monthIndicators: Map<string, DayIndicators>;
  isYearTransitioning: boolean;
  getUserLeaveInfo: (dateStr: string) => { isOnLeave?: boolean };
  colors: CalendarColors;
}

// ============================================================================
// Component
// ============================================================================

/**
 * WeekRow - Renders a single week row in the calendar
 *
 * Displays 7 day cells in a row, calculates platoon rotation,
 * pay days, and passes indicators to each day cell.
 */
export const WeekRow = React.memo<WeekRowProps>(
  (props) => {
    const {
      week,
      onDatePress,
      styles,
      platoonColors,
      monthIndicators,
      isYearTransitioning,
      getUserLeaveInfo,
      colors,
    } = props;

    const leaveHighlightColor = colors.leaveHighlight;

    return (
      <View style={styles.weekRow}>
        {week.days.map((dayData: DayData) => {
          const indicators = isYearTransitioning
            ? undefined
            : monthIndicators.get(dayData.key);
          const leaveInfo = getUserLeaveInfo(dayData.key);

          return (
            <DayCell
              key={dayData.key}
              dayData={dayData}
              platoon={dayData.platoon}
              isPay={dayData.isPay}
              indicators={indicators}
              leaveInfo={leaveInfo}
              onPress={onDatePress}
              styles={styles}
              platoonColor={platoonColors[dayData.platoon]}
              leaveHighlightColor={leaveHighlightColor}
            />
          );
        })}
      </View>
    );
  },
  (prev, next) => {
    // week.key identifies the week, other checks for dynamic data
    // Note: getUserLeaveInfo excluded - DayCell handles leave comparison
    return (
      prev.week.key === next.week.key &&
      prev.isYearTransitioning === next.isYearTransitioning &&
      prev.monthIndicators === next.monthIndicators &&
      prev.platoonColors === next.platoonColors &&
      prev.colors.leaveHighlight === next.colors.leaveHighlight
    );
  },
);

WeekRow.displayName = 'WeekRow';
