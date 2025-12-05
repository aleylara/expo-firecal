/**
 * Root Layout
 *
 * Sets up the app-wide provider hierarchy:
 * - Error boundary for crash handling
 * - Gesture handler for bottom sheets
 * - Safe area provider for notch/status bar handling
 * - SQLite database provider
 * - Database context (notes/timesheets)
 * - Notes refresh context (indicator updates)
 * - Theme context (light/dark mode + platoon settings)
 * - Notification context (toast notifications)
 *
 * Also handles:
 * - Navigation routing
 */
import { AppErrorBoundary } from '@/components/error/app-error-boundary';
import NotificationContainer from '@/components/notifications/notification-container';
import { OnboardingCoordinator } from '@/components/onboarding';
import { AnalyticsProvider } from '@/contexts/analytics-context';
import { DatabaseProvider } from '@/contexts/notes/database-context';
import { NotesRefreshProvider } from '@/contexts/notes/notes-refresh-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { OnboardingProvider } from '@/contexts/onboarding';
import { SubscriptionProvider } from '@/contexts/subscription/subscription-context';
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from '@/contexts/theme-context';
import { initializeDatabase } from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import mobileAds from 'react-native-google-mobile-ads';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { colorScheme } = useTheme();

  // Initialization flow:
  // 1. SQLiteProvider (parent) waits for DB init to complete before rendering this component.
  // 2. This component mounts and runs 'prepare'.
  // 3. Fonts are loaded.
  // 4. Splash screen is hidden only after BOTH DB and Fonts are ready.
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize AdMob
        // mobileAds().initialize();

        // Preload fonts
        await Font.loadAsync({
          ...Ionicons.font,
        });
      } catch (error) {
        console.warn('Error loading fonts:', error);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={
          colorScheme === 'dark' ? 'hsl(210, 12%, 10%)' : 'hsl(25, 40%, 98%)'
        }
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SQLiteProvider databaseName="firecal.db" onInit={initializeDatabase}>
            <DatabaseProvider>
              <NotesRefreshProvider>
                <CustomThemeProvider>
                  <AnalyticsProvider>
                    <SubscriptionProvider>
                      <OnboardingProvider>
                        <NotificationProvider>
                          <RootLayoutContent />
                          <NotificationContainer />
                          <OnboardingCoordinator />
                        </NotificationProvider>
                      </OnboardingProvider>
                    </SubscriptionProvider>
                  </AnalyticsProvider>
                </CustomThemeProvider>
              </NotesRefreshProvider>
            </DatabaseProvider>
          </SQLiteProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
