/**
 * Setup Modal Component
 *
 * Initial onboarding screen that collects user profile information.
 * Refactored to match the app's Settings screen design system.
 */

import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/theme/themed-text';
import { stations } from '@/constants/station-list';
import { useOnboarding } from '@/contexts/onboarding';
import {
  useTheme,
  type GroupLetter,
  type ThemeMode,
} from '@/contexts/theme-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Button } from '@/components/ui/button';

// Helper component for section headers
const SectionHeader = ({
  title,
  icon,
  colors,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: any;
}) => (
  <View style={localStyles.sectionHeader}>
    <Ionicons name={icon} size={18} color={colors.primary} />
    <ThemedText
      style={[localStyles.sectionTitle, { color: colors.textSecondary }]}
    >
      {title.toUpperCase()}
    </ThemedText>
  </View>
);

export function SetupModal() {
  const { completeSetup } = useOnboarding();
  const { themeMode, setThemeMode, userGroup, setUserGroup } = useTheme();
  const { colors, platoonColors } = useThemedStyles();

  const [selectedLetter, setSelectedLetter] = useState<GroupLetter>(
    userGroup.group,
  );
  const [selectedNumber, setSelectedNumber] = useState<number>(
    userGroup.number,
  );
  const [selectedStation, setSelectedStation] = useState<string>(
    userGroup.baseStation,
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themeMode);
  const [showStationPicker, setShowStationPicker] = useState(false);

  const isValid =
    selectedLetter && selectedNumber && selectedStation && selectedTheme;

  const handleContinue = async () => {
    if (!isValid) return;

    // Save all settings
    setUserGroup({
      group: selectedLetter,
      number: selectedNumber,
      baseStation: selectedStation,
    });
    // Ensure theme is saved (it might be already set by handleThemeChange)
    setThemeMode(selectedTheme);

    // Move to tour
    completeSetup();
  };

  const handleThemeChange = (theme: ThemeMode) => {
    setSelectedTheme(theme);
    setThemeMode(theme); // Apply immediately for preview
  };

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'system', label: 'System', icon: 'settings-outline' },
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  ];

  return (
    <Modal visible={true} animationType="fade">
      <View
        style={[localStyles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={localStyles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={localStyles.header}>
            <View
              style={[
                localStyles.iconCircle,
                { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={32}
                color={colors.primary}
              />
            </View>
            <ThemedText style={[localStyles.title, { color: colors.text }]}>
              Welcome to FireCal
            </ThemedText>
            <ThemedText
              style={[localStyles.subtitle, { color: colors.textSecondary }]}
            >
              Let&apos;s set up your profile. You can change these later in
              Settings.
            </ThemedText>
          </View>

          <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center' }}>
            {/* Theme Section */}
            <View style={localStyles.sectionContainer}>
              <SectionHeader
                title="Appearance"
                icon="color-palette-outline"
                colors={colors}
              />
              <View
                style={[
                  localStyles.card,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                <View
                  style={[
                    localStyles.themeRow,
                    { backgroundColor: colors.surfaceTrack },
                  ]}
                >
                  {themeOptions.map((option) => {
                    const isActive = selectedTheme === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          localStyles.themeButton,
                          isActive && {
                            backgroundColor: colors.surfaceHighlight,
                          },
                          isActive && localStyles.shadow,
                        ]}
                        onPress={() => handleThemeChange(option.value)}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={isActive ? colors.text : colors.textMuted}
                        />
                        <ThemedText
                          style={[
                            localStyles.themeButtonText,
                            {
                              color: isActive ? colors.text : colors.textMuted,
                            },
                          ]}
                        >
                          {option.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Platoon Section */}
            <View style={localStyles.sectionContainer}>
              <SectionHeader
                title="Platoon Settings"
                icon="people-outline"
                colors={colors}
              />
              <View
                style={[
                  localStyles.card,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                {/* Group Letter */}
                <View style={localStyles.settingRow}>
                  <ThemedText
                    style={[localStyles.settingLabel, { color: colors.text }]}
                  >
                    Platoon
                  </ThemedText>
                  <View style={localStyles.groupToggles}>
                    {(['A', 'B', 'C', 'D'] as GroupLetter[]).map((letter) => (
                      <TouchableOpacity
                        key={letter}
                        style={[
                          localStyles.letterButton,
                          {
                            backgroundColor:
                              selectedLetter === letter
                                ? platoonColors[letter]
                                : 'transparent',
                            borderColor: platoonColors[letter],
                          },
                        ]}
                        onPress={() => setSelectedLetter(letter)}
                      >
                        <ThemedText
                          style={[
                            localStyles.letterText,
                            {
                              color:
                                selectedLetter === letter
                                  ? '#FFF'
                                  : platoonColors[letter],
                            },
                          ]}
                        >
                          {letter}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View
                  style={[
                    localStyles.divider,
                    { backgroundColor: colors.borderLight },
                  ]}
                />

                {/* Group Number */}
                <View
                  style={[
                    localStyles.settingRow,
                    {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 12,
                    },
                  ]}
                >
                  <ThemedText
                    style={[localStyles.settingLabel, { color: colors.text }]}
                  >
                    Leave Group
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 16 }}
                  >
                    <View style={localStyles.numberRow}>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(
                        (number) => (
                          <TouchableOpacity
                            key={number}
                            style={[
                              localStyles.numberButton,
                              {
                                borderColor: selectedLetter
                                  ? platoonColors[selectedLetter]
                                  : colors.border,
                                backgroundColor:
                                  selectedNumber === number && selectedLetter
                                    ? platoonColors[selectedLetter]
                                    : 'transparent',
                              },
                            ]}
                            onPress={() => setSelectedNumber(number)}
                          >
                            <ThemedText
                              style={[
                                localStyles.numberText,
                                {
                                  color:
                                    selectedNumber === number && selectedLetter
                                      ? '#FFF'
                                      : selectedLetter
                                        ? platoonColors[selectedLetter]
                                        : colors.text,
                                },
                              ]}
                            >
                              {number}
                            </ThemedText>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Base Section */}
            <View style={localStyles.sectionContainer}>
              <SectionHeader title="Base" icon="home-outline" colors={colors} />
              <View
                style={[
                  localStyles.card,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                <TouchableOpacity
                  style={localStyles.settingRow}
                  onPress={() => setShowStationPicker(true)}
                >
                  <ThemedText
                    style={[localStyles.settingLabel, { color: colors.text }]}
                  >
                    Station
                  </ThemedText>
                  <View style={localStyles.valueContainer}>
                    <ThemedText
                      style={[
                        localStyles.settingValue,
                        {
                          color: selectedStation
                            ? colors.text
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {selectedStation || 'Select'}
                    </ThemedText>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={localStyles.footer}>
              <Button
                title="Continue"
                onPress={handleContinue}
                disabled={!isValid}
              />
            </View>
          </View>
        </ScrollView>

        {/* Station Picker Modal */}
        <Modal
          visible={showStationPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowStationPicker(false)}
        >
          <View style={localStyles.modalOverlay}>
            <View
              style={[
                localStyles.modalContent,
                { backgroundColor: colors.surface },
              ]}
            >
              <View
                style={[
                  localStyles.modalHeader,
                  { borderBottomColor: colors.borderLight },
                ]}
              >
                <ThemedText
                  style={[localStyles.modalTitle, { color: colors.text }]}
                >
                  Select Base Station
                </ThemedText>
                <TouchableOpacity onPress={() => setShowStationPicker(false)}>
                  <ThemedText
                    style={{
                      color: colors.primary,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Done
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <ScrollView style={localStyles.stationList}>
                {stations.map(([label, value]) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      localStyles.stationItem,
                      { borderBottomColor: colors.borderLight },
                      selectedStation === label && {
                        backgroundColor: colors.surfaceElevated,
                      },
                    ]}
                    onPress={() => {
                      setSelectedStation(label);
                      setShowStationPicker(false);
                    }}
                  >
                    <ThemedText
                      style={[
                        localStyles.stationItemText,
                        { color: colors.text },
                      ]}
                    >
                      {label}
                    </ThemedText>
                    {selectedStation === label && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 280,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Theme Styles
  themeRow: {
    flexDirection: 'row',
    padding: 4,
    margin: 12,
    borderRadius: 10,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Row Styles
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  // Platoon Styles
  groupToggles: {
    flexDirection: 'row',
    gap: 12,
  },
  letterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 16,
    fontWeight: '700',
  },
  numberRow: {
    flexDirection: 'row',
    gap: 6,
  },
  numberButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  stationList: { maxHeight: 500 },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  stationItemText: { fontSize: 16 },
});
