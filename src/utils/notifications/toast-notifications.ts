/**
 * Toast notification (in-app banners) presets
 *
 * Pre-configured notification messages for common scenarios.
 * Use with useNotify() hook from notification context.
 *
 * Example:
 * const notify = useNotify();
 * notify.success('Saved', 'Note saved successfully');
 * notify.warning('No Data', 'No notes found');
 */

// This file is kept for documentation purposes but presets are rarely used.
// Most code uses notify.success/error/info/warning directly.
// If you need presets, add them here and use with showNotification().

export const notificationPresets = {
  // Example preset (not currently used):
  // settingsSaved: () => ({
  //   type: 'success' as const,
  //   title: 'Settings Saved',
  //   duration: 2000,
  // }),
};
