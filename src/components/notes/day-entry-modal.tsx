/**
 * Day Entry Modal
 *
 * Combined modal for viewing/editing notes and timesheets for a selected day.
 * Replaces the bottom sheet approach with a direct modal.
 *
 * Features:
 * - Tab switching between Note and Timesheet
 * - Inline editing for both types
 * - Optional "View in Logbook" button
 */
import NoteFormModal from '@/components/notes/note-form-modal';
import TimesheetFormModal from '@/components/notes/timesheet-form-modal';
import { formatDateString } from '@/constants/timezone';
import type { CreateTimesheetInput, UpdateTimesheetInput } from '@/types/notes';
import { useNotesRefresh } from '@/contexts/notes/notes-refresh-context';
import { useNotify } from '@/contexts/notification-context';
import { useDayData } from '@/hooks/notes/use-day-data';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DayEntryModalProps {
  visible: boolean;
  date: string | null;
  onClose: () => void;
  onSaveComplete?: () => void;
}

export default function DayEntryModal({
  visible,
  date,
  onClose,
  onSaveComplete,
}: DayEntryModalProps) {
  const { colors, tokens } = useThemedStyles();
  const {
    note,
    timesheet,
    saveNote,
    saveTimesheet,
    deleteNote,
    deleteTimesheet,
    error,
  } = useDayData(date);
  const { triggerRefresh } = useNotesRefresh();
  const notify = useNotify();
  const router = useRouter();

  const [noteEditorVisible, setNoteEditorVisible] = useState(false);
  const [timesheetEditorVisible, setTimesheetEditorVisible] = useState(false);

  useErrorHandler(error);

  const handleSaveNote = async (
    noteTitle: string | null,
    noteContent: string,
    actionRequired: boolean,
  ) => {
    try {
      await saveNote({ title: noteTitle, content: noteContent, action_required: actionRequired });
      notify.success('Saved', 'Note saved successfully');
      setNoteEditorVisible(false);

      if (onSaveComplete) {
        onSaveComplete();
      }

      // Redirect to Logbook Notes tab
      router.push('/(tabs)/logbook?tab=notes');

      setTimeout(() => {
        triggerRefresh();
      }, 300);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteNote = async () => {
    try {
      await deleteNote();
      notify.success('Deleted', 'Note deleted');
      setNoteEditorVisible(false);

      // Close the main modal so user falls back to calendar
      onClose();

      setTimeout(() => {
        triggerRefresh();
      }, 300);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveTimesheet = async (
    timesheetData: CreateTimesheetInput | UpdateTimesheetInput,
  ) => {
    try {
      await saveTimesheet(timesheetData);
      notify.success('Saved', 'Timesheet saved successfully');
      setTimesheetEditorVisible(false);

      if (onSaveComplete) {
        onSaveComplete();
      }

      // Redirect to Logbook Timesheet tab
      router.push('/(tabs)/logbook?tab=timesheet');

      setTimeout(() => {
        triggerRefresh();
      }, 300);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTimesheet = async () => {
    try {
      await deleteTimesheet();
      notify.success('Deleted', 'Timesheet deleted');

      // Close local editor state
      setTimesheetEditorVisible(false);

      // Close the main modal so user falls back to calendar and sees the toast
      onClose();

      // Trigger refresh after closing
      setTimeout(() => {
        triggerRefresh();
      }, 300);
    } catch (error) {
      notify.error('Error', 'Failed to delete timesheet');
    }
  };

  const hasNote = note && note.content && note.content.trim().length > 0;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)', // Dimmer overlay
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '85%',
      maxWidth: 400,
      backgroundColor: colors.surface, // Card-like background
      borderRadius: 16,
      overflow: 'hidden',
      paddingBottom: 24, // Bottom spacing
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderLight,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 16,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginLeft: 4,
      marginBottom: 4,
    },
    card: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    emptyCard: {
      backgroundColor: colors.background, // Lighter background for empty state
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 15,
      fontWeight: '500',
    },
  });

  if (!visible || !date) return null;

  return (
    <>
      <Modal
        visible={visible && !noteEditorVisible && !timesheetEditorVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            style={styles.container}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {formatDateString(date, 'EEE, d MMMM')}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* List Content */}
            <ScrollView contentContainerStyle={styles.list}>

              {/* Note Section */}
              <View>
                <Text style={styles.sectionTitle}>Daily Note</Text>
                <TouchableOpacity
                  style={[styles.card, !hasNote && styles.emptyCard]}
                  onPress={() => setNoteEditorVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={hasNote ? "document-text" : "add-circle-outline"}
                    size={24}
                    color={hasNote ? colors.primary : colors.textMuted}
                  />
                  <View style={styles.cardContent}>
                    {hasNote ? (
                      <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <Text style={styles.cardTitle} numberOfLines={1}>{note?.title || 'Note'}</Text>
                          {note?.action_required === 1 && (
                            <View>
                              <Ionicons name="flag" size={16} color={colors.warning} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.cardSubtitle} numberOfLines={2}>{note?.content}</Text>
                      </>
                    ) : (
                      <Text style={styles.emptyText}>Add Note</Text>
                    )}
                  </View>
                  {hasNote && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>

              {/* Timesheet Section */}
              <View>
                <Text style={styles.sectionTitle}>Timesheet</Text>
                <TouchableOpacity
                  style={[styles.card, !timesheet && styles.emptyCard]}
                  onPress={() => setTimesheetEditorVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={timesheet ? "time" : "add-circle-outline"}
                    size={24}
                    color={timesheet ? colors.primary : colors.textMuted}
                  />
                  <View style={styles.cardContent}>
                    {timesheet ? (
                      <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <Text style={styles.cardTitle}>Shift Entry</Text>
                          {timesheet.overtime_shift === 1 && (
                            <View>
                              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.warning }}>OT</Text>
                            </View>
                          )}
                          {timesheet.action_required === 1 && (
                            <View>
                              <Ionicons name="flag" size={16} color={colors.warning} />
                            </View>
                          )}
                        </View>
                        <View>
                          {/* Time & Hours */}
                          {timesheet.start_time && timesheet.finish_time && (
                            <Text style={styles.cardSubtitle}>
                              {timesheet.start_time.substring(0, 2)}:{timesheet.start_time.substring(2)} - {timesheet.finish_time.substring(0, 2)}:{timesheet.finish_time.substring(2)}
                              {timesheet.total_hours ? ` • ${timesheet.total_hours}h` : ''}
                              {timesheet.stayback ? ` • Stayback: ${timesheet.stayback.substring(0, 2)}:${timesheet.stayback.substring(2)}` : ''}
                            </Text>
                          )}

                          {/* Leave */}
                          {timesheet.taken_leave && (
                            <Text style={styles.cardSubtitle}>
                              Leave: {timesheet.taken_leave}
                            </Text>
                          )}

                          {/* Destination & Kms */}
                          {(timesheet.to_station || timesheet.return_kms) && (
                            <Text style={styles.cardSubtitle}>
                              {timesheet.to_station ? timesheet.to_station : 'No Destination'}
                              {timesheet.return_kms ? ` • ${timesheet.return_kms}km` : ''}
                            </Text>
                          )}

                          {/* Comments */}
                          {timesheet.comments && (
                            <Text style={styles.cardSubtitle} numberOfLines={2}>
                              {timesheet.comments}
                            </Text>
                          )}
                        </View>
                      </>
                    ) : (
                      <Text style={styles.emptyText}>Add Timesheet</Text>
                    )}
                  </View>
                  {timesheet && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>

            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <NoteFormModal
        visible={noteEditorVisible}
        date={date}
        note={note}
        onClose={() => setNoteEditorVisible(false)}
        onSave={handleSaveNote}
        onDelete={note ? handleDeleteNote : undefined}
      />

      <TimesheetFormModal
        visible={timesheetEditorVisible}
        date={date}
        timesheet={timesheet}
        onClose={() => setTimesheetEditorVisible(false)}
        onSave={handleSaveTimesheet}
        onDelete={timesheet ? handleDeleteTimesheet : undefined}
      />
    </>
  );
}
