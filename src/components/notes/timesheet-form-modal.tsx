/**
 * Timesheet Form Modal
 *
 * Full-screen modal for creating and editing timesheet entries.
 * Includes fields for hours, stations, kms, times, and overtime flag.
 * Validates numeric inputs and time format (HHMM).
 *
 * Features:
 * - Station dropdowns with base station default
 * - Auto-calculation of return kilometers from distance matrix
 * - Auto-calculation of hours from start/finish times
 */
import { formatDateString, validateHHMMFormat } from '@/constants/timezone';
import { useTheme } from '@/contexts/theme-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Timesheet } from '@/types/notes';
import { DistanceMatrix } from '@/utils/distance-matrix';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StationPickerModal } from './station-picker-modal';

interface TimesheetFormModalProps {
  visible: boolean;
  date: string | null;
  timesheet?: Timesheet | null;
  onClose: () => void;
  onSave: (data: {
    total_hours: number | null;
    taken_leave: string | null;
    from_station: string | null;
    to_station: string | null;
    return_kms: number | null;
    start_time: string | null;
    finish_time: string | null;
    stayback: string | null;
    comments: string | null;
    overtime_shift: boolean;
    action_required: boolean;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function TimesheetFormModal({
  visible,
  date,
  timesheet,
  onClose,
  onSave,
  onDelete,
}: TimesheetFormModalProps) {
  const { colors, common, tokens } = useThemedStyles();
  const { userGroup } = useTheme();
  const distanceMatrix = useMemo(() => new DistanceMatrix(), []);

  const [totalHours, setTotalHours] = useState('');
  const [takenLeave, setTakenLeave] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [returnKms, setReturnKms] = useState('');
  const [startTime, setStartTime] = useState('');
  const [finishTime, setFinishTime] = useState('');
  const [stayback, setStayback] = useState('');
  const [comments, setComments] = useState('');
  const [overtimeShift, setOvertimeShift] = useState(false);
  const [actionRequired, setActionRequired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [manualKmsOverride, setManualKmsOverride] = useState(false);
  const [kmsFocused, setKmsFocused] = useState(false);

  // Ref to suppress auto-triggering action required during initial load
  const suppressActionRequiredTrigger = React.useRef(false);

  // Station picker modals
  const [showFromStationPicker, setShowFromStationPicker] = useState(false);
  const [showToStationPicker, setShowToStationPicker] = useState(false);

  // Validation errors
  const [hoursError, setHoursError] = useState('');
  const [kmsError, setKmsError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [finishTimeError, setFinishTimeError] = useState('');
  const [staybackError, setStaybackError] = useState('');
  const [commentsError, setCommentsError] = useState('');

  // Helper to format HHMM to HH:MM for display
  const formatTimeForDisplay = (time: string): string => {
    if (!time || time.length !== 4) return '';
    return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
  };

  // Helper to strip colon from HH:MM to HHMM for storage
  const formatTimeForStorage = (time: string): string => {
    return time.replace(':', '');
  };

  // Initialize form with existing data or defaults
  useEffect(() => {
    if (visible) {
      setTotalHours(timesheet?.total_hours?.toString() || '');
      setTakenLeave(timesheet?.taken_leave || '');
      // Default from station to user's base station if creating new entry
      setFromStation(timesheet?.from_station || userGroup.baseStation || '');
      setToStation(timesheet?.to_station || '');
      setReturnKms(timesheet?.return_kms?.toString() || '');
      setManualKmsOverride(!!timesheet?.return_kms);
      setStartTime(
        timesheet?.start_time ? formatTimeForDisplay(timesheet.start_time) : '',
      );
      setFinishTime(
        timesheet?.finish_time
          ? formatTimeForDisplay(timesheet.finish_time)
          : '',
      );
      setStayback(
        timesheet?.stayback ? formatTimeForDisplay(timesheet.stayback) : '',
      );
      setComments(timesheet?.comments || '');
      setOvertimeShift(timesheet?.overtime_shift === 1);
      setActionRequired(timesheet?.action_required === 1);

      // Suppress the next auto-trigger from the distance calc effect
      // so we don't overwrite the loaded action_required state
      if (timesheet) {
        suppressActionRequiredTrigger.current = true;
      }

      // Clear errors
      setHoursError('');
      setKmsError('');
      setStartTimeError('');
      setFinishTimeError('');
      setStaybackError('');
      setCommentsError('');
    }
  }, [visible, timesheet, userGroup.baseStation]);

  // Auto-format time input as user types (add colon after 2 digits)
  // Also restricts input to valid time values (HH: 00-23, MM: 00-59)
  const handleTimeInput = (text: string, setter: (value: string) => void) => {
    // Remove non-digits
    const digits = text.replace(/\D/g, '');

    // Validate each digit position
    let validDigits = '';
    for (let i = 0; i < digits.length && i < 4; i++) {
      const digit = parseInt(digits[i], 10);

      if (i === 0) {
        // First hour digit: 0-2 only
        if (digit <= 2) validDigits += digits[i];
      } else if (i === 1) {
        // Second hour digit: depends on first digit
        const firstHourDigit = parseInt(validDigits[0], 10);
        if (firstHourDigit === 2) {
          // If hour starts with 2, only allow 0-3 (20-23)
          if (digit <= 3) validDigits += digits[i];
        } else {
          // If hour starts with 0 or 1, allow 0-9 (00-19)
          validDigits += digits[i];
        }
      } else if (i === 2) {
        // First minute digit: 0-5 only (00-59)
        if (digit <= 5) validDigits += digits[i];
      } else if (i === 3) {
        // Second minute digit: 0-9
        validDigits += digits[i];
      }
    }

    // Format as HH:MM
    if (validDigits.length <= 2) {
      setter(validDigits);
    } else if (validDigits.length <= 4) {
      setter(`${validDigits.substring(0, 2)}:${validDigits.substring(2)}`);
    }
  };

  // Auto-calculate hours when start and finish times change
  useEffect(() => {
    const startFormatted = formatTimeForStorage(startTime);
    const finishFormatted = formatTimeForStorage(finishTime);

    if (
      startFormatted.length === 4 &&
      finishFormatted.length === 4 &&
      validateHHMMFormat(startFormatted) &&
      validateHHMMFormat(finishFormatted)
    ) {
      const startHour = parseInt(startFormatted.substring(0, 2));
      const startMin = parseInt(startFormatted.substring(2, 4));
      const finishHour = parseInt(finishFormatted.substring(0, 2));
      const finishMin = parseInt(finishFormatted.substring(2, 4));

      let totalMinutes =
        finishHour * 60 + finishMin - (startHour * 60 + startMin);

      // Handle overnight shifts or 24-hour shifts
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
      } else if (totalMinutes === 0) {
        // Same time = 24 hour shift
        totalMinutes = 24 * 60;
      }

      const hours = (totalMinutes / 60).toFixed(2);
      setTotalHours(hours);
    }
  }, [startTime, finishTime]);

  // Auto-calculate return kilometers when stations change
  useEffect(() => {
    // Only auto-calculate if both stations are selected and user hasn't manually overridden
    if (fromStation && toStation && !manualKmsOverride) {
      // Strip station numbers (e.g., "1 City Of Sydney" -> "City Of Sydney")
      const fromStationName = fromStation.replace(/^\d+\s+/, '');
      const toStationName = toStation.replace(/^\d+\s+/, '');

      const distanceStr = distanceMatrix.getDistance(
        fromStationName,
        toStationName,
      );

      if (distanceStr) {
        // Extract numeric value from "X Km" format
        const distance = distanceStr.replace(' Km', '');
        setReturnKms(distance);
      } else {
        // Not found in matrix - set to N/A
        setReturnKms('N/A');

        // Auto-trigger action_required when N/A is set (skip on initial load)
        if (!suppressActionRequiredTrigger.current) {
          setActionRequired(true);
          
          // Add ESS claim note once (only if comments are empty)
          if (!comments.trim()) {
            setComments('Submit a Quick Claim in ESS');
          }
        }
      }
    }
    
    // Clear suppression flag after first effect run
    suppressActionRequiredTrigger.current = false;
  }, [fromStation, toStation, manualKmsOverride, distanceMatrix]);

  const handleKmsFocus = () => {
    setKmsFocused(true);
    if (returnKms === 'N/A') {
      setReturnKms('');
    }
  };

  const handleKmsBlur = () => {
    setKmsFocused(false);
    if (!returnKms.trim() && fromStation && toStation) {
      // If user clears field and leaves it empty, restore auto-calc
      const fromStationName = fromStation.replace(/^\d+\s+/, '');
      const toStationName = toStation.replace(/^\d+\s+/, '');

      const distanceStr = distanceMatrix.getDistance(
        fromStationName,
        toStationName,
      );

      if (distanceStr) {
        setReturnKms(distanceStr.replace(' Km', ''));
      } else {
        setReturnKms('N/A');
      }
      setManualKmsOverride(false);
    }
  };



  const validateForm = (): boolean => {
    let isValid = true;

    // Validate total_hours (positive decimal)
    if (
      totalHours.trim() &&
      (isNaN(Number(totalHours)) || Number(totalHours) <= 0)
    ) {
      setHoursError('Positive number required');
      isValid = false;
    } else {
      setHoursError('');
    }

    // Validate return_kms (positive number or N/A)
    if (
      returnKms.trim() &&
      returnKms !== 'N/A' &&
      (isNaN(Number(returnKms)) || Number(returnKms) < 0)
    ) {
      setKmsError('Invalid number');
      isValid = false;
    } else {
      setKmsError('');
    }

    // Validate start_time (HH:MM format)
    const startFormatted = formatTimeForStorage(startTime);
    if (startTime.trim() && !validateHHMMFormat(startFormatted)) {
      setStartTimeError('Invalid time');
      isValid = false;
    } else {
      setStartTimeError('');
    }

    // Validate finish_time (HH:MM format)
    const finishFormatted = formatTimeForStorage(finishTime);
    if (finishTime.trim() && !validateHHMMFormat(finishFormatted)) {
      setFinishTimeError('Invalid time');
      isValid = false;
    } else {
      setFinishTimeError('');
    }

    // Validate stayback (HH:MM format)
    const staybackFormatted = formatTimeForStorage(stayback);
    if (stayback.trim() && !validateHHMMFormat(staybackFormatted)) {
      setStaybackError('Invalid time');
      isValid = false;
    } else {
      setStaybackError('');
    }

    // Validate comments (max 255 chars)
    if (comments.length > 255) {
      setCommentsError('Max 255 chars');
      isValid = false;
    } else {
      setCommentsError('');
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave({
        total_hours: totalHours.trim() ? Number(totalHours) : null,
        taken_leave: takenLeave.trim() || null,
        from_station: fromStation.trim() || null,
        to_station: toStation.trim() || null,
        return_kms:
          returnKms.trim() && returnKms !== 'N/A' ? Number(returnKms) : null,
        start_time: startTime.trim() ? formatTimeForStorage(startTime) : null,
        finish_time: finishTime.trim()
          ? formatTimeForStorage(finishTime)
          : null,
        stayback: stayback.trim() ? formatTimeForStorage(stayback) : null,
        comments: comments.trim() || null,
        overtime_shift: overtimeShift,
        action_required: actionRequired,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete Timesheet',
      'Are you sure you want to delete this timesheet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDelete();
            onClose();
          },
        },
      ],
    );
  };

  const hasTimesheetData =
    timesheet &&
    (timesheet.total_hours !== null ||
      timesheet.taken_leave !== null ||
      timesheet.from_station !== null ||
      timesheet.to_station !== null ||
      timesheet.return_kms !== null ||
      timesheet.start_time !== null ||
      timesheet.finish_time !== null ||
      timesheet.comments !== null ||
      timesheet.stayback !== null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[common.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {date ? formatDateString(date, 'EEE, d MMM') : 'New Entry'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isSaving}>
              <Text style={[styles.headerButtonText, { color: colors.primary, fontWeight: '700' }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ paddingBottom: 40, flex: 1 }}>
                {/* Shift Time Group */}
                <FormGroup title="Shift Details" colors={colors}>
                  {/* Overtime Toggle */}
                  <View style={[styles.formRow, styles.switchRow, { borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }]}>
                    <View style={styles.switchLabelContainer}>
                      <Text style={[styles.rowLabel, { color: colors.text }]}>Overtime Shift</Text>
                    </View>
                    <Switch
                      value={overtimeShift}
                      onValueChange={setOvertimeShift}
                      trackColor={{ false: colors.borderStrong, true: colors.success }}
                      thumbColor={colors.switchThumb}
                      ios_backgroundColor={colors.borderStrong}
                      style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                    />
                  </View>

                  <FormRow
                    label="Start Time"
                    value={startTime}
                    onChange={(t: string) => handleTimeInput(t, setStartTime)}
                    placeholder="HH:MM"
                    error={startTimeError}
                    keyboardType="number-pad"
                    maxLength={5}
                    colors={colors}
                  />
                  <FormRow
                    label="Finish"
                    value={finishTime}
                    onChange={(t: string) => handleTimeInput(t, setFinishTime)}
                    placeholder="HH:MM"
                    error={finishTimeError}
                    keyboardType="number-pad"
                    maxLength={5}
                    colors={colors}
                  />
                  <FormRow
                    label="Total Hours"
                    value={totalHours}
                    onChange={setTotalHours}
                    placeholder="Auto"
                    error={hoursError}
                    keyboardType="decimal-pad"
                    colors={colors}
                  />
                  <FormRow
                    label="Stayback"
                    value={stayback}
                    onChange={(t: string) => handleTimeInput(t, setStayback)}
                    placeholder="HH:MM"
                    error={staybackError}
                    keyboardType="number-pad"
                    maxLength={5}
                    isLast
                    colors={colors}
                  />
                </FormGroup>

                {/* Location Group */}
                <FormGroup title="Travel & Location" colors={colors}>
                  <FormRow
                    label="From"
                    value={fromStation}
                    onPress={() => setShowFromStationPicker(true)}
                    placeholder="Select"
                    rightIcon="chevron-forward"
                    colors={colors}
                  />
                  <FormRow
                    label="To"
                    value={toStation}
                    onPress={() => setShowToStationPicker(true)}
                    placeholder="Select"
                    rightIcon="chevron-forward"
                    colors={colors}
                  />
                  <FormRow
                    label="Return Kms"
                    value={returnKms}
                    onChange={(t: string) => { setReturnKms(t); setManualKmsOverride(true); }}
                    placeholder={kmsFocused ? "" : "Auto"}
                    error={kmsError}
                    keyboardType="numeric"
                    isLast
                    colors={colors}
                    suffix={returnKms === 'N/A' ? ' 🚩' : null}
                    onFocus={handleKmsFocus}
                    onBlur={handleKmsBlur}
                  />
                </FormGroup>

                {/* Other Details Group */}
                <FormGroup title="Additional Info" colors={colors}>

                  <View style={[styles.formRow, styles.switchRow, { borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }]}>
                    <View style={styles.switchLabelContainer}>
                      <Text style={[styles.rowLabel, { color: colors.text }]}>
                        Action Required{actionRequired ? <Text style={{ fontSize: 12 }}> 🚩</Text> : ''}
                      </Text>
                    </View>
                    <Switch
                      value={actionRequired}
                      onValueChange={setActionRequired}
                      trackColor={{ false: colors.borderStrong, true: colors.warning }}
                      thumbColor={colors.switchThumb}
                      ios_backgroundColor={colors.borderStrong}
                      style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                    />
                  </View>
                  <FormRow
                    label="Taken Leave"
                    value={takenLeave}
                    onChange={setTakenLeave}
                    placeholder="e.g. 2Hrs CL"
                    colors={colors}
                  />
                  <View style={[styles.formRow, { height: 'auto', flexDirection: 'column', alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12 }]}>
                    <Text style={[styles.rowLabel, { color: colors.text, marginBottom: 8 }]}>Comments</Text>
                    <TextInput
                      style={[styles.rowInput, { color: colors.text, textAlign: 'left', minHeight: 80, width: '100%', flex: 0 }]}
                      value={comments}
                      onChangeText={setComments}
                      placeholder="Add comments..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      maxLength={255}
                      textAlignVertical="top"
                    />
                    {commentsError ? <Text style={styles.inlineError}>{commentsError}</Text> : null}
                  </View>
                </FormGroup>

                {/* Delete Button */}
                {hasTimesheetData && onDelete && (
                  <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { backgroundColor: colors.surfaceElevated }]}>
                    <Text style={{ color: colors.error, fontSize: 17, fontWeight: '500' }}>Delete Entry</Text>
                  </TouchableOpacity>
                )}

              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* New Reusable Station Pickers */}
        <StationPickerModal
          visible={showFromStationPicker}
          title="From Station"
          onClose={() => setShowFromStationPicker(false)}
          onSelect={setFromStation}
          selectedValue={fromStation}
        />

        <StationPickerModal
          visible={showToStationPicker}
          title="To Station"
          onClose={() => setShowToStationPicker(false)}
          onSelect={setToStation}
          selectedValue={toStation}
        />
      </SafeAreaView>
    </Modal>
  );
}

// Reusable Components moved outside to prevent re-renders losing focus
const FormGroup = ({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) => (
  <View style={styles.formGroup}>
    <Text style={[styles.groupTitle, { color: colors.textMuted }]}>{title.toUpperCase()}</Text>
    <View style={[styles.groupContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
      {children}
    </View>
  </View>
);

interface FormRowProps {
  label: string;
  value: string;
  onChange?: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'number-pad' | 'decimal-pad';
  isLast?: boolean;
  maxLength?: number;
  readOnly?: boolean;
  onPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onFocus?: () => void;
  onBlur?: () => void;
  colors: any; // Using any for colors context object for simplicity as it comes from hook
  suffix?: string | null;
}

const FormRow = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  keyboardType = 'default',
  isLast = false,
  maxLength,
  readOnly = false,
  onPress,
  rightIcon,
  onFocus,
  onBlur,
  colors,
  suffix
}: FormRowProps) => (
  <View style={[styles.formRow, !isLast && { borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }]}>
    <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1}>{label}</Text>
    {onPress ? (
      <TouchableOpacity onPress={onPress} style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Text style={[styles.rowValue, { color: value ? colors.text : colors.textMuted }]}>
          {value || placeholder}
        </Text>
        {rightIcon && <Ionicons name={rightIcon} size={16} color={colors.textMuted} style={{ marginLeft: 4 }} />}
      </TouchableOpacity>
    ) : (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={[styles.rowInput, { color: colors.text }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={!readOnly}
          textAlign="right"
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {suffix && <Text style={{ fontSize: 14, marginLeft: 4 }}>{suffix}</Text>}
      </View>
    )}
    {error ? <Text style={styles.inlineError}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerButton: {
    padding: 4,
  },
  headerButtonText: {
    fontSize: 17,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16, // Use default inset
    paddingTop: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    marginLeft: 16,
    marginBottom: 8,
  },
  groupContainer: {
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48, // Standard row height
  },
  switchRow: {
    height: 60,
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '400',
    // Removed flex: 1 to allow label to take necessary width
    marginRight: 12, // Add spacing between label and input
  },
  rowInput: {
    fontSize: 16,
    flex: 1, // Take up all remaining space
    textAlign: 'right', // Align text to the right
  },
  rowValue: {
    fontSize: 16,
    flex: 1, // Ensure touchable value also takes up space
    textAlign: 'right',
  },
  inlineError: {
    color: 'red',
    fontSize: 11,
    position: 'absolute',
    bottom: 2,
    right: 16
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    marginBottom: 40,
  },
});
