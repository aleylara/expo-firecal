/**
 * Tour Tooltip Component
 *
 *
 * Features:
 * - Title and description
 * - Next button
 * - Subtle skip button (small, muted, top-right)
 * - Positioned relative to target
 */

import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/theme/themed-text';
import { useThemedStyles } from '@/hooks/use-themed-styles';

interface TourTooltipProps {
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
  containerStyle?: ViewStyle;
}

export function TourTooltip({
  title,
  description,
  onNext,
  onSkip,
  containerStyle,
}: TourTooltipProps) {
  const { colors, tokens } = useThemedStyles();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.space.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      maxWidth: 400,
      width: '100%',
    },
    skipButton: {
      position: 'absolute',
      top: tokens.space.sm,
      right: tokens.space.sm,
      padding: tokens.space.xs,
    },
    skipText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: tokens.space.sm,
      marginRight: tokens.space.xl,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: tokens.space.lg,
    },
    nextButton: {
      backgroundColor: colors.primary,
      paddingVertical: tokens.space.sm,
      paddingHorizontal: tokens.space.xl,
      borderRadius: tokens.radius.lg,
      alignItems: 'center',
      alignSelf: 'flex-end',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background,
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <ThemedText style={styles.skipText}>Skip</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.description}>
        {description.split('highlighted').map((part, index, array) => (
          <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && (
              <ThemedText
                style={[
                  styles.description,
                  {
                    backgroundColor: colors.leaveHighlight,
                    paddingHorizontal: 2,
                  },
                ]}
              >
                highlighted
              </ThemedText>
            )}
          </React.Fragment>
        ))}
      </ThemedText>

      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <ThemedText style={styles.nextButtonText}>Next</ThemedText>
      </TouchableOpacity>
    </View>
  );
}
