import { type LeavePeriod } from '@/utils/annual-leave-logic';
import { formatDateString } from '@/constants/timezone';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface ScheduleTableProps {
  periods: LeavePeriod[];
  groupId: string;
  isLoading: boolean;
}

export default function ScheduleTable({
  periods,
  groupId,
  isLoading,
}: ScheduleTableProps) {
  const { colors, tokens } = useThemedStyles(); // Destructure tokens

  const formatCompactDate = (dateString: string) => {
    return formatDateString(dateString, 'dd/MM/yy');
  };

  const styles = getStyles(colors, tokens); // Pass tokens to getStyles

  return (
    <View style={styles.table} key={groupId}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.setCell]}>SET</Text>
        <Text style={[styles.headerCell, styles.leaveCell]}>LEAVE</Text>
        <Text style={[styles.headerCell, styles.startsCell]}>STARTS</Text>
        <Text style={[styles.headerCell, styles.returnCell]}>RETURN</Text>
      </View>

      {/* Table Rows */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.text} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : periods.length > 0 ? (
        periods.map((period, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}
          >
            <View style={[styles.cell, styles.setCell]}>
              <Text style={styles.setBadgeText}>{period.setType}</Text>
            </View>
            <Text
              style={[
                styles.cell,
                styles.leaveCell,
                { color: colors.text, fontSize: tokens.fontSize.sm, letterSpacing: 0.5 },
              ]}
            >
              {formatCompactDate(period.leaveDate)}
            </Text>
            <Text
              style={[
                styles.cell,
                styles.startsCell,
                { color: colors.text, fontSize: tokens.fontSize.sm, letterSpacing: 0.5 },
              ]}
            >
              {formatCompactDate(period.startsOn)}
            </Text>
            <Text
              style={[
                styles.cell,
                styles.returnCell,
                { color: colors.text, fontSize: tokens.fontSize.sm, letterSpacing: 0.5 },
              ]}
            >
              {formatCompactDate(period.returnDate)}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No upcoming leave periods</Text>
        </View>
      )}
    </View>
  );
}

function getStyles(colors: any, tokens: any) {
  return StyleSheet.create({
    table: {
      borderRadius: tokens.radius.lg,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: colors.borderLight,
      marginHorizontal: 10,
      alignSelf: 'center', // Center on tablets
      width: '100%',
      maxWidth: 600, // Prevent stretching on tablets
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderLight,
      paddingVertical: tokens.space.md,
    },
    headerCell: {
      fontSize: tokens.fontSize.sm, // Use token
      fontWeight: '700',
      color: colors.text,
      textAlign: 'left',
      textTransform: 'uppercase',
      opacity: 0.7,
      paddingLeft: tokens.space.sm, // Use token
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderLight,
      paddingVertical: tokens.space.sm,
      alignItems: 'center',
    },
    evenRow: {
      // backgroundColor: alternateRow,
    },
    cell: {
      textAlign: 'left',
      justifyContent: 'center',
      paddingLeft: tokens.space.sm, // Use token
    },
    setCell: {
      flex: 1,
      alignItems: 'center',
      textAlign: 'center',
      paddingLeft: 0,
    },
    leaveCell: {
      flex: 1.5,
    },
    startsCell: {
      flex: 1.5,
    },
    returnCell: {
      flex: 1.5,
    },
    setBadgeText: {
      color: colors.text,
      fontSize: tokens.fontSize.sm, // Use token
      fontWeight: 'normal',
      letterSpacing: 0.5,
    },
    emptyRow: {
      padding: tokens.space.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: tokens.fontSize.sm,
      color: colors.text,
      fontStyle: 'italic',
      opacity: 0.6,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.space.xl,
      gap: tokens.space.sm,
    },
    loadingText: {
      fontSize: tokens.fontSize.sm,
      color: colors.text,
      opacity: 0.6,
    },
  });
}
