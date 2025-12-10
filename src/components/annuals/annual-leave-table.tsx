import { Ionicons } from '@expo/vector-icons';
import {
  getAllNextApproachingLeaveGroups,
  getAllOngoingLeaveGroups,
  LeaveScheduleGenerator,
  type LeavePeriod,
} from '@/utils/annual-leave-logic';
import NextAnnuals from '@/components/annuals/next-annuals';
import OngoingAnnuals from '@/components/annuals/ongoing-annuals';
import ScheduleTable from '@/components/annuals/schedule-table';
import { useTheme } from '@/contexts/theme-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface AnnualLeaveTableProps {
  periods: LeavePeriod[];
  groupId: string;
  isExpanded?: boolean;
}

export default function AnnualLeaveTable({
  periods: initialPeriods,
  groupId: initialGroupId,
  isExpanded = false,
}: AnnualLeaveTableProps) {
  const { common, getPlatoonColor, colors, tokens } = useThemedStyles();
  const { userGroup } = useTheme();

  const [currentPeriods, setCurrentPeriods] =
    useState<LeavePeriod[]>(initialPeriods);
  const [currentGroupId, setCurrentGroupId] = useState<string>(initialGroupId);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [ongoingAnnuals, setOngoingAnnuals] = useState<LeavePeriod[]>([]);
  const [nextAnnuals, setNextAnnuals] = useState<LeavePeriod[]>([]);

  const loadingRef = useRef<string | null>(null);

  // Get all subgroups for user's letter only, sorted by chronological start date
  const userSubgroups = React.useMemo(() => {
    const generator = new LeaveScheduleGenerator();
    const schedule = generator.generateSchedule(userGroup.group);

    const groupsWithDates = Array.from({ length: 8 }, (_, i) => {
      const groupId = `${userGroup.group}${i + 1}`;
      const periods = schedule[groupId];
      const firstLeaveDate =
        periods && periods.length > 0 ? periods[0].leaveDate : '9999-12-31';
      return { groupId, firstLeaveDate };
    });

    groupsWithDates.sort((a, b) =>
      a.firstLeaveDate.localeCompare(b.firstLeaveDate),
    );
    return groupsWithDates.map((group) => group.groupId);
  }, [userGroup.group]);

  const loadGroupSchedule = useCallback(
    async (groupId: string) => {
      if (loadingRef.current === groupId || isLoading) return;

      loadingRef.current = groupId;
      setIsLoading(true);

      try {
        const generator = new LeaveScheduleGenerator();
        const schedule = generator.generateSchedule(userGroup.group);

        if (loadingRef.current === groupId && schedule[groupId]) {
          setCurrentPeriods([...schedule[groupId]]);
          setCurrentGroupId(groupId);
        }
      } catch (error) {
        console.error('Error loading group schedule:', error);
      } finally {
        if (loadingRef.current === groupId) {
          setIsLoading(false);
          loadingRef.current = null;
        }
      }
    },
    [isLoading, userGroup.group],
  );

  // Initialize with user's group and refresh when userGroup changes
  React.useEffect(() => {
    const newGroupId = `${userGroup.group}${userGroup.number}`;
    const userIndex = userSubgroups.findIndex((group) => group === newGroupId);
    if (userIndex >= 0) {
      setCurrentGroupIndex(userIndex);
      loadGroupSchedule(newGroupId);
    }
  }, [userSubgroups, userGroup.group, userGroup.number, loadGroupSchedule]);

  // Load ongoing and next annuals
  React.useEffect(() => {
    const loadAnnualsData = () => {
      try {
        const ongoing = getAllOngoingLeaveGroups();
        const next = getAllNextApproachingLeaveGroups();
        setOngoingAnnuals(ongoing);
        setNextAnnuals(next);
      } catch (error) {
        console.error('Error loading annuals data:', error);
        setOngoingAnnuals([]);
        setNextAnnuals([]);
      }
    };

    loadAnnualsData();
  }, []);

  const handlePrevGroup = () => {
    if (currentGroupIndex > 0 && !isLoading) {
      const newIndex = currentGroupIndex - 1;
      const newGroupId = userSubgroups[newIndex];
      setCurrentGroupIndex(newIndex);
      loadGroupSchedule(newGroupId);
    }
  };

  const handleNextGroup = () => {
    if (currentGroupIndex < userSubgroups.length - 1 && !isLoading) {
      const newIndex = currentGroupIndex + 1;
      const newGroupId = userSubgroups[newIndex];
      setCurrentGroupIndex(newIndex);
      loadGroupSchedule(newGroupId);
    }
  };

  const isPrevDisabled = currentGroupIndex === 0 || isLoading;
  const isNextDisabled =
    currentGroupIndex === userSubgroups.length - 1 || isLoading;

  return (
    <View style={[common.container, { backgroundColor: colors.surface }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={[styles.arrowButton, { opacity: isExpanded && !isPrevDisabled ? 1 : 0 }]}
          onPress={handlePrevGroup}
          disabled={!isExpanded || isPrevDisabled}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.groupIdContainer}>
          <Text
            style={[
              common.text,
              styles.groupIdText,
              { color: getPlatoonColor(currentGroupId.charAt(0)) },
            ]}
          >
            {currentGroupId}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.arrowButton, { opacity: isExpanded && !isNextDisabled ? 1 : 0 }]}
          onPress={handleNextGroup}
          disabled={!isExpanded || isNextDisabled}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScheduleTable
        periods={currentPeriods}
        groupId={currentGroupId}
        isLoading={isLoading}
      />

      <OngoingAnnuals ongoingAnnuals={ongoingAnnuals} />
      <NextAnnuals nextAnnuals={nextAnnuals} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  arrowButton: {
    padding: 8,
  },
  groupIdContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIdText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
