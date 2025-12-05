import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { IconButton } from '@/components/ui/icon-button';

interface CalendarHeaderProps {
  onPrevYear: () => void;
  onNextYear: () => void;
  onToday: () => void;
  isNavigating: boolean;
}

export function CalendarHeader({
  onPrevYear,
  onNextYear,
  onToday,
  isNavigating,
}: CalendarHeaderProps) {
  const { colors, tokens } = useThemedStyles();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space.lg, 
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space.sm,
    },
    title: {
      fontSize: tokens.fontSize.xxxl,
      fontWeight: '700',
      letterSpacing: -0.3,
      color: colors.text,
    },
    navContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space.xs, // Reduced gap since IconButton has padding
      paddingHorizontal: tokens.space.xs,
      paddingVertical: tokens.space.xs,
      borderRadius: tokens.radius.xl,
    },
    todayButton: {
      paddingHorizontal: tokens.space.sm,
      paddingVertical: tokens.space.xs,
    },
    todayText: {
      fontSize: tokens.fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Ionicons
          name="calendar"
          size={tokens.icon.lg}
          color={colors.primary}
        />
        <Text style={styles.title}>
          FireCal
        </Text>
        <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
          {isNavigating && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      {/* Year Navigation */}
      <View style={styles.navContainer}>
        <IconButton 
          icon="chevron-back" 
          onPress={onPrevYear} 
          color={colors.textMuted}
          disabled={isNavigating}
        />
        
        <TouchableOpacity
           onPress={onToday}
           activeOpacity={0.7}
           style={[styles.todayButton, { opacity: isNavigating ? 0.5 : 1 }]}
           disabled={isNavigating}
        >
          <Text style={styles.todayText}>
            Today
          </Text>
        </TouchableOpacity>

        <IconButton 
          icon="chevron-forward" 
          onPress={onNextYear} 
          color={colors.textMuted}
          disabled={isNavigating}
        />
      </View>
    </View>
  );
}
