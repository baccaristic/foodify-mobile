import * as SecureStore from 'expo-secure-store';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

/**
 * Reset onboarding status - useful for testing
 * This will cause onboarding to show again on next restaurant visit
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ONBOARDING_COMPLETED_KEY);
    console.log('Onboarding reset successfully');
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    throw error;
  }
};

/**
 * Check if onboarding has been completed
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const completed = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};
