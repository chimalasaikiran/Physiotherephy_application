import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

export type GenderOption = 'male' | 'female';

interface GenderSelectorProps {
  selectedGender: GenderOption;
  onSelectGender: (gender: GenderOption) => void;
  label?: string;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  selectedGender,
  onSelectGender,
  label = Strings.profile.genderLabel,
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.pillsContainer}>
        {/* Male Pill */}
        <TouchableOpacity
          style={[
            styles.pill,
            selectedGender === 'male' ? styles.pillSelected : styles.pillUnselected,
          ]}
          onPress={() => onSelectGender('male')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={Strings.accessibility.genderMaleButton}
        >
          <Text
            style={[
              styles.pillText,
              selectedGender === 'male' ? styles.pillTextSelected : styles.pillTextUnselected,
            ]}
          >
            {Strings.profile.genderMale}
          </Text>
        </TouchableOpacity>

        {/* Female Pill */}
        <TouchableOpacity
          style={[
            styles.pill,
            selectedGender === 'female' ? styles.pillSelected : styles.pillUnselected,
          ]}
          onPress={() => onSelectGender('female')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={Strings.accessibility.genderFemaleButton}
        >
          <Text
            style={[
              styles.pillText,
              selectedGender === 'female' ? styles.pillTextSelected : styles.pillTextUnselected,
            ]}
          >
            {Strings.profile.genderFemale}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  pillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: Colors.genderSelectedBg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  pillUnselected: {
    backgroundColor: Colors.genderUnselectedBg,
  },
  pillText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  pillTextSelected: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  pillTextUnselected: {
    color: Colors.genderUnselectedText,
  },
});
