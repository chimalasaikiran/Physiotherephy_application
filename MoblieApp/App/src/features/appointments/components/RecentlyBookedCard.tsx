import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';

import { TherapistAvatar } from '@/components';

export interface RecentlyBookedDoctor {
  id: string;
  doctorName: string;
  specialty: string;
  timeAgo: string;
  imageName?: string;
  avatarUrl?: string;
}

export interface RecentlyBookedCardProps {
  doctor: RecentlyBookedDoctor;
  onPress: (doctor: RecentlyBookedDoctor) => void;
  onRebookPress?: (doctor: RecentlyBookedDoctor) => void;
}

export const RecentlyBookedCard: React.FC<RecentlyBookedCardProps> = ({
  doctor,
  onPress,
  onRebookPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardContainer}
      onPress={() => onPress(doctor)}
      accessibilityRole="button"
      accessibilityLabel={`Rebook ${doctor.doctorName}`}
    >
      <View style={styles.avatarWrapper}>
        <TherapistAvatar
          name={doctor.doctorName}
          avatarUrl={doctor.avatarUrl}
          imageName={doctor.imageName}
          size={48}
        />
      </View>

      <View style={styles.infoWrapper}>
        <Text style={styles.doctorName} numberOfLines={1}>
          {doctor.doctorName}
        </Text>
        <Text style={styles.specialtyText} numberOfLines={1}>
          {doctor.specialty}
        </Text>
        <Text style={styles.timeAgoText}>{doctor.timeAgo}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.replayButton}
        onPress={() => (onRebookPress ? onRebookPress(doctor) : onPress(doctor))}
      >
        <Ionicons name="refresh" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 230,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E0E7FF',
    marginRight: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  doctorName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
  },
  specialtyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: '#64748B',
    marginTop: 1,
  },
  timeAgoText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#94A3B8',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  replayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default RecentlyBookedCard;
