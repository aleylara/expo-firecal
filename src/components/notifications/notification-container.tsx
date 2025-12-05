import {
  useNotifications,
  type NotificationType,
} from '@/contexts/notification-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AnimatedNotificationProps {
  notification: NotificationData;
  notifColors: { bg: string; text: string };
  tokens: {
    space: Record<string, number>;
    radius: Record<string, number>;
    fontSize: Record<string, number>;
  };
  onDismiss: (id: string) => void;
}

function AnimatedNotification({
  notification,
  notifColors,
  tokens,
  onDismiss,
}: AnimatedNotificationProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Slide in
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [opacity, translateY]);

  const handleDismiss = () => {
    // Slide out
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      'worklet';
      if (finished) {
        onDismiss(notification.id);
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const styles = StyleSheet.create({
    notification: {
      borderRadius: tokens.radius.lg,
      padding: tokens.space.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: tokens.fontSize.md,
      fontWeight: '600' as const,
    },
    message: {
      fontSize: tokens.fontSize.sm,
      fontWeight: '400' as const,
    },
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.notification, { backgroundColor: notifColors.bg }]}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <View>
          <Text style={[styles.title, { color: notifColors.text }]}>
            {notification.title}
          </Text>
          {notification.message && (
            <Text
              style={[
                styles.message,
                { color: notifColors.text, marginTop: tokens.space.xs },
              ]}
            >
              {notification.message}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NotificationContainer() {
  const { notifications, hideNotification } = useNotifications();
  const { colors, tokens } = useThemedStyles();
  const insets = useSafeAreaInsets();

  const getNotificationColors = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return { bg: 'hsl(115, 45%, 75%)', text: 'hsl(115, 58%, 20%)' };
      case 'error':
        return { bg: 'hsl(0, 70%, 80%)', text: 'hsl(0, 75%, 30%)' };
      case 'warning':
        return { bg: 'hsl(45, 90%, 75%)', text: 'hsl(45, 100%, 25%)' };
      case 'info':
      default:
        return { bg: 'hsl(220, 40%, 75%)', text: 'hsl(220, 50%, 25%)' };
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: insets.top + tokens.space.sm,
      left: tokens.space.md,
      right: tokens.space.md,
      zIndex: 9999,
      gap: tokens.space.sm,
    },
  });

  if (notifications.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification) => {
        const notifColors = getNotificationColors(notification.type);

        return (
          <AnimatedNotification
            key={notification.id}
            notification={notification}
            notifColors={notifColors}
            tokens={tokens}
            onDismiss={hideNotification}
          />
        );
      })}
    </View>
  );
}
