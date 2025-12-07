/**
 * Logbook Timesheet Item Component
 *
 * Renders a single timesheet entry card for the Logbook list.
 * Displays hours, station details, and OT status.
 */
import { formatDateString, formatHHMMToDisplay } from '@/constants/timezone';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Timesheet } from '@/types/notes';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LogbookTimesheetItemProps {
  item: Timesheet;
  onPress: (date: string) => void;
  onDelete: (date: string) => void;
}

export const LogbookTimesheetItem = React.memo(
  ({ item, onPress, onDelete }: LogbookTimesheetItemProps) => {
    const { colors, tokens } = useThemedStyles();

    const handleDelete = () => {
      Alert.alert(
        'Delete Timesheet',
        'Are you sure you want to delete this timesheet entry?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(item.date),
          },
        ],
      );
    };

    const styles = useMemo(
      () =>
        StyleSheet.create({
          itemCard: {
            backgroundColor: colors.surface,
            borderRadius: tokens.radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: tokens.space.md,
            marginBottom: tokens.space.sm,
          },
          itemDate: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2, // Tight spacing
          },
          rowText: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 18, // Compact line height
          },
          notesText: {
            fontSize: 13,
            color: colors.textMuted,
            marginTop: 4,
            fontStyle: 'italic',
          },
          recallText: {
            color: colors.primary,
            fontWeight: '500',
          },
          header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          },
          deleteButton: {
            padding: 4,
          },
        }),
      [colors, tokens],
    );

    // Format Start - Finish (Total)
    const timeString = `${item.start_time ? formatHHMMToDisplay(item.start_time) : '?'} - ${item.finish_time ? formatHHMMToDisplay(item.finish_time) : '?'}${item.total_hours ? ` (${item.total_hours}h)` : ''}`;

    // Format To Station • Return Kms
    const routeParts = [];
    if (item.to_station) routeParts.push(item.to_station);
    if (item.return_kms) routeParts.push(`${item.return_kms} km`);
    
    const routeString = routeParts.length > 0 ? routeParts.join(' • ') : null;

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => onPress(item.date)}
        activeOpacity={0.7}
      >
        {/* Line 0: Date */}
        <View style={styles.header}>
          <Text style={styles.itemDate}>
            {formatDateString(item.date, 'EEE, d MMMM')}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Line 1: Time & Hours */}
        <Text style={styles.rowText}>{timeString}</Text>

        {/* Line 2: Route & Recall */}
        {routeString && (
          <Text style={styles.rowText}>
            {routeString}
            {item.overtime_shift === 1 && (
              <Text style={styles.recallText}>  Recall</Text>
            )}
          </Text>
        )}

        {/* Line 3: Notes snippet */}
        {item.more_info ? (
          <Text style={styles.notesText} numberOfLines={1}>
            {item.more_info}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  },
);

LogbookTimesheetItem.displayName = 'LogbookTimesheetItem';
