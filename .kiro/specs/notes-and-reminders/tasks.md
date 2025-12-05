# Implementation Plan

- [x] 1. Install dependencies and setup database
  - Install expo-sqlite and expo-notifications packages
  - Create database migration file with schema
  - Wrap app in SQLiteProvider
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 2. Create database context and hooks
  - [x] 2.1 Create database context with CRUD operations
    - Implement note operations (get, save, delete)
    - Implement reminder operations (get, save, delete)
    - Implement indicator queries (single day, month batch)
    - _Requirements: 1.3, 2.3, 3.3, 7.3_
  
  - [x] 2.2 Create custom hooks for database access
    - Create useNote hook for single date
    - Create useReminders hook for date reminders
    - Create useDayIndicators hook for calendar markers
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 3. Setup notification system
  - [x] 3.1 Configure notification permissions
    - Request notification permissions on first use
    - Handle permission denial gracefully
    - Store permission status
    - _Requirements: 2.5, 5.4_
  
  - [x] 3.2 Create notification scheduler utility
    - Implement scheduleReminder function
    - Implement cancelReminder function
    - Handle notification scheduling errors
    - _Requirements: 2.5, 5.4, 5.5_

- [x] 4. Build note bottom sheet UI
  - [x] 4.1 Create note bottom sheet component
    - Create bottom sheet with text input (500 char limit)
    - Add character counter
    - Add save/delete buttons
    - Style to match existing theme
    - _Requirements: 1.1, 1.2, 6.1_
  
  - [x] 4.2 Add reminder toggle and time picker
    - Add "Add Reminder" toggle switch
    - Add time picker for reminder selection
    - Add timing preset buttons (day of 8am, day before 6pm, custom)
    - _Requirements: 2.1, 2.2, 3.1, 5.1_
  
  - [x] 4.3 Implement save/delete logic
    - Save note to database
    - Save reminder and schedule notification
    - Delete note and cancel associated reminders
    - Show success/error notifications
    - _Requirements: 1.3, 2.3, 3.3, 6.2, 6.3_

- [x] 5. Update calendar to show indicators
  - [x] 5.1 Add indicator rendering to calendar dates
    - Add dot indicator for notes (bottom left)
    - Add bell indicator for reminders (bottom right)
    - Load month indicators on calendar render
    - _Requirements: 1.4, 2.4, 3.4_
  
  - [x] 5.2 Handle date tap to open note sheet
    - Add onPress handler to calendar dates
    - Open note bottom sheet with selected date
    - Load existing note/reminders if present
    - _Requirements: 1.1, 1.5, 6.1_

- [x] 6. Implement platoon reminder feature
  - [x] 6.1 Create platoon reminder UI
    - Add platoon reminder option in settings (or dedicated screen)
    - Add platoon selector (A, B, C, D)
    - Add timing preset selector
    - _Requirements: 4.1, 4.2, 5.1_
  
  - [x] 6.2 Calculate and schedule platoon reminders
    - Calculate all platoon work days for next 90 days
    - Create reminder records for each day
    - Schedule notifications for all reminders
    - Show progress indicator during scheduling
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 7. Handle notification interactions
  - [x] 7.1 Setup notification listeners
    - Listen for notification received events
    - Listen for notification tapped events
    - Navigate to date when notification tapped
    - _Requirements: 2.5, 5.5_
  
  - [x] 7.2 Integrate with existing notification system
    - Use existing in-app notification component for feedback
    - Show notification when reminder fires
    - Handle notification data payload
    - _Requirements: 5.5_

- [x] 8. Add edit functionality
  - Update note content and save
  - Update reminder time and reschedule notification
  - Handle concurrent edits gracefully
  - _Requirements: 6.1, 6.4_

- [x] 9. Handle edge cases and cleanup
  - Enforce 500 character limit on notes
  - Handle multiple reminders on same date
  - Clean up notifications when reminders deleted
  - Handle app restart with scheduled reminders
  - _Requirements: 1.2, 6.3, 6.5, 7.5_
