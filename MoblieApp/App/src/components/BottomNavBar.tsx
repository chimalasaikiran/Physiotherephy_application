import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Strings } from '@/constants';

export type TabKey = 'home' | 'bookings' | 'schedule' | 'recovery' | 'alerts' | 'profile';

interface BottomNavBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  style?: ViewStyle;
}

interface TabConfig {
  key: TabKey;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  hasBadge?: boolean;
}

const TABS: TabConfig[] = [
  {
    key: 'home',
    label: Strings.explore?.tabs?.home || 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    key: 'bookings',
    label: Strings.myBookings?.headerTitle || 'Bookings',
    activeIcon: 'calendar-clear',
    inactiveIcon: 'calendar-clear-outline',
  },
  {
    key: 'recovery',
    label: Strings.explore?.tabs?.recovery || 'Recovery',
    activeIcon: 'analytics',
    inactiveIcon: 'analytics-outline',
  },
  {
    key: 'alerts',
    label: Strings.explore?.tabs?.alerts || 'Alerts',
    activeIcon: 'notifications',
    inactiveIcon: 'notifications-outline',
    hasBadge: true,
  },
  {
    key: 'profile',
    label: Strings.explore?.tabs?.profile || 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = React.memo(({ activeTab, onTabPress, style }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 10) },
        style,
      ]}
    >
      <View style={styles.floatingBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={1}
              style={styles.tabButton}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                {tab.key === 'home' && isActive ? (
                  <View style={styles.homeIconContainer}>
                    <Ionicons name="home" size={22} color="#FFFFFF" />
                    <View style={styles.homeCrossBadge}>
                      <Ionicons name="add" size={9} color="#003D9B" style={{ fontWeight: 'bold' }} />
                    </View>
                  </View>
                ) : (
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.inactiveIcon}
                    size={23}
                    color={isActive ? Colors.white : '#5F6D7E'}
                  />
                )}

                {tab.hasBadge && (
                  <View style={[styles.notificationDot, isActive && styles.notificationDotActive]} />
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingTop: 6,
    zIndex: 100,
  },
  floatingBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(238, 242, 246, 0.85)',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  activeIconWrapper: {
    backgroundColor: Colors.primary, // #003D9B
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  homeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  homeCrossBadge: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationDotActive: {
    borderColor: Colors.primary,
    top: 8,
    right: 9,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  inactiveLabel: {
    color: '#5F6D7E',
    fontWeight: Typography.fontWeight.medium,
  },
  bottomHomeIndicator: {
    width: 134,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default BottomNavBar;

