# Requirements Document

## Introduction

This feature optimizes the main calendar's scroll performance by replacing the current ScrollView implementation with Shopify's FlashList. The calendar currently renders all 12 months upfront, causing slow navigation and janky scrolling. FlashList virtualizes the list, rendering only visible months plus a small buffer, dramatically improving performance while maintaining the existing UX.

## Glossary

- **FlashList**: Shopify's high-performance list component that virtualizes rendering, only mounting visible items
- **Virtualization**: Technique where only visible list items are rendered, with off-screen items recycled
- **estimatedItemSize**: FlashList prop that hints at item height for optimal scroll performance
- **Month View**: A calendar component displaying a single month with its weeks and days
- **Recycling**: FlashList's mechanism of reusing unmounted item components for new items

## Requirements

### Requirement 1

**User Story:** As a user, I want the calendar to scroll smoothly when navigating through months, so that I can quickly find dates without lag.

#### Acceptance Criteria

1. WHEN the user scrolls through the calendar THEN the Calendar_System SHALL render only visible months plus a small buffer
2. WHEN the user performs rapid scrolling THEN the Calendar_System SHALL maintain smooth 60fps performance
3. WHEN months scroll off-screen THEN the Calendar_System SHALL recycle those components for incoming months

### Requirement 2

**User Story:** As a user, I want the calendar to load quickly when I open it, so that I can start using it immediately.

#### Acceptance Criteria

1. WHEN the calendar screen mounts THEN the Calendar_System SHALL render only the initially visible months
2. WHEN the calendar initializes THEN the Calendar_System SHALL scroll to the current month without rendering all 12 months first
3. WHEN year navigation occurs THEN the Calendar_System SHALL update the list data without full re-render

### Requirement 3

**User Story:** As a user, I want to tap on any date to view its details, so that I can manage my notes and timesheets.

#### Acceptance Criteria

1. WHEN a user taps a date cell THEN the Calendar_System SHALL trigger the onDatePress callback with the correct date
2. WHEN FlashList recycles a month component THEN the Calendar_System SHALL maintain correct date press handling
3. WHEN indicators update (notes/timesheets) THEN the Calendar_System SHALL reflect changes in visible months

### Requirement 4

**User Story:** As a user, I want the "scroll to today" feature to work reliably, so that I can quickly return to the current date.

#### Acceptance Criteria

1. WHEN the user triggers scroll-to-today THEN the Calendar_System SHALL scroll to the current month using FlashList's scrollToIndex
2. WHEN the current month is already visible THEN the Calendar_System SHALL not perform unnecessary scrolling
3. WHEN year changes during scroll-to-today THEN the Calendar_System SHALL update data and scroll to correct month

### Requirement 5

**User Story:** As a developer, I want the FlashList integration to follow existing code patterns, so that the codebase remains maintainable.

#### Acceptance Criteria

1. WHEN implementing FlashList THEN the Calendar_System SHALL use the existing MonthView component as the renderItem
2. WHEN configuring FlashList THEN the Calendar_System SHALL provide getItemType for consistent month rendering
3. WHEN FlashList is integrated THEN the Calendar_System SHALL maintain all existing calendar features (platoon colors, pay days, leave highlighting)
