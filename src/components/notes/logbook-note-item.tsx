/**
 * Logbook Note Item
 *
 * Renders a single note entry in the Logbook list.
 * Displays title, date, and truncated content.
 */
import { formatDateString } from '@/constants/timezone';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Note } from '@/types/notes';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LogbookNoteItemProps {
  item: Note;
  onPress: (date: string) => void;
  onDelete: (date: string) => void;
}

export const LogbookNoteItem = React.memo(
  ({ item, onPress, onDelete }: LogbookNoteItemProps) => {
    const { colors, tokens } = useThemedStyles();

    const handleDelete = () => {
      Alert.alert(
        'Delete Note',
        'Are you sure you want to delete this note?',
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
            color: colors.textSecondary,
            marginBottom: 2,
          },
          itemTitle: {
            fontSize: 14,
            color: colors.textSecondary,
            fontWeight: '400',
            marginBottom: 2,
          },
          itemContent: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
            fontStyle: 'italic',
          },
          header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          },
          dateRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          },
          actionBadge: {
          },
          actionBadgeText: {
          },
          deleteButton: {
            padding: 4,
          },
        }),
      [colors, tokens],
    );


    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => onPress(item.date)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.dateRow}>
            <Text style={styles.itemDate}>
              {formatDateString(item.date, 'EEE, d MMMM')}
            </Text>
            {item.action_required && (
              <View style={styles.actionBadge}>
                <Ionicons name="flag" size={16} color={colors.warning} />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
        {item.title ? (
          <Text style={styles.itemTitle}>{item.title}</Text>
        ) : null}
        {item.content && (
          <Text style={styles.itemContent} numberOfLines={3}>
            {item.content}
          </Text>
        )}
      </TouchableOpacity>
    );
  },
);

LogbookNoteItem.displayName = 'LogbookNoteItem';
