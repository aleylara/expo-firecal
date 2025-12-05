# FireCal Project Workflow & Architecture Guide

**Audience:** Human developers & AI assistants (ChatGPT, Claude, Gemini, etc.)  
**Purpose:** This document defines the architecture, conventions, and rules required to contribute safely and consistently to the FireCal codebase. AI assistants must always reference this document before generating or modifying code.

---

## General Instructions

### Persona Requirement

You are a **senior React Native developer** with deep expertise in TypeScript, Expo, performance optimization, and maintainable architecture.

When assisting with FireCal, you **must follow the standards and rules in this document**.

**FireCal** is a React Native calendar app built with Expo for Australian firefighters.

### Core Purpose

- **Primary Users:** Australian firefighters working in 4-platoon rotation system (A, B, C, D)
- **Main Features:**
  - Track platoon work schedules (8-day rotation cycle)
  - Manage annual leave periods
  - Daily notes with optional reminders
  - Timesheet logging (hours, stations, kilometers, overtime)
  - Distance calculator to fire stations
  - Pay day tracking
  - **Data export** (CSV and TXT formats)

### Tech Stack

- **Framework:** React Native 0.81.5 + Expo ~54
- **Language:** TypeScript 5.9 (strict mode)
- **Routing:** Expo Router (file-based, Next.js-like)
- **Database:** SQLite (expo-sqlite), offline-first
- **Dates:** date-fns + date-fns-tz
- **Animations:** React Native Reanimated, Gesture Handler
- **UI:** @gorhom/bottom-sheet

### Critical Constraints

- **Timezone:** All dates must use **Australia/Sydney** (`date-fns-tz`)
- **Offline-first:** Fully functional with no network
- **Platforms:** iOS & Android
- **Notifications:** Expo Go has limited support — full testing requires a dev build

# Architecture Principles

**AI assistants must treat these rules as strict and non-negotiable.**

---

## 1. Component Architecture Pattern

- **Separation of Concerns:**  
  UI components render — **logic lives in hooks**.
- **Custom Hooks:**  
  Extract reusable or complex logic into `/hooks`.
- **Global State:**  
  Use React Context for theme, database, notifications, and app-wide state.
- **Avoid Prop Drilling:**  
  Prefer context or hooks instead of deep prop chains.

---

## 2. File Organization Rules

- **Colocation:** Keep related code grouped (e.g., `components/day-view/`).
- **Barrel Exports:** Each folder should expose an `index.ts`.
- **TypeScript Only:** `.ts` / `.tsx` files only — no JavaScript.
- **Naming:**
  - Files: `kebab-case`
  - Components: `PascalCase`
  - Functions/variables: `camelCase`

---

## 3. Code Style Conventions

- Use `@/` absolute imports (e.g., `@/hooks/use-themed-styles`)
- Prefer `async/await` over `.then()`
- Use `try/catch` with `AppError` types (see error handling)
- Avoid `any` — always define explicit types

# Key Concepts & Data Flow

---

## 1. Theming System

🚨 **CRITICAL FOR AI ASSISTANTS**

The app uses a centralized semantic theming architecture.

**Key Files**

- `constants/theme.ts`
- `hooks/use-themed-styles.ts`

### Golden Rules for Theming

- **ALWAYS** use `useThemedStyles()`
- **NEVER** hardcode colors (`'#FFF'`, `black`, etc.)
- **NEVER** create local StyleSheets for standard UI patterns
- Prefer `common.*` styles returned by the hook

The `useThemedStyles()` hook returns:

- **colors** — full theme palette
- **tokens** — spacing, radii, font sizes, **icon sizes**
- **common** — prebuilt StyleSheet blocks for consistent UI

**If unsure, default to `common.*` styles.**

---

## 2. Timezone Handling

🚨 **CRITICAL FOR AI ASSISTANTS**

**All date logic must use the Australia/Sydney timezone.**

**Location:** `constants/timezone.ts`

### Timezone Rules

- **NEVER** use `new Date('YYYY-MM-DD')`  
  (Creates silent UTC-midnight bugs)
- **NEVER** use `toLocaleDateString()` or device-dependent functions
- **ALWAYS** use helper utilities in `timezone.ts`

### 4. Database Access (SQLite)

### 5. Notifications System

**Two Types of Notifications:**

1. **In-App Toast Notifications** - Banners for user feedback (success/error/info)
2. **Push Notifications** - Scheduled reminders via expo-notifications

**🎯 For AI Assistants:** Use the right notification type for the context.

#### A) In-App Toast Notifications

**Location:** `contexts/notification-context.tsx`, `utils/notifications/toast-notifications.ts`

**Usage:**

````typescript
import { useNotify } from '@/contexts/notification-context';

const notify = useNotify();

// Show notifications
notify.success('Success', 'Note saved!');
notify.error('Error', 'Failed to save');
notify.info('Info', 'Reminder scheduled');
notify.warning('Warning', 'Check your input');



### Styling a Component

1.  Import `useThemedStyles` from `@/hooks/use-themed-styles`.
2.  Call `const { common, colors, tokens } = useThemedStyles();` at the top of your component.
3.  Use styles from the `common` object for all standard elements (e.g., `common.button`, `common.container`).
4.  For unique styles, create a local `StyleSheet` but use `colors` and `tokens` from the hook for all values.
5.  **NEVER** hardcode a color string (e.g., `'#FFFFFF'`).

### Adding a Feature with Complex Logic

1.  Consider if the logic can be encapsulated in a new custom hook in the `hooks/` directory.
2.  The hook should handle its own state, effects, and interactions with contexts (like `useDatabase` or `useTheme`).
3.  The hook should return a simple interface for the UI component to use (e.g., state flags, handler functions).
4.  The UI component should then call this hook and be responsible only for rendering the UI based on the state provided by the hook.

### Error Handling

**Standardized Pattern:** All hooks return `error` state of type `AppError` with severity levels:

- **`silent`**: Background operations (auto-sync, cleanup) - logged only
- **`toast`**: User actions (save, delete) - in-app notification banner
- **`modal`**: Critical errors (permissions, connectivity) - Alert dialog

**Hook Pattern:**
```typescript
import { AppError, toAppError, ErrorMessages } from '@/utils/error-handling';

export function useMyFeature() {
  const [error, setError] = useState<AppError | null>(null);

  try {
    // ... operation
  } catch (err) {
    setError(toAppError(err, ErrorMessages.OPERATION_FAILED, 'toast'));
  }

  return { data, error };
}
````

**Component Pattern:**

```typescript
const { data, error } = useMyFeature();
const notify = useNotify();

useEffect(() => {
  if (error?.severity === 'toast') {
    notify.error('Error', error.message);
  } else if (error?.severity === 'modal') {
    Alert.alert('Error', error.message);
  }
}, [error, notify]);
```

**Or use the helper:**

```typescript
import { useErrorHandler } from '@/hooks/use-error-handler';

const { data, error } = useMyFeature();
useErrorHandler(error); // Automatically handles display based on severity
```

### Platoon Rotation Explained

Australian firefighters work in a **4-platoon system** with an **8-day cycle**:

- **4 Platoons:** A, B, C, D
- **Work Pattern:** 1 day on, 1 day off, 1 day on, 5 days off (repeats)
- **8-Day Cycle:** Each platoon follows the same pattern, offset by days

**Rotation Sequence:**

```
Day:      1  2  3  4  5  6  7  8
Platoon:  A  D  A  D  C  B  C  B  (pattern repeats)
```

**Individual Platoon Pattern (e.g., Platoon A):**

```
Day 1:    Work
Day 2:    Off
Day 3:    Work
Day 4-8:  Off (5 days)
[Repeat 8-day cycle]
```

**Why This Matters:**

- Calendar must correctly show which platoon works each day
- The sequence A, D, A, D, C, B, C, B repeats throughout
- Reminders can be set for all work days for a platoon
- Annual leave scheduling depends on the rotation
- Pay days are tied to the rotation cycle

**Last Updated:** November 20, 2025  
**Version:** 3.1.0 (Code Refactoring & Cleanup)  
**Document Purpose:** Guide for both human developers and AI assistants

---

## 3. Tablet & Responsive Design Strategy

The app supports both phones and tablets (iPad/Android Tablets) using a single adaptive codebase.

### Core Principles

1.  **Adaptive Scaling:**
    - **Typography/Spacing:** Scale by **1.2x** on tablets (`width > 700px`). Handled automatically via `src/constants/theme.ts`.
    - **Calendar Grid:** Scales aggressively (**1.5x**) via `src/constants/layout.ts` to utilize screen real estate.
    - **Icons:** Use `tokens.icon.*` (sm/md/lg/xl) which auto-scale. **Avoid hardcoded numbers.**

2.  **Layout Constraints:**
    - **Calendar:** Stays **Full Width** (`flex: 1`).
    - **Forms & Lists:** Must be constrained to `maxWidth: 600` and centered (`alignSelf: 'center'`) to preserve readability on wide screens.

3.  **Component Adaptation:**
    - **DayCell:** Indicators (dots/triangles) are anchored relative to specific elements (corners or text), not the container, to prevent visual drift on large cells.
