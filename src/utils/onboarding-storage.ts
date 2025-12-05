/**
 * Onboarding Storage Utilities
 *
 * Helper functions for managing onboarding completion state.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@onboarding_completed';

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'completed';
  } catch (error) {
    console.error(
      '[OnboardingStorage] Error checking onboarding status:',
      error,
    );
    return false;
  }
}

/**
 * Mark onboarding as complete
 */
export async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'completed');
  } catch (error) {
    console.error(
      '[OnboardingStorage] Error marking onboarding complete:',
      error,
    );
    throw error;
  }
}
