import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/theme/themed-text';
import { ThemedView } from '@/components/theme/themed-view';
import { stations } from '@/constants/station-list';
import {
  useTheme,
  type GroupLetter,
  type ThemeMode,
} from '@/contexts/theme-context';
import { useSubscription } from '@/contexts/subscription/subscription-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';

const themeOptions: {
  value: ThemeMode;
  label: string;
  icon: string;
}[] = [
  { value: 'system', label: 'System', icon: 'settings-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

const SectionHeader = ({
  title,
  icon,
  colors,
  styles,
}: {
  title: string;
  icon: string;
  colors: any;
  styles: any;
}) => (
  <View style={styles.sectionHeader}>
    <Ionicons name={icon as any} size={18} color={colors.primary} />
    <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
      {title.toUpperCase()}
    </ThemedText>
  </View>
);

export default function SettingsScreen() {
  const { themeMode, setThemeMode, userGroup, setUserGroup, setBaseStation } =
    useTheme();
  const { hasFireCalPro, presentPaywall, presentCustomerCenter } =
    useSubscription();
  const { colors, platoonColors } = useThemedStyles();
  const [showStationPicker, setShowStationPicker] = useState(false);

  const handleThemeChange = (theme: ThemeMode) => {
    setThemeMode(theme);
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
      >
        <View
          style={[
            styles.content,
            { maxWidth: 600, width: '100%', alignSelf: 'center' },
          ]}
        >
          {/* Appearance Section */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Appearance"
              icon="color-palette-outline"
              colors={colors}
              styles={styles}
            />
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View
                style={[
                  styles.themeRow,
                  { backgroundColor: colors.surfaceTrack },
                ]}
              >
                {themeOptions.map((option) => {
                  const isActive = themeMode === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.themeButton,
                        isActive && {
                          backgroundColor: colors.surfaceHighlight,
                        },
                        isActive && styles.shadow,
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
                          styles.themeButtonText,
                          { color: isActive ? colors.text : colors.textMuted },
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

          {/* Platoon Settings Section */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Platoon Settings"
              icon="people-outline"
              colors={colors}
              styles={styles}
            />
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              {/* Group Letter */}
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Platoon</ThemedText>
                <View style={styles.groupToggles}>
                  {(['A', 'B', 'C', 'D'] as GroupLetter[]).map((letter) => (
                    <TouchableOpacity
                      key={letter}
                      style={[
                        styles.letterButton,
                        {
                          backgroundColor:
                            userGroup.group === letter
                              ? platoonColors[letter]
                              : 'transparent',
                          borderColor: platoonColors[letter], // Always show group color border
                        },
                      ]}
                      onPress={() =>
                        setUserGroup({ ...userGroup, group: letter })
                      }
                    >
                      <ThemedText
                        style={[
                          styles.letterText,
                          {
                            color:
                              userGroup.group === letter
                                ? '#FFF'
                                : platoonColors[letter],
                          }, // Show colored text when inactive
                        ]}
                      >
                        {letter}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View
                style={[styles.divider, { backgroundColor: colors.borderLight }]}
              />

              {/* Group Number */}
              <View
                style={[
                  styles.settingRow,
                  { flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
                ]}
              >
                <ThemedText style={styles.settingLabel}>Leave Group</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                >
                  <View style={styles.numberRow}>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(
                      (number) => (
                        <TouchableOpacity
                          key={number}
                          style={[
                            styles.numberButton,
                            {
                              borderColor: platoonColors[userGroup.group], // Use selected group color
                              backgroundColor:
                                userGroup.number === number
                                  ? platoonColors[userGroup.group]
                                  : 'transparent',
                            },
                          ]}
                          onPress={() => setUserGroup({ ...userGroup, number })}
                        >
                          <ThemedText
                            style={[
                              styles.numberText,
                              {
                                color:
                                  userGroup.number === number
                                    ? '#FFF'
                                    : platoonColors[userGroup.group],
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

          {/* Location Section */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Base"
              icon="home-outline"
              colors={colors}
              styles={styles}
            />
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setShowStationPicker(true)}
              >
                <ThemedText style={styles.settingLabel}>Station</ThemedText>
                <View style={styles.valueContainer}>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      {
                        color: userGroup.baseStation
                          ? colors.text
                          : colors.textMuted,
                      },
                    ]}
                  >
                    {userGroup.baseStation || 'Select'}
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

          {/* Subscription Section */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Subscription"
              icon="star-outline"
              colors={colors}
              styles={styles}
            />
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              {hasFireCalPro ? (
                <>
                  <View style={styles.settingRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                      <ThemedText style={styles.settingLabel}>
                        FireCal Pro Active
                      </ThemedText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.borderLight },
                    ]}
                  />
                  <TouchableOpacity
                    style={styles.settingRow}
                    onPress={presentCustomerCenter}
                  >
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.primary }]}
                    >
                      Manage Subscription
                    </ThemedText>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={presentPaywall}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Ionicons name="star" size={20} color={colors.primary} />
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.primary }]}
                    >
                      Upgrade to FireCal Pro
                    </ThemedText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText
              style={[styles.versionText, { color: colors.textMuted }]}
            >
              FireCal v1.0.0
            </ThemedText>
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
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: colors.borderLight },
              ]}
            >
              <ThemedText style={styles.modalTitle}>
                Select Base Station
              </ThemedText>
              <TouchableOpacity onPress={() => setShowStationPicker(false)}>
                <ThemedText style={{ color: colors.primary, fontSize: 16 }}>
                  Done
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.stationList}>
              {stations.map(([label, value]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.stationItem,
                    { borderBottomColor: colors.borderLight },
                    userGroup.baseStation === label && {
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                  onPress={() => {
                    setBaseStation(label);
                    setShowStationPicker(false);
                  }}
                >
                  <ThemedText style={styles.stationItemText}>{label}</ThemedText>
                  {userGroup.baseStation === label && (
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
    gap: 4.5,
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 13,
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