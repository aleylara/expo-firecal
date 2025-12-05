/**
 * Onboarding Context
 *
 * Manages the onboarding flow state for first-time users.
 *
 * Features:
 * - Tracks onboarding completion status
 * - Manages current step (setup, tour, complete)
 * - Tracks tour progress
 * - Provides methods to advance through onboarding
 *
 * Flow:
 * 1. Check if onboarding is complete on mount
 * 2. If not complete, show setup modal
 * 3. After setup, show feature tour
 * 4. After tour, show premium promo
 * 5. Mark as complete when promo finished
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  checkOnboardingComplete,
  markOnboardingComplete,
} from '@/utils/onboarding-storage';

type OnboardingStep = 'setup' | 'tour' | 'promo' | 'complete';

interface OnboardingState {
  isComplete: boolean;
  currentStep: OnboardingStep;
  tourStep: number;
  isLoading: boolean;
}

interface OnboardingContextType extends OnboardingState {
  completeSetup: () => void;
  nextTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  finishOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[Onboarding] Provider mounted');
  const [state, setState] = useState<OnboardingState>({
    isComplete: false,
    currentStep: 'setup',
    tourStep: 0,
    isLoading: true,
  });

  // Check onboarding status on mount
  useEffect(() => {
    console.log('[Onboarding] Checking status...');
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const complete = await checkOnboardingComplete();
      console.log('[Onboarding] Complete status:', complete);
      setState((prev) => ({
        ...prev,
        isComplete: complete,
        currentStep: complete ? 'complete' : 'setup',
        isLoading: false,
      }));
    } catch (error) {
      console.error('[Onboarding] Error checking status:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const completeSetup = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 'tour',
      tourStep: 0,
    }));
  }, []);

  const nextTourStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tourStep: prev.tourStep + 1,
    }));
  }, []);

  // Skip tour goes straight to promo now
  const skipTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 'promo',
    }));
  }, []);

  // Complete tour goes to promo
  const completeTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 'promo',
    }));
  }, []);

  // Actually mark as complete and close
  const finishOnboarding = useCallback(async () => {
    try {
      await markOnboardingComplete();
      setState((prev) => ({
        ...prev,
        isComplete: true,
        currentStep: 'complete',
      }));
    } catch (error) {
      console.error('[Onboarding] Error finishing onboarding:', error);
    }
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        completeSetup,
        nextTourStep,
        skipTour,
        completeTour,
        finishOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
