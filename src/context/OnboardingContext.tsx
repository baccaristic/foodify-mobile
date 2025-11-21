import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ONBOARDING_COMPLETED_KEY } from '~/constants/onboarding';

export type OnboardingStep =
  | 'restaurant_menu_item'
  | 'menu_detail_extras'
  | 'menu_detail_plus'
  | 'menu_detail_add_cart'
  | 'fixed_order_bar'
  | 'cart_checkout'
  | 'completed';

interface OnboardingContextValue {
  isOnboardingActive: boolean;
  currentStep: OnboardingStep | null;
  isLoading: boolean;
  startOnboarding: () => void;
  nextStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  'restaurant_menu_item',
  'menu_detail_extras',
  'menu_detail_plus',
  'menu_detail_add_cart',
  'fixed_order_bar',
  'cart_checkout',
  'completed',
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const startOnboarding = useCallback(() => {
    if (hasCompletedOnboarding) {
      return;
    }
    setIsOnboardingActive(true);
    setCurrentStep(ONBOARDING_STEPS[0]);
  }, [hasCompletedOnboarding]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (!prev) return null;
      const currentIndex = ONBOARDING_STEPS.indexOf(prev);
      if (currentIndex === -1 || currentIndex >= ONBOARDING_STEPS.length - 1) {
        return prev;
      }
      return ONBOARDING_STEPS[currentIndex + 1];
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, 'true');
      setHasCompletedOnboarding(true);
      setIsOnboardingActive(false);
      setCurrentStep(null);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  }, []);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  useEffect(() => {
    if (currentStep === 'completed') {
      completeOnboarding();
    }
  }, [currentStep, completeOnboarding]);

  const value: OnboardingContextValue = {
    isOnboardingActive,
    currentStep,
    isLoading,
    startOnboarding,
    nextStep,
    skipOnboarding,
    completeOnboarding,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
