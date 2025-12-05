/**
 * Premium Promo Component
 *
 * Final step of onboarding.
 * Mentions that premium features (ad removal, etc.) are available in Settings.
 */

import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/theme/themed-text';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/onboarding';
import { useThemedStyles } from '@/hooks/use-themed-styles';

export function PremiumPromo() {
  const { finishOnboarding } = useOnboarding();
  const { colors, tokens } = useThemedStyles();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: tokens.space.xl,
    },
    content: {
      alignItems: 'center',
      maxWidth: 400,
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
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: tokens.space.md,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: tokens.space.xl,
    },
    card: {
      width: '100%',
      backgroundColor: colors.surfaceElevated,
      borderRadius: tokens.radius.lg,
      padding: tokens.space.lg,
      marginBottom: 40,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.space.md,
      gap: tokens.space.md,
    },
    featureText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    footer: {
      width: '100%',
      gap: tokens.space.md,
    },
    note: {
      fontSize: 14,
      marginRight: 10,
      color: colors.textMuted,
      textAlign: 'right',
      fontStyle: 'italic',
    },
  });

  return (
    <Modal visible={true} animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Hero Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={40} color={colors.primary} />
          </View>

          <ThemedText style={styles.title}>You're All Set!</ThemedText>

          <ThemedText style={styles.description}>
            FireCal is free to use. If you find it helpful, consider supporting its continued development with a cup of coffee.
          </ThemedText>
          <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: tokens.space.lg }}>
            <ThemedText style={styles.note}>
              Cheers! Sami
            </ThemedText>
          </View>
          {/* Premium Features Card */}
          <View style={styles.card}>
            <View style={styles.featureRow}>
              <Ionicons name="star" size={24} color={colors.primary} />
              <ThemedText style={styles.featureText}>Pro Features</ThemedText>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <ThemedText style={styles.featureText}>Ad-free experience</ThemedText>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <ThemedText style={styles.featureText}>Support a fellow Firefighter </ThemedText>
            </View>
            <View style={[styles.featureRow, { marginBottom: 0 }]}>
              <Ionicons name="settings-outline" size={24} color={colors.textMuted} />
              <ThemedText style={[styles.featureText, { color: colors.textSecondary }]}>
                Upgrade available in Settings
              </ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <Button
              title="Get Started"
              onPress={finishOnboarding}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
