/**
 * Main Calendar Component
 *
 * Displays a full year calendar with:
 * - Platoon rotation colors (A, B, C, D)
 * - Pay day indicators ($)
 * - Annual leave highlighting
 * - Year navigation and scroll to today
 *
 * Subscribes to NotesRefreshContext to update indicators when data changes.
 */
import AlertBanner from '@/components/alerts/alert-banner';
import type { CalendarColors, MonthItem } from '@/components/calendar/calendar-types';
import { MonthView } from '@/components/calendar/month-view';

import { CALENDAR_FOOTER_HEIGHT, TIMING } from '@/constants/layout';
import { tokens } from '@/constants/theme';
import { formatDateToString } from '@/constants/timezone';
import { useNotesRefresh } from '@/contexts/notes/notes-refresh-context';
import { useYearIndicators } from '@/hooks/notes/use-day-indicators';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { useUserLeavePeriods } from '@/hooks/use-user-leave-periods';
import { FlashList } from '@shopify/flash-list';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MainCalendarProps {
  onDatePress?: (dateStr: string) => void;
  onAnnualLeaveClose?: () => void;
  months: MonthItem[];
  currentYear: number;
  scrollTarget: number | null;
  onScrollComplete: () => void;
}

export default function MainCalendar({
  onDatePress,
  onAnnualLeaveClose,
  months,
  currentYear,
  scrollTarget,
  onScrollComplete,
}: MainCalendarProps) {
  const { colors, common, platoonColors } = useThemedStyles();
  const listRef = useRef<any>(null);

  // Get user's leave periods for highlighting
  const { getUserLeaveInfo } = useUserLeavePeriods(currentYear);

  // Track refresh trigger for indicators - load entire year at once
  const { refreshKey } = useNotesRefresh();
  const [indicatorYear, setIndicatorYear] = React.useState(currentYear);
  const [isYearTransitioning, setIsYearTransitioning] = React.useState(false);
  const { indicators: monthIndicators } = useYearIndicators(
    indicatorYear,
    refreshKey,
  );

  // Defer indicator loading when year changes to make UI responsive
  React.useEffect(() => {
    setIsYearTransitioning(true);

    const transitionTimer = setTimeout(() => {
      setIsYearTransitioning(false);
    }, TIMING.TRANSITION_STATE_DELAY);

    const indicatorTimer = setTimeout(() => {
      setIndicatorYear(currentYear);
    }, TIMING.YEAR_TRANSITION_DELAY);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(indicatorTimer);
    };
  }, [currentYear]);

  // Track if this is initial mount or year change
  const isInitialMount = React.useRef(true);
  const prevYearRef = React.useRef(currentYear);
  const isYearChange = prevYearRef.current !== currentYear;

  React.useEffect(() => {
    prevYearRef.current = currentYear;
  }, [currentYear]);

  // Handle scroll to month using FlashList's scrollToIndex
  React.useEffect(() => {
    if (scrollTarget === null) return;

    // Initial mount: minimal delay, no animation (instant jump)
    // Year change: longer delay, no animation
    // Same-year scroll: short delay, animated
    let delay: number;
    let animated: boolean;

    if (isInitialMount.current) {
      delay = 10;
      animated = false;
      isInitialMount.current = false;
    } else if (isYearChange) {
      delay = 100;
      animated = false;
    } else {
      delay = 50;
      animated = true;
    }

    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: scrollTarget,
        animated,
        viewPosition: 0,
      });
      onScrollComplete();
    }, delay);

    return () => clearTimeout(timer);
  }, [scrollTarget, onScrollComplete, isYearChange]);



  const dynamicStyles = React.useMemo(
    () => getStyles(colors),
    [colors],
  );

  const handleDatePress = React.useCallback(
    (date: Date) => {
      const dateStr = formatDateToString(date);
      if (onDatePress) {
        onDatePress(dateStr);
      }
      if (onAnnualLeaveClose) {
        onAnnualLeaveClose();
      }
    },
    [onDatePress, onAnnualLeaveClose],
  );

  const renderMonthItem = React.useCallback(
    ({ item }: { item: MonthItem }) => (
      <MonthView
        month={item}
        onDatePress={handleDatePress}
        styles={dynamicStyles}
        colors={colors}
        platoonColors={platoonColors}
        monthIndicators={monthIndicators}
        isYearTransitioning={isYearTransitioning}
        getUserLeaveInfo={getUserLeaveInfo}
      />
    ),
    [
      handleDatePress,
      dynamicStyles,
      colors,
      platoonColors,
      monthIndicators,
      isYearTransitioning,
      getUserLeaveInfo,
    ],
  );

  return (
    <SafeAreaView style={[common.container]} edges={['bottom']}>
      {/* Alert Banner */}
      <AlertBanner />

      {/* Main Calendar FlashList API v2 */}
      <View style={{ flex: 1, marginBottom: CALENDAR_FOOTER_HEIGHT }}>
        <FlashList
          ref={listRef}
          data={months}
          renderItem={renderMonthItem}
          keyExtractor={(item) => `${currentYear}-${item.index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ backgroundColor: colors.background }}
          drawDistance={8000}
          overScrollMode="always"
          decelerationRate={0.998}
          scrollEventThrottle={16}
          bounces={true}
          removeClippedSubviews={false}
          alwaysBounceVertical={true}
          extraData={monthIndicators}
        />
      </View>
    </SafeAreaView>
  );
}

// Export the refresh function for parent components
export { type MainCalendarProps };

function getStyles(colors: CalendarColors) {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    monthContainer: {
      padding: tokens.space.md,
    },
    monthTitle: {
      fontSize: tokens.fontSize.lg,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    daysHeader: {
      flexDirection: 'row',
    },
    dayHeader: {
      flex: 1,
      textAlign: 'center',
      fontSize: tokens.fontSize.sm,
      fontWeight: '600',
      paddingVertical: tokens.space.xs,
    },
    weekRow: {
      flexDirection: 'row',
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      borderWidth: 0.5,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    dayText: {
      fontSize: tokens.fontSize.md,
      fontWeight: '500',
    },
  });
}
