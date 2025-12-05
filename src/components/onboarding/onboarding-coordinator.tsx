/**
 * Onboarding Coordinator Component
 *
 * Orchestrates the onboarding flow:
 * 1. Checks if onboarding is complete
 * 2. Shows setup modal if not complete
 * 3. Shows feature tour after setup
 * 4. Hides when complete
 *
 * This component should be rendered at the app root level.
 */

import React from 'react';

import { useOnboarding } from '@/contexts/onboarding';

import { FeatureTour } from './feature-tour';
import { SetupModal } from './setup-modal';
import { PremiumPromo } from './premium-promo';

export function OnboardingCoordinator() {
  const { isComplete, currentStep, isLoading } = useOnboarding();

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Don't render if onboarding is complete
  if (isComplete || currentStep === 'complete') {
    return null;
  }

  // Render appropriate step
  if (currentStep === 'setup') {
    return <SetupModal />;
  }

  if (currentStep === 'tour') {
    return <FeatureTour />;
  }

  if (currentStep === 'promo') {
    return <PremiumPromo />;
  }

  return null;
}
