/**
 * Hook for user's annual leave periods
 *
 * Provides:
 * - getUserLeaveInfo: Check if a date is during leave and get set type
 * - Memoized leave period map for performance
 * - Automatically updates when user's platoon/number changes
 */
import { addDays } from 'date-fns';
import { useCallback, useMemo } from 'react';

import {
  LeaveScheduleGenerator,
  parseDate,
  type LeavePeriod,
} from '@/utils/annual-leave-logic';
import { formatDateToString } from '@/constants/timezone';
import { useTheme } from '@/contexts/theme-context';

interface LeavePeriodMap {
  [dateString: string]: {
    isOnLeave: boolean;
    setType: '3' | '4';
  };
}

/**
 * Hook to get user's leave periods and check if a date is during their leave
 */
export function useUserLeavePeriods(year: number) {
  const { userGroup } = useTheme();

  const leavePeriodMap = useMemo(() => {
    const generator = new LeaveScheduleGenerator();
    const schedule = generator.generateSchedule(userGroup.group);
    const userGroupId = `${userGroup.group}${userGroup.number}`;
    const userPeriods = schedule[userGroupId] || [];

    const map: LeavePeriodMap = {};

    // For each leave period, mark all dates in the range
    userPeriods.forEach((period: LeavePeriod) => {
      const startDate = parseDate(period.startsOn);
      const returnDate = parseDate(period.returnDate);
      const leaveYear = startDate.getFullYear();

      // Only process periods that overlap with the requested year
      if (leaveYear === year || returnDate.getFullYear() === year) {
        let currentDate = startDate;

        while (currentDate < returnDate) {
          // FIXED: Use timezone-aware date formatting to prevent date shifts
          const dateStr = formatDateToString(currentDate);
          map[dateStr] = {
            isOnLeave: true,
            setType: period.setType,
          };
          currentDate = addDays(currentDate, 1);
        }
      }
    });

    return map;
  }, [userGroup.group, userGroup.number, year]);

  const isUserOnLeave = useCallback(
    (dateString: string) => {
      return leavePeriodMap[dateString]?.isOnLeave || false;
    },
    [leavePeriodMap],
  );

  const getUserLeaveInfo = useCallback(
    (dateString: string) => {
      return leavePeriodMap[dateString];
    },
    [leavePeriodMap],
  );

  return {
    leavePeriodMap,
    isUserOnLeave,
    getUserLeaveInfo,
  };
}
