/**
 * Premium Promo Component
 *
 * Final step of onboarding.
 * Professionally presents the value proposition of FireCal Pro
 * while maintaining a personal connection.
 */

import React from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/theme/themed-text';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/onboarding';
import { useThemedStyles } from '@/hooks/use-themed-styles';

export function PremiumPromo() {
  const { finishOnboarding } = useOnboarding();
  const { colors, tokens } = useThemedStyles();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: tokens.space.xl,
    },
    content: {
      alignItems: 'center',
      maxWidth: 500,
      width: '100%',
      alignSelf: 'center',
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: tokens.space.xl,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    title: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700',
      color: colors.text,
      marginBottom: tokens.space.md,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    description: {
      fontSize: 17,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: tokens.space.xxl,
      paddingHorizontal: tokens.space.md,
    },
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.xl,
      padding: tokens.space.xl,
      marginBottom: tokens.space.xl,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.space.lg,
      paddingBottom: tokens.space.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginLeft: tokens.space.md,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: tokens.space.lg,
    },
    featureIcon: {
      width: 32,
      alignItems: 'center',
      marginRight: tokens.space.md,
      marginTop: 2,
    },
    featureTextContainer: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    featureSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    samiContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    footer: {
      width: '100%',
      gap: tokens.space.md,
    },
    subtext: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: tokens.space.md,
    },
  });

  return (
    <Modal visible={true} animationType="slide">
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(
                tokens.space.xl,
                insets.top + tokens.space.md,
              ),
            },
          ]}
        >
          <View style={styles.content}>
            {/* Hero Icon */}
            <View style={styles.iconCircle}>
              <Ionicons
                name="shield-checkmark"
                size={42}
                color={colors.primary}
              />
            </View>

            <ThemedText style={styles.title}>FireCal Pro</ThemedText>

            <ThemedText style={styles.description}>
              The essential toolkit built for firefighters and their families. Core features
              are free and always will be. 
            </ThemedText>

            {/* Pro Features Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="star" size={24} color={colors.warning} />
                <ThemedText style={styles.cardTitle}>FireCal Pro</ThemedText>
              </View>

              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name="remove-circle-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <ThemedText style={styles.featureTitle}>
                    Ad-Free Experience
                  </ThemedText>
                  <ThemedText style={styles.featureSubtitle}>
                    Focus on your schedule, distraction-free.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name="time-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <ThemedText style={styles.featureTitle}>
                    Advanced Logging
                  </ThemedText>
                  <ThemedText style={styles.featureSubtitle}>
                    Track overtime, recalls, and personal logbook entries.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <ThemedText style={styles.featureTitle}>
                    Data Export
                  </ThemedText>
                  <ThemedText style={styles.featureSubtitle}>
                    Export timesheets to CSV or Text files.
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.featureRow, { marginBottom: 0 }]}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name="heart-outline"
                    size={24}
                    color={colors.error}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <ThemedText style={styles.featureTitle}>
                    Support Development
                  </ThemedText>
                  <ThemedText style={styles.featureSubtitle}>
                    Directly support a fellow firefighter.
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.footer}>
              <Button
                title="Get Started"
                onPress={finishOnboarding}
                variant="primary"
              />
              <ThemedText style={styles.subtext}>
                You can upgrade anytime in Settings
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
