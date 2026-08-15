import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export interface NotificationData {
  id: string;
  title: string;
  timeAgo: string;
  description: string;
  section: 'TODAY' | 'YESTERDAY' | 'EARLIER';
  category: 'Appointments' | 'Recovery' | 'Payments' | 'System' | 'Reports';
  isUnread: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  targetRoute?: string;
}

const INITIAL_NOTIFICATIONS: NotificationData[] = [
  {
    id: 'notif_1',
    title: 'Appointment Reminder',
    timeAgo: '1h ago',
    description: 'Your session with Dr. Mehta starts in 1 hour.',
    section: 'TODAY',
    category: 'Appointments',
    isUnread: true,
    iconName: 'calendar-outline',
    iconColor: '#003D9B',
    iconBgColor: '#EFF6FF',
    targetRoute: '/my-bookings',
  },
  {
    id: 'notif_2',
    title: 'Recovery Milestone',
    timeAgo: '2m ago',
    description: "Congratulations! You've reached 80% of your Week 4 goals.",
    section: 'TODAY',
    category: 'Recovery',
    isUnread: true,
    iconName: 'trophy-outline',
    iconColor: '#9333EA',
    iconBgColor: '#F3E8FF',
    targetRoute: '/recovery-progress',
  },
  {
    id: 'notif_3',
    title: 'New Report',
    timeAgo: '1d ago',
    description: 'Your MRI Lumbar Spine report is now available to view.',
    section: 'YESTERDAY',
    category: 'Recovery',
    isUnread: false,
    iconName: 'document-text-outline',
    iconColor: '#0D9488',
    iconBgColor: '#E6F7F5',
    targetRoute: '/recovery-program-details',
  },
  {
    id: 'notif_4',
    title: 'Payment Success',
    timeAgo: '1d ago',
    description: 'Invoice #INV-9902 for ₹1,500 has been processed.',
    section: 'YESTERDAY',
    category: 'Payments',
    isUnread: false,
    iconName: 'checkmark-circle-outline',
    iconColor: '#16A34A',
    iconBgColor: '#EAF8F0',
    targetRoute: '/my-bookings',
  },
  {
    id: 'notif_5',
    title: 'System Update',
    timeAgo: '3d ago',
    description: 'PhysioPro version 2.4 is now live with enhanced tracking.',
    section: 'EARLIER',
    category: 'System',
    isUnread: false,
    iconName: 'settings-outline',
    iconColor: '#003D9B',
    iconBgColor: '#F1F5F9',
  },
];

const CATEGORIES = ['All', 'Appointments', 'Recovery', 'Payments', 'System'];

interface NotificationsScreenProps {
  hideBottomNavBar?: boolean;
  onTabPress?: (tab: TabKey) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ hideBottomNavBar = false, onTabPress }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [notifications, setNotifications] = useState<NotificationData[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeNavTab, setActiveNavTab] = useState<TabKey>('alerts');

  // Filter notifications based on active category chip
  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'All') return notifications;
    return notifications.filter(item => item.category === activeCategory);
  }, [notifications, activeCategory]);

  // Group filtered notifications by section
  const sections = useMemo(() => {
    const todayItems = filteredNotifications.filter(item => item.section === 'TODAY');
    const yesterdayItems = filteredNotifications.filter(item => item.section === 'YESTERDAY');
    const earlierItems = filteredNotifications.filter(item => item.section === 'EARLIER');

    const result = [];
    if (todayItems.length > 0) result.push({ title: 'TODAY', items: todayItems });
    if (yesterdayItems.length > 0) result.push({ title: 'YESTERDAY', items: yesterdayItems });
    if (earlierItems.length > 0) result.push({ title: 'EARLIER', items: earlierItems });
    return result;
  }, [filteredNotifications]);

  const handleNotificationPress = (item: NotificationData) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, isUnread: false } : n))
    );

    // Route navigation or detail alert
    if (item.targetRoute) {
      router.push(item.targetRoute as any);
    } else {
      Alert.alert(
        item.title,
        `${item.description}\n\nReceived: ${item.timeAgo}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    Alert.alert('Notifications', 'All notifications marked as read.');
  };

  const handleHeaderAction = () => {
    Alert.alert(
      'Notification Options',
      'Choose an action for your alerts',
      [
        { text: 'Mark All as Read', onPress: handleMarkAllRead },
        { text: 'Notification Settings', onPress: () => router.push('/notification-preferences' as any) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleNavTabPress = (tab: TabKey) => {
    setActiveNavTab(tab);
    if (onTabPress) {
      onTabPress(tab);
      return;
    }
    if (tab === 'home') {
      router.push('/explore');
    } else if (tab === 'bookings') {
      router.push('/my-bookings');
    } else if (tab === 'recovery') {
      router.push('/recovery');
    } else if (tab === 'alerts') {
      router.push('/notifications');
    } else if (tab === 'profile') {
      router.push('/profile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{Strings.notifications?.headerTitle || 'Notifications'}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleHeaderAction}
            style={styles.actionBtn}
            accessibilityLabel="Share or options"
          >
            <Ionicons name="share-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips Bar */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {CATEGORIES.map(category => {
              const isActive = activeCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  onPress={() => setActiveCategory(category)}
                  style={[styles.filterChip, isActive && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Notifications List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {sections.length > 0 ? (
            sections.map(sec => (
              <View key={sec.title} style={styles.sectionContainer}>
                <Text style={styles.sectionHeaderTitle}>{sec.title}</Text>
                
                <View style={styles.sectionCardsGroup}>
                  {sec.items.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.85}
                      onPress={() => handleNotificationPress(item)}
                      style={[
                        styles.notificationCard,
                        item.isUnread && styles.unreadNotificationCard,
                      ]}
                    >
                      {/* Left Circle Icon */}
                      <View style={[styles.iconCircle, { backgroundColor: item.iconBgColor }]}>
                        <Ionicons name={item.iconName} size={22} color={item.iconColor} />
                      </View>

                      {/* Content Group */}
                      <View style={styles.cardContent}>
                        <View style={styles.cardHeaderRow}>
                          <Text style={styles.cardTitle}>{item.title}</Text>
                          <Text style={styles.cardTimeAgo}>{item.timeAgo}</Text>
                        </View>
                        <Text style={styles.cardDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>

                      {/* Right Actions: Unread dot + Chevron */}
                      <View style={styles.rightActionGroup}>
                        {item.isUnread && <View style={styles.unreadDot} />}
                        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          ) : (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={42} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {Strings.notifications?.emptyState?.title || 'No Notifications'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {Strings.notifications?.emptyState?.subtitle || 'You have no notifications in this category right now.'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation Menu Bar */}
        {!hideBottomNavBar && <BottomNavBar activeTab={activeNavTab} onTabPress={handleNavTabPress} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },

  /* FILTER CHIPS */
  filterBar: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  filterScrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterChip: {
    backgroundColor: '#003D9B',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },

  /* MAIN SCROLL CONTENT */
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sectionCardsGroup: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadNotificationCard: {
    backgroundColor: '#FAFCFF',
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  cardTimeAgo: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.regular,
    color: '#94A3B8',
  },
  cardDescription: {
    fontSize: 13.5,
    fontWeight: Typography.fontWeight.regular,
    color: '#475569',
    lineHeight: 19,
  },
  rightActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#003D9B',
  },

  /* EMPTY STATE */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default NotificationsScreen;
