import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { BottomNavBar, TabKey } from './BottomNavBar';
import { ExploreScreen } from '@/features/explore';
import { MyBookingsScreen } from '@/features/appointments';
import { RecoveryScreen } from '@/features/recovery';
import { NotificationsScreen } from '@/features/profile';
import { ProfileScreen } from '@/features/profile';

interface MainTabContainerProps {
  initialTab?: TabKey;
}

export const MainTabContainer: React.FC<MainTabContainerProps> = ({ initialTab = 'home' }) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Trigger smooth screen content transition on tab change
  const handleTabPress = (tab: TabKey) => {
    if (tab === activeTab) return;

    // Instantly switch activeTab so BottomNavBar updates instantly
    setActiveTab(tab);

    // Smooth screen content transition animation
    fadeAnim.setValue(0.85);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <View style={styles.container}>
      {/* SCREEN CONTENT AREA (TRANSITIONS SMOOTHLY ABOVE STATIC NAV BAR) */}
      <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
        <View style={[styles.tabScreen, activeTab === 'home' ? styles.visible : styles.hidden]}>
          <ExploreScreen hideBottomNavBar={true} onTabPress={handleTabPress} />
        </View>

        <View style={[styles.tabScreen, activeTab === 'bookings' ? styles.visible : styles.hidden]}>
          <MyBookingsScreen hideBottomNavBar={true} onTabPress={handleTabPress} />
        </View>

        <View style={[styles.tabScreen, activeTab === 'recovery' ? styles.visible : styles.hidden]}>
          <RecoveryScreen hideBottomNavBar={true} onTabPress={handleTabPress} />
        </View>

        <View style={[styles.tabScreen, activeTab === 'alerts' ? styles.visible : styles.hidden]}>
          <NotificationsScreen hideBottomNavBar={true} onTabPress={handleTabPress} />
        </View>

        <View style={[styles.tabScreen, activeTab === 'profile' ? styles.visible : styles.hidden]}>
          <ProfileScreen hideBottomNavBar={true} onTabPress={handleTabPress} />
        </View>
      </Animated.View>

      {/* STATIC BOTTOM NAVIGATION BAR (UNMOVING, NON-ANIMATED ICONS) */}
      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  screenContainer: {
    flex: 1,
  },
  tabScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  visible: {
    display: 'flex',
  },
  hidden: {
    display: 'none',
  },
});

export default MainTabContainer;
