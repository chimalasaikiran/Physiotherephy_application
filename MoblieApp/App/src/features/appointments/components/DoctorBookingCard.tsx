import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  degree: string;
  institution: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  experienceStr: string;
  clinicName: string;
  clinicAddress: string;
  distance: string;
  fee: string;
  numericFee: number;
  availableToday: boolean;
  isTopRated: boolean;
  isNearby: boolean;
  supportsOnline: boolean;
  languages: readonly string[] | string[];
  imageName: string;
  avatarBg: string;
  bio: string;
}

export interface DoctorBookingCardProps {
  doctor: Doctor;
  onBookPress: (doctor: Doctor) => void;
  onCardPress?: (doctor: Doctor) => void;
  buttonLabel?: string;
}

export const DoctorBookingCard: React.FC<DoctorBookingCardProps> = ({
  doctor,
  onBookPress,
  onCardPress,
  buttonLabel = 'View Details',
}) => {
  const getImageSource = (name: string) => {
    switch (name) {
      case 'doctor_ananya':
        return require('../../../assets/images/doctor_ananya.png');
      case 'care_team_doctor':
        return require('../../../assets/images/care_team_doctor.png');
      case 'doctor_arjun':
      default:
        return require('../../../assets/images/doctor_arjun.png');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onCardPress && onCardPress(doctor)}
      style={styles.card}
    >
      {/* Top Main Section */}
      <View style={styles.topRow}>
        <View style={[styles.avatarContainer, { backgroundColor: doctor.avatarBg }]}>
          <Image
            source={getImageSource(doctor.imageName)}
            style={styles.avatarImage}
            resizeMode="cover"
          />
          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingText}>{doctor.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameHeaderRow}>
            <Text style={styles.doctorName} numberOfLines={1}>
              {doctor.name}
            </Text>
            {doctor.availableToday && (
              <View style={styles.availableTodayPill}>
                <View style={styles.greenDot} />
                <Text style={styles.availableTodayText}>TODAY</Text>
              </View>
            )}
          </View>

          <Text style={styles.specialtyText} numberOfLines={1}>
            {doctor.specialty}
          </Text>

          <Text style={styles.degreeText} numberOfLines={1}>
            {doctor.degree}
          </Text>

          {/* Key Badges Row */}
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Ionicons name="briefcase-outline" size={12} color={Colors.primary} />
              <Text style={styles.badgeText}>{doctor.experienceStr}</Text>
            </View>
            <View style={styles.badgePill}>
              <Ionicons name="chatbubble-ellipses-outline" size={12} color="#0284C7" />
              <Text style={styles.badgeText}>{doctor.reviewsCount} Reviews</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Clinic & Distance Row */}
      <View style={styles.clinicRow}>
        <Ionicons name="location-outline" size={14} color="#64748B" style={styles.locIcon} />
        <Text style={styles.clinicText} numberOfLines={1}>
          {doctor.clinicName} <Text style={styles.bulletDot}>•</Text> {doctor.distance}
        </Text>
      </View>

      {/* Languages Pills */}
      <View style={styles.languagesRow}>
        {doctor.languages.map((lang, idx) => (
          <View key={idx} style={styles.langPill}>
            <Text style={styles.langText}>{lang}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Bottom Fee & Book CTA Row */}
      <View style={styles.bottomRow}>
        <View style={styles.feeContainer}>
          <Text style={styles.feeLabel}>Consultation Fee</Text>
          <Text style={styles.feeValue}>{doctor.fee}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.bookButton}
          onPress={() => onBookPress(doctor)}
        >
          <Text style={styles.bookButtonText}>{buttonLabel}</Text>
          <Ionicons name="arrow-forward" size={15} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    gap: 14,
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    position: 'relative',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: Colors.white,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#0F172A',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  doctorName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    flex: 1,
  },
  availableTodayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  availableTodayText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#15803D',
  },
  specialtyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
    marginTop: 2,
  },
  degreeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  clinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  locIcon: {
    marginRight: 6,
  },
  clinicText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  bulletDot: {
    color: Colors.textMuted,
  },
  languagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  langPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.medium,
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeContainer: {
    justifyContent: 'center',
  },
  feeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.regular,
  },
  feeValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  bookButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
});
