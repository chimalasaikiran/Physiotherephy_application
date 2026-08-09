import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Text,
  Keyboard,
  Platform,
} from 'react-native';
import { Colors } from '@/constants';
import { Typography } from '@/constants';

export interface OtpInputGridProps {
  otp: string[];
  onChangeOtp: (otp: string[]) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
}

export const OtpInputGrid: React.FC<OtpInputGridProps> = ({
  otp,
  onChangeOtp,
  length = 6,
  error = false,
  autoFocus = true,
}) => {
  const hiddenInputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const rawValue = otp.join('');

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleChangeText = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, length);
    const newOtp = Array.from({ length }, (_, i) => digits[i] || '');
    onChangeOtp(newOtp);

    // Dismiss keyboard when full code entered
    if (digits.length === length) {
      Keyboard.dismiss();
    }
  };

  const handlePressContainer = () => {
    hiddenInputRef.current?.focus();
  };

  // Determine active box index
  const activeIndex = Math.min(rawValue.length, length - 1);

  return (
    <Pressable style={styles.container} onPress={handlePressContainer}>
      {/* Hidden single TextInput that captures all numeric keypad input & paste */}
      <TextInput
        ref={hiddenInputRef}
        value={rawValue}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        caretHidden
        style={styles.hiddenTextInput}
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        textContentType="oneTimeCode"
        accessibilityLabel="6-digit verification code input"
      />

      {/* Visual OTP 6-box grid */}
      <View style={styles.boxesRow}>
        {Array.from({ length }).map((_, index) => {
          const digit = otp[index] || '';
          const isActiveBox = isFocused && index === activeIndex;

          return (
            <View
              key={index}
              style={[
                styles.inputBox,
                isActiveBox && styles.inputBoxActive,
                error && styles.inputBoxError,
              ]}
            >
              <Text style={styles.inputText}>{digit}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
    position: 'relative',
  },
  hiddenTextInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.01,
    zIndex: 10,
    fontSize: 1, // Minimize visual artifacts on web/older platforms
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  inputBox: {
    width: 48,
    height: 56,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.otpInputBorderDefault,
    backgroundColor: Colors.otpInputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBoxActive: {
    borderColor: Colors.otpInputBorderActive,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  inputBoxError: {
    borderColor: '#EF4444',
  },
  inputText: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
