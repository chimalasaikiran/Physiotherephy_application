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
  Image,
  Share,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';
import { BottomNavBar, TabKey } from '@/components';

export const EditProfileScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State with explicit string types
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>(Strings.editProfileDetails.personalInfo.fullNameValue);
  const [email, setEmail] = useState<string>(Strings.editProfileDetails.personalInfo.emailValue);
  const [mobileNumber, setMobileNumber] = useState<string>(Strings.editProfileDetails.personalInfo.mobileValue);
  const [dob, setDob] = useState<string>(Strings.editProfileDetails.personalInfo.dobValue);
  const [gender, setGender] = useState<string>(Strings.editProfileDetails.personalInfo.genderValue);

  const [height, setHeight] = useState<string>(Strings.editProfileDetails.bodyInfo.heightValue);
  const [weight, setWeight] = useState<string>(Strings.editProfileDetails.bodyInfo.weightValue);
  const [bloodGroup, setBloodGroup] = useState<string>(Strings.editProfileDetails.bodyInfo.bloodGroupValue);

  const [contactName, setContactName] = useState<string>(Strings.editProfileDetails.emergencyContact.nameValue);
  const [relationship, setRelationship] = useState<string>(Strings.editProfileDetails.emergencyContact.relationshipValue);
  const [emergencyPhone, setEmergencyPhone] = useState<string>(Strings.editProfileDetails.emergencyContact.phoneValue);

  const e = Strings.editProfileDetails;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Profile Details for ${fullName} on ONE MEDICAL`,
      });
    } catch (error) {
      console.log('Error sharing profile details:', error);
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

  const handleChangePhoto = () => {
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

  const handleChangeMobile = () => {
    router.push('/change-mobile-number' as any);
  };


  const handleSelectGender = () => {
    Alert.alert(
      'Select Gender',
      'Choose your gender:',
      [
        { text: 'Female', onPress: () => setGender('Female') },
        { text: 'Male', onPress: () => setGender('Male') },
        { text: 'Other', onPress: () => setGender('Other') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSelectBloodGroup = () => {
    Alert.alert(
      'Select Blood Group',
      'Choose your blood group:',
      [
        { text: 'O negative (O-)', onPress: () => setBloodGroup('O negative (O-)') },
        { text: 'O positive (O+)', onPress: () => setBloodGroup('O positive (O+)') },
        { text: 'A positive (A+)', onPress: () => setBloodGroup('A positive (A+)') },
        { text: 'A negative (A-)', onPress: () => setBloodGroup('A negative (A-)') },
        { text: 'B positive (B+)', onPress: () => setBloodGroup('B positive (B+)') },
        { text: 'B negative (B-)', onPress: () => setBloodGroup('B negative (B-)') },
        { text: 'AB positive (AB+)', onPress: () => setBloodGroup('AB positive (AB+)') },
        { text: 'AB negative (AB-)', onPress: () => setBloodGroup('AB negative (AB-)') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete My Health Profile',
      'Are you sure you want to delete your health profile? This action will erase all stored health records and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Health Profile Deleted', 'Your health profile has been permanently deleted.', [
              {
                text: 'OK',
                onPress: () => router.replace('/login' as any),
              },
            ]);
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

          <Text style={styles.headerTitle}>{e.headerTitle}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerIconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share profile"
          >
            <Ionicons name="share-outline" size={22} color="#003D9B" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 120 + Math.max(insets.bottom, 12) },
            ]}
          >
            {/* 1. PHOTO AVATAR CARD */}
            <View style={styles.avatarCardContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    avatarUri
                      ? { uri: avatarUri }
                      : require('../../../assets/images/sanya_avatar.png')
                  }
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.cameraBadgeButton}
                  onPress={handleChangePhoto}
                >
                  <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity activeOpacity={0.7} onPress={handleChangePhoto}>
                <Text style={styles.changePhotoText}>{e.changePhoto}</Text>
              </TouchableOpacity>
            </View>

            {/* 2. PERSONAL INFORMATION SECTION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{e.sections.personalInfo}</Text>

              <View style={styles.cardContainer}>
                {/* Full Name */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{e.personalInfo.fullNameLabel}</Text>
                  <TextInput
                    style={styles.fieldValueInput}
                    value={fullName}
                    onChangeText={(text: string) => setFullName(text)}
                    placeholder="Enter full name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.divider} />

                {/* Email Address */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{e.personalInfo.emailLabel}</Text>
                  <TextInput
                    style={styles.fieldValueInput}
                    value={email}
                    onChangeText={(text: string) => setEmail(text)}
                    placeholder="Enter email address"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.divider} />

                {/* Mobile Number */}
                <View style={styles.fieldRowWithAction}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{e.personalInfo.mobileLabel}</Text>
                    <TextInput
                      style={styles.fieldValueInput}
                      value={mobileNumber}
                      onChangeText={(text: string) => setMobileNumber(text)}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleChangeMobile}
                    style={styles.actionTextButton}
                  >
                    <Text style={styles.actionText}>{e.personalInfo.changeMobileBtn}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Date of Birth */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{e.personalInfo.dobLabel}</Text>
                  <TextInput
                    style={styles.fieldValueInput}
                    value={dob}
                    onChangeText={(text: string) => setDob(text)}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.divider} />

                {/* Gender Dropdown */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.fieldDropdownRow}
                  onPress={handleSelectGender}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{e.personalInfo.genderLabel}</Text>
                    <Text style={styles.fieldValueText}>{gender}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. BODY INFORMATION SECTION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{e.sections.bodyInfo}</Text>

              <View style={styles.cardContainer}>
                {/* Side-by-side Height & Weight */}
                <View style={styles.twoColumnRow}>
                  <View style={styles.columnItem}>
                    <Text style={styles.fieldLabel}>{e.bodyInfo.heightLabel}</Text>
                    <TextInput
                      style={styles.fieldValueInput}
                      value={height}
                      onChangeText={(text: string) => setHeight(text)}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.columnDivider} />

                  <View style={styles.columnItem}>
                    <Text style={styles.fieldLabel}>{e.bodyInfo.weightLabel}</Text>
                    <TextInput
                      style={styles.fieldValueInput}
                      value={weight}
                      onChangeText={(text: string) => setWeight(text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Blood Group Dropdown */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.fieldDropdownRow}
                  onPress={handleSelectBloodGroup}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>{e.bodyInfo.bloodGroupLabel}</Text>
                    <Text style={styles.fieldValueText}>{bloodGroup}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. EMERGENCY CONTACT SECTION */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{e.sections.emergencyContact}</Text>

              <View style={styles.cardContainer}>
                {/* Contact Name */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{e.emergencyContact.nameLabel}</Text>
                  <TextInput
                    style={styles.fieldValueInput}
                    value={contactName}
                    onChangeText={(text: string) => setContactName(text)}
                    placeholder="Enter contact name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.divider} />

                {/* Relationship */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{e.emergencyContact.relationshipLabel}</Text>
                  <TextInput
                    style={styles.fieldValueInput}
                    value={relationship}
                    onChangeText={(text: string) => setRelationship(text)}
                    placeholder="e.g. Father, Spouse"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.divider} />

                {/* Phone Number */}
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{e.emergencyContact.phoneLabel}</Text>
                  <TextInput
                    style={styles.fieldValueInput}
                    value={emergencyPhone}
                    onChangeText={(text: string) => setEmergencyPhone(text)}
                    placeholder="Enter phone number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* DELETE MY HEALTH PROFILE BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.deleteButton}
              onPress={handleDeleteProfile}
            >
              <Text style={styles.deleteButtonText}>{e.deleteProfileBtn}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

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
    backgroundColor: '#FAFCFF',
  },
  keyboardAvoidingView: {
    flex: 1,
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

  /* AVATAR PHOTO CARD */
  avatarCardContainer: {
    backgroundColor: '#FAFCFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  cameraBadgeButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#003D9B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
    marginTop: 2,
  },

  /* SECTIONS */
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  /* FIELD ROWS */
  fieldRow: {
    paddingVertical: 14,
  },
  fieldRowWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  fieldDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginBottom: 4,
  },
  fieldValueInput: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#051A3E',
    padding: 0,
  },
  fieldValueText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#051A3E',
  },
  actionTextButton: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#003D9B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  /* TWO COLUMN ROW (HEIGHT / WEIGHT) */
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  columnItem: {
    flex: 1,
  },
  columnDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F1F5F9',
    marginHorizontal: Spacing.md,
  },

  /* DELETE BUTTON */
  deleteButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#B91C1C',
  },
});

export default EditProfileScreen;
