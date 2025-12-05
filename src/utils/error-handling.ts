/**
 * Error Handling Utilities for FireCal
 *
 * Provides a consistent error handling strategy across the app:
 * - Silent: Log only, no user feedback (background operations)
 * - Toast: In-app notification banner (user actions)
 * - Modal: Alert dialog requiring acknowledgment (critical errors)
 */

export type ErrorSeverity = 'silent' | 'toast' | 'modal';

export interface AppError {
  message: string;
  severity: ErrorSeverity;
  code?: string;
  details?: string;
}

/**
 * Creates an AppError with appropriate severity
 */
export function createError(
  message: string,
  severity: ErrorSeverity = 'toast',
  code?: string,
  details?: string,
): AppError {
  return { message, severity, code, details };
}

/**
 * Converts unknown error to AppError
 */
export function toAppError(
  error: unknown,
  defaultMessage: string = 'An error occurred',
  severity: ErrorSeverity = 'toast',
): AppError {
  if (error instanceof Error) {
    return createError(error.message || defaultMessage, severity);
  }

  if (typeof error === 'string') {
    return createError(error, severity);
  }

  return createError(defaultMessage, severity);
}

/**
 * Common error messages
 */
export const ErrorMessages = {
  // Network/Connectivity
  NETWORK_ERROR: 'Network connection error. Please check your connection.',

  // Database
  DATABASE_ERROR: 'Failed to access local storage.',
  DATABASE_WRITE_ERROR: 'Failed to save data.',
  DATABASE_READ_ERROR: 'Failed to load data.',

  // Notes
  NOTE_SAVE_FAILED: 'Failed to save note.',
  NOTE_DELETE_FAILED: 'Failed to delete note.',
  NOTE_LOAD_FAILED: 'Failed to load notes.',

  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
} as const;

/**
 * Success messages for toast notifications
 */
export const SuccessMessages = {
  NOTE_SAVED: 'Note saved',
  NOTE_DELETED: 'Note deleted',
  SETTINGS_SAVED: 'Settings saved',
  DATA_RESET: 'App data has been reset',
} as const;
