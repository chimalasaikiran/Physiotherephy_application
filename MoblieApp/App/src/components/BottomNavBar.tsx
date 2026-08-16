import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';

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
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    key: 'recovery',
    label: 'Recovery',
    activeIcon: 'fitness',
    inactiveIcon: 'fitness-outline',
  },
  {
    key: 'bookings',
    label: 'bookings',
    activeIcon: 'calendar',
    inactiveIcon: 'calendar-outline',
  },
  {
    key: 'alerts',
    label: 'Notifications',
    activeIcon: 'document-text',
    inactiveIcon: 'document-text-outline',
    hasBadge: true,
  },
  {
    key: 'profile',
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

interface TabButtonProps {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = React.memo(({ tab, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.88)).current;
  const bgOpacityAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.88,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacityAnim, {
        toValue: isActive ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, scaleAnim, bgOpacityAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabButton}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Active Circular Background */}
        <Animated.View
          style={[
            styles.activeBackground,
            {
              opacity: bgOpacityAnim,
            },
          ]}
        />

        {/* Icon */}
        <Ionicons
          name={isActive ? tab.activeIcon : tab.inactiveIcon}
          size={19}
          color={isActive ? Colors.white : '#64748B'}
        />

        {/* Optional Notification Badge */}
        {tab.hasBadge && (
          <View style={[styles.notificationDot, isActive && styles.notificationDotActive]} />
        )}
      </Animated.View>

      <Text
        style={[
          styles.tabLabel,
          isActive ? styles.activeLabel : styles.inactiveLabel,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.85}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
});

export const BottomNavBar: React.FC<BottomNavBarProps> = React.memo(({ activeTab, onTabPress, style }) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 6);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: bottomInset },
        style,
      ]}
    >
      <View style={styles.floatingBar}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={() => onTabPress(tab.key)}
          />
        ))}
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
    paddingHorizontal: 12,
    paddingTop: 4,
    zIndex: 100,
  },
  floatingBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    paddingVertical: 5,
    paddingHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: Colors.primary, // #003D9B
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  notificationDotActive: {
    borderColor: Colors.primary,
    top: 5,
    right: 5,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 12,
    marginTop: 3,
    textAlign: 'center',
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  inactiveLabel: {
    color: '#64748B',
    fontWeight: Typography.fontWeight.medium,
  },
});

export default BottomNavBar;


