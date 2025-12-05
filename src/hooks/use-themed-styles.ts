/**
 * Hook for theme-aware styles and colors
 *
 * Returns:
 * - colors: Full color palette for current theme
 * - tokens: Design tokens (spacing, font sizes, radius)
 * - platoonColors: Platoon-specific colors
 * - common: Pre-built StyleSheet objects for common UI elements
 *
 * This is the primary styling hook - use it instead of hardcoding colors
 */
import { Colors, PLATOON_COLORS, tokens } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useMemo } from 'react';

export function useThemedStyles() {
  const { colorScheme } = useTheme();

  return useMemo(() => {
    const colors = Colors[colorScheme];

    return {
      colors,
      tokens,
      platoonColors: PLATOON_COLORS[colorScheme],

      // Common style objects using the new systematic colors
      common: {
        // Containers
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },

        surface: {
          backgroundColor: colors.surface,
          borderRadius: tokens.radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },

        surfaceElevated: {
          backgroundColor: colors.surfaceElevated,
          borderRadius: tokens.radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },

        // Layout
        section: {
          marginTop: tokens.space.xxl,
          paddingHorizontal: tokens.space.lg,
        },

        // Typography
        text: {
          color: colors.text,
          fontSize: tokens.fontSize.md,
        },

        textSecondary: {
          color: colors.textSecondary,
          fontSize: tokens.fontSize.md,
        },

        textMuted: {
          color: colors.textMuted,
          fontSize: tokens.fontSize.sm,
        },

        sectionTitle: {
          fontSize: tokens.fontSize.md,
          fontWeight: tokens.fontWeight.bold,
          color: colors.text,
          marginBottom: tokens.space.md,
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
        },

        mutedText: {
          color: colors.textMuted,
          fontSize: tokens.fontSize.sm,
        },

        subtleText: {
          color: colors.textMuted,
          fontSize: tokens.fontSize.md,
          fontStyle: 'italic' as const,
        },

        // Buttons
        button: {
          paddingVertical: tokens.space.md,
          paddingHorizontal: tokens.space.lg,
          borderRadius: tokens.radius.lg,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        },

        buttonPrimary: {
          backgroundColor: colors.primary,
        },

        buttonSecondary: {
          backgroundColor: colors.secondary,
          borderWidth: 1,
          borderColor: colors.border,
        },

        buttonDestructive: {
          backgroundColor: colors.error,
        },

        buttonText: {
          fontSize: tokens.fontSize.md,
          fontWeight: tokens.fontWeight.semibold,
        },

        buttonTextPrimary: {
          color:
            colorScheme === 'light' ? colors.background : colors.background,
        },

        buttonTextSecondary: {
          color: colors.text,
        },

        // Form elements
        input: {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: tokens.radius.md,
          paddingHorizontal: tokens.space.md,
          paddingVertical: tokens.space.sm,
          fontSize: tokens.fontSize.md,
          color: colors.text,
        },

        inputFocused: {
          borderColor: colors.borderStrong,
        },

        // Cards
        card: {
          backgroundColor: colors.surface,
          borderRadius: tokens.radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: tokens.space.lg,
        },

        cardElevated: {
          backgroundColor: colors.surfaceElevated,
          borderRadius: tokens.radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: tokens.space.lg,
        },
      },

      // Utility functions
      getPlatoonColor: (groupId: string) => {
        const letter = groupId.charAt(0) as keyof typeof PLATOON_COLORS.light;
        return PLATOON_COLORS[colorScheme][letter] || colors.text;
      },

      // Helper to get semantic colors
      getStatusColor: (status: 'success' | 'warning' | 'error') => {
        return colors[status];
      },
    };
  }, [colorScheme]);
}
