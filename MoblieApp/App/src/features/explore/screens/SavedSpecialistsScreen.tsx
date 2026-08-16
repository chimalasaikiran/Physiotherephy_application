import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
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

export interface SavedSpecialistItem {
  id: string;
  doctorId: string;
  name: string;
  specialty: string;
  rating: number;
  isVerified: boolean;
  clinic: string;
  experience: string;
  nextAvailable: string;
  distance: string;
  imageName: string;
  category: string;
  isSaved: boolean;
}

export const SavedSpecialistsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = Strings.savedSpecialistsDetails;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [specialists, setSpecialists] = useState<SavedSpecialistItem[]>(
    s.specialists as unknown as SavedSpecialistItem[]
  );

  const categories = s.categories;

  const getImageSource = (imageName: string) => {
    switch (imageName) {
      case 'doctor_ananya':
        return require('../../../assets/images/doctor_ananya.png');
      case 'care_team_doctor':
        return require('../../../assets/images/care_team_doctor.png');
      case 'doctor_arjun':
      default:
        return require('../../../assets/images/doctor_arjun.png');
    }
  };

  const toggleSaveSpecialist = (id: string) => {
    setSpecialists((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextSaved = !item.isSaved;
          Alert.alert(
            nextSaved ? 'Specialist Saved' : 'Specialist Removed',
            nextSaved
              ? `${item.name} has been added to your saved specialists.`
              : `${item.name} has been removed from your saved specialists.`
          );
          return { ...item, isSaved: nextSaved };
        }
        return item;
      })
    );
  };

  const filteredSpecialists = useMemo(() => {
    return specialists.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.clinic.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Nearby' && parseFloat(item.distance) <= 3.0);

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory, specialists]);

  const handleShareScreen = async () => {
    try {
      await Share.share({
        message: 'Saved Specialists on ONE MEDICAL App',
      });
    } catch (error) {
      console.log('Error sharing specialists:', error);
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* HEADER BAR */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerIconButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#003D9B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{s.headerTitle}</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerIconButton}
          onPress={handleShareScreen}
          accessibilityRole="button"
          accessibilityLabel="Share saved specialists"
        >
          <Ionicons name="share-outline" size={22} color="#003D9B" />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE CONTENT AREA */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + Math.max(insets.bottom, 12) },
        ]}
      >
          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={s.searchPlaceholder}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* CATEGORY TABS HORIZONTAL SCROLL */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContainer}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryChip,
                    isSelected ? styles.categoryChipActive : styles.categoryChipInactive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected ? styles.categoryTextActive : styles.categoryTextInactive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SPECIALISTS CARDS LIST */}
          {filteredSpecialists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Saved Specialists</Text>
              <Text style={styles.emptySubtitle}>
                No specialists match your search criteria or selected filter category.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.resetFilterButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                <Text style={styles.resetFilterText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.specialistListContainer}>
              {filteredSpecialists.map((item) => (
                <View key={item.id} style={styles.specialistCard}>
                  {/* DOCTOR IMAGE CONTAINER */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={getImageSource(item.imageName)}
                      style={styles.doctorImage}
                      resizeMode="cover"
                    />

                    {/* HEART BADGE TOP RIGHT */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.heartButton}
                      onPress={() => toggleSaveSpecialist(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Save specialist"
                    >
                      <Ionicons
                        name={item.isSaved ? 'heart' : 'heart-outline'}
                        size={20}
                        color={item.isSaved ? '#003D9B' : '#64748B'}
                      />
                    </TouchableOpacity>

                    {/* VERIFIED BADGE BOTTOM LEFT */}
                    {item.isVerified && (
                      <View style={styles.verifiedBadgePill}>
                        <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                      </View>
                    )}
                  </View>

                  {/* CARD DETAILS BODY */}
                  <View style={styles.cardBody}>
                    {/* NAME & RATING ROW */}
                    <View style={styles.nameRatingRow}>
                      <Text style={styles.doctorName}>{item.name}</Text>
                      <View style={styles.ratingPill}>
                        <Ionicons name="star" size={13} color="#0284C7" style={{ marginRight: 3 }} />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                      </View>
                    </View>

                    {/* SPECIALTY */}
                    <Text style={styles.specialtyText}>{item.specialty}</Text>

                    {/* CLINIC & EXPERIENCE ROW */}
                    <View style={styles.infoMetaRow}>
                      <View style={styles.infoMetaItem}>
                        <Ionicons name="business-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                        <Text style={styles.infoMetaText} numberOfLines={1}>
                          {item.clinic}
                        </Text>
                      </View>

                      <View style={styles.infoMetaItem}>
                        <Ionicons name="briefcase-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                        <Text style={styles.infoMetaText}>{item.experience}</Text>
                      </View>
                    </View>

                    {/* NEXT SLOT & DISTANCE BANNER */}
                    <View style={styles.slotBanner}>
                      <View style={styles.slotBannerLeft}>
                        <Ionicons name="calendar-outline" size={16} color="#003D9B" style={{ marginRight: 8 }} />
                        <Text style={styles.slotBannerText}>{item.nextAvailable}</Text>
                      </View>
                      <Text style={styles.slotDistanceText}>{item.distance}</Text>
                    </View>

                    {/* ACTION BUTTONS ROW */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.viewProfileBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/therapist-details' as any,
                            params: {
                              doctorId: item.doctorId,
                              doctorName: item.name,
                              doctorSpecialty: item.specialty,
                              doctorClinic: item.clinic,
                              doctorExperience: item.experience,
                              doctorRating: String(item.rating),
                              doctorImageName: item.imageName,
                            },
                          })
                        }
                      >
                        <Text style={styles.viewProfileText}>View Profile</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.bookApptBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/select-date-time' as any,
                            params: {
                              doctorId: item.doctorId,
                              doctorName: item.name,
                              doctorSpecialty: item.specialty,
                              doctorClinic: item.clinic,
                              doctorExperience: item.experience,
                              doctorRating: String(item.rating),
                              doctorImageName: item.imageName,
                            },
                          })
                        }
                      >
                        <Text style={styles.bookApptText}>Book Appointment</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* EXPLORE DIRECTORY FOOTER SECTION */}
          <View style={styles.exploreFooterContainer}>
            <View style={styles.exploreIconCircle}>
              <Ionicons name="search-outline" size={26} color="#003D9B" />
            </View>
            <Text style={styles.exploreFooterTitle}>{s.exploreFooter.title}</Text>
            <Text style={styles.exploreFooterSubtitle}>{s.exploreFooter.subtitle}</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.exploreAllBtn}
              onPress={() => router.push('/service-selection' as any)}
            >
              <Text style={styles.exploreAllBtnText}>{s.exploreFooter.buttonText}</Text>
              <Ionicons name="arrow-forward" size={16} color="#003D9B" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* BOTTOM NAVIGATION BAR */}
        <BottomNavBar activeTab="profile" onTabPress={handleTabPress} />
      </View>
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

  /* SEARCH BAR */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#0F172A',
  },

  /* CATEGORIES TABS */
  categoriesScrollContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: Spacing.xl,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  categoryChipActive: {
    backgroundColor: '#003D9B',
  },
  categoryChipInactive: {
    backgroundColor: '#EEF2FE',
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryTextInactive: {
    color: '#003D9B',
  },

  /* SPECIALIST LIST CONTAINER */
  specialistListContainer: {
    gap: 20,
    marginBottom: Spacing.xl,
  },
  specialistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  /* IMAGE CONTAINER */
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 210,
    backgroundColor: '#F1F5F9',
  },
  doctorImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verifiedBadgePill: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003D9B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  /* CARD BODY */
  cardBody: {
    padding: Spacing.lg,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
  },
  specialtyText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#0284C7',
    marginBottom: 12,
  },

  /* INFO META */
  infoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoMetaText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },

  /* SLOT BANNER */
  slotBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  slotBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slotBannerText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  slotDistanceText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* CARD ACTIONS ROW */
  cardActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  viewProfileBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#003D9B',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  bookApptBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  bookApptText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  /* EMPTY STATE */
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetFilterButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  resetFilterText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* EXPLORE DIRECTORY FOOTER */
  exploreFooterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  exploreIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exploreFooterTitle: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 6,
  },
  exploreFooterSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  exploreAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreAllBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
});

export default SavedSpecialistsScreen;
