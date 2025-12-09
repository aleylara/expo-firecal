import { stations } from '@/constants/station-list';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StationPickerModalProps {
    visible: boolean;
    title: string;
    onClose: () => void;
    onSelect: (value: string) => void;
    selectedValue: string;
}

export function StationPickerModal({
    visible,
    title,
    onClose,
    onSelect,
    selectedValue,
}: StationPickerModalProps) {
    const { colors } = useThemedStyles();

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.pickerModalOverlay}>
                <View style={[styles.pickerModalContent, { backgroundColor: colors.surface }]}>
                    <View style={[styles.pickerModalHeader, { borderBottomColor: colors.borderLight }]}>
                        <Text style={[styles.pickerModalTitle, { color: colors.text }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{ color: colors.primary, fontSize: 16 }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.pickerStationList} removeClippedSubviews>
                        {stations.map(([label, value]) => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles.pickerStationItem,
                                    { borderBottomColor: colors.borderLight },
                                    selectedValue === label && { backgroundColor: colors.surfaceElevated }
                                ]}
                                onPress={() => { onSelect(label); onClose(); }}
                            >
                                <Text style={[styles.pickerStationText, { color: colors.text }]}>{label}</Text>
                                {selectedValue === label && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
