import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

export interface ProgramItem {
  id: string;
  category: string;
  title: string;
  instructor: string;
  duration: string;
  exercisesCount: number;
  level: string;
  progress: number; // 0.0 to 1.0
  icon: keyof typeof Ionicons.glyphMap;
  badgeColor: string;
  accentColor: string;
}

interface ProgramCardProps {
  program: ProgramItem;
  onPress?: (program: ProgramItem) => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onPress }) => {
  const percentage = Math.round(program.progress * 100);

  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(program)}
      activeOpacity={0.85}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${program.title}, ${program.duration}, ${percentage}% progress`}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: program.badgeColor }]}>
          <Ionicons name={program.icon} size={22} color={program.accentColor} />
        </View>
        <View style={styles.tagGroup}>
          <View style={styles.levelTag}>
            <Text style={styles.levelText}>{program.level}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {program.title}
      </Text>
      <Text style={styles.instructor} numberOfLines={1}>
        {program.instructor}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{program.duration}</Text>
        </View>
        <Text style={styles.dotSeparator}>•</Text>
        <View style={styles.metaItem}>
          <Ionicons name="fitness-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{program.exercisesCount} Exercises</Text>
        </View>
      </View>

      {/* PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{percentage}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: program.accentColor },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.md,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelTag: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  levelText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    marginTop: 4,
  },
  instructor: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: Colors.textMuted,
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.inputBackground,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ProgramCard;
