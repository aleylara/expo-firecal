import { ThemedText } from '@/components/theme/themed-text';
import { ThemedView } from '@/components/theme/themed-view';
import { stations, stationSpecialCases } from '@/constants/station-list';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DriveScreen() {
  const { colors } = useThemedStyles();
  const [toStation, setToStation] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const getSearchTerm = (stationName: string) => {
    // Strip "123 " prefix if exists, although usually stationName is just the label
    const name = stationName.replace(/^\d+\s+/, ''); 
    if (stationSpecialCases[name]) {
      const specialCase = stationSpecialCases[name];
      if (specialCase.includes('NSW') && specialCase.includes('St,')) {
        return specialCase;
      }
      return `Fire and Rescue NSW ${specialCase} Fire Station NSW`;
    }
    return `Fire and Rescue NSW ${name} Fire Station NSW`;
  };

  const openInGoogleMaps = () => {
    if (!toStation) return;
    const searchTerm = getSearchTerm(toStation);
    const query = encodeURIComponent(searchTerm);
    const appUrl = `geo:0,0?q=${query}`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.openURL(appUrl).catch(() => {
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('Error', 'Could not open maps');
      });
    });
  };

  const openInWaze = () => {
    if (!toStation) return;
    const searchTerm = getSearchTerm(toStation);
    const query = encodeURIComponent(searchTerm);
    const url = `waze://?q=${query}&navigate=yes`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'Waze Not Installed',
        'Please install Waze to use this feature',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Install',
            onPress: () =>
              Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.waze',
              ),
          },
        ],
      );
    });
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText style={styles.pageTitle}>Drive to Station</ThemedText>
            <ThemedText style={styles.pageSubtitle}>
              Start navigation to any station
            </ThemedText>
          </View>

          {/* Destination Card */}
          <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
            <TouchableOpacity
              style={styles.selectionRow}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.label}>Destination</ThemedText>
              <View style={styles.valueContainer}>
                <ThemedText style={[styles.value, { color: toStation ? colors.text : colors.textMuted }]}>
                  {toStation || 'Select Station'}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Grid */}
          <View style={[styles.grid, { backgroundColor: colors.surfaceHighlight, borderRadius: 16, padding: 16 }]}>
            {/* Google Maps Button */}
            <TouchableOpacity
              style={[
                styles.navButton, 
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight, opacity: toStation ? 1 : 0.5 }
              ]}
              onPress={openInGoogleMaps}
              disabled={!toStation}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#4285F4' }]}>
                <Ionicons name="map" size={24} color="#FFF" />
              </View>
              <ThemedText style={styles.navButtonText}>Google Maps</ThemedText>
            </TouchableOpacity>

            {/* Waze Button */}
            <TouchableOpacity
              style={[
                styles.navButton, 
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight, opacity: toStation ? 1 : 0.5 }
              ]}
              onPress={openInWaze}
              disabled={!toStation}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#33CCFF' }]}>
                <Ionicons name="navigate" size={24} color="#FFF" />
              </View>
              <ThemedText style={styles.navButtonText}>Waze</ThemedText>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Station Picker Modal */}
      <Modal visible={showPicker} animationType="fade" transparent onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <ThemedText style={styles.modalTitle}>Select Destination</ThemedText>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <ThemedText style={{ color: colors.primary, fontSize: 16 }}>Done</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }} removeClippedSubviews>
              {stations.map(([label, value]) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.modalItem, { borderBottomColor: colors.borderLight }]}
                  onPress={() => { setToStation(label); setShowPicker(false); }}
                >
                  <ThemedText style={{ fontSize: 16 }}>{label}</ThemedText>
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
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  navButton: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
});
