import { useThemedStyles } from '@/hooks/use-themed-styles';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export function FormField({ label, children, error }: FormFieldProps) {
  const { colors, common } = useThemedStyles();

  return (
    <View style={styles.container}>
      <Text style={[common.text, styles.label]}>{label}</Text>
      <View style={styles.inputContainer}>{children}</View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    // Container for the input element
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
});
