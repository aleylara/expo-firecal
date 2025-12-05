import { ThemedText } from '@/components/theme/themed-text';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SimpleErrorProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function SimpleError({
  message,
  onRetry,
  showRetry = true,
}: SimpleErrorProps) {
  const { colors } = useThemedStyles();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>

      {showRetry && onRetry && (
        <ThemedText style={styles.retryButton} onPress={onRetry}>
          Try Again
        </ThemedText>
      )}
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      padding: 16,
      margin: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
      alignItems: 'center',
    },
    errorIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 8,
    },
    retryButton: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  });
}
