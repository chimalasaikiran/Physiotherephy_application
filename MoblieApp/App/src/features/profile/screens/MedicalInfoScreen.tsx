import React, { useState, useRef } from 'react';
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
}

interface ConditionItem {
  id: string;
  name: string;
}

export const MedicalInfoScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const m = Strings.medicalInfoDetails;

  // Dynamic state for interactive items
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medicalConditions, setMedicalConditions] = useState<ConditionItem[]>([
    ...m.medicalConditions.items,
  ]);
  const [medications, setMedications] = useState<MedicationItem[]>([
    ...m.currentMedications.items,
  ]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Medical Information Overview:\n- Blood Group: ${m.vitalsOverview.bloodGroupValue}\n- Height: ${m.vitalsOverview.heightValue} cm\n- Weight: ${m.vitalsOverview.weightValue} kg\n- Emergency Contact: ${m.emergencyContact.name} (${m.emergencyContact.phone})`,
      });
    } catch (error) {
      console.log('Error sharing medical info:', error);
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

  const handleAddAllergy = () => {
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt(
        'Add Allergy',
        'Enter allergy details (e.g. Penicillin, Peanuts):',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: (val?: string) => {
              if (val && val.trim().length > 0) {
                setAllergies((prev) => [...prev, val.trim()]);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Add Allergy',
        'Specify any known drug or food allergy.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Dust / Pollen',
            onPress: () => setAllergies((prev) => [...prev, 'Dust / Pollen']),
          },
          {
            text: 'Penicillin',
            onPress: () => setAllergies((prev) => [...prev, 'Penicillin']),
          },
        ]
      );
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    Alert.alert(
      'Add Medical Condition',
      'Choose a condition or note:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Diabetes (Type 2)',
          onPress: () =>
            setMedicalConditions((prev) => [
              ...prev,
              { id: Date.now().toString(), name: 'Diabetes (Type 2)' },
            ]),
        },
        {
          text: 'Asthma',
          onPress: () =>
            setMedicalConditions((prev) => [
              ...prev,
              { id: Date.now().toString(), name: 'Asthma' },
            ]),
        },
      ]
    );
  };

  const handleAddMedication = () => {
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt(
        'Add Medication',
        'Enter medication name & dosage:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: (val?: string) => {
              if (val && val.trim().length > 0) {
                setMedications((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    name: val.trim(),
                    dosage: 'As prescribed',
                  },
                ]);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Add Medication',
        'Add a new prescribed medication to your profile.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Paracetamol 500mg',
            onPress: () =>
              setMedications((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  name: 'Paracetamol',
                  dosage: '500mg, As needed',
                },
              ]),
          },
          {
            text: 'Multivitamin',
            onPress: () =>
              setMedications((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  name: 'Multivitamin',
                  dosage: '1 Tablet, Daily Morning',
                },
              ]),
          },
        ]
      );
    }
  };

  const handleCallEmergencyContact = () => {
    const phoneNumber = m.emergencyContact.phone;
    Alert.alert(
      'Emergency Contact',
      `Call ${m.emergencyContact.name} (${phoneNumber})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber.replace(/\s+/g, '')}`).catch(() => {
              Alert.alert('Calling', `Initiating call to ${phoneNumber}`);
            });
          },
        },
      ]
    );
  };

  const handleScrollToEmergency = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
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
                Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 16
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

          <Text style={styles.headerTitle}>{m.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share medical info"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE MAIN CONTENT */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 12) },
          ]}
        >
          {/* 1. VITALS OVERVIEW SECTION */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.sectionHeaderRow}
              onPress={() => Alert.alert('Vitals Overview', 'Viewing vital metrics')}
            >
              <Text style={styles.sectionTitle}>{m.vitalsOverview.sectionTitle}</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.vitalsCard}>
              {/* 3 COLUMNS: BLOOD GROUP, HEIGHT, WEIGHT */}
              <View style={styles.vitalsColumnsRow}>
                {/* Blood Group */}
                <View style={styles.vitalColumn}>
                  <Text style={styles.vitalLabel}>{m.vitalsOverview.bloodGroupLabel}</Text>
                  <Text style={styles.vitalValuePrimary}>{m.vitalsOverview.bloodGroupValue}</Text>
                </View>

                <View style={styles.columnDivider} />

                {/* Height */}
                <View style={styles.vitalColumn}>
                  <Text style={styles.vitalLabel}>{m.vitalsOverview.heightLabel}</Text>
                  <View style={styles.valueWithUnitRow}>
                    <Text style={styles.vitalValuePrimary}>{m.vitalsOverview.heightValue}</Text>
                    <Text style={styles.vitalUnitText}>{m.vitalsOverview.heightUnit}</Text>
                  </View>
                </View>

                <View style={styles.columnDivider} />

                {/* Weight */}
                <View style={styles.vitalColumn}>
                  <Text style={styles.vitalLabel}>{m.vitalsOverview.weightLabel}</Text>
                  <View style={styles.valueWithUnitRow}>
                    <Text style={styles.vitalValuePrimary}>{m.vitalsOverview.weightValue}</Text>
                    <Text style={styles.vitalUnitText}>{m.vitalsOverview.weightUnit}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* VIEW EMERGENCY CONTACTS LINK */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.emergencyLinkRow}
                onPress={handleScrollToEmergency}
              >
                <Ionicons name="id-card-outline" size={18} color="#003D9B" style={{ marginRight: 8 }} />
                <Text style={styles.emergencyLinkText}>{m.vitalsOverview.viewEmergencyContactsBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. ALLERGIES SECTION */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleWithoutCaps}>{m.allergies.sectionTitle}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.iconAddCircleButton}
                onPress={handleAddAllergy}
              >
                <Ionicons name="add" size={18} color="#003D9B" />
              </TouchableOpacity>
            </View>

            {allergies.length === 0 ? (
              <View style={styles.allergiesDashedCard}>
                <View style={styles.minusCircleIconBg}>
                  <Ionicons name="remove-circle-outline" size={24} color="#94A3B8" />
                </View>
                <Text style={styles.noAllergiesText}>{m.allergies.emptyText}</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={handleAddAllergy}>
                  <Text style={styles.addAllergyBtnText}>{m.allergies.addBtn}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.allergiesFilledCard}>
                <View style={styles.allergiesChipsRow}>
                  {allergies.map((allergy, idx) => (
                    <View key={idx} style={styles.allergyChip}>
                      <Ionicons name="warning-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
                      <Text style={styles.allergyChipText}>{allergy}</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveAllergy(idx)}
                        style={{ marginLeft: 6 }}
                      >
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.addMoreLinkRow}
                  onPress={handleAddAllergy}
                >
                  <Ionicons name="add" size={16} color="#003D9B" style={{ marginRight: 4 }} />
                  <Text style={styles.addMoreLinkText}>Add Another Allergy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 3. MEDICAL CONDITIONS SECTION */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.sectionHeaderRow}
              onPress={handleAddCondition}
            >
              <Text style={styles.sectionTitleWithoutCaps}>{m.medicalConditions.sectionTitle}</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.conditionsCard}>
              <View style={styles.conditionsChipsContainer}>
                {medicalConditions.map((cond) => (
                  <View key={cond.id} style={styles.conditionPill}>
                    <View style={styles.cyanDot} />
                    <Text style={styles.conditionPillText}>{cond.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 4. CURRENT MEDICATIONS SECTION */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.sectionHeaderRow}
              onPress={() => Alert.alert('Medications', 'Viewing prescribed medications')}
            >
              <Text style={styles.sectionTitleWithoutCaps}>{m.currentMedications.sectionTitle}</Text>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.medicationsCard}>
              {medications.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.medicationRow,
                    index < medications.length - 1 && styles.medicationBorderBottom,
                  ]}
                >
                  <View style={styles.pillIconCircle}>
                    <Ionicons name="medical-outline" size={20} color="#003D9B" />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{item.name}</Text>
                    <Text style={styles.medicationDosage}>{item.dosage}</Text>
                  </View>
                </View>
              ))}

              {/* ADD MEDICATION BUTTON */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addMedicationButton}
                onPress={handleAddMedication}
              >
                <Ionicons name="add-circle-outline" size={20} color="#003D9B" style={{ marginRight: 6 }} />
                <Text style={styles.addMedicationButtonText}>{m.currentMedications.addMedicationBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. INJURY HISTORY SECTION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitleWithoutCaps}>{m.injuryHistory.sectionTitle}</Text>

            <View style={styles.injuryCard}>
              {m.injuryHistory.items.map((injury, idx) => {
                const isLast = idx === m.injuryHistory.items.length - 1;
                return (
                  <View key={injury.id} style={styles.timelineItemRow}>
                    {/* TIMELINE LEFT GRAPHIC */}
                    <View style={styles.timelineColumn}>
                      <View
                        style={[
                          styles.timelineDot,
                          injury.active ? styles.timelineDotActive : styles.timelineDotInactive,
                        ]}
                      />
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>

                    {/* TIMELINE CONTENT RIGHT */}
                    <View style={styles.timelineContent}>
                      <Text style={styles.injuryTitle}>{injury.title}</Text>
                      <Text style={styles.injurySubtitle}>{injury.subtitle}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 6. EMERGENCY CONTACT CARD SECTION */}
          <View style={styles.sectionContainer}>
            <View style={styles.emergencyCard}>
              <Text style={styles.emergencyCardHeaderTitle}>{m.emergencyContact.sectionTitle}</Text>

              <View style={styles.emergencyCardMainRow}>
                {/* INITIALS AVATAR */}
                <View style={styles.avatarInitialsCircle}>
                  <Text style={styles.avatarInitialsText}>{m.emergencyContact.initials}</Text>
                </View>

                {/* CONTACT DETAILS */}
                <View style={styles.emergencyInfoColumn}>
                  <Text style={styles.emergencyName}>{m.emergencyContact.name}</Text>
                  <Text style={styles.emergencyRelationship}>{m.emergencyContact.relationship}</Text>
                </View>

                {/* CALL BUTTON */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.callCircleButton}
                  onPress={handleCallEmergencyContact}
                  accessibilityRole="button"
                  accessibilityLabel="Call emergency contact"
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* PHONE NUMBER TEXT */}
              <TouchableOpacity activeOpacity={0.7} onPress={handleCallEmergencyContact}>
                <Text style={styles.emergencyPhoneText}>{m.emergencyContact.phone}</Text>
              </TouchableOpacity>
            </View>
          </View>
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

  /* SECTION GENERIC */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTitleWithoutCaps: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  iconAddCircleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* 1. VITALS CARD */
  vitalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  vitalsColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  vitalColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
  },
  vitalLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 6,
  },
  vitalValuePrimary: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  valueWithUnitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  vitalUnitText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    marginLeft: 3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  emergencyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 2,
  },
  emergencyLinkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* 2. ALLERGIES DASHED CARD */
  allergiesDashedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    paddingVertical: 22,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusCircleIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  noAllergiesText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 6,
  },
  addAllergyBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  allergiesFilledCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  allergiesChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  allergyChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#B45309',
  },
  addMoreLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addMoreLinkText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* 3. MEDICAL CONDITIONS CARD */
  conditionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  conditionsChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  conditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  cyanDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0284C7',
    marginRight: 8,
  },
  conditionPillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#0369A1',
  },

  /* 4. CURRENT MEDICATIONS CARD */
  medicationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  medicationBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  pillIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  addMedicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#003D9B',
    backgroundColor: '#FFFFFF',
    marginTop: 14,
  },
  addMedicationButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },

  /* 5. INJURY HISTORY CARD */
  injuryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: 14,
    width: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: '#003D9B',
  },
  timelineDotInactive: {
    backgroundColor: '#CBD5E1',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  injuryTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 3,
  },
  injurySubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },

  /* 6. EMERGENCY CONTACT CARD */
  emergencyCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  emergencyCardHeaderTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  emergencyCardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitialsCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0052CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarInitialsText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  emergencyInfoColumn: {
    flex: 1,
  },
  emergencyName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  emergencyRelationship: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
  },
  callCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#003D9B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyPhoneText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});

export default MedicalInfoScreen;
