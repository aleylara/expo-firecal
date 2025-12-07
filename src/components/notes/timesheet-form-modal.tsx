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
import { stations } from '@/constants/station-list';
import { formatDateString, validateHHMMFormat } from '@/constants/timezone';
import { useTheme } from '@/contexts/theme-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import type { Timesheet } from '@/types/notes';
import { DistanceMatrix } from '@/utils/distance-matrix';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    more_info: string | null;
    overtime_shift: boolean;
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
  const [moreInfo, setMoreInfo] = useState('');
  const [overtimeShift, setOvertimeShift] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [manualKmsOverride, setManualKmsOverride] = useState(false);
  const [startTimeFocused, setStartTimeFocused] = useState(false);
  const [finishTimeFocused, setFinishTimeFocused] = useState(false);

  // Station picker modals
  const [showFromStationPicker, setShowFromStationPicker] = useState(false);
  const [showToStationPicker, setShowToStationPicker] = useState(false);

  // Validation errors
  const [hoursError, setHoursError] = useState('');
  const [kmsError, setKmsError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [finishTimeError, setFinishTimeError] = useState('');
  const [moreInfoError, setMoreInfoError] = useState('');

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
      setStartTime(
        timesheet?.start_time ? formatTimeForDisplay(timesheet.start_time) : '',
      );
      setFinishTime(
        timesheet?.finish_time
          ? formatTimeForDisplay(timesheet.finish_time)
          : '',
      );
      setMoreInfo(timesheet?.more_info || '');
      setOvertimeShift(timesheet?.overtime_shift === 1);

      // Clear errors
      setHoursError('');
      setKmsError('');
      setStartTimeError('');
      setFinishTimeError('');
      setMoreInfoError('');
    }
  }, [visible, timesheet, userGroup.baseStation]);

  // Auto-format time input as user types (add colon after 2 digits)
  const handleTimeInput = (text: string, setter: (value: string) => void) => {
    // Remove non-digits
    const digits = text.replace(/\D/g, '');

    // Format as HH:MM
    if (digits.length <= 2) {
      setter(digits);
    } else if (digits.length <= 4) {
      setter(`${digits.substring(0, 2)}:${digits.substring(2)}`);
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
      }
    }
  }, [fromStation, toStation, manualKmsOverride, distanceMatrix]);

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

    // Validate more_info (max 255 chars)
    if (moreInfo.length > 255) {
      setMoreInfoError('Max 255 chars');
      isValid = false;
    } else {
      setMoreInfoError('');
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
        more_info: moreInfo.trim() || null,
        overtime_shift: overtimeShift,
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
      timesheet.more_info !== null);
  
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
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Shift Time Group */}
            <FormGroup title="Shift Details" colors={colors}>
               <FormRow 
                 label="Start Time" 
                 value={startTime} 
                 onChange={(t: string) => handleTimeInput(t, setStartTime)} 
                 placeholder={!startTimeFocused && !startTime ? "0800" : ""} 
                 error={startTimeError}
                 keyboardType="number-pad"
                 maxLength={5}
                 onFocus={() => setStartTimeFocused(true)}
                 onBlur={() => setStartTimeFocused(false)}
                 colors={colors}
               />
               <FormRow 
                 label="Finish" 
                 value={finishTime} 
                 onChange={(t: string) => handleTimeInput(t, setFinishTime)} 
                 placeholder={!finishTimeFocused && !finishTime ? "1700" : ""} 
                 error={finishTimeError}
                 keyboardType="number-pad"
                 maxLength={5}
                 onFocus={() => setFinishTimeFocused(true)}
                 onBlur={() => setFinishTimeFocused(false)}
                 colors={colors}
               />
               <FormRow 
                 label="Total Hours" 
                 value={totalHours} 
                 onChange={setTotalHours} 
                 placeholder="Auto" 
                 error={hoursError}
                 keyboardType="decimal-pad"
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
                 placeholder="Auto" 
                 error={kmsError}
                 keyboardType="numeric"
                 isLast
                 colors={colors}
               />
            </FormGroup>

            {/* Other Details Group */}
            <FormGroup title="Additional Info" colors={colors}>
               <View style={[styles.formRow, { borderBottomWidth: 0.5, borderBottomColor: colors.borderLight, justifyContent: 'space-between' }]}>
                 <Text style={[styles.rowLabel, { color: colors.text }]}>Recall/Overtime</Text>
                 <Switch
                    value={overtimeShift}
                    onValueChange={setOvertimeShift}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.surface}
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
                 <Text style={[styles.rowLabel, { color: colors.text, marginBottom: 8 }]}>Notes</Text>
                 <TextInput
                   style={[styles.rowInput, { color: colors.text, textAlign: 'left', minHeight: 80, width: '100%', flex: 0 }]}
                   value={moreInfo}
                   onChangeText={setMoreInfo}
                   placeholder="Add notes..."
                   placeholderTextColor={colors.textMuted}
                   multiline
                   maxLength={255}
                   textAlignVertical="top"
                 />
                 {moreInfoError ? <Text style={styles.inlineError}>{moreInfoError}</Text> : null}
               </View>
            </FormGroup>

            {/* Delete Button */}
            {hasTimesheetData && onDelete && (
               <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={{ color: colors.error, fontSize: 17, fontWeight: '500' }}>Delete Entry</Text>
               </TouchableOpacity>
            )}

          </ScrollView>
        </KeyboardAvoidingView>

        {/* Reuse existing Modal logic for Pickers */}
        {/* From Station Picker Modal */}
        <Modal
          visible={showFromStationPicker}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowFromStationPicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={[styles.pickerModalContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.pickerModalHeader, { borderBottomColor: colors.borderLight }]}>
                <Text style={[styles.pickerModalTitle, { color: colors.text }]}>From Station</Text>
                <TouchableOpacity onPress={() => setShowFromStationPicker(false)}>
                  <Text style={{ color: colors.primary, fontSize: 16 }}>Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerStationList} removeClippedSubviews>
                {stations.map(([label, value]) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.pickerStationItem, { borderBottomColor: colors.borderLight }, fromStation === label && { backgroundColor: colors.surfaceElevated }]}
                    onPress={() => { setFromStation(label); setShowFromStationPicker(false); }}
                  >
                    <Text style={[styles.pickerStationText, { color: colors.text }]}>{label}</Text>
                    {fromStation === label && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* To Station Picker Modal */}
        <Modal
          visible={showToStationPicker}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowToStationPicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={[styles.pickerModalContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.pickerModalHeader, { borderBottomColor: colors.borderLight }]}>
                 <Text style={[styles.pickerModalTitle, { color: colors.text }]}>To Station</Text>
                <TouchableOpacity onPress={() => setShowToStationPicker(false)}>
                  <Text style={{ color: colors.primary, fontSize: 16 }}>Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerStationList} removeClippedSubviews>
                {stations.map(([label, value]) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.pickerStationItem, { borderBottomColor: colors.borderLight }, toStation === label && { backgroundColor: colors.surfaceElevated }]}
                    onPress={() => { setToStation(label); setShowToStationPicker(false); }}
                  >
                    <Text style={[styles.pickerStationText, { color: colors.text }]}>{label}</Text>
                    {toStation === label && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  colors
}: any) => (
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

  // Picker Styles
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerStationList: {
    maxHeight: 400,
  },
  pickerStationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerStationText: {
    fontSize: 16,
  },
});
