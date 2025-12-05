/**
 * Notes Refresh Context
 *
 * Provides a centralized way to trigger indicator refreshes across the app.
 * When notes/timesheets are created/updated/deleted, components
 * can call triggerRefresh() to notify subscribers (like the calendar).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface NotesRefreshContextValue {
  refreshKey: number;
  triggerRefresh: () => void;
}

const NotesRefreshContext = createContext<NotesRefreshContextValue | undefined>(
  undefined,
);

export function NotesRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const value = useMemo(
    () => ({
      refreshKey,
      triggerRefresh,
    }),
    [refreshKey, triggerRefresh],
  );

  return (
    <NotesRefreshContext.Provider value={value}>
      {children}
    </NotesRefreshContext.Provider>
  );
}

export function useNotesRefresh() {
  const context = useContext(NotesRefreshContext);
  if (!context) {
    throw new Error('useNotesRefresh must be used within NotesRefreshProvider');
  }
  return context;
}
