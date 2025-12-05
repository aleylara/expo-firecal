/**
 * Theme Context
 *
 * Manages app-wide theme settings and user preferences.
 *
 * Features:
 * - Theme mode: system, light, or dark
 * - User platoon group (A, B, C, D) and number
 * - First-time setup flag
 * - Persistent storage via SafeStorage
 * - Loading state to prevent flash of wrong theme
 *
 * The theme mode determines the color scheme:
 * - 'system': Follows device settings
 * - 'light': Always light mode
 * - 'dark': Always dark mode
 *
 * User group affects calendar display (platoon rotation colors).
 */
import { SafeStorage, STORAGE_KEYS } from '@/utils/safe-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme, View } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';
export type GroupLetter = 'A' | 'B' | 'C' | 'D';

interface UserGroup {
  group: GroupLetter;
  number: number;
  baseStation: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => void;
  userGroup: UserGroup;
  setUserGroup: (group: UserGroup) => void;
  setBaseStation: (station: string) => void;
  isFirstTime: boolean;
  setIsFirstTime: (isFirst: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [userGroup, setUserGroupState] = useState<UserGroup>({
    group: 'A',
    number: 1,
    baseStation: '',
  });
  const [isFirstTime, setIsFirstTimeState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate the actual color scheme based on theme mode
  const colorScheme: ColorScheme =
    themeMode === 'system'
      ? (systemColorScheme ?? 'light')
      : themeMode === 'dark'
        ? 'dark'
        : 'light';

  // Load saved settings on app start using safe storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load theme mode with validation
      const savedTheme = await SafeStorage.getItem(
        STORAGE_KEYS.THEME_MODE,
        'theme',
      );
      setThemeModeState(savedTheme);

      // Load user group with validation
      const savedGroup = await SafeStorage.getItem(
        STORAGE_KEYS.USER_GROUP,
        'userGroup',
      );
      setUserGroupState(savedGroup);

      // Check if it's first time setup
      const firstTimeSetup = await SafeStorage.getItem(
        STORAGE_KEYS.FIRST_TIME,
        'firstTime',
      );
      setIsFirstTimeState(firstTimeSetup);
    } catch (error) {
      console.error('Error loading settings:', error);
      // SafeStorage already provides defaults, so we can continue
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    // Persist async without blocking UI
    setTimeout(() => {
      SafeStorage.setItem(STORAGE_KEYS.THEME_MODE, mode, 'theme').catch(
        (error) => console.error('Error saving theme mode:', error),
      );
    }, 0);
  };

  const setUserGroup = (group: UserGroup) => {
    setUserGroupState(group);
    setTimeout(() => {
      SafeStorage.setItem(STORAGE_KEYS.USER_GROUP, group, 'userGroup').catch(
        (error) => console.error('Error saving user group:', error),
      );
    }, 0);
  };

  const setBaseStation = (station: string) => {
    const updatedGroup = { ...userGroup, baseStation: station };
    setUserGroupState(updatedGroup);
    setTimeout(() => {
      SafeStorage.setItem(
        STORAGE_KEYS.USER_GROUP,
        updatedGroup,
        'userGroup',
      ).catch((error) => console.error('Error saving base station:', error));
    }, 0);
  };

  const setIsFirstTime = (isFirst: boolean) => {
    setIsFirstTimeState(isFirst);
    setTimeout(() => {
      SafeStorage.setItem(STORAGE_KEYS.FIRST_TIME, !isFirst, 'firstTime').catch(
        (error) => console.error('Error saving first time setup:', error),
      );
    }, 0);
  };

  // Show minimal loading screen - just background color to avoid flash
  if (isLoading) {
    const loadingColorScheme = systemColorScheme ?? 'light';
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            loadingColorScheme === 'dark' ? '#000000' : '#ffffff',
        }}
      />
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        colorScheme,
        setThemeMode,
        userGroup,
        setUserGroup,
        setBaseStation,
        isFirstTime,
        setIsFirstTime,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
