/**
 * Note Form Modal Component
 *
 * Full-screen modal for creating and editing daily notes.
 *
 * Features:
 * - Optional title and required content (max 500 chars)
 * - Character counter with validation
 * - Delete functionality for existing notes
 * - Keyboard-aware layout
 *
 * Props:
 * - visible: Controls modal visibility
 * - date: Date string (YYYY-MM-DD) for the note
 * - note: Existing note data for editing (optional)
 * - onSave: Callback with note data
 * - onDelete: Callback for deleting existing notes (optional)
 * - onClose: Callback when modal is dismissed
 */
import { formatDateString } from '@/constants/timezone';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Note } from '@/types/notes';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NoteFormModalProps {
  visible: boolean;
  date: string | null;
  note?: Note | null;
  onClose: () => void;
  onSave: (noteTitle: string | null, noteContent: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const MAX_CHARS = 500;

export default function NoteFormModal({
  visible,
  date,
  note,
  onClose,
  onSave,
  onDelete,
}: NoteFormModalProps) {
  const { colors, common, tokens } = useThemedStyles();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(note?.title || '');
      setContent(note?.content || '');
    }
  }, [visible, note]);

  const handleSave = async () => {
    if (content.trim().length === 0) return;
    if (content.length > MAX_CHARS) return;

    setIsSaving(true);
    try {
      await onSave(title.trim() || null, content.trim());
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await onDelete();
          onClose();
        },
      },
    ]);
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSave = content.trim().length > 0 && !isOverLimit && !isSaving;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          common.container,
          {
            backgroundColor: colors.background,
            maxWidth: 600,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        edges={['top']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header Bar */}
          <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
               <Text style={[styles.headerDate, { color: colors.text }]}>
                  {date ? formatDateString(date, 'EEE, d MMM') : 'New Note'}
                </Text>
            </View>

            <TouchableOpacity 
              onPress={handleSave} 
              disabled={!canSave}
              style={[styles.headerButton, { opacity: canSave ? 1 : 0.5 }]}
            >
              <Text style={[styles.headerButtonText, { color: colors.primary, fontWeight: '700' }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Title Input */}
            <TextInput
              style={[
                styles.titleInput,
                { color: colors.text },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={colors.textMuted}
              maxLength={100}
            />

            {/* Content Input */}
            <TextInput
              style={[
                styles.contentInput,
                { color: colors.text },
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="Start typing..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={MAX_CHARS}
              textAlignVertical="top"
              scrollEnabled={false} // Let parent ScrollView handle scrolling
            />
          </ScrollView>

          {/* Footer with char counter */}
          <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
             <Text
                style={[
                  styles.charCounter,
                  { color: isOverLimit ? colors.error : colors.textMuted },
                ]}
              >
                {charCount} / {MAX_CHARS}
              </Text>
          </View>

          {/* Delete Button */}
          {note && onDelete && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <TouchableOpacity 
                onPress={handleDelete} 
                style={[styles.deleteButton, { backgroundColor: colors.surfaceElevated }]}
              >
                <Text style={{ color: colors.error, fontSize: 17, fontWeight: '500' }}>Delete Entry</Text>
              </TouchableOpacity>
            </View>
          )}

        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 17,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    padding: 0, // Remove default padding
  },
  contentInput: {
    fontSize: 17,
    lineHeight: 24,
    minHeight: 150,
    padding: 0, // Remove default padding
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
  },
  charCounter: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  deleteButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
});
