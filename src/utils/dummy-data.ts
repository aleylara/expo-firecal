import { CreateNoteInput, CreateTimesheetInput } from '@/types/notes';
import {
  addDaysInSydney,
  createTimezoneDate,
  formatDateToString,
} from '@/constants/timezone';

/**
 * Generates dummy data for testing purposes
 * Creates random notes and timesheets for the specified year
 */
export async function generateDummyData(
  createNote: (date: string, data: CreateNoteInput) => Promise<string>,
  createTimesheet: (
    date: string,
    data: CreateTimesheetInput,
  ) => Promise<string>,
  year: number,
  notesCount: number,
  timesheetsCount: number,
) {
  const stations = [
    '001',
    '002',
    '003',
    '004',
    '005',
    '010',
    '012',
    '015',
    '020',
    '025',
  ];
  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Long Service', 'Training'];

  // Helper to get random date in year
  const getRandomDateInYear = () => {
    const start = createTimezoneDate(year, 0, 1);
    const end = createTimezoneDate(year, 11, 31);
    const daysDiff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const randomDays = Math.floor(Math.random() * daysDiff);
    return addDaysInSydney(start, randomDays);
  };

  // Keep track of used dates to avoid unique constraint violations
  const usedNoteDates = new Set<string>();
  const usedTimesheetDates = new Set<string>();

  // Generate Notes
  let notesCreated = 0;
  let attempts = 0;
  const maxAttempts = notesCount * 5; // Prevent infinite loops

  while (notesCreated < notesCount && attempts < maxAttempts) {
    attempts++;
    const date = getRandomDateInYear();
    const dateStr = formatDateToString(date);

    if (usedNoteDates.has(dateStr)) continue;

    try {
      await createNote(dateStr, {
        title: `Test Note ${notesCreated + 1}`,
        content: `This is a randomly generated note for ${dateStr}. \n\nIt has some content to test the display.`,
      });
      usedNoteDates.add(dateStr);
      notesCreated++;
    } catch (e) {
      // Ignore if it fails (likely due to existing data if not cleared)
      console.log(`Failed to create note for ${dateStr}:`, e);
    }
  }

  // Generate Timesheets
  let timesheetsCreated = 0;
  attempts = 0;
  const maxTimesheetAttempts = timesheetsCount * 5;

  while (
    timesheetsCreated < timesheetsCount &&
    attempts < maxTimesheetAttempts
  ) {
    attempts++;
    const date = getRandomDateInYear();
    const dateStr = formatDateToString(date);

    if (usedTimesheetDates.has(dateStr)) continue;

    try {
      const isLeave = Math.random() < 0.2;

      if (isLeave) {
        await createTimesheet(dateStr, {
          taken_leave:
            leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
          total_hours: 24,
        });
      } else {
        const startHour = 8 + Math.floor(Math.random() * 4); // 08:00 - 12:00
        const duration = 8 + Math.floor(Math.random() * 6); // 8 - 14 hours
        const endHour = startHour + duration;

        const startTime = `${startHour.toString().padStart(2, '0')}00`;
        const finishTime = `${(endHour % 24).toString().padStart(2, '0')}00`;

        await createTimesheet(dateStr, {
          overtime_shift: Math.random() < 0.3,
          total_hours: duration,
          from_station: stations[Math.floor(Math.random() * stations.length)],
          to_station: stations[Math.floor(Math.random() * stations.length)],
          return_kms: Math.floor(Math.random() * 50),
          start_time: startTime,
          finish_time: finishTime,
          comments: Math.random() < 0.5 ? 'Generated shift data' : null,
        });
      }
      usedTimesheetDates.add(dateStr);
      timesheetsCreated++;
    } catch (e) {
      console.log(`Failed to create timesheet for ${dateStr}:`, e);
    }
  }
}
