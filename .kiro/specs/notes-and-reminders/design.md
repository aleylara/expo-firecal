# Design Document

## Overview

Add notes and reminders to the firefighter shift calendar using SQLite for storage and Expo Notifications for alerts. Keep it simple - one database file, two tables, minimal UI changes.

## Architecture

**Data Layer:**
- SQLite database (`firecal.db`)
- Two tables: `notes` and `reminders`
- Database context provider wrapping the app

**UI Layer:**
- New bottom sheet for note/reminder editing
- Dot/bell indicators on calendar dates
- Reuse existing notification system for alerts

**Notification Layer:**
- Expo Notifications for local scheduling
- Integrate with existing in-app notification system

## Components and Interfaces

### Database Schema

```sql
-- Notes table
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,  -- YYYY-MM-DD format
  content TEXT NOT NULL,       -- Max 500 chars
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Reminders table
CREATE TABLE reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,          -- YYYY-MM-DD format
  title TEXT NOT NULL,
  note_id INTEGER,             -- NULL for standalone reminders
  reminder_time TEXT NOT NULL, -- ISO datetime string
  timing_type TEXT NOT NULL,   -- 'day_of_8am' | 'day_before_6pm' | 'custom'
  platoon TEXT,                -- NULL or 'A' | 'B' | 'C' | 'D' for recurring
  notification_id TEXT,        -- Expo notification ID
  created_at TEXT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE INDEX idx_notes_date ON notes(date);
CREATE INDEX idx_reminders_date ON reminders(date);
CREATE INDEX idx_reminders_note_id ON reminders(note_id);
```

### TypeScript Types

```typescript
// types/database.ts
export interface Note {
  id: number;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: number;
  date: string;
  title: string;
  note_id: number | null;
  reminder_time: string;
  timing_type: 'day_of_8am' | 'day_before_6pm' | 'custom';
  platoon: 'A' | 'B' | 'C' | 'D' | null;
  notification_id: string | null;
  created_at: string;
}

export interface DayIndicators {
  hasNote: boolean;
  hasReminder: boolean;
}
```

### Database Context

```typescript
// contexts/database-context.tsx
interface DatabaseContextType {
  // Notes
  getNote: (date: string) => Promise<Note | null>;
  saveNote: (date: string, content: string) => Promise<void>;
  deleteNote: (date: string) => Promise<void>;
  
  // Reminders
  getReminders: (date: string) => Promise<Reminder[]>;
  saveReminder: (reminder: Omit<Reminder, 'id' | 'created_at'>) => Promise<void>;
  deleteReminder: (id: number) => Promise<void>;
  
  // Indicators
  getDayIndicators: (date: string) => Promise<DayIndicators>;
  getMonthIndicators: (year: number, month: number) => Promise<Map<string, DayIndicators>>;
}
```

### Note Bottom Sheet Component

```typescript
// components/bottomsheet/note-bottom-sheet.tsx
interface NoteBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  selectedDate: string | null;
  onClose: () => void;
}

// Features:
// - Text input (500 char limit)
// - Toggle for "Add Reminder"
// - Reminder time picker (if toggled)
// - Save/Delete buttons
// - Character counter
```

### Calendar Date Indicators

```typescript
// Update calendar day cell to show:
// - Small dot (bottom left) if note exists
// - Small bell icon (bottom right) if reminder exists
// - Both if both exist
```

### Notification Scheduling

```typescript
// utils/notification-scheduler.ts
export async function scheduleReminder(reminder: Reminder): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.note_id ? 'Tap to view note' : '',
      data: { reminderId: reminder.id, date: reminder.date },
    },
    trigger: new Date(reminder.reminder_time),
  });
  return notificationId;
}

export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
```

## Data Models

### Note Flow
1. User taps calendar date
2. Note bottom sheet opens
3. User types note (max 500 chars)
4. User saves → writes to SQLite
5. Calendar shows dot indicator

### Standalone Reminder Flow
1. User taps calendar date
2. Note bottom sheet opens
3. User toggles "Add Reminder" (without note)
4. User sets reminder time
5. User saves → writes to SQLite + schedules notification
6. Calendar shows bell indicator

### Note + Reminder Flow
1. User taps calendar date
2. Note bottom sheet opens
3. User types note
4. User toggles "Add Reminder"
5. User sets reminder time
6. User saves → writes note + reminder to SQLite + schedules notification
7. Calendar shows both dot and bell indicators

### Platoon Reminder Flow
1. User opens settings
2. User selects "Platoon Reminder"
3. User picks platoon (A/B/C/D)
4. User sets timing (e.g., "Day before at 6pm")
5. App calculates all matching work days for the remainder of the year
6. App creates reminder records + schedules notifications
7. Calendar shows bell indicators on all platoon work days

## Error Handling

- Database errors: Log and show notification to user
- Notification permission denied: Show alert, disable reminder features
- Invalid dates: Validate before saving
- Character limit exceeded: Disable save button
- Failed notification scheduling: Save reminder but mark as failed

## Testing Strategy

**Manual Testing:**
1. Create note → verify dot appears
2. Create reminder → verify bell appears
3. Create note + reminder → verify both appear
4. Delete note → verify dot disappears
5. Delete reminder → verify bell disappears
6. Wait for reminder → verify notification fires
7. Create platoon reminder → verify multiple bells appear
8. Edit note → verify updates persist
9. Edit reminder time → verify notification reschedules

**Edge Cases:**
- 500 character limit enforcement
- Multiple reminders on same date
- Deleting note with attached reminder
- App restart with scheduled reminders
- Notification permission changes

## Implementation Notes

**Dependencies to install:**
```bash
npx expo install expo-sqlite expo-notifications
```

**Database initialization:**
- Wrap app in SQLiteProvider
- Run migration on first launch
- Use WAL mode for better concurrency

**Notification permissions:**
- Request on first reminder creation
- Handle permission denial gracefully
- Show settings prompt if denied

**Performance:**
- Load month indicators in batch (one query)
- Cache indicators in memory
- Debounce text input saves
- Use transactions for multi-row operations

**UI/UX:**
- Reuse existing theme colors
- Match existing bottom sheet style
- Use existing notification system for feedback
- Keep character counter subtle
- Disable save button while saving
