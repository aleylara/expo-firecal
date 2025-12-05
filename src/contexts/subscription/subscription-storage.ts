import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'firecal_pro_status';

export interface CachedSubscriptionStatus {
  hasFireCalPro: boolean;
  lastChecked: number;
}

export async function getCachedSubscriptionStatus(): Promise<CachedSubscriptionStatus | null> {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (error) {
    console.error('Failed to read cached subscription status:', error);
    return null;
  }
}

export async function setCachedSubscriptionStatus(status: CachedSubscriptionStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch (error) {
    console.error('Failed to cache subscription status:', error);
  }
}
