import {
  getAllNextApproachingLeaveGroups,
  getAllOngoingLeaveGroups,
  getCurrentDate,
  type LeavePeriod,
  parseDate,
} from '@/utils/annual-leave-logic';
import { addDays } from 'date-fns';

export type AlertType = 'return-to-work' | 'last-shifts';

export interface AlertInfo {
  type: AlertType;
  message: string;
  leaveGroup: string;
  relevantDate: string;
  platoonLetter: string;
}

export class AlertCalculator {
  private static readonly PLATOON_ROTATION = [
    'A',
    'D',
    'A',
    'D',
    'C',
    'B',
    'C',
    'B',
  ];
  private static readonly ROTATION_START_DATE = new Date(2024, 0, 5);
  private static readonly cache = new Map<string, AlertInfo | null>();
  private static readonly CACHE_TTL = 5 * 60 * 1000;
  private static lastCacheCleanup = Date.now();

  private readonly currentDate: Date;
  private readonly currentPlatoon: string;

  constructor(currentDate: Date = getCurrentDate(), currentPlatoon?: string) {
    this.currentDate = this.validateDate(currentDate);
    this.currentPlatoon =
      currentPlatoon || this.detectCurrentPlatoon(this.currentDate);
  }

  private validateDate(date: Date): Date {
    if (!date || isNaN(date.getTime())) {
      console.warn('Invalid currentDate provided, using current date');
      return getCurrentDate();
    }
    return date;
  }

  calculateAlert(): AlertInfo | null {
    this.cleanupCache();

    const cacheKey = `${this.currentDate.toISOString().split('T')[0]}-${this.currentPlatoon}`;
    const cached = AlertCalculator.cache.get(cacheKey);
    if (cached !== undefined) return cached;

    try {
      const alert =
        this.checkReturnToWorkAlert() || this.checkLastShiftsAlert();
      AlertCalculator.cache.set(cacheKey, alert);
      return alert;
    } catch (error) {
      console.warn('Error calculating alert:', error);
      return null;
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    if (now - AlertCalculator.lastCacheCleanup > AlertCalculator.CACHE_TTL) {
      AlertCalculator.cache.clear();
      AlertCalculator.lastCacheCleanup = now;
    }
  }

  private detectCurrentPlatoon(date: Date): string {
    try {
      const diffTime =
        date.getTime() - AlertCalculator.ROTATION_START_DATE.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      let rotationIndex = diffDays % 8;
      if (rotationIndex < 0) rotationIndex += 8;

      return AlertCalculator.PLATOON_ROTATION[rotationIndex];
    } catch (error) {
      console.warn('Failed to detect current platoon, defaulting to A:', error);
      return 'A';
    }
  }

  private checkReturnToWorkAlert(): AlertInfo | null {
    try {
      const ongoingLeaveGroups = getAllOngoingLeaveGroups(this.currentDate);

      for (const period of ongoingLeaveGroups) {
        if (!this.isValidPeriod(period)) {
          continue;
        }

        const returnDate = parseDate(period.returnDate);
        if (!returnDate || isNaN(returnDate.getTime())) continue;

        const dayBeforeReturn = addDays(returnDate, -1);

        // Check if today is the day before return (and the return date is a platoon day for this group)
        if (this.isSameDate(this.currentDate, dayBeforeReturn)) {
          if (this.isRelevantToPlatoonOnDate(period, returnDate)) {
            return this.createAlert(
              'return-to-work',
              period,
              returnDate,
              'back at work tomorrow',
            );
          }
        }

        // Check if today is the return date itself (and it's a platoon day for this group)
        if (this.isSameDate(this.currentDate, returnDate)) {
          if (this.isRelevantToPlatoonOnDate(period, returnDate)) {
            return this.createAlert(
              'return-to-work',
              period,
              returnDate,
              'back at work today',
            );
          }
        }
      }
    } catch (error) {
      console.warn('Error checking return-to-work alerts:', error);
    }
    return null;
  }

  private checkLastShiftsAlert(): AlertInfo | null {
    try {
      const approachingLeaveGroups = getAllNextApproachingLeaveGroups(
        this.currentDate,
      );

      for (const period of approachingLeaveGroups) {
        if (!this.isValidPeriod(period)) {
          continue;
        }

        const leaveStartDate = parseDate(period.leaveDate);
        if (!leaveStartDate || isNaN(leaveStartDate.getTime())) continue;

        // Find the last 2 work days for this group before leave starts
        const lastWorkDays = this.getLastTwoWorkDays(
          leaveStartDate,
          period.leaveGroup.charAt(0),
        );

        if (lastWorkDays.length === 2) {
          const firstShift = lastWorkDays[0];
          const secondShift = lastWorkDays[1];
          const dayOff = addDays(firstShift, 1);

          // Check if current date falls within the 3-day alert window
          if (this.isSameDate(this.currentDate, firstShift)) {
            // First shift day
            if (this.isRelevantToPlatoon(period)) {
              return this.createAlert(
                'last-shifts',
                period,
                leaveStartDate,
                'last set before annuals',
              );
            }
          } else if (this.isSameDate(this.currentDate, dayOff)) {
            // Day off between shifts
            if (this.isRelevantToPlatoonOnDate(period, firstShift)) {
              return this.createAlert(
                'last-shifts',
                period,
                leaveStartDate,
                'last set before annuals',
              );
            }
          } else if (this.isSameDate(this.currentDate, secondShift)) {
            // Second (final) shift day
            if (this.isRelevantToPlatoon(period)) {
              return this.createAlert(
                'last-shifts',
                period,
                leaveStartDate,
                'last set before annuals',
              );
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error checking last shifts alerts:', error);
    }
    return null;
  }

  private isValidPeriod(period: LeavePeriod): boolean {
    return !!(period?.leaveGroup && (period.leaveDate || period.returnDate));
  }

  private createAlert(
    type: AlertType,
    period: LeavePeriod,
    date: Date,
    action: string,
  ): AlertInfo {
    const relevantDate =
      type === 'return-to-work' ? period.returnDate : period.leaveDate;
    return {
      type,
      message: `${period.leaveGroup} ${action}`,
      leaveGroup: period.leaveGroup,
      relevantDate: relevantDate || period.leaveDate || period.returnDate,
      platoonLetter: period.leaveGroup.charAt(0),
    };
  }

  private isRelevantToPlatoon(period: LeavePeriod): boolean {
    try {
      return period?.leaveGroup?.charAt(0) === this.currentPlatoon;
    } catch (error) {
      console.warn('Error checking platoon relevance:', error);
      return false;
    }
  }

  private isRelevantToPlatoonOnDate(period: LeavePeriod, date: Date): boolean {
    try {
      const platoonOnDate = this.detectCurrentPlatoon(date);
      return period?.leaveGroup?.charAt(0) === platoonOnDate;
    } catch (error) {
      console.warn('Error checking platoon relevance for date:', error);
      return false;
    }
  }

  private getLastTwoWorkDays(
    leaveStartDate: Date,
    platoonLetter: string,
  ): Date[] {
    const workDays: Date[] = [];
    let checkDate = addDays(leaveStartDate, -1);

    // Look back up to 10 days to find the last 2 work days
    for (let i = 0; i < 10 && workDays.length < 2; i++) {
      const platoonOnDate = this.detectCurrentPlatoon(checkDate);

      if (platoonOnDate === platoonLetter) {
        workDays.unshift(checkDate); // Add to beginning to maintain chronological order
      }

      checkDate = addDays(checkDate, -1);
    }

    return workDays;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static clearCache(): void {
    AlertCalculator.cache.clear();
    AlertCalculator.lastCacheCleanup = Date.now();
  }
}

export function getCurrentAlert(): AlertInfo | null {
  try {
    return new AlertCalculator().calculateAlert();
  } catch (error) {
    console.warn('Error getting current alert:', error);
    return null;
  }
}

export function getAlertForDate(
  date: Date,
  platoon?: string,
): AlertInfo | null {
  try {
    return new AlertCalculator(date, platoon).calculateAlert();
  } catch (error) {
    console.warn('Error getting alert for date:', error);
    return null;
  }
}
