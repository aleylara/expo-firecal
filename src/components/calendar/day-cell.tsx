/**
 * DayCell Component
 *
 * Renders a single day in the calendar grid.
 * Displays:
 * - Date number (or '$' for pay day)
 * - Visual indicators for Notes (triangle) and Timesheets (dot)
 * - Visual feedback for "Today" and selection state
 *
 * Optimized with React.memo to prevent unnecessary re-renders during scroll.
 */
import {
  DATE_CIRCLE_RADIUS,
  DATE_CIRCLE_SIZE,
  NOTE_INDICATOR_OFFSET_BOTTOM,
  NOTE_INDICATOR_OFFSET_RIGHT,
  SCALE,
  TIMESHEET_INDICATOR_OFFSET_BOTTOM,
} from '@/constants/layout';
import { tokens } from '@/constants/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type {
  CalendarStyles,
  DayData,
  DayIndicators,
  LeaveInfo,
  PlatoonType,
} from './calendar-types';

interface DayCellProps {
  dayData: DayData;
  platoon: PlatoonType;
  isPay: boolean;
  indicators?: DayIndicators;
  leaveInfo?: LeaveInfo;
  onPress: (date: Date) => void;
  styles: CalendarStyles;
  platoonColor: string;
  leaveHighlightColor: string;
}

// Helper to generate accessibility label
function getAccessibilityLabel(
  props: DayCellProps,
  dateString: string,
): string {
  const parts = [dateString];
  const { dayData, isPay, leaveInfo, indicators, platoon } = props;

  if (dayData.isToday) parts.push('Today');
  if (isPay) parts.push('Pay day');
  if (leaveInfo?.isOnLeave) parts.push('On leave');
  if (indicators?.hasNote) parts.push('Has note');
  if (indicators?.hasTimesheet) parts.push('Has timesheet');
  parts.push(`Platoon ${platoon}`);

  return parts.join(', ');
}

// Extracted Sub-components for cleaner render
const NoteIndicator = React.memo(({ color }: { color: string }) => (
  <View style={[localStyles.noteIndicator, { borderRightColor: color }]} />
));
NoteIndicator.displayName = 'NoteIndicator';

const TimesheetIndicator = React.memo(({ color }: { color: string }) => (
  <View style={[localStyles.timesheetIndicator, { backgroundColor: color }]} />
));
TimesheetIndicator.displayName = 'TimesheetIndicator';

export const DayCell = React.memo<DayCellProps>(
  (props) => {
    const {
      dayData,
      isPay,
      indicators,
      leaveInfo,
      onPress,
      styles,
      platoonColor,
      leaveHighlightColor,
    } = props;

    // Memoize date formatting
    const dateString = useMemo(() => {
      return dayData.date.toLocaleDateString('en-AU', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }, [dayData.date]);

    // Memoize accessibility label
    const accessibilityLabel = useMemo(
      () => getAccessibilityLabel(props, dateString),
      [dayData.isToday, isPay, leaveInfo?.isOnLeave, indicators?.hasNote, indicators?.hasTimesheet, props.platoon, dateString],
    );

    // Early return for padding cells
    if (!dayData.isCurrentMonth) {
      return <View style={styles.dayCell} accessible={false} />;
    }

    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          leaveInfo?.isOnLeave && { backgroundColor: leaveHighlightColor },
        ]}
        onPress={() => onPress(dayData.date)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Tap to view day details"
        testID={`day-cell-${dayData.key}`}
      >
        <View style={localStyles.contentWrapper}>
          <View
            style={[
              localStyles.dateCircle,
              {
                borderColor: dayData.isToday ? platoonColor : 'transparent',
                borderWidth: dayData.isToday ? 1.5 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color: platoonColor,
                  fontSize: tokens.fontSize.md,
                },
              ]}
            >
              {isPay ? '$' : dayData.date.getDate()}
            </Text>
          </View>

          {/* Timesheet indicator is now relative to the date text/circle wrapper */}
          {indicators?.hasTimesheet && (
            <TimesheetIndicator color={platoonColor} />
          )}
        </View>

        {/* Note indicator is now relative to the cell corner */}
        {indicators?.hasNote && <NoteIndicator color={platoonColor} />}
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    // dayData.key uniquely identifies the day (includes platoon/isPay via pre-computation)
    // Only need to check dynamic values that can change independently
    return (
      prev.dayData.key === next.dayData.key &&
      prev.platoonColor === next.platoonColor &&
      prev.leaveHighlightColor === next.leaveHighlightColor &&
      prev.leaveInfo?.isOnLeave === next.leaveInfo?.isOnLeave &&
      prev.indicators?.hasNote === next.indicators?.hasNote &&
      prev.indicators?.hasTimesheet === next.indicators?.hasTimesheet
    );
  },
);

DayCell.displayName = 'DayCell';

// Local static styles for indicators
const localStyles = StyleSheet.create({
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircle: {
    width: DATE_CIRCLE_SIZE,
    height: DATE_CIRCLE_SIZE,
    borderRadius: DATE_CIRCLE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIndicator: {
    position: 'absolute',
    bottom: NOTE_INDICATOR_OFFSET_BOTTOM,
    right: NOTE_INDICATOR_OFFSET_RIGHT,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 10 * SCALE,
    borderTopWidth: 10 * SCALE,
    borderTopColor: 'transparent',
    opacity: 0.7,
  },
  timesheetIndicator: {
    position: 'absolute',
    bottom: TIMESHEET_INDICATOR_OFFSET_BOTTOM,
    alignSelf: 'center',
    width: 6 * SCALE,
    height: 6 * SCALE,
    borderRadius: 3 * SCALE,
    opacity: 0.7,
  },
});
