import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';

export interface ConcernItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface PrimaryConcernCardProps {
  concern: ConcernItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const PrimaryConcernCard: React.FC<PrimaryConcernCardProps> = ({
  concern,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
      onPress={() => onSelect(concern.id)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {/* Icon Circle */}
      <View
        style={[
          styles.iconContainer,
          isSelected ? styles.iconContainerSelected : styles.iconContainerUnselected,
        ]}
      >
        <Ionicons
          name={concern.icon}
          size={22}
          color={isSelected ? Colors.primary : Colors.textSecondary}
        />
      </View>

      {/* Card Header & Subtitle */}
      <Text
        style={[
          styles.title,
          isSelected ? styles.titleSelected : styles.titleUnselected,
        ]}
      >
        {concern.title}
      </Text>

      <Text style={styles.subtitle}>{concern.subtitle}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
  },
  cardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#003D9B',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardUnselected: {
    backgroundColor: Colors.white,
    borderColor: '#F1F5F9',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainerSelected: {
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainerUnselected: {
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleSelected: {
    color: '#051A3E',
  },
  titleUnselected: {
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
