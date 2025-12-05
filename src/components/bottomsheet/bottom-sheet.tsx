import { LeavePeriod } from '@/utils/annual-leave-logic';
import AnnualLeaveTable from '@/components/annuals/annual-leave-table';
import CustomBottomSheetHandle from '@/components/bottomsheet/custom-bottom-sheet-handle';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';

interface CalendarBottomSheetProps {
  snapPoints: string[];
  userLeaveSchedule: LeavePeriod[];
  groupId: string;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

export default function CalendarBottomSheet({
  snapPoints,
  userLeaveSchedule,
  groupId,
  bottomSheetRef,
}: CalendarBottomSheetProps) {
  const { colors } = useThemedStyles();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePress = () => {
    if (currentIndex === 0) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      enableHandlePanningGesture={true}
      index={0}
      backgroundStyle={{
        backgroundColor: colors.surface,
      }}
      handleComponent={(props) => (
        <CustomBottomSheetHandle {...props} onPress={handlePress} />
      )}
      onChange={setCurrentIndex}
    >
      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          maxWidth: 600, 
          alignSelf: 'center', 
          width: '100%' 
        }}
        showsVerticalScrollIndicator={false}
      >
        <AnnualLeaveTable 
          periods={userLeaveSchedule} 
          groupId={groupId} 
          isExpanded={currentIndex > 0} 
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
