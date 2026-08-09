import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

interface StatsOverviewProps {
  onBannerPress?: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ onBannerPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{Strings.explore.sections.stats}</Text>

      {/* TWO STAT CARDS ROW */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconBadge}>
            <Ionicons name="flame" size={20} color="#FF6B00" />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statTitle}>{Strings.explore.stats.streakTitle}</Text>
            <Text style={styles.statValue}>{Strings.explore.stats.streakValue}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBadge, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-done" size={20} color="#166534" />
          </View>
          <View style={styles.statTextGroup}>
            <Text style={styles.statTitle}>{Strings.explore.stats.completedTitle}</Text>
            <Text style={styles.statValue}>{Strings.explore.stats.completedValue}</Text>
          </View>
        </View>
      </View>

      {/* UPCOMING SESSION BANNER */}
      <TouchableOpacity
        onPress={onBannerPress}
        activeOpacity={0.85}
        style={styles.banner}
        accessibilityRole="button"
        accessibilityLabel={Strings.explore.stats.nextAppointmentTitle}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerIconBox}>
            <Ionicons name="calendar-outline" size={22} color={Colors.statsAccent} />
          </View>
          <View style={styles.bannerTextGroup}>
            <Text style={styles.bannerTitle}>
              {Strings.explore.stats.nextAppointmentTitle}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {Strings.explore.stats.nextAppointmentTime}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.statsAccent} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextGroup: {
    flex: 1,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginTop: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.statsCardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.statsCardBorder,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  bannerSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.statsAccent,
    marginTop: 2,
  },
});

export default StatsOverview;
