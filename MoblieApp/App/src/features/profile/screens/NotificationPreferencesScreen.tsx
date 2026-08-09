import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export const NotificationPreferencesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const prefData = Strings.notificationPreferencesDetails;

  // Master switch state
  const [masterEnabled, setMasterEnabled] = useState<boolean>(
    prefData.enableNotificationsCard.defaultState
  );

  // Individual toggle states key-value dictionary
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    prefData.sections.forEach((sec) => {
      sec.items.forEach((item) => {
        initialMap[item.id] = item.defaultState;
      });
    });
    return initialMap;
  });

  const handleToggle = (itemId: string, value: boolean) => {
    setToggles((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleMasterToggle = (value: boolean) => {
    setMasterEnabled(value);
  };

  const handleResetToDefault = () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all notification preferences to default settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setMasterEnabled(prefData.enableNotificationsCard.defaultState);
            const defaultMap: Record<string, boolean> = {};
            prefData.sections.forEach((sec) => {
              sec.items.forEach((item) => {
                defaultMap[item.id] = item.defaultState;
              });
            });
            setToggles(defaultMap);
            Alert.alert('Reset Complete', 'Notification preferences restored to default.');
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Notification Preferences - ONE MEDICAL App',
      });
    } catch (error) {
      console.log('Error sharing notification preferences:', error);
    }
  };

  const handleTabPress = (tab: TabKey) => {
    if (tab === 'home') {
      router.push('/explore' as any);
    } else if (tab === 'bookings') {
      router.push('/my-bookings' as any);
    } else if (tab === 'recovery') {
      router.push('/recovery' as any);
    } else if (tab === 'alerts') {
      router.push('/notifications' as any);
    } else if (tab === 'profile') {
      router.push('/profile' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* HEADER BAR */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 16
              ) + 8,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#003D9B" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{prefData.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share preferences"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* MAIN SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* MASTER ENABLE NOTIFICATIONS CARD */}
          <View style={styles.enableCard}>
            <View style={styles.enableTextContainer}>
              <Text style={styles.enableTitle}>{prefData.enableNotificationsCard.title}</Text>
              <Text style={styles.enableDescription}>
                {prefData.enableNotificationsCard.description}
              </Text>
            </View>

            <Switch
              value={masterEnabled}
              onValueChange={handleMasterToggle}
              trackColor={{ false: '#E2E8F0', true: '#22C55E' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          {/* PREFERENCE SECTIONS */}
          {prefData.sections.map((section) => (
            <View key={section.id} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.sectionCard}>
                {section.items.map((item, index) => {
                  const isChecked = masterEnabled && (toggles[item.id] ?? item.defaultState);
                  const isLast = index === section.items.length - 1;

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.toggleRow,
                        !isLast && styles.toggleRowBorder,
                      ]}
                    >
                      <Text style={styles.itemTitle}>{item.title}</Text>

                      <Switch
                        value={isChecked}
                        disabled={!masterEnabled}
                        onValueChange={(val) => handleToggle(item.id, val)}
                        trackColor={{ false: '#E2E8F0', true: '#22C55E' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#E2E8F0"
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* BOTTOM ACTIONS AREA */}
          <View style={styles.bottomActionsArea}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.resetButton}
              onPress={handleResetToDefault}
            >
              <Text style={styles.resetButtonText}>{prefData.resetButtonText}</Text>
            </TouchableOpacity>

            <Text style={styles.syncFooterText}>{prefData.footerSyncText}</Text>
          </View>
        </ScrollView>

        {/* BOTTOM NAVIGATION TAB BAR */}
        <BottomNavBar activeTab="profile" onTabPress={handleTabPress} />
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
    backgroundColor: '#FAFBFD',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* SCROLL CONTENT */
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* MASTER ENABLE CARD */
  enableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.xl,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  enableTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  enableTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  enableDescription: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    lineHeight: 18,
  },

  /* SECTIONS */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  toggleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },

  /* BOTTOM ACTIONS */
  bottomActionsArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  resetButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  resetButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
  },
  syncFooterText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default NotificationPreferencesScreen;
