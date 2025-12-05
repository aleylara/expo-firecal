/**
 * Hook for managing annual leave schedule
 *
 * Provides:
 * - User's leave periods based on platoon and number
 * - Loading and error states
 * - Methods to reload schedule and update user group
 */
import {
  LeaveScheduleGenerator,
  type LeavePeriod,
} from '@/utils/annual-leave-logic';
import type { GroupLetter } from '@/contexts/theme-context';
import { useCallback, useEffect, useState } from 'react';

interface UseLeaveScheduleReturn {
  userLeaveSchedule: LeavePeriod[];
  loading: boolean;
  error: string | null;
  reloadSchedule: () => void;
  setUserGroup: (group: GroupLetter, number: number) => void;
}

export function useLeaveSchedule(
  userGroup: GroupLetter,
  userNumber: number,
): UseLeaveScheduleReturn {
  const [userLeaveSchedule, setUserLeaveSchedule] = useState<LeavePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserSchedule = useCallback(async () => {
    if (loading) return; // Prevent concurrent loads

    setLoading(true);
    setError(null);

    try {
      const generator = new LeaveScheduleGenerator();
      const schedule = generator.generateSchedule(userGroup);
      const subgroupId = `${userGroup}${userNumber}`;

      if (schedule[subgroupId]) {
        setUserLeaveSchedule([...schedule[subgroupId]]);
      } else {
        // No schedule found for this subgroup
        console.warn(`No leave schedule found for group ${subgroupId}`);
        setUserLeaveSchedule([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load leave schedule';
      console.error('Error loading user schedule:', err);
      setError(errorMessage);
      setUserLeaveSchedule([]);
    } finally {
      setLoading(false);
    }
  }, [userGroup, userNumber, loading]);

  const reloadSchedule = useCallback(() => {
    loadUserSchedule();
  }, [loadUserSchedule]);

  const handleSetUserGroup = useCallback(
    (group: GroupLetter, number: number) => {
      // The dependency on userGroup and userNumber will trigger reloadSchedule
      // This is just a placeholder for the return interface
      loadUserSchedule();
    },
    [loadUserSchedule],
  );

  // Load schedule when user group or number changes
  useEffect(() => {
    loadUserSchedule();
  }, [loadUserSchedule]);

  return {
    userLeaveSchedule,
    loading,
    error,
    reloadSchedule,
    setUserGroup: handleSetUserGroup,
  };
}
