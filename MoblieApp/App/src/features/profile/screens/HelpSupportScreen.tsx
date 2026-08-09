import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
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

export const HelpSupportScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const helpData = Strings.helpSupportDetails;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq_1');

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'ONE MEDICAL - Help & Support Center\nReach our 24/7 care team at support@onemedical.com',
      });
    } catch (error) {
      console.log('Error sharing help support details:', error);
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

  const handleContactChannel = (channelId: string) => {
    if (channelId === 'chat') {
      Alert.alert(
        'Live Care Chat',
        'Connecting you to a care manager...\nEstimated wait time: 30 seconds.',
        [{ text: 'Start Chat', onPress: () => Alert.alert('Chat Connected', 'Care team representative is now active in chat.') }, { text: 'Cancel', style: 'cancel' }]
      );
    } else if (channelId === 'phone') {
      Alert.alert(
        'Call Customer Support',
        'Dial toll-free helpline +91 1800-123-4567?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call Now', onPress: () => Linking.openURL('tel:18001234567').catch(() => Alert.alert('Error', 'Unable to place call on this device.')) },
        ]
      );
    } else if (channelId === 'email') {
      Linking.openURL('mailto:support@onemedical.com?subject=Help%20%26%20Support%20Inquiry').catch(() =>
        Alert.alert('Email Support', 'Contact us at: support@onemedical.com')
      );
    } else if (channelId === 'callback') {
      Alert.alert(
        'Request Call Back',
        'We will call your registered phone number (+91 98765 43210) within 30 minutes.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm Request', onPress: () => Alert.alert('Request Received', 'A care manager will call you shortly.') },
        ]
      );
    }
  };

  const handleSelfServiceItem = (itemId: string, title: string) => {
    if (itemId === 'user_guide') {
      Alert.alert('User Guide & Video Tutorials', 'Opening interactive app walkthrough and video guides...');
    } else if (itemId === 'feedback') {
      Alert.alert('App Feedback', 'Thank you for helping us improve ONE MEDICAL! Send your thoughts to feedback@onemedical.com.');
    } else if (itemId === 'report_bug') {
      Alert.alert('Report a Bug', 'Opening bug report diagnostic screen...');
    } else {
      Alert.alert(title, `Opening ${title}...`);
    }
  };

  const toggleFaqExpand = (faqId: string) => {
    setExpandedFaqId((prev) => (prev === faqId ? null : faqId));
  };

  // Filter FAQs based on search query and category tab
  const filteredFaqs = helpData.faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

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

          <Text style={styles.headerTitle}>{helpData.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share help support info"
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
          {/* HERO BANNER & SEARCH */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeaderRow}>
              <View style={styles.heroIconCircle}>
                <Ionicons name="help-buoy" size={26} color="#003D9B" />
              </View>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>{helpData.hero.title}</Text>
                <Text style={styles.heroSubtitle}>{helpData.hero.subtitle}</Text>
              </View>
            </View>

            {/* SEARCH INPUT BAR */}
            <View style={styles.searchBarContainer}>
              <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={helpData.hero.searchPlaceholder}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && Platform.OS === 'android' && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 1. DIRECT CONTACT CHANNELS SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{helpData.quickContactSectionTitle}</Text>

            <View style={styles.contactGrid}>
              {helpData.contactOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.85}
                  style={styles.contactCard}
                  onPress={() => handleContactChannel(opt.id)}
                >
                  <View style={styles.contactCardTopRow}>
                    <View style={styles.contactIconCircle}>
                      <Ionicons name={opt.icon as any} size={22} color="#003D9B" />
                    </View>
                    <View style={[styles.badgePill, { backgroundColor: opt.badgeBg }]}>
                      <Text style={[styles.badgePillText, { color: opt.badgeColor }]}>
                        {opt.badge}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.contactTitle}>{opt.title}</Text>
                  <Text style={styles.contactSubtitle}>{opt.subtitle}</Text>

                  <View style={styles.contactActionRow}>
                    <Text style={styles.contactActionText}>{opt.actionText}</Text>
                    <Ionicons name="arrow-forward" size={14} color="#003D9B" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 2. FREQUENTLY ASKED QUESTIONS SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{helpData.faqSectionTitle}</Text>

            {/* CATEGORY FILTER TABS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabsContainer}
            >
              {helpData.faqCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.75}
                    style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        isSelected && styles.categoryTabTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ACCORDION FAQ CARDS */}
            <View style={styles.faqCardContainer}>
              {filteredFaqs.length === 0 ? (
                <View style={styles.emptyFaqState}>
                  <Ionicons name="information-circle-outline" size={36} color="#94A3B8" />
                  <Text style={styles.emptyFaqTitle}>No FAQs Found</Text>
                  <Text style={styles.emptyFaqSubtitle}>
                    No questions matched your search query. Try searching with different terms or select "All FAQs".
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.resetSearchBtn}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    <Text style={styles.resetSearchBtnText}>Reset Search & Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const isExpanded = expandedFaqId === faq.id;
                  const isLast = index === filteredFaqs.length - 1;

                  return (
                    <View
                      key={faq.id}
                      style={[styles.faqItemContainer, !isLast && styles.faqBorderBottom]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.faqQuestionRow}
                        onPress={() => toggleFaqExpand(faq.id)}
                      >
                        <Text style={styles.faqQuestionText}>{faq.question}</Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#003D9B"
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.faqAnswerContainer}>
                          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* 3. SELF-SERVICE & RESOURCES SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{helpData.selfServiceSectionTitle}</Text>

            <View style={styles.selfServiceCard}>
              {helpData.selfServiceItems.map((item, index) => {
                const isLast = index === helpData.selfServiceItems.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[styles.selfServiceRow, !isLast && styles.selfServiceBorderBottom]}
                    onPress={() => handleSelfServiceItem(item.id, item.title)}
                  >
                    <View style={styles.selfServiceIconCircle}>
                      <Ionicons name={item.icon as any} size={20} color="#003D9B" />
                    </View>
                    <View style={styles.selfServiceTextCol}>
                      <Text style={styles.selfServiceTitle}>{item.title}</Text>
                      <Text style={styles.selfServiceSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. MEDICAL EMERGENCY NOTICE BANNER */}
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeaderRow}>
              <Ionicons name="warning-outline" size={22} color="#DC2626" />
              <Text style={styles.emergencyTitle}>{helpData.emergencyNoticeTitle}</Text>
            </View>
            <Text style={styles.emergencyText}>{helpData.emergencyNoticeText}</Text>
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

  /* HERO BANNER & SEARCH */
  heroCard: {
    backgroundColor: '#003D9B',
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#E0E7FF',
    lineHeight: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#0F172A',
    paddingVertical: 0,
  },

  /* SECTIONS GENERIC */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },

  /* DIRECT CONTACT GRID */
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  contactCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.4,
  },
  contactTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 12,
  },
  contactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactActionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* FAQ CATEGORY TABS */
  categoryTabsContainer: {
    gap: 8,
    paddingBottom: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTabSelected: {
    backgroundColor: '#003D9B',
    borderColor: '#003D9B',
  },
  categoryTabText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#64748B',
  },
  categoryTabTextSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },

  /* FAQ ACCORDION CARDS */
  faqCardContainer: {
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
  faqItemContainer: {
    paddingVertical: 14,
  },
  faqBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  faqAnswerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  faqAnswerText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#475569',
    lineHeight: 18,
  },

  /* EMPTY FAQ STATE */
  emptyFaqState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFaqTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyFaqSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: Spacing.md,
  },
  resetSearchBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#EFF6FF',
  },
  resetSearchBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* SELF-SERVICE & RESOURCES */
  selfServiceCard: {
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
  selfServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  selfServiceBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  selfServiceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  selfServiceTextCol: {
    flex: 1,
    marginRight: 12,
  },
  selfServiceTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  selfServiceSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
  },

  /* EMERGENCY NOTICE */
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: Spacing.lg,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  emergencyTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
    letterSpacing: 0.6,
  },
  emergencyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#991B1B',
    lineHeight: 17,
  },
});

export default HelpSupportScreen;
