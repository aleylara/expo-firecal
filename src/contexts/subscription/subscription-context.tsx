import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { getCachedSubscriptionStatus, setCachedSubscriptionStatus } from './subscription-storage';

interface SubscriptionContextType {
  hasFireCalPro: boolean;
  isLoading: boolean;
  presentPaywall: () => Promise<void>;
  presentCustomerCenter: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const REVENUECAT_API_KEY = 'test_SuNKapQkyGrrBTPUwbWZYzbGbZs';
const ENTITLEMENT_ID = 'FireCal Pro';

// Set to true to bypass RevenueCat for testing
const TESTING_MODE = true;

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [hasFireCalPro, setHasFireCalPro] = useState(TESTING_MODE);
  const [isLoading, setIsLoading] = useState(!TESTING_MODE);

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  async function initializeRevenueCat() {
    if (TESTING_MODE) return;
    
    try {
      // Read cached status first
      const cached = await getCachedSubscriptionStatus();
      if (cached) {
        setHasFireCalPro(cached.hasFireCalPro);
      }
      setIsLoading(false);

      // Configure RevenueCat
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });

      // Fetch current status
      const customerInfo = await Purchases.getCustomerInfo();
      const hasPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      
      setHasFireCalPro(hasPro);
      await setCachedSubscriptionStatus({
        hasFireCalPro: hasPro,
        lastChecked: Date.now(),
      });
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      setIsLoading(false);
    }
  }

  async function presentPaywall() {
    try {
      const result = await RevenueCatUI.presentPaywall();
      
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        const customerInfo = await Purchases.getCustomerInfo();
        const hasPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
        
        setHasFireCalPro(hasPro);
        await setCachedSubscriptionStatus({
          hasFireCalPro: hasPro,
          lastChecked: Date.now(),
        });
      }
    } catch (error) {
      console.error('Paywall error:', error);
    }
  }

  async function presentCustomerCenter() {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      console.error('Customer Center error:', error);
    }
  }

  return (
    <SubscriptionContext.Provider value={{ hasFireCalPro, isLoading, presentPaywall, presentCustomerCenter }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
