import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
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
import { BrandHeader } from '@/components';
import { PrimaryButton } from '@/components';
import { ProfileAvatarPicker } from '@/components';
import { GenderSelector, GenderOption } from '@/components';
import { MeasurementInput } from '@/components';
import { PrimaryConcernCard, ConcernItem } from '@/features/recovery';

export interface CompleteProfileScreenProps {
  onBackPress?: () => void;
  onCompleteSuccess?: (data: ProfileData) => void;
}

export interface ProfileData {
  fullName: string;
  dob: string;
  gender: GenderOption;
  height: number;
  weight: number;
  primaryConcernId: string;
  avatarUri?: string | null;
}

export const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({
  onBackPress,
  onCompleteSuccess,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderOption>('male');
  const [height, setHeight] = useState<number | null>(Spacing.heightRange.defaultVal);
  const [weight, setWeight] = useState<number | null>(Spacing.weightRange.defaultVal);
  const [selectedConcern, setSelectedConcern] = useState('back_pain');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Status & Validation State
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; dob?: string }>({});

  const isFormValid =
    fullName.trim().length > 0 &&
    height !== null &&
    height >= Spacing.heightRange.min &&
    height <= Spacing.heightRange.max &&
    weight !== null &&
    weight >= Spacing.weightRange.min &&
    weight <= Spacing.weightRange.max &&
    Boolean(selectedConcern);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/otp');
    }
  };

  const handleAvatarSelect = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option to update your photo:',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            setAvatarUri('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80');
          },
        },
        {
          text: 'Choose from Library',
          onPress: () => {
            setAvatarUri('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { fullName?: string; dob?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = Strings.profile.validationNameRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isFormValid;
  };

  const handleContinue = () => {
    if (!validateForm() || height === null || weight === null) {
      return;
    }

    setIsLoading(true);

    const profileData: ProfileData = {
      fullName: fullName.trim(),
      dob: dob.trim() || '1995-05-15',
      gender,
      height,
      weight,
      primaryConcernId: selectedConcern,
      avatarUri,
    };

    // Simulate async submission for realistic UX loading state
    setTimeout(() => {
      setIsLoading(false);
      if (onCompleteSuccess) {
        onCompleteSuccess(profileData);
      } else {
        router.push({
          pathname: '/enable-experience',
          params: { profileName: profileData.fullName },
        });
      }
    }, 800);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} translucent />

      <SafeAreaView
        style={[
          styles.topSafeArea,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 16) + 4 },
        ]}
      >
        {/* Top Header Row with Back Button & Brand Logo */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={Strings.accessibility.backButton}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.brandContainer}>
            <BrandHeader />
          </View>

          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Title & Subtitle */}
          <View style={styles.headlineSection}>
            <Text style={styles.title}>{Strings.profile.title}</Text>
            <Text style={styles.subtitle}>{Strings.profile.subtitle}</Text>
          </View>

          {/* Profile Photo Avatar Section */}
          <ProfileAvatarPicker
            imageUri={avatarUri}
            onSelectImage={handleAvatarSelect}
          />

          {/* SECTION 1: Personal Details */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>{Strings.profile.sectionPersonalDetails}</Text>

            {/* Full Name Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{Strings.profile.fullNameLabel}</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.fullName ? styles.textInputError : null,
                ]}
                placeholder={Strings.profile.fullNamePlaceholder}
                placeholderTextColor={Colors.placeholderText}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) {
                    setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                autoCapitalize="words"
                accessibilityLabel={Strings.accessibility.fullNameInput}
              />
              {errors.fullName ? (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              ) : null}
            </View>

            {/* Date of Birth & Gender Row */}
            <View style={styles.twoColumnRow}>
              {/* Date of Birth */}
              <View style={styles.columnFlex}>
                <Text style={styles.fieldLabel}>{Strings.profile.dobLabel}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={Strings.profile.dobPlaceholder}
                  placeholderTextColor={Colors.placeholderText}
                  value={dob}
                  onChangeText={setDob}
                  keyboardType="numbers-and-punctuation"
                  accessibilityLabel={Strings.accessibility.dobInput}
                />
              </View>

              {/* Gender Toggle */}
              <View style={styles.columnFlex}>
                <GenderSelector
                  selectedGender={gender}
                  onSelectGender={setGender}
                />
              </View>
            </View>
          </View>

          {/* SECTION 2: Body Measurements (Side-by-side Vertical Wheel Pickers) */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>{Strings.profile.sectionBodyMeasurements}</Text>

            <View style={styles.twoColumnRow}>
              <MeasurementInput
                label={Strings.profile.heightLabel}
                value={height}
                unit="cm"
                onChangeValue={setHeight}
                min={Spacing.heightRange.min}
                max={Spacing.heightRange.max}
              />
              <MeasurementInput
                label={Strings.profile.weightLabel}
                value={weight}
                unit="kg"
                onChangeValue={setWeight}
                min={Spacing.weightRange.min}
                max={Spacing.weightRange.max}
              />
            </View>
          </View>

          {/* SECTION 3: Primary Concern Grid */}
          <View style={styles.sectionContainer}>
            <Text style={Strings.profile.sectionPrimaryConcern ? styles.sectionHeader : styles.hidden}>
              {Strings.profile.sectionPrimaryConcern}
            </Text>

            <View style={styles.gridContainer}>
              {Strings.profile.concerns.map((concern: ConcernItem) => (
                <PrimaryConcernCard
                  key={concern.id}
                  concern={concern}
                  isSelected={selectedConcern === concern.id}
                  onSelect={(id) => setSelectedConcern(id)}
                />
              ))}
            </View>
          </View>

          {/* Primary Action Button (Disabled until form & measurements are valid) */}
          <View style={styles.actionContainer}>
            <PrimaryButton
              title={Strings.profile.continue}
              onPress={handleContinue}
              disabled={!isFormValid}
              isLoading={isLoading}
              accessibilityLabel={Strings.accessibility.continueButton}
            />
          </View>

          {/* Home Indicator Spacing Bar */}
          <View style={styles.homeIndicator} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topSafeArea: {
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 4 : 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  headlineSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    textAlign: 'center',
    letterSpacing: Typography.letterSpacing.tighter,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionContainer: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  textInput: {
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  textInputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  columnFlex: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionContainer: {
    marginTop: Spacing.sm,
  },
  homeIndicator: {
    width: Spacing.homeIndicatorWidth,
    height: Spacing.homeIndicatorHeight,
    backgroundColor: Colors.homeIndicator,
    borderRadius: 9999,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  hidden: {
    display: 'none',
  },
});

export default CompleteProfileScreen;
