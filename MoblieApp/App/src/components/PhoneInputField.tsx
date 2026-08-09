import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Country } from '@/constants';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { Strings } from '@/constants';

interface PhoneInputFieldProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  value: string;
  onChangeText: (text: string) => void;
  selectedCountry: Country;
  onOpenCountryPicker: () => void;
  error?: string;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChangeText,
  selectedCountry,
  onOpenCountryPicker,
  error,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Filter numeric inputs for clean phone formatting
  const handleTextChange = (inputText: string) => {
    const numericOnly = inputText.replace(/[^0-9\s-]/g, '');
    onChangeText(numericOnly);
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          !!error && styles.containerError,
        ]}
      >
        {/* Country Code Picker Button Trigger */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={onOpenCountryPicker}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${Strings.accessibility.countrySelector}, current selection ${selectedCountry.name} ${selectedCountry.dialCode}`}
        >
          <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color={Colors.textSecondary}
            style={styles.chevronIcon}
          />
          {/* Vertical Separator line */}
          <View style={styles.verticalDivider} />
        </TouchableOpacity>

        {/* Mobile Number Input */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder={Strings.login.placeholder}
          placeholderTextColor={Colors.placeholderText}
          keyboardType="phone-pad"
          maxLength={15}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={Strings.accessibility.phoneInput}
          {...textInputProps}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Spacing.buttonHeight, // 56px
    backgroundColor: Colors.inputBackground, // #F8FAFC
    borderRadius: Spacing.buttonRadius, // 24px
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
  },
  containerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  containerError: {
    borderColor: '#EF4444',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    height: '100%',
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  dialCode: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    marginRight: 4,
  },
  chevronIcon: {
    marginRight: Spacing.sm,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.divider,
    marginLeft: Spacing.xs,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.xs,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: Spacing.md,
  },
});
