/**
 * Logbook Note Item
 *
 * Renders a single note entry in the Logbook list.
 * Displays title, date, and truncated content.
 */
import { formatDateString } from '@/constants/timezone';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Note } from '@/types/notes';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface LogbookNoteItemProps {
  item: Note;
  onPress: (date: string) => void;
}

export const LogbookNoteItem = React.memo(
  ({ item, onPress }: LogbookNoteItemProps) => {
    const { colors, tokens } = useThemedStyles();

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
        }),
      [colors, tokens],
    );

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => onPress(item.date)}
        activeOpacity={0.7}
      >
        <Text style={styles.itemDate}>
          {formatDateString(item.date, 'EEE, d MMMM')}
        </Text>
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
