import { Ionicons } from '@expo/vector-icons';
import { type LeavePeriod } from '@/utils/annual-leave-logic';
import { formatDateString } from '@/constants/timezone';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NextAnnualsProps {
  nextAnnuals: LeavePeriod[];
}

export default function NextAnnuals({ nextAnnuals }: NextAnnualsProps) {
  const { colors, common, getPlatoonColor, tokens } = useThemedStyles();

  const formatShortDate = (dateString: string) => {
    return formatDateString(dateString, 'MMM d');
  };

  const sortedAnnuals = useMemo(() => {
    return [...nextAnnuals].sort((a, b) => {
      // Primary sort: Platoon Group (Alphabetical)
      const groupA = a.leaveGroup.charAt(0);
      const groupB = b.leaveGroup.charAt(0);
      if (groupA < groupB) return -1;
      if (groupA > groupB) return 1;

      // Secondary sort: Leave Date (Chronological)
      return a.leaveDate.localeCompare(b.leaveDate);
    });
  }, [nextAnnuals]);

  if (nextAnnuals.length === 0) {
    return null; // Hide section when empty
  }

  return (
    <View style={[common.section, { marginTop: tokens.space.md }]}>
      <View style={[common.surfaceElevated, styles.card, { borderColor: colors.borderLight, borderWidth: 1 }]}>
        <View style={styles.inlineHeader}>
             <Ionicons name="calendar-outline" size={16} color={colors.primary} />
             <Text style={[styles.inlineTitle, { color: colors.text }]}>Next Annual - Leave Date</Text>
        </View>
        <View style={styles.container}>
          {sortedAnnuals.map((period, index) => (
              <View
                key={index}
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.groupText,
                    { color: getPlatoonColor(period.leaveGroup) },
                  ]}
                >
                  {period.leaveGroup}
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.dateContainer}>
                  <Ionicons
                    name="arrow-forward-outline"
                    size={12}
                    color={getPlatoonColor(period.leaveGroup)}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      { color: getPlatoonColor(period.leaveGroup) },
                    ]}
                  >
                    {formatShortDate(period.leaveDate)}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Removed old headerContainer and sectionTitle
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    opacity: 0.8,
  },
  inlineTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  card: {
    padding: 12, // Reduced
    borderRadius: 12,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the grid
    gap: 12, // Gap between columns/rows
  },
  chip: {
    width: '47%', // Force 2 columns
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content inside chip
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  groupText: {
    fontSize: 14, // Smaller
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12, // Smaller
    fontWeight: '600',
  },
});
