import { addDays, format, setHours, setMinutes } from 'date-fns';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CustomPicker } from './picker';

interface DateTimeSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
}

export function DateTimeSelector({
  value,
  onChange,
  mode = 'datetime',
}: DateTimeSelectorProps) {
  // Generate date options (next 30 days)
  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      options.push({
        label: format(date, 'MMM dd, yyyy'),
        value: date.toISOString(),
      });
    }
    return options;
  };

  // Generate hour options (0-23)
  const getHourOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      options.push({
        label: `${hour}:00`,
        value: i.toString(),
      });
    }
    return options;
  };

  // Generate minute options (0-59 in 5-minute increments)
  const getMinuteOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i += 5) {
      const minute = i.toString().padStart(2, '0');
      options.push({
        label: minute,
        value: i.toString(),
      });
    }
    return options;
  };

  // Handle date change
  const handleDateChange = (dateString: string) => {
    if (dateString) {
      const newDate = new Date(dateString);
      const currentHours = value.getHours();
      const currentMinutes = value.getMinutes();

      const updatedDate = setMinutes(
        setHours(newDate, currentHours),
        currentMinutes,
      );
      onChange(updatedDate);
    }
  };

  // Handle hour change
  const handleHourChange = (hourString: string) => {
    if (hourString) {
      const hour = parseInt(hourString, 10);
      const currentMinutes = value.getMinutes();
      const currentDate = new Date(value);

      const updatedDate = setMinutes(
        setHours(currentDate, hour),
        currentMinutes,
      );
      onChange(updatedDate);
    }
  };

  // Handle minute change
  const handleMinuteChange = (minuteString: string) => {
    if (minuteString) {
      const minute = parseInt(minuteString, 10);
      const currentHours = value.getHours();
      const currentDate = new Date(value);

      const updatedDate = setMinutes(
        setHours(currentDate, currentHours),
        minute,
      );
      onChange(updatedDate);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {mode !== 'time' && (
        <View style={styles.pickerWrapper}>
          <CustomPicker
            selectedValue={format(value, 'yyyy-MM-dd')}
            onValueChange={handleDateChange}
            items={getDateOptions()}
            placeholder="Select Date"
          />
        </View>
      )}

      {mode !== 'date' && (
        <>
          <View style={styles.pickerWrapper}>
            <CustomPicker
              selectedValue={value.getHours().toString()}
              onValueChange={handleHourChange}
              items={getHourOptions()}
              placeholder="Hour"
            />
          </View>

          <View style={styles.pickerWrapper}>
            <CustomPicker
              selectedValue={value.getMinutes().toString()}
              onValueChange={handleMinuteChange}
              items={getMinuteOptions()}
              placeholder="Minute"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  pickerWrapper: {
    width: 120,
    marginRight: 8,
  },
});
