import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { ServiceSelectionHeader } from '@/features/appointments';
import { RecentlyBookedCard, RecentlyBookedDoctor } from '@/features/appointments';
import { ServiceCard, MedicalService } from '@/features/appointments';
import { BottomNavBar, TabKey } from '@/components';
import { EmptyStateView } from '@/components';
import { SkeletonLoader } from '@/components';
import { fetchServicesFromApi } from '@/api/appointmentApi';


export const ServiceSelectionScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [servicesList, setServicesList] = useState<MedicalService[]>([...Strings.serviceSelection.services]);
  const [selectedService, setSelectedService] = useState<MedicalService | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('schedule');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const recentlyBookedList: RecentlyBookedDoctor[] = [...Strings.serviceSelection.recentlyBooked];

  useEffect(() => {
    let isMounted = true;
    const loadServices = async () => {
      setIsLoading(true);
      const apiServices = await fetchServicesFromApi();
      if (isMounted) {
        if (apiServices && apiServices.length > 0) {
          const mapped: MedicalService[] = apiServices.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            category: s.category,
            iconName: s.iconName as any,
            startingFee: s.startingFee,
            numericFee: s.numericFee,
          }));
          setServicesList(mapped);
        }
        setIsLoading(false);
      }
    };
    loadServices();
    return () => {
      isMounted = false;
    };
  }, []);

  // Search filtering logic
  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return servicesList;
    return servicesList.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q))
    );
  }, [servicesList, searchQuery]);

  const handleServiceSelect = (service: MedicalService) => {
    if (selectedService?.id === service.id) {
      // Toggle off if tapped again or keep selected
      setSelectedService(service);
    } else {
      setSelectedService(service);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/explore');
    }
  };

  const handleContinue = () => {
    if (!selectedService) return;
    router.push({
      pathname: '/book-appointment',
      params: {
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
      },
    });
  };

  const handleRebookDoctor = (doctor: RecentlyBookedDoctor) => {
    // Quick shortcut: select a matching service or directly open book appointment
    const matchingService = servicesList.find(
      (s: MedicalService) => doctor.specialty.toLowerCase().includes(s.title.toLowerCase()) || s.id === 'back_pain'
    ) || servicesList[0];

    setSelectedService(matchingService);
  };

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* 1. Header */}
      <ServiceSelectionHeader
        title={Strings.serviceSelection.headerTitle}
        onBack={handleBack}
        onAvatarPress={() => Alert.alert('Profile', 'Opening सागर user profile...')}
      />

        {/* 2. Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={Strings.serviceSelection.searchPlaceholder}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 150);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. Main Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 170 + Math.max(insets.bottom, 12) },
          ]}
        >
          {hasError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
              <Text style={styles.errorText}>Unable to load services. Please try again.</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => setHasError(false)}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* RECENTLY BOOKED SECTION */}
              {!searchQuery && (
                <View style={styles.sectionWrapper}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>
                      {Strings.serviceSelection.recentlyBookedTitle}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => Alert.alert('Recently Booked', 'Showing recently booked specialists history.')}
                    >
                      <Text style={styles.viewAllText}>
                        {Strings.serviceSelection.viewAll}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollList}
                  >
                    {recentlyBookedList.map((doc) => (
                      <RecentlyBookedCard
                        key={doc.id}
                        doctor={doc}
                        onPress={handleRebookDoctor}
                        onRebookPress={handleRebookDoctor}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* POPULAR SERVICES SECTION */}
              <View style={styles.sectionWrapper}>
                <Text style={styles.sectionTitle}>
                  {Strings.serviceSelection.popularServicesTitle}
                </Text>

                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <SkeletonLoader />
                  </View>
                ) : filteredServices.length === 0 ? (
                  <EmptyStateView
                    title={Strings.serviceSelection.emptyState.title}
                    subtitle={Strings.serviceSelection.emptyState.subtitle}
                    onReset={() => setSearchQuery('')}
                  />
                ) : (
                  <View style={styles.gridContainer}>
                    {filteredServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        isSelected={selectedService?.id === service.id}
                        onSelect={handleServiceSelect}
                      />
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* 4. STICKY BOTTOM CONTINUE BUTTON (POSITIONED ABOVE NAV BAR) */}
        <View
          style={[
            styles.bottomStickyBar,
            { bottom: 74 + Math.max(insets.bottom, 10) },
          ]}
        >
          <TouchableOpacity
            activeOpacity={selectedService ? 0.85 : 1}
            disabled={!selectedService}
            onPress={handleContinue}
            style={[
              styles.continueButton,
              selectedService ? styles.continueButtonEnabled : styles.continueButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedService }}
            accessibilityLabel="Continue to booking screen"
          >
            <Text style={styles.continueButtonText}>
              {Strings.serviceSelection.continueButton}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. BOTTOM NAVIGATION BAR */}
        <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#FBFBFE',
  },
  searchContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 9999,
    paddingHorizontal: 16,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  sectionWrapper: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  viewAllText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  horizontalScrollList: {
    paddingRight: Spacing.xl,
    paddingBottom: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    paddingVertical: 20,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: '#64748B',
    marginTop: 10,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#003D9B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.xs,
  },

  /* STICKY BOTTOM BAR */
  bottomStickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    zIndex: 90,
  },
  continueButton: {
    height: 52,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  continueButtonEnabled: {
    backgroundColor: '#003D9B',
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default ServiceSelectionScreen;
