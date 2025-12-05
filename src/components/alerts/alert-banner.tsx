import { getCurrentAlert, type AlertInfo } from './alert-logic';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertBannerProps {
  onPress?: (alert: AlertInfo) => void;
}

export default function AlertBanner({
  onPress,
}: AlertBannerProps) {
  const { tokens, getPlatoonColor } = useThemedStyles();
  const alert = getCurrentAlert();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 6,
      paddingHorizontal: 6,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: {
      fontSize: tokens.fontSize.md,
      fontWeight: tokens.fontWeight.medium,
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space.md,
    },
    platoonDot: {
      width: tokens.space.xs,
      height: tokens.space.xs,
      borderRadius: tokens.space.xs / 2,
    },
  });

  if (!alert) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.dotsContainer}>
            {['A', 'B', 'C', 'D'].map((platoon) => (
              <View
                key={platoon}
                style={[
                  styles.platoonDot,
                  { backgroundColor: getPlatoonColor(platoon) },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  const platoonColor = getPlatoonColor(alert.platoonLetter);

  const handlePress = () => {
    onPress?.(alert);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={[styles.message, { color: platoonColor }]}>
          {alert.message}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
