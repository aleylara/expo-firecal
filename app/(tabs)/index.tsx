/**
 * Calendar Tab Screen
 *
 * Main screen showing the annual calendar with:
 * 1. Annual leave schedule bottom sheet
 * 2. Day entry modal for notes/timesheets
 *
 * Coordinates between calendar date selection and day entry display.
 */
import CalendarBottomSheet from '@/components/bottomsheet/bottom-sheet';
import MainCalendar from '@/components/calendar/main-calendar';
import DayEntryModal from '@/components/notes/day-entry-modal';
import { ThemedView } from '@/components/theme/themed-view';
import { useTheme } from '@/contexts/theme-context';
import { useOnboarding } from '@/contexts/onboarding';
import { useLeaveSchedule } from '@/hooks/use-leave-schedule';
import { useCalendarData } from '@/hooks/use-calendar-data';
import BottomSheet from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SHEET_SNAP_POINTS } from '@/constants/layout';
import { CalendarHeader } from '@/components/calendar/calendar-header';

export default function AnnualLeaveScreen() {
  const { userGroup } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null!);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { isComplete: onboardingComplete } = useOnboarding();
  const prevOnboardingComplete = useRef(onboardingComplete);

  // Force re-render key when user group changes
  const userGroupKey = `${userGroup.group}${userGroup.number}`;

  // Hook for Calendar Data (all navigation state managed here)
  const {
    months,
    currentYear,
    scrollTarget,
    isNavigating,
    handlePrevYear,
    handleNextYear,
    handleTodayPress,
    onScrollComplete,
  } = useCalendarData();

  const { userLeaveSchedule } = useLeaveSchedule(
    userGroup.group,
    userGroup.number,
  );

  // Scroll to current month when onboarding completes
  useEffect(() => {
    if (onboardingComplete && !prevOnboardingComplete.current) {
      // Onboarding just completed - scroll to today
      handleTodayPress();
    }
    prevOnboardingComplete.current = onboardingComplete;
  }, [onboardingComplete, handleTodayPress]);

  const handleDatePress = (dateStr: string) => {
    setSelectedDate(dateStr);
    setModalVisible(true);
    // Close annual leave sheet when opening day entry
    bottomSheetRef.current?.close();
  };

  const handleAnnualLeaveClose = () => {
    bottomSheetRef.current?.close();
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedDate(null);
    // Reopen the annual leave sheet
    bottomSheetRef.current?.snapToIndex(0);
  };



  const renderHeaderTitle = useCallback(
    () => (
      <CalendarHeader
        onPrevYear={handlePrevYear}
        onNextYear={handleNextYear}
        onToday={handleTodayPress}
        isNavigating={isNavigating}
      />
    ),
    [handlePrevYear, handleNextYear, handleTodayPress, isNavigating],
  );


  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerTitle: renderHeaderTitle }} />
      <MainCalendar
        key={userGroupKey}
        onDatePress={handleDatePress}
        onAnnualLeaveClose={handleAnnualLeaveClose}
        months={months}
        currentYear={currentYear}
        scrollTarget={scrollTarget}
        onScrollComplete={onScrollComplete}
      />

      {/* Annual leave bottom sheet */}
      <View style={styles.bottomSheetContainer} pointerEvents="box-none">
        <CalendarBottomSheet
          bottomSheetRef={bottomSheetRef}
          snapPoints={SHEET_SNAP_POINTS}
          userLeaveSchedule={userLeaveSchedule}
          groupId={`${userGroup.group}${userGroup.number}`}
        />
      </View>

      {/* Day entry modal */}
      <DayEntryModal
        visible={modalVisible}
        date={selectedDate}
        onClose={handleModalClose}
        onSaveComplete={handleModalClose}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
