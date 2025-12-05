# Implementation Plan

- [x] 1. Install FlashList package
  - [x] 1.1 Install @shopify/flash-list
    - Run `npm install @shopify/flash-list`
    - _Requirements: 1.1, 1.2_

- [x] 2. Add calendar constants
  - [x] 2.1 Add ESTIMATED_MONTH_HEIGHT to calendar-constants.ts
    - Calculate based on month title + days header + 6 week rows + padding (~420px)
    - _Requirements: 1.1_

- [x] 3. Update MainCalendar component
  - [x] 3.1 Replace ScrollView with FlashList
    - Import FlashList from @shopify/flash-list
    - Replace ScrollView with FlashList component
    - Add estimatedItemSize prop with ESTIMATED_MONTH_HEIGHT
    - Add keyExtractor for month items
    - Add getItemType returning 'month' for all items
    - _Requirements: 1.1, 1.3, 5.1, 5.2_
  - [x] 3.2 Update scroll-to-month logic
    - Replace measureLayout-based scrolling with FlashList scrollToIndex
    - Remove monthRefs tracking (no longer needed)
    - Update scrollToToday to use scrollToIndex with current month
    - _Requirements: 4.1, 4.2_
  - [x] 3.3 Add initialScrollIndex for scroll-to-today on mount
    - Calculate current month index from today's date
    - Pass initialScrollIndex to FlashList when shouldScrollToToday is true
    - _Requirements: 2.2_
  - [ ]* 3.4 Write property test for initial scroll index
    - **Property 1: Initial scroll targets current month**
    - **Validates: Requirements 2.2**
  - [ ]* 3.5 Write property test for scroll-to-today
    - **Property 3: Scroll-to-today targets correct month**
    - **Validates: Requirements 4.1**

- [x] 4. Update MonthView component
  - [x] 4.1 Remove ref forwarding from MonthView
    - FlashList manages item refs internally
    - Keep React.memo for performance
    - _Requirements: 5.1_

- [x] 5. Checkpoint - Verify calendar functionality
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify: scrolling, date press, platoon colors, indicators, leave highlighting

- [x] 6. Final cleanup
  - [x] 6.1 Remove unused imports and code
    - Remove ScrollView import if no longer used
    - Remove monthRefs and related measureLayout code
    - Clean up any unused effects related to old scroll logic
    - _Requirements: 5.3_
  - [ ]* 6.2 Write property test for date press
    - **Property 2: Date press returns correct date**
    - **Validates: Requirements 3.1**

- [ ] 7. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
