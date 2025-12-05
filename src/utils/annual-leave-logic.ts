// ============================================================================
// IMPORTS
// ============================================================================
import { addDays } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

import { TIMEZONE as SYDNEY_TIMEZONE } from '@/constants/timezone';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LeavePeriod {
  readonly leaveGroup: string;
  readonly leaveDate: string;
  readonly startsOn: string;
  readonly setType: LeaveSetType;
  readonly returnDate: string;
}

export type LeaveSetType = '3' | '4';

export interface SubgroupConfig {
  readonly firstCycleStart: string;
  readonly secondCycleStart: string;
}

export interface GroupConfig {
  readonly [subgroupId: string]: SubgroupConfig;
}

export interface LeaveSchedule {
  readonly [subgroupId: string]: readonly LeavePeriod[];
}

export interface ScheduleGeneratorConfig {
  readonly cycleIntervalDays: number;
  readonly set3DurationDays: number;
  readonly set3AdvanceNoticeDays: number;
  readonly set4DurationDays: number;
  readonly set4AdvanceNoticeDays: number;
}
export { SYDNEY_TIMEZONE };
const MAX_PERIODS_PER_SUBGROUP = 4;

export const GROUP_AC_CONFIG: ScheduleGeneratorConfig = {
  cycleIntervalDays: 448, // ~15 months between recurring cycles
  set3DurationDays: 29,
  set3AdvanceNoticeDays: 0, // No advance notice for Set-3 in AC groups
  set4DurationDays: 33,
  set4AdvanceNoticeDays: 4,
} as const;

export const GROUP_BD_CONFIG: ScheduleGeneratorConfig = {
  cycleIntervalDays: 448, // ~15 months between recurring cycles
  set3DurationDays: 28,
  set3AdvanceNoticeDays: 1, // 1-day advance notice for Set-3 in BD groups
  set4DurationDays: 32,
  set4AdvanceNoticeDays: 5,
} as const;

const GROUP_A_CONFIG: GroupConfig = {
  A1: { firstCycleStart: '2017-11-12', secondCycleStart: '2018-07-22' },
  A2: { firstCycleStart: '2018-06-24', secondCycleStart: '2019-03-03' },
  A3: { firstCycleStart: '2018-01-07', secondCycleStart: '2018-09-16' },
  A4: { firstCycleStart: '2018-08-19', secondCycleStart: '2019-04-28' },
  A5: { firstCycleStart: '2018-03-04', secondCycleStart: '2018-11-11' },
  A6: { firstCycleStart: '2018-10-14', secondCycleStart: '2019-06-23' },
  A7: { firstCycleStart: '2018-04-29', secondCycleStart: '2019-01-06' },
  A8: { firstCycleStart: '2018-12-09', secondCycleStart: '2019-08-18' },
} as const;

const GROUP_C_CONFIG: GroupConfig = {
  C1: { firstCycleStart: '2018-07-22', secondCycleStart: '2019-02-03' },
  C2: { firstCycleStart: '2017-12-10', secondCycleStart: '2018-06-24' },
  C3: { firstCycleStart: '2018-09-16', secondCycleStart: '2019-03-31' },
  C4: { firstCycleStart: '2018-02-04', secondCycleStart: '2018-08-19' },
  C5: { firstCycleStart: '2018-11-11', secondCycleStart: '2019-05-26' },
  C6: { firstCycleStart: '2018-04-01', secondCycleStart: '2018-10-14' },
  C7: { firstCycleStart: '2019-01-06', secondCycleStart: '2019-07-21' },
  C8: { firstCycleStart: '2018-05-27', secondCycleStart: '2018-12-09' },
} as const;

const GROUP_B_CONFIG: GroupConfig = {
  B1: { firstCycleStart: '2017-11-26', secondCycleStart: '2018-08-05' },
  B2: { firstCycleStart: '2018-07-08', secondCycleStart: '2019-03-17' },
  B3: { firstCycleStart: '2018-01-21', secondCycleStart: '2018-09-30' },
  B4: { firstCycleStart: '2018-09-02', secondCycleStart: '2019-05-12' },
  B5: { firstCycleStart: '2018-03-18', secondCycleStart: '2018-11-25' },
  B6: { firstCycleStart: '2018-10-28', secondCycleStart: '2019-07-07' },
  B7: { firstCycleStart: '2018-05-13', secondCycleStart: '2019-01-20' },
  B8: { firstCycleStart: '2018-12-23', secondCycleStart: '2019-09-01' },
} as const;

const GROUP_D_CONFIG: GroupConfig = {
  D1: { firstCycleStart: '2018-08-05', secondCycleStart: '2019-02-17' },
  D2: { firstCycleStart: '2017-12-24', secondCycleStart: '2018-07-08' },
  D3: { firstCycleStart: '2018-09-30', secondCycleStart: '2019-04-14' },
  D4: { firstCycleStart: '2018-02-18', secondCycleStart: '2018-09-02' },
  D5: { firstCycleStart: '2018-11-25', secondCycleStart: '2019-06-09' },
  D6: { firstCycleStart: '2018-04-15', secondCycleStart: '2018-10-28' },
  D7: { firstCycleStart: '2019-01-20', secondCycleStart: '2019-08-04' },
  D8: { firstCycleStart: '2018-06-10', secondCycleStart: '2018-12-23' },
} as const;

export const GROUP_CONFIGS: Readonly<Record<string, GroupConfig>> = {
  A: GROUP_A_CONFIG,
  B: GROUP_B_CONFIG,
  C: GROUP_C_CONFIG,
  D: GROUP_D_CONFIG,
} as const;

// ============================================================================
// DATE UTILITIES (Using date-fns-tz)
// ============================================================================

/**
 * Parses an ISO date string (YYYY-MM-DD) as a date in the configured timezone
 */
function parseDateString(dateString: string): Date {
  return fromZonedTime(`${dateString} 00:00:00`, SYDNEY_TIMEZONE);
}

/**
 * Formats a Date as ISO string (YYYY-MM-DD) in the configured timezone
 */
function formatDateISO(date: Date): string {
  return formatInTimeZone(date, SYDNEY_TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Gets current date in the configured timezone
 */
export function getCurrentDate(): Date {
  return toZonedTime(new Date(), SYDNEY_TIMEZONE);
}

/**
 * Parses an ISO date string (YYYY-MM-DD) as a date in the configured timezone
 */
export function parseDate(dateString: string): Date {
  return parseDateString(dateString);
}

/**
 * Generates the next 5 recurring dates from a cycle start, including any ongoing period
 */
function getNext5CycleDates(
  cycleStartDate: string,
  intervalDays: number,
  currentDate: Date,
): Date[] {
  const start = parseDateString(cycleStartDate);
  const results: Date[] = [];

  // Calculate how many complete cycles have passed since the start
  const daysSinceStart = Math.floor(
    (currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const cyclesPassed = Math.floor(daysSinceStart / intervalDays);

  // Start from 2 cycles before the calculated point as a safety net for better coverage
  let currentCycle = Math.max(0, cyclesPassed - 2);

  // Generate dates until we have 5 that are relevant (ongoing or future)
  while (results.length < 5) {
    const cycleDate = addDays(start, currentCycle * intervalDays);

    // Include if it's ongoing or in the future (we'll filter later in the calling code)
    results.push(new Date(cycleDate));
    currentCycle++;
  }

  return results;
}

// ============================================================================
// CORE BUSINESS LOGIC
// ============================================================================

export class LeaveScheduleGenerator {
  private readonly currentDate: Date;

  constructor(currentDate: Date = getCurrentDate()) {
    this.currentDate = currentDate;
  }

  /**
   * Gets the appropriate config for a group
   */
  private getConfigForGroup(groupId: string): ScheduleGeneratorConfig {
    return groupId === 'B' || groupId === 'D'
      ? GROUP_BD_CONFIG
      : GROUP_AC_CONFIG;
  }

  /**
   * Generates all leave periods for a group
   */
  generateSchedule(groupId: string): LeaveSchedule {
    const groupConfig = GROUP_CONFIGS[groupId];

    const config = this.getConfigForGroup(groupId);
    const schedule: { [key: string]: LeavePeriod[] } = {};

    for (const [subgroupId, subgroupConfig] of Object.entries(groupConfig)) {
      schedule[subgroupId] = this.generateSubgroupSchedule(
        subgroupId,
        subgroupConfig,
        config,
      );
    }

    return schedule as LeaveSchedule;
  }

  /**
   * Generates leave periods for a single subgroup
   */
  private generateSubgroupSchedule(
    subgroupId: string,
    subgroupConfig: SubgroupConfig,
    config: ScheduleGeneratorConfig,
  ): LeavePeriod[] {
    const periods: LeavePeriod[] = [];

    const firstCycleDates = getNext5CycleDates(
      subgroupConfig.firstCycleStart,
      config.cycleIntervalDays,
      this.currentDate,
    );

    const secondCycleDates = getNext5CycleDates(
      subgroupConfig.secondCycleStart,
      config.cycleIntervalDays,
      this.currentDate,
    );

    // Create Set-3 periods from first cycle
    for (const date of firstCycleDates) {
      const period = this.createLeavePeriod(subgroupId, date, '3', config);
      if (this.isRelevantPeriod(period)) {
        periods.push(period);
      }
    }

    // Create Set-4 periods from second cycle
    for (const date of secondCycleDates) {
      const period = this.createLeavePeriod(subgroupId, date, '4', config);
      if (this.isRelevantPeriod(period)) {
        periods.push(period);
      }
    }

    // Sort by leave date and take the first 4
    periods.sort((a, b) => a.leaveDate.localeCompare(b.leaveDate));

    return periods.slice(0, MAX_PERIODS_PER_SUBGROUP);
  }

  /**
   * Creates a leave period (Set-3 or Set-4)
   */
  private createLeavePeriod(
    subgroupId: string,
    leaveDate: Date,
    setType: LeaveSetType,
    config: ScheduleGeneratorConfig,
  ): LeavePeriod {
    const isSet3 = setType === '3';
    const advanceNoticeDays = isSet3
      ? config.set3AdvanceNoticeDays
      : config.set4AdvanceNoticeDays;
    const durationDays = isSet3
      ? config.set3DurationDays
      : config.set4DurationDays;

    return {
      leaveGroup: subgroupId,
      leaveDate: formatDateISO(leaveDate),
      startsOn: formatDateISO(addDays(leaveDate, -advanceNoticeDays)),
      setType,
      returnDate: formatDateISO(addDays(leaveDate, durationDays)),
    };
  }

  /**
   * Checks if a period is relevant based on return date
   */
  private isRelevantPeriod(period: LeavePeriod): boolean {
    const returnDate = parseDateString(period.returnDate);
    return returnDate >= this.currentDate;
  }

  /**
   * Returns available group IDs
   */
  static getAvailableGroups(): readonly string[] {
    return ['A', 'B', 'C', 'D'] as const;
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR CONSUMERS
// ============================================================================

/**
 * Helper to check if a leave period is currently active
 */
export function isActivePeriod(
  period: LeavePeriod,
  checkDate: Date = getCurrentDate(),
): boolean {
  const startsOn = parseDateString(period.startsOn);
  const returnDate = parseDateString(period.returnDate);
  return checkDate >= startsOn && checkDate < returnDate;
}

/**
 * Helper to get all active periods at a given date
 */
export function getActivePeriods(
  schedule: LeaveSchedule,
  checkDate: Date = getCurrentDate(),
): LeavePeriod[] {
  return Object.values(schedule)
    .flat()
    .filter((period) => isActivePeriod(period, checkDate));
}

/**
 * Helper to get all ongoing leave groups across all groups
 */
export function getAllOngoingLeaveGroups(
  checkDate: Date = getCurrentDate(),
): LeavePeriod[] {
  const generator = new LeaveScheduleGenerator(checkDate);
  const allActivePeriods: LeavePeriod[] = [];

  // Generate schedules for all groups and collect active periods
  for (const groupId of LeaveScheduleGenerator.getAvailableGroups()) {
    const schedule = generator.generateSchedule(groupId);
    const activePeriods = getActivePeriods(schedule, checkDate);
    allActivePeriods.push(...activePeriods);
  }

  // Sort by leave date for consistent ordering
  return allActivePeriods.sort((a, b) =>
    a.leaveDate.localeCompare(b.leaveDate),
  );
}

/**
 * Helper to get all next approaching leave groups across all groups
 */
export function getAllNextApproachingLeaveGroups(
  checkDate: Date = getCurrentDate(),
): LeavePeriod[] {
  const generator = new LeaveScheduleGenerator(checkDate);
  const nextPeriodsPerGroup: LeavePeriod[] = [];

  // Generate schedules for all groups and collect the first upcoming period for each group
  for (const groupId of LeaveScheduleGenerator.getAvailableGroups()) {
    const schedule = generator.generateSchedule(groupId);

    // Get all upcoming periods for this group across all subgroups
    const allUpcomingPeriodsForGroup = Object.values(schedule)
      .flat()
      .filter((period) => {
        const leaveDate = parseDateString(period.leaveDate);
        return leaveDate > checkDate; // Future leave dates only
      })
      .sort((a, b) => a.leaveDate.localeCompare(b.leaveDate));

    // Take the first (earliest) upcoming period for this group
    if (allUpcomingPeriodsForGroup.length > 0) {
      nextPeriodsPerGroup.push(allUpcomingPeriodsForGroup[0]);
    }
  }

  // Sort by leave date for consistent ordering
  return nextPeriodsPerGroup.sort((a, b) =>
    a.leaveDate.localeCompare(b.leaveDate),
  );
}
