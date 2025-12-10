/**
 * Logbook Screen
 *
 * View for displaying notes and timesheets by year
 * Two tabs: Notes and Timesheets
 * Includes data export functionality
 */

import { LogbookNoteItem } from '@/components/notes/logbook-note-item';
import { LogbookTimesheetItem } from '@/components/notes/logbook-timesheet-item';
import NoteFormModal from '@/components/notes/note-form-modal';
import TimesheetFormModal from '@/components/notes/timesheet-form-modal';
import { ThemedText } from '@/components/theme/themed-text';
import { ThemedView } from '@/components/theme/themed-view';
import { getCurrentDateInTimezone } from '@/constants/timezone';
import { useDatabase } from '@/contexts/notes/database-context';
import { useNotesRefresh } from '@/contexts/notes/notes-refresh-context';
import { useNotify } from '@/contexts/notification-context';
import { useSubscription } from '@/contexts/subscription/subscription-context';
import { useLogbookData } from '@/hooks/notes/use-logbook-data';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { type Note } from '@/types/notes';
import { type ExportFormat } from '@/utils/export-data';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type TabType = 'notes' | 'timesheet';

const tabOptions: {
  value: TabType;
  label: string;
  icon: string;
}[] = [
    { value: 'notes', label: 'Notes', icon: 'document-text-outline' },
    { value: 'timesheet', label: 'Timesheet', icon: 'time-outline' },
  ];

export default function LogsScreen() {
  const { colors, tokens } = useThemedStyles();
  const params = useLocalSearchParams<{ tab?: TabType }>();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        header: {
          paddingHorizontal: tokens.space.lg,
          paddingVertical: tokens.space.md,
          backgroundColor: colors.background,
        },
        yearSelector: {
          marginBottom: tokens.space.lg,
        },
        yearScrollContent: {
          flexDirection: 'row',
          gap: tokens.space.sm,
          paddingRight: tokens.space.md,
        },
        yearButton: {
          paddingHorizontal: tokens.space.lg,
          paddingVertical: tokens.space.sm,
          borderRadius: 20,
          backgroundColor: colors.surface,
          borderWidth: 0,
        },
        yearButtonActive: {
          backgroundColor: colors.primary,
        },
        yearButtonText: {
          fontSize: tokens.fontSize.sm,
          color: colors.text,
          fontWeight: '500',
        },
        yearButtonTextActive: {
          color: colors.background,
          fontWeight: '700',
        },
        controlsContainer: {
          backgroundColor: colors.surfaceElevated,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.borderLight,
          padding: tokens.space.sm,
          marginBottom: tokens.space.sm,
        },
        tabsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.space.sm,
        },
        segmentedControl: {
          flex: 1,
          flexDirection: 'row',
          padding: 2,
          backgroundColor: colors.surfaceTrack,
          borderRadius: 10,
          height: 40,
          alignItems: 'center',
        },
        tabButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          borderRadius: tokens.radius.lg,
          gap: tokens.space.xs,
        },
        tabButtonActive: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        tabButtonText: {
          fontSize: tokens.fontSize.md,
          fontWeight: '600',
        },
        listContainer: {
          padding: tokens.space.md,
          gap: tokens.space.md,
        },
        emptyState: {
          padding: tokens.space.xl,
          alignItems: 'center',
        },
        emptyText: {
          fontSize: tokens.fontSize.md,
          color: colors.textMuted,
          textAlign: 'center',
        },
        loadingContainer: {
          padding: tokens.space.xl,
          alignItems: 'center',
        },
        actionButtons: {
          flexDirection: 'row',
          gap: tokens.space.sm,
        },
        exportButton: {
          width: 40,
          height: 40,
          borderRadius: tokens.radius.lg,
          backgroundColor: colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
        },
        exportButtonDisabled: {
          opacity: 0.6,
        },
        deleteButton: {
          width: 40,
          height: 40,
          borderRadius: tokens.radius.lg,
          backgroundColor: colors.surfaceElevated,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors, tokens],
  );

  const currentYear = getCurrentDateInTimezone().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  // Sync tab with params
  useEffect(() => {
    if (params.tab && (params.tab === 'notes' || params.tab === 'timesheet')) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteEditorVisible, setNoteEditorVisible] = useState(false);
  const [timesheetEditorVisible, setTimesheetEditorVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const {
    notes,
    timesheets,
    availableYears,
    isLoading,
    refresh,
    deleteNotesByYear,
    deleteTimesheetsByYear,
    exportLogbookData,
  } = useLogbookData(selectedYear);
  const db = useDatabase();
  const { triggerRefresh: triggerCalendarRefresh } = useNotesRefresh();
  const notify = useNotify();
  const { hasFireCalPro, presentPaywall } = useSubscription();
  const [isExporting, setIsExporting] = useState(false);

  // Use available years from data, fallback to current year if no data
  const years = availableYears.length > 0 ? availableYears : [currentYear];

  const selectedTimesheet = useMemo(
    () => timesheets.find((t) => t.date === selectedDate),
    [timesheets, selectedDate],
  );

  // Refresh data when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleOpenNote = async (date: string) => {
    setSelectedDate(date);
    try {
      const fullNote = await db.getNote(date);
      setEditingNote(fullNote);
      setNoteEditorVisible(true);
    } catch (error) {
      console.error('Error fetching note details:', error);
      notify.error('Error', 'Failed to load note details');
    }
  };

  const handleDeleteNote = async (date: string) => {
    const noteToDelete = notes.find((n) => n.date === date);
    if (!noteToDelete) return;

    try {
      await db.deleteNote(noteToDelete.id);
      notify.success('Deleted', 'Note deleted');
      await refresh();
      triggerCalendarRefresh();
    } catch (error) {
      notify.error('Error', 'Failed to delete note');
      console.error('[Logbook] Delete note error:', error);
    }
  };

  const handleOpenTimesheet = (date: string) => {
    setSelectedDate(date);
    setTimesheetEditorVisible(true);
  };

  const handleDeleteTimesheet = async (date: string) => {
    const timesheetToDelete = timesheets.find((t) => t.date === date);
    if (!timesheetToDelete) return;

    try {
      await db.deleteTimesheet(timesheetToDelete.id);
      notify.success('Deleted', 'Timesheet deleted');
      await refresh();
      triggerCalendarRefresh();
    } catch (error) {
      notify.error('Error', 'Failed to delete timesheet');
      console.error('[Logbook] Delete timesheet error:', error);
    }
  };

  const handleCloseEditors = () => {
    setNoteEditorVisible(false);
    setTimesheetEditorVisible(false);
    setSelectedDate(null);
    setEditingNote(null);
    refresh(); // Refresh list after editing
  };

  const handleExportNotes = async () => {
    if (!hasFireCalPro) {
      presentPaywall();
      return;
    }
    if (notes.length === 0) {
      notify.warning('No Data', `No notes found for ${selectedYear}`);
      return;
    }
    await performExport(true, false, 'txt');
  };

  const handleExportTimesheets = async () => {
    if (!hasFireCalPro) {
      presentPaywall();
      return;
    }
    if (timesheets.length === 0) {
      notify.warning('No Data', `No timesheets found for ${selectedYear}`);
      return;
    }
    await performExport(false, true, 'csv');
  };

  const performExport = async (
    includeNotes: boolean,
    includeTimesheets: boolean,
    format: ExportFormat,
  ) => {
    setIsExporting(true);
    try {
      const result = await exportLogbookData(
        includeNotes,
        includeTimesheets,
        format,
      );

      if (!result.success && result.error) {
        notify.error('Export Failed', result.error);
      }
    } catch (error) {
      notify.error('Export Failed', 'An error occurred during export');
      console.error('[Logs] Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDeleteNotes = () => {
    if (notes.length === 0) {
      notify.warning('No Data', `No notes found for ${selectedYear}`);
      return;
    }

    Alert.alert(
      'Delete All Notes',
      `Are you sure you want to delete all ${notes.length} notes from ${selectedYear}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const deleted = await deleteNotesByYear(selectedYear);
              notify.success(
                'Deleted',
                `${deleted} notes deleted from ${selectedYear}`,
              );
            } catch (error) {
              notify.error('Error', 'Failed to delete notes');
              console.error('[Logbook] Bulk delete notes error:', error);
            }
          },
        },
      ],
    );
  };

  const handleBulkDeleteTimesheets = () => {
    if (timesheets.length === 0) {
      notify.warning('No Data', `No timesheets found for ${selectedYear}`);
      return;
    }

    Alert.alert(
      'Delete All Timesheets',
      `Are you sure you want to delete all ${timesheets.length} timesheets from ${selectedYear}? This cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const deleted = await deleteTimesheetsByYear(selectedYear);
              notify.success(
                'Deleted',
                `${deleted} timesheets deleted from ${selectedYear}`,
              );
            } catch (error) {
              notify.error('Error', 'Failed to delete timesheets');
              console.error('[Logbook] Bulk delete timesheets error:', error);
            }
          },
        },
      ],
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        No {activeTab} found for {selectedYear}
      </Text>
      <Text style={styles.emptyText}>Tap a calendar day to create one</Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.yearSelector}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearScrollContent}
          >
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  selectedYear === year && styles.yearButtonActive,
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.yearButtonText,
                    selectedYear === year && styles.yearButtonTextActive,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.tabsRow}>
            <View style={styles.segmentedControl}>
              {tabOptions.map((option) => {
                const isActive = activeTab === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.tabButton,
                      isActive && { backgroundColor: colors.surfaceHighlight },
                      isActive && styles.tabButtonActive,
                    ]}
                    onPress={() => setActiveTab(option.value)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={18}
                      color={isActive ? colors.text : colors.textMuted}
                    />
                    <ThemedText
                      style={[
                        styles.tabButtonText,
                        { color: isActive ? colors.text : colors.textMuted },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.exportButton,
                  isExporting && styles.exportButtonDisabled,
                ]}
                onPress={
                  activeTab === 'notes'
                    ? handleExportNotes
                    : handleExportTimesheets
                }
                disabled={isExporting}
                activeOpacity={0.7}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>

              {selectedYear <= currentYear && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={
                    activeTab === 'notes'
                      ? handleBulkDeleteNotes
                      : handleBulkDeleteTimesheets
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {isLoading ? (<View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      ) : activeTab === 'notes' ? (
        <FlatList
          data={notes}
          renderItem={({ item }) => (
            <LogbookNoteItem
              item={item}
              onPress={handleOpenNote}
              onDelete={handleDeleteNote}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        <FlatList
          data={timesheets}
          renderItem={({ item }) => (
            <LogbookTimesheetItem
              item={item}
              onPress={handleOpenTimesheet}
              onDelete={handleDeleteTimesheet}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      <NoteFormModal
        visible={noteEditorVisible}
        date={selectedDate}
        note={editingNote}
        onClose={handleCloseEditors}
        onSave={async (noteTitle, noteContent, actionRequired) => {
          console.log('[Logbook] onSave actionRequired:', actionRequired);
          if (!selectedDate) return;
          if (editingNote) {
            await db.updateNote(editingNote.id, {
              title: noteTitle,
              content: noteContent,
              action_required: actionRequired,
            });
          } else {
            await db.createNote(selectedDate, {
              title: noteTitle,
              content: noteContent,
              action_required: actionRequired,
            });
          }
          await refresh();
          handleCloseEditors();
        }}
        onDelete={
          editingNote
            ? async () => {
              if (editingNote) {
                await db.deleteNote(editingNote.id);
                notify.success('Deleted', 'Note deleted');
                await refresh();
                triggerCalendarRefresh();
                handleCloseEditors();
              }
            }
            : undefined
        }
      />

      <TimesheetFormModal
        visible={timesheetEditorVisible}
        date={selectedDate}
        timesheet={selectedTimesheet || null}
        onClose={handleCloseEditors}
        onSave={async (timesheetData) => {
          if (!selectedDate) return;
          if (selectedTimesheet) {
            await db.updateTimesheet(selectedTimesheet.id, timesheetData);
          } else {
            await db.createTimesheet(selectedDate, timesheetData);
          }
          await refresh();
          handleCloseEditors();
        }}
        onDelete={
          selectedTimesheet
            ? async () => {
              if (selectedTimesheet) {
                await db.deleteTimesheet(selectedTimesheet.id);
                notify.success('Deleted', 'Timesheet deleted');
                await refresh();
                triggerCalendarRefresh();
                handleCloseEditors();
              }
            }
            : undefined
        }
      />
    </ThemedView>
  );
}
