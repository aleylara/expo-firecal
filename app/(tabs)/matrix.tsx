import { ThemedText } from '@/components/theme/themed-text';
import { ThemedView } from '@/components/theme/themed-view';
import { stations, stationSpecialCases } from '@/constants/station-list';
import { useTheme } from '@/contexts/theme-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { DistanceMatrix } from '@/utils/distance-matrix';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MatrixScreen() {
  const { userGroup } = useTheme();
  const { colors } = useThemedStyles();
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [distanceMatrix] = useState(() => new DistanceMatrix());
  
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Set base station as default on mount
  useEffect(() => {
    if (userGroup.baseStation && !fromStation) {
      const baseStationItem = stations.find(
        ([label]) => label === userGroup.baseStation,
      );
      if (baseStationItem) {
        setFromStation(baseStationItem[1]); // Use value (e.g. "001 City of Sydney")
      }
    }
  }, [userGroup.baseStation, fromStation]);

  const getSearchTerm = (stationName: string) => {
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

  const openRouteInGoogleMaps = () => {
    if (!fromStation || !toStation) return;
    const origin = encodeURIComponent(getSearchTerm(fromStation));
    const destination = encodeURIComponent(getSearchTerm(toStation));
    
    // Try native app first (works on both iOS and Android)
    const nativeUrl = `comgooglemaps://?saddr=${origin}&daddr=${destination}&directionsmode=driving`;
    const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    Linking.openURL(nativeUrl).catch(() => {
      // Fallback to web if app not installed
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('Error', 'Could not open Google Maps');
      });
    });
  };

  const handleButtonPress = () => {
    if (distance) {
      setFromStation('');
      setToStation('');
      setDistance(null);
    } else if (fromStation && toStation) {
      setLoading(true);
      setTimeout(() => {
        try {
          const fromName = fromStation.replace(/^\d+\s+/, '');
          const toName = toStation.replace(/^\d+\s+/, '');
          const result = distanceMatrix.getDistance(fromName, toName);
          setDistance(result || 'N/A');
        } catch (error) {
          setDistance('Error');
        } finally {
          setLoading(false);
        }
      }, 50);
    }
  };

  // Reusable Selection Row
  const SelectionRow = ({ label, value, onPress, placeholder }: any) => (
    <TouchableOpacity
      style={styles.selectionRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={styles.valueContainer}>
        <ThemedText style={[styles.value, { color: value ? colors.text : colors.textMuted }]}>
          {value || placeholder}
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.pageTitle}>Distance Calculator</ThemedText>
            <ThemedText style={styles.pageSubtitle}>
              Official Distance Matrix
            </ThemedText>
          </View>

          {/* Result Card (Hero) */}
          <View style={[styles.resultCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
             {distance !== 'N/A' && (
               <>
                 <ThemedText style={styles.resultLabel}>DISTANCE</ThemedText>
                 <ThemedText style={[styles.resultValue, { color: distance ? colors.text : colors.textMuted }]}>
                   {distance || '---'}
                 </ThemedText>
                 {distance && <ThemedText style={styles.resultUnit}>Return Kilometers</ThemedText>}
               </>
             )}
             {distance === 'N/A' && (
               <>
                 <ThemedText style={[styles.notInMatrixText, { color: colors.textMuted }]}>
                   Not in official matrix
                 </ThemedText>
                 <ThemedText style={[styles.essClaimText, { color: colors.textMuted }]}>
                   You are required to submit a quick claim in ESS
                 </ThemedText>
                 <TouchableOpacity 
                   style={[styles.mapsButton, { backgroundColor: colors.primary }]}
                   onPress={openRouteInGoogleMaps}
                   activeOpacity={0.8}
                 >
                   <Ionicons name="map" size={18} color="#FFF" />
                   <ThemedText style={styles.mapsButtonText}>View Route in Maps</ThemedText>
                 </TouchableOpacity>
               </>
             )}
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
            <SelectionRow 
              label="From" 
              value={fromStation} 
              onPress={() => setShowFromPicker(true)} 
              placeholder="Select Station" 
            />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <SelectionRow 
              label="To" 
              value={toStation} 
              onPress={() => setShowToPicker(true)} 
              placeholder="Select Station" 
            />
          </View>

          {/* Action Button */}
          <View style={styles.actions}>
             <TouchableOpacity 
               style={[styles.button, { backgroundColor: colors.text, opacity: (!fromStation || !toStation) ? 0.3 : 1 }]}
               onPress={handleButtonPress}
               disabled={!fromStation || !toStation || loading}
             >
               <ThemedText style={[styles.buttonText, { color: colors.background }]}>
                 {loading ? 'Calculating...' : distance ? 'Clear' : 'Calculate'}
               </ThemedText>
             </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Station Pickers */}
      <StationPickerModal 
        visible={showFromPicker} 
        onClose={() => setShowFromPicker(false)} 
        onSelect={(val: string) => { 
          setFromStation(val); 
          setDistance(null); 
          setShowFromPicker(false);
        }} 
        title="From Station"
        stations={stations}
        colors={colors}
      />
      <StationPickerModal 
        visible={showToPicker} 
        onClose={() => setShowToPicker(false)} 
        onSelect={(val: string) => { 
          setToStation(val); 
          setDistance(null);
          setShowToPicker(false);
        }} 
        title="To Station"
        stations={stations}
        colors={colors}
      />

    </ThemedView>
  );
}

const StationPickerModal = ({ visible, onClose, onSelect, title, stations, colors }: any) => (
  <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={{ color: colors.primary, fontSize: 16 }}>Done</ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 400 }} removeClippedSubviews>
          {stations.map(([label, value]: any) => (
            <TouchableOpacity
              key={value}
              style={[styles.modalItem, { borderBottomColor: colors.borderLight }]}
              onPress={() => onSelect(label)}
            >
              <ThemedText style={{ fontSize: 16 }}>{label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

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
    flexGrow: 1, // Allow content to expand to fill screen
  },
  header: {
    marginBottom: 24,
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
  resultCard: {
    borderRadius: 20,
    minHeight: 114,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    paddingVertical: 20,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.5,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 56,
  },
  resultUnit: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.5,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 40,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  actions: {
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
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
  notInMatrixText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  essClaimText: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  mapsButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
