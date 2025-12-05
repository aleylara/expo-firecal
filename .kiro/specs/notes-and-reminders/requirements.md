# Requirements Document

## Introduction

Add note-taking and reminder functionality to the firefighter shift calendar app. Users can add notes to specific dates and set reminders that trigger notifications. Keep it simple - SQLite for storage, local notifications, minimal UI.

## Glossary

- **App**: The firefighter shift calendar React Native application
- **User**: A firefighter using the app to track shifts
- **Note**: Text content (max 500 chars) attached to a specific date
- **Reminder**: A notification that fires at a specified time
- **Standalone Reminder**: A reminder without an attached note
- **Platoon**: Work group (A, B, C, or D) with rotating shift schedules
- **SQLite Database**: Local database for storing notes and reminders

## Requirements

### Requirement 1: Add Notes to Calendar Dates

**User Story:** As a firefighter, I want to add notes to specific dates so that I can remember important shift details or personal reminders.

#### Acceptance Criteria

1. WHEN the User taps a calendar date, THE App SHALL display a bottom sheet with note input
2. THE App SHALL allow the User to enter up to 500 characters of text
3. WHEN the User saves a note, THE App SHALL store the note in the SQLite Database
4. WHEN a date has a note, THE App SHALL display a dot indicator on that calendar date
5. WHEN the User taps a date with an existing note, THE App SHALL display the saved note for editing

### Requirement 2: Create Standalone Reminders

**User Story:** As a firefighter, I want to set reminders for specific dates without writing a note so that I get notified about important events.

#### Acceptance Criteria

1. WHEN the User opens the note bottom sheet, THE App SHALL provide an option to add a reminder
2. THE App SHALL allow the User to set a reminder time (date + time)
3. WHEN the User saves a standalone reminder, THE App SHALL store it in the SQLite Database
4. WHEN a date has a reminder, THE App SHALL display a bell indicator on that calendar date
5. WHEN the reminder time arrives, THE App SHALL trigger a local notification

### Requirement 3: Attach Reminders to Notes

**User Story:** As a firefighter, I want to attach a reminder to my note so that I get notified about the note content at a specific time.

#### Acceptance Criteria

1. WHEN the User is editing a note, THE App SHALL provide an option to add a reminder
2. THE App SHALL allow the User to toggle reminder on/off for the note
3. WHEN a reminder is attached to a note, THE App SHALL store the relationship in the SQLite Database
4. WHEN the reminder fires, THE App SHALL display the note content in the notification
5. WHEN a date has both note and reminder, THE App SHALL display both dot and bell indicators

### Requirement 4: Set Reminders for Platoon Work Days

**User Story:** As a firefighter, I want to set a recurring reminder for all my platoon work days so that I get notified before each shift.

#### Acceptance Criteria

1. THE App SHALL provide an option to create a platoon-based reminder
2. THE App SHALL allow the User to select a platoon (A, B, C, or D)
3. THE App SHALL allow the User to set a reminder time offset (e.g., "1 hour before shift")
4. WHEN the User saves a platoon reminder, THE App SHALL calculate all matching work days
5. THE App SHALL schedule notifications for all calculated platoon work days

### Requirement 5: Configure Reminder Timing

**User Story:** As a firefighter, I want to choose when my reminders fire so that I get notified at the most useful time.

#### Acceptance Criteria

1. THE App SHALL provide reminder timing options: "On the day at 8am", "Day before at 6pm", "1 hour before", "Custom time"
2. WHEN the User selects a timing option, THE App SHALL calculate the notification time
3. THE App SHALL store the reminder timing preference in the SQLite Database
4. THE App SHALL schedule the notification at the calculated time
5. WHEN the notification fires, THE App SHALL display the reminder title and content

### Requirement 6: Manage Notes and Reminders

**User Story:** As a firefighter, I want to edit or delete my notes and reminders so that I can keep my calendar organized.

#### Acceptance Criteria

1. WHEN the User opens a note, THE App SHALL provide edit and delete options
2. WHEN the User deletes a note, THE App SHALL remove it from the SQLite Database
3. WHEN the User deletes a note with a reminder, THE App SHALL cancel the scheduled notification
4. WHEN the User edits a reminder time, THE App SHALL reschedule the notification
5. THE App SHALL remove the dot/bell indicators when notes/reminders are deleted

### Requirement 7: Store Data in SQLite

**User Story:** As a developer, I want to use SQLite for data storage so that notes and reminders persist across app restarts.

#### Acceptance Criteria

1. THE App SHALL create a SQLite database on first launch
2. THE App SHALL create tables for notes and reminders
3. WHEN the User saves data, THE App SHALL write to the SQLite Database
4. WHEN the App launches, THE App SHALL load existing notes and reminders from the database
5. THE App SHALL handle database errors without crashing
