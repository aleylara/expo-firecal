import { useThemedStyles } from '@/hooks/use-themed-styles';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const { colors, common, getStatusColor } = useThemedStyles();

  const getButtonStyle = () => {
    if (disabled) {
      return {
        backgroundColor: colors.textMuted,
        opacity: 0.5,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...common.buttonPrimary,
        };
      case 'secondary':
        return {
          ...common.buttonSecondary,
        };
      case 'destructive':
        return {
          backgroundColor: getStatusColor('error'),
        };
      default:
        return common.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    if (disabled) {
      return {
        color: colors.background,
      };
    }

    switch (variant) {
      case 'primary':
        return common.buttonTextPrimary;
      case 'secondary':
        return common.buttonTextSecondary;
      case 'destructive':
        return {
          color: colors.background,
        };
      default:
        return common.buttonTextPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[common.button, getButtonStyle(), styles.button]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.6}
    >
      <Text style={[common.buttonText, getTextStyle(), styles.text]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
  },
  text: {
    letterSpacing: -0.4,
  },
});
