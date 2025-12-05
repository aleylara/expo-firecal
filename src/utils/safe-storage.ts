/**
 * Safe AsyncStorage wrapper with error handling and type validation
 *
 * Provides:
 * - Type-safe storage operations with default values
 * - Automatic JSON serialization/deserialization
 * - Error handling with fallback to defaults
 * - Multi-key operations (multiGet, multiRemove)
 *
 * Storage types: 'theme', 'userGroup', 'firstTime', 'other'
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SafeStorage {
  private static getDefaultValue(
    type: 'theme' | 'userGroup' | 'firstTime' | 'other',
  ): any {
    switch (type) {
      case 'theme':
        return 'system';
      case 'userGroup':
        return { group: 'A', number: 1 };
      case 'firstTime':
        return true;
      case 'other':
      default:
        return null;
    }
  }

  static async getItem(
    key: string,
    type: 'theme' | 'userGroup' | 'firstTime' | 'other',
  ): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return this.getDefaultValue(type);
      }

      // For userGroup, validate the data structure
      if (type === 'userGroup') {
        try {
          const parsed = JSON.parse(value);
          if (this.isValidUserGroup(parsed)) {
            return parsed;
          } else {
            console.warn('Invalid user group data found, using default');
            return this.getDefaultValue('userGroup');
          }
        } catch {
          console.warn('Corrupted user group data, using default');
          return this.getDefaultValue('userGroup');
        }
      }

      // For theme, validate it's a valid theme mode
      if (type === 'theme') {
        const validThemes = ['system', 'light', 'dark'];
        if (validThemes.includes(value)) {
          return value;
        } else {
          console.warn('Invalid theme data found, using default');
          return this.getDefaultValue('theme');
        }
      }

      // For firstTime, should be boolean
      if (type === 'firstTime') {
        return value === 'completed' ? false : true;
      }

      // For other types, try to parse JSON, fallback to raw value
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('AsyncStorage getItem failed:', error);
      return this.getDefaultValue(type);
    }
  }

  static async setItem(
    key: string,
    value: any,
    type: 'theme' | 'userGroup' | 'firstTime' | 'other',
  ): Promise<boolean> {
    try {
      let storedValue: string;

      if (type === 'firstTime') {
        storedValue = value ? 'completed' : '';
      } else {
        storedValue = typeof value === 'string' ? value : JSON.stringify(value);
      }

      await AsyncStorage.setItem(key, storedValue);
      return true;
    } catch (error) {
      console.error('AsyncStorage setItem failed:', error);
      // Don't throw - just fail silently for hobby app
      return false;
    }
  }

  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('AsyncStorage removeItem failed:', error);
      return false;
    }
  }

  static async multiRemove(keys: string[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('AsyncStorage multiRemove failed:', error);
      return false;
    }
  }

  private static isValidUserGroup(group: any): boolean {
    return (
      group &&
      typeof group === 'object' &&
      ['A', 'B', 'C', 'D'].includes(group.group) &&
      typeof group.number === 'number' &&
      group.number >= 1 &&
      group.number <= 8
    );
  }
}

// Storage keys matching the existing app
export const STORAGE_KEYS = {
  THEME_MODE: '@theme_mode',
  USER_GROUP: '@user_group',
  FIRST_TIME: '@first_time_setup',
} as const;
