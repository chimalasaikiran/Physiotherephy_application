import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
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

export const DeleteAccountScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const data = Strings.deleteAccountScreenDetails;

  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'ONE MEDICAL - Account Deletion Information & Policy',
      });
    } catch (error) {
      console.log('Error sharing delete account screen:', error);
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

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You can sign back in at any time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: () => {
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'If you are having trouble or need assistance with your account, reach out to our team at support@onemedical.com or call +1-800-555-0199.',
      [{ text: 'Close' }]
    );
  };

  const handleDeleteAccountPress = () => {
    if (!isChecked) {
      Alert.alert(
        'Action Required',
        'Please check the box to confirm that you understand this action is permanent before deleting your account.'
      );
      return;
    }

    Alert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to permanently delete your account? All health records, saved specialists, and progress data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deleted',
              'Your account has been permanently deleted.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/login' as any),
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* HEADER BAR */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#003D9B" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{data.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share screen"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* MAIN SCROLL CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* 1. TOP HERO WARNING CARD */}
          <View style={styles.heroCard}>
            <View style={styles.warningIconBadge}>
              <Ionicons name="warning-outline" size={28} color="#DC2626" />
            </View>
            <Text style={styles.heroTitle}>{data.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{data.heroSubtitle}</Text>
          </View>

          {/* 2. WHAT HAPPENS CARD */}
          <View style={styles.whatHappensCard}>
            <Text style={styles.cardSectionTitle}>{data.whatHappensTitle}</Text>

            {data.whatHappensItems.map((item, index) => (
              <View key={`item_${index}`} style={styles.bulletRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#003D9B"
                  style={styles.bulletIcon}
                />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}

            {/* LEGAL NOTICE ITEM */}
            <View style={styles.legalNoticeRow}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#64748B"
                style={styles.legalNoticeIcon}
              />
              <Text style={styles.legalNoticeText}>{data.legalNoticeText}</Text>
            </View>
          </View>

          {/* 3. NEED A BREAK CARD */}
          <View style={styles.needBreakCard}>
            <Text style={styles.needBreakTitle}>{data.needBreakTitle}</Text>
            <Text style={styles.needBreakSubtitle}>{data.needBreakSubtitle}</Text>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.signOutButton}
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
            >
              <Text style={styles.signOutButtonText}>{data.signOutButtonText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleContactSupport}
              style={styles.contactSupportTouch}
            >
              <Text style={styles.contactSupportText}>{data.contactSupportText}</Text>
            </TouchableOpacity>
          </View>

          {/* 4. CONFIRMATION CHECKBOX ROW */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.checkboxRow}
            onPress={() => setIsChecked(!isChecked)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
          >
            <Ionicons
              name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={isChecked ? '#003D9B' : '#94A3B8'}
            />
            <Text style={styles.checkboxLabel}>{data.checkboxLabel}</Text>
          </TouchableOpacity>

          {/* 5. DELETE ACCOUNT ACTION BUTTON */}
          <TouchableOpacity
            activeOpacity={isChecked ? 0.85 : 1}
            style={[
              styles.deleteButton,
              isChecked ? styles.deleteButtonActive : styles.deleteButtonDisabled,
            ]}
            onPress={handleDeleteAccountPress}
            accessibilityRole="button"
            accessibilityLabel="Delete Account"
          >
            <Text
              style={[
                styles.deleteButtonText,
                isChecked ? styles.deleteButtonTextActive : styles.deleteButtonTextDisabled,
              ]}
            >
              {data.deleteAccountButtonText}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* BOTTOM NAVIGATION BAR */}
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

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },

  /* 1. HERO WARNING CARD */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  warningIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },

  /* 2. WHAT HAPPENS CARD */
  whatHappensCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bulletIcon: {
    marginRight: 12,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
    lineHeight: 20,
  },
  legalNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingTop: 12,
  },
  legalNoticeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  legalNoticeText: {
    flex: 1,
    fontSize: Typography.fontSize.xs + 0.5,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    lineHeight: 18,
  },

  /* 3. NEED A BREAK CARD */
  needBreakCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  needBreakTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  needBreakSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 19,
  },
  signOutButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#003D9B',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  signOutButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  contactSupportTouch: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  contactSupportText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },

  /* 4. CONFIRMATION CHECKBOX */
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: Spacing.xl,
  },
  checkboxLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#0F172A',
    marginLeft: 10,
    flex: 1,
  },

  /* 5. DELETE BUTTON */
  deleteButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  deleteButtonActive: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonDisabled: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  deleteButtonTextActive: {
    color: '#FFFFFF',
  },
  deleteButtonTextDisabled: {
    color: '#FCA5A5',
  },
});

export default DeleteAccountScreen;
