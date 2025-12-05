import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PickerItem {
  label: string;
  value: string;
}

interface PickerProps {
  selectedValue: string;
  onValueChange: (itemValue: string) => void;
  items: PickerItem[];
  placeholder?: string;
  enabled?: boolean;
}

export function CustomPicker({
  selectedValue,
  onValueChange,
  items,
  placeholder = 'Select an option...',
  enabled = true,
}: PickerProps) {
  const { colors, common } = useThemedStyles();

  return (
    <View style={[common.input, styles.container, !enabled && styles.disabled]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        enabled={enabled}
        style={[styles.picker, { color: colors.text }]}
        dropdownIconColor={colors.textSecondary}
        mode="dropdown"
      >
        {placeholder && <Picker.Item label={placeholder} value="" />}
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, // Override common.input padding for picker
    paddingVertical: 0,
  },
  picker: {
    height: 56,
  },
  disabled: {
    opacity: 0.6,
  },
});
