/**
 * Feature Tour Component
 *
 * Simple tour that introduces key app features.
 *
 * Tour Steps:
 * 1. Calendar - Tap dates to add notes
 * 2. Logs Tab - Record timesheets and export data
 * 3. Settings Tab - Update preferences
 */

import { useOnboarding } from '@/contexts/onboarding';
import { Modal, StyleSheet, View } from 'react-native';

import { TourTooltip } from './tour-tooltip';

interface TourStep {
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
   {
    title: 'Home Screen',
    description:
      'Yearly shift calendar with your annual leave dates highlighted. Pull up the bottom drawer to see all other annual-leave details',
  },
   {
    title: 'Look up Kilometers',
    description:
      'Use the Distance tab below to look up return kilometers between two stations in the official Matrix',
  },
   {
    title: 'Quick Navigation',
    description:
      'Drive tab below lets you quickly select a fire station and start navigation using Waze or Google Maps',
  },
  {
    title: 'Track Shifts or Recalls',
    description:
      'Tap any date on the calendar to add notes, log hours for regular or recall shifts (Pro feature)',
  },
  {
    title: 'View & Export Data',
    description:
      'Use the Logbook tab to view yearly notes and timesheets, and export them to your device or a chosen cloud provider (Pro feature)',
  },
  {
    title: 'Customize Settings',
    description:
      'Visit Settings to update your platoon, base station, theme, and other preferences anytime.',
  },
];

export function FeatureTour() {
  const { tourStep, nextTourStep, skipTour, completeTour } = useOnboarding();

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

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.container}>
        <TourTooltip
          title={currentStep.title}
          description={currentStep.description}
          onNext={handleNext}
          onSkip={skipTour}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
