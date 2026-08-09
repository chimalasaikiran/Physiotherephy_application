import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import {
  BookingItem,
  BookingStatusConfig,
  DoctorAvatarMap,
} from '@/constants';

interface BookingCardProps {
  booking: BookingItem;
  onPress: (booking: BookingItem) => void;
  style?: ViewStyle;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  style,
}) => {
  const statusCfg = BookingStatusConfig[booking.status];
  const avatarSource = DoctorAvatarMap[booking.avatarImageName] || DoctorAvatarMap.doctor_ananya;

  const getLocationIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (booking.placeType) {
      case 'home':
        return 'home-outline';
      case 'online':
        return 'videocam-outline';
      default:
        return 'location-outline';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(booking)}
      style={[styles.card, style]}
      accessibilityRole="button"
      accessibilityLabel={`Booking with ${booking.doctorName} for ${booking.serviceTitle}`}
    >
      {/* Top Header: Date/Time + Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.dateTimeBadge}>
          <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
          <Text style={styles.dateTimeText}>{booking.fullDate}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Ionicons name="time-outline" size={14} color={Colors.primary} />
          <Text style={styles.dateTimeText}>{booking.timeSlot}</Text>
        </View>

        {/* Status Pill */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusCfg.badgeBg,
              borderColor: statusCfg.borderColor,
            },
          ]}
        >
          <Ionicons
            name={statusCfg.iconName}
            size={12}
            color={statusCfg.badgeText}
          />
          <Text style={[styles.statusText, { color: statusCfg.badgeText }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Main Doctor & Service Info Row */}
      <View style={styles.bodyRow}>
        {/* Doctor Avatar Image */}
        <View style={[styles.avatarWrapper, { backgroundColor: booking.avatarBg }]}>
          <Image
            source={avatarSource}
            style={styles.avatarImage}
            resizeMode="cover"
          />
          {booking.rating && (
            <View style={styles.ratingTag}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={styles.ratingText}>{booking.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Doctor & Service Details */}
        <View style={styles.infoContent}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {booking.doctorName}
          </Text>
          <Text style={styles.doctorSpecialty} numberOfLines={1}>
            {booking.doctorSpecialty}
          </Text>

          {/* Service Tag */}
          <View style={styles.servicePill}>
            <Ionicons name="fitness-outline" size={12} color="#0284C7" />
            <Text style={styles.serviceText} numberOfLines={1}>
              {booking.serviceTitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Row: Location & View Details Action */}
      <View style={styles.bottomRow}>
        <View style={styles.locationContainer}>
          <Ionicons name={getLocationIcon()} size={14} color={Colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {booking.location}
          </Text>
        </View>

        <View style={styles.actionBtnRow}>
          <Text style={styles.viewDetailsLabel}>Details</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.md + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  dateTimeText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkBlue,
  },
  dotSeparator: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  ratingTag: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: Colors.white,
    borderRadius: 9999,
    paddingHorizontal: 5,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  infoContent: {
    flex: 1,
    gap: 3,
  },
  doctorName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  servicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    marginTop: 4,
  },
  serviceText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: '#0284C7',
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 5,
    marginRight: 8,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDetailsLabel: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});

export default BookingCard;
