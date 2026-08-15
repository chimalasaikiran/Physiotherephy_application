import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export const AboutScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const about = Strings.aboutDetails;

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'ONE MEDICAL - Recover Better. Move Stronger. Learn more about our digital physiotherapy experience!',
        url: 'https://onemedical.com',
      });
    } catch (error) {
      console.log('Error sharing about info:', error);
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

  const handleMenuPress = (id: string) => {
    if (id === 'privacy_policy') {
      router.push('/privacy-security' as any);
    } else if (id === 'terms_conditions') {
      Alert.alert('Terms & Conditions', 'ONE MEDICAL Platform Terms of Service & Healthcare Service Level Agreement v1.0.');
    } else if (id === 'open_source') {
      Alert.alert('Open Source Licenses', 'This application uses React Native, Expo, and open-source libraries licensed under MIT.');
    } else if (id === 'website') {
      Linking.openURL('https://onemedical.com').catch(() => {
        Alert.alert('Website', 'Visiting https://onemedical.com');
      });
    }
  };

  const handleSocialPress = (id: string) => {
    const urls: Record<string, string> = {
      instagram: 'https://instagram.com/onemedical',
      facebook: 'https://facebook.com/onemedical',
      linkedin: 'https://linkedin.com/company/onemedical',
    };
    const targetUrl = urls[id] || 'https://onemedical.com';
    Linking.openURL(targetUrl).catch(() => {
      Alert.alert(id.toUpperCase(), `Opening ${targetUrl}`);
    });
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

          <Text style={styles.headerTitle}>{about.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share about info"
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
          {/* BRAND LOGO & TITLE HERO */}
          <View style={styles.heroSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="medkit" size={38} color="#FFFFFF" />
            </View>

            <Text style={styles.brandTitle}>{about.brandName}</Text>
            <Text style={styles.brandTagline}>{about.tagline}</Text>

            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>{about.versionText}</Text>
            </View>
          </View>

          {/* 1. OUR MISSION CARD */}
          <View style={styles.cardContainer}>
            <Text style={styles.missionTitle}>{about.ourMissionTitle}</Text>
            <Text style={styles.missionDescription}>{about.ourMissionDescription}</Text>
          </View>

          {/* 2. MENU LINKS CARD */}
          <View style={[styles.cardContainer, styles.menuCard]}>
            {about.menuLinks.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={[
                  styles.menuItemRow,
                  index < about.menuLinks.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleMenuPress(item.id)}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#003D9B" style={styles.menuIcon} />
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. CONNECT WITH US SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{about.connectWithUsTitle}</Text>

            <View style={[styles.cardContainer, styles.menuCard]}>
              {about.socialLinks.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={[
                    styles.menuItemRow,
                    index < about.socialLinks.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => handleSocialPress(item.id)}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons name={item.icon as any} size={20} color="#003D9B" style={styles.menuIcon} />
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="open-outline" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 4. CLINIC IMAGE BANNER */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/clinic_office.png')}
              style={styles.clinicImage}
              resizeMode="cover"
            />
          </View>

          {/* 5. FOOTER INFO */}
          <View style={styles.footerContainer}>
            <Text style={styles.copyrightText}>{about.copyrightText}</Text>
            <Text style={styles.addressLine1}>{about.officeAddressLine1}</Text>
            <Text style={styles.addressLine2}>{about.officeAddressLine2}</Text>
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
    paddingTop: Spacing.xl,
  },

  /* HERO SECTION */
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  versionBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#64748B',
  },

  /* CARD GENERIC */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  missionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    marginBottom: 12,
  },
  missionDescription: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: '#475569',
    lineHeight: 22,
  },

  /* MENU CARD */
  menuCard: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.lg,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    minHeight: 56,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 14,
    width: 24,
  },
  menuTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0F172A',
  },

  /* CONNECT WITH US SECTION */
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

  /* CLINIC IMAGE */
  imageContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  clinicImage: {
    width: '100%',
    height: 180,
  },

  /* FOOTER */
  footerContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    marginBottom: 6,
    textAlign: 'center',
  },
  addressLine1: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 2,
  },
  addressLine2: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default AboutScreen;
