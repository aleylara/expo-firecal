import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNotify } from '@/contexts/notification-context';
import { AppError } from '@/utils/error-handling';

/**
 * Hook to handle errors based on their severity
 *
 * Usage:
 * ```typescript
 * const { data, error } = useSomeFeature();
 * useErrorHandler(error);
 * ```
 */
export function useErrorHandler(error: AppError | Error | string | null) {
  const notify = useNotify();

  useEffect(() => {
    if (!error) return;

    // Convert to AppError if needed
    let appError: AppError;
    if (typeof error === 'string') {
      appError = { message: error, severity: 'toast' };
    } else if (error instanceof Error) {
      appError = { message: error.message, severity: 'toast' };
    } else {
      appError = error;
    }

    // Handle based on severity
    switch (appError.severity) {
      case 'modal':
        Alert.alert('Error', appError.message);
        break;

      case 'toast':
        notify.error('Error', appError.message);
        break;

      case 'silent':
        // Just log to console
        console.error('Silent error:', appError.message, appError.details);
        break;
    }
  }, [error, notify]);
}
