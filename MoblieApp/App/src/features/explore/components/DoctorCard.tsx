import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

export interface DoctorItem {
  id: string;
  name: string;
  title: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  experience: string;
  availability: string;
  avatarBg: string;
}

interface DoctorCardProps {
  doctor: DoctorItem;
  onBookPress?: (doctor: DoctorItem) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookPress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View style={[styles.avatar, { backgroundColor: doctor.avatarBg }]}>
          <Ionicons name="person" size={28} color={Colors.primary} />
        </View>
      </View>

      <View style={styles.middleCol}>
        <Text style={styles.name} numberOfLines={1}>
          {doctor.name}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {doctor.title}
        </Text>

        <View style={styles.specialtyTag}>
          <Text style={styles.specialtyText} numberOfLines={1}>
            {doctor.specialty}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={Colors.starRating} />
          <Text style={styles.ratingValue}>{doctor.rating.toFixed(1)}</Text>
          <Text style={styles.reviewsCount}>({doctor.reviewsCount} reviews)</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.experienceText}>{doctor.experience}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <TouchableOpacity
          onPress={() => onBookPress && onBookPress(doctor)}
          activeOpacity={0.8}
          style={styles.bookButton}
          accessibilityRole="button"
          accessibilityLabel={`Book appointment with ${doctor.name}`}
        >
          <Text style={styles.bookButtonText}>{Strings.explore.actions.bookAppointment}</Text>
        </TouchableOpacity>
        <Text style={styles.availabilityText}>{doctor.availability}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  leftCol: {
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  middleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  title: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  specialtyTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.enablePillBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.enablePillText,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginLeft: 3,
  },
  reviewsCount: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 3,
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: Colors.textMuted,
    fontSize: 10,
  },
  experienceText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.enabledPillText,
    marginTop: 6,
  },
});

export default DoctorCard;
