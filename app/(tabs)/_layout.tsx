// import BannerAdComponent from '@/components/ads/banner-ad';
import { TAB_BAR_HEIGHT } from '@/constants/layout';
import { useSubscription } from '@/contexts/subscription/subscription-context';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Tabs } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EXTERNAL_LINKS = [
  { label: 'Remote Fireplace', url: 'https://www.fire.nsw.gov.au/' },
  { label: 'School Holidays', url: 'https://www.nsw.gov.au/about-nsw/school-holidays' },
  { label: 'Weather-BOM', url: 'https://www.bom.gov.au/' },
  { label: 'Contact Support', url: 'mailto:firecal24@gmail.com' },
] as const;

export default function TabLayout() {
  const { colors, tokens } = useThemedStyles();
  const { hasFireCalPro } = useSubscription();
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const closeMenu = useCallback(() => setMenuVisible(false), []);
  const toggleMenu = useCallback(() => setMenuVisible((prev) => !prev), []);

  const openLink = useCallback(
    async (url: string) => {
      closeMenu();
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Could not open link');
      }
    },
    [closeMenu],
  );

  const renderHeaderTitle = useCallback(
    (onPress?: () => void) => (
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <Ionicons
          name="calendar"
          size={tokens.icon.lg}
          color={colors.primary}
        />
        <Text style={[styles.title, { color: colors.text }]}>FireCal</Text>
      </TouchableOpacity>
    ),
    [colors.primary, colors.text, tokens.icon.lg],
  );

  const renderHeaderRight = useCallback(
    () => (
      <>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={tokens.icon.lg}
            color={colors.text}
          />
        </TouchableOpacity>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <Pressable
            style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
            onPress={closeMenu}
          >
            <View style={[styles.dropdownWrapper, { top: insets.top + 56, right: 16 }]}>
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: colors.text,
                  },
                ]}
              >
                {EXTERNAL_LINKS.map((link, index) => (
                  <TouchableOpacity
                    key={link.url}
                    style={[
                      styles.dropdownItem,
                      index < EXTERNAL_LINKS.length - 1 && {
                        borderBottomColor: colors.border,
                        borderBottomWidth: 1,
                      },
                    ]}
                    onPress={() => openLink(link.url)}
                  >
                    <Text style={[styles.dropdownText, { color: colors.text }]}>
                      {link.label}
                    </Text>
                    <Ionicons
                      name="open-outline"
                      size={tokens.icon.sm}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Pressable>
        </Modal>
      </>
    ),
    [colors, menuVisible, toggleMenu, closeMenu, openLink, tokens],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {!hasFireCalPro && (
        <View style={{ backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }}>
          {/* <BannerAdComponent /> */}
        </View>
      )}
      <Tabs
        screenOptions={{
          headerStatusBarHeight: hasFireCalPro ? Constants.statusBarHeight : 0,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            height: TAB_BAR_HEIGHT,
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerTitle: () => renderHeaderTitle(),
          headerRight: renderHeaderRight,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => (
              <Ionicons name="calendar-outline" size={tokens.icon.lg} color={color} />
            ),
            headerTitle: () => renderHeaderTitle(undefined), // Will be overridden by screen
          }}
          listeners={{ tabPress: closeMenu }}
        />
        <Tabs.Screen
          name="matrix"
          options={{
            title: 'Distance',
            tabBarIcon: ({ color }) => (
              <Ionicons name="map" size={tokens.icon.lg} color={color} />
            ),
          }}
          listeners={{ tabPress: closeMenu }}
        />
        <Tabs.Screen
          name="drive"
          options={{
            title: 'Drive',
            tabBarIcon: ({ color }) => (
              <Ionicons name="navigate" size={tokens.icon.lg} color={color} />
            ),
          }}
          listeners={{ tabPress: closeMenu }}
        />
        <Tabs.Screen
          name="logbook"
          options={{
            title: 'Logbook',
            tabBarIcon: ({ color }) => (
              <Ionicons name="list" size={tokens.icon.lg} color={color} />
            ),
          }}
          listeners={{ tabPress: closeMenu }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings" size={tokens.icon.lg} color={color} />
            ),
          }}
          listeners={{ tabPress: closeMenu }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  menuButton: {
    padding: 4,
    marginRight: 8,
  },
  modalBackdrop: {
    flex: 1,
  },
  dropdownWrapper: {
    position: 'absolute',
  },
  dropdown: {
    minWidth: 260,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  dropdownText: {
    fontSize: 15,
    flex: 1,
  },
});
