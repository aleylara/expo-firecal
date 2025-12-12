/**
 * Feature Tour Component
 *
 * Simple tour that introduces key app features with concise cards
 * and directional arrows pointing to relevant tabs.
 */

import { TAB_BAR_HEIGHT } from '@/constants/layout';
import { useOnboarding } from '@/contexts/onboarding';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import React from 'react';
import { Modal, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TourTooltip } from './tour-tooltip';

interface TourStep {
  title: string;
  description: string;
  targetTab: number | null; // 0-4 for tabs, null for no arrow
  position?: 'standard' | 'center-high';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Calendar & Shifts',
    description:
      'View your shift rotations at a glance. Tap dates to add notes or log work hours.',
    targetTab: 0,
  },
  {
    title: 'Distance Matrix',
    description: 'Calculate official return kilometers between fire stations.',
    targetTab: 1,
  },
  {
    title: 'Quick Drive',
    description:
      'Select a station to start navigation via Waze or Google Maps.',
    targetTab: 2,
  },
  {
    title: 'Logbook',
    description: 'View history and export notes and timesheets to CSV or TXT.',
    targetTab: 3,
  },
  {
    title: 'Settings',
    description: 'Configure your platoon, station, and app theme.',
    targetTab: 4,
  },
  {
    title: 'Leave & Details',
    description: 'Pull up the bottom drawer to view annual leave dates.',
    targetTab: null,
    position: 'center-high',
  },
];

export function FeatureTour() {
  const { tourStep, nextTourStep, skipTour, completeTour } = useOnboarding();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useThemedStyles();

  const currentStep = TOUR_STEPS[tourStep];
  const isLastStep = tourStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      nextTourStep();
    }
  };

  if (!currentStep) {
    return null;
  }

  // Calculate arrow position based on 5 tabs distributed evenly
  const tabWidth = width / 5;
  const arrowPosition =
    currentStep.targetTab !== null
      ? tabWidth * (currentStep.targetTab + 0.5)
      : width / 2;

  // Position logic
  const isHighPosition = currentStep.position === 'center-high';
  const baseBottom = TAB_BAR_HEIGHT + insets.bottom + 16;

  // If high, position it slightly higher than standard tab tips (e.g. for drawer)
  const bottomPosition = isHighPosition ? baseBottom + 50 : baseBottom;

  // High contrast border color (Text color is light in dark mode, dark in light mode)
  const contrastBorderColor = colors.text;

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.tooltipWrapper,
            {
              bottom: bottomPosition,
            },
          ]}
        >
          <View style={styles.contentContainer}>
            <TourTooltip
              title={currentStep.title}
              description={currentStep.description}
              onNext={handleNext}
              onSkip={skipTour}
              containerStyle={{
                borderWidth: 1,
                borderColor: contrastBorderColor,
              }}
            />

            {(isHighPosition || currentStep.targetTab !== null) && (
              <View
                style={[
                  styles.arrow,
                  {
                    left: arrowPosition - 15,
                    borderTopColor: colors.surface,
                  },
                ]}
              >
                {/*
                  Rotated square approach for bordered arrow:
                  - A square rotated 45 degrees
                  - Background matches card
                  - Border matches card
                  - Positioned so bottom half sticks out
                */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: colors.surface,
                    transform: [{ rotate: '45deg' }],
                    borderBottomWidth: 1,
                    borderRightWidth: 1,
                    borderColor: contrastBorderColor,
                    position: 'absolute',
                    top: -10, // Pull it up so it connects
                    left: 5,
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  tooltipWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  arrow: {
    position: 'absolute',
    bottom: -15, // The tip of the arrow extends below the card
    width: 30,
    height: 15, // Only show bottom half
    overflow: 'hidden', // Hide the top half of the rotated square
  },
});
