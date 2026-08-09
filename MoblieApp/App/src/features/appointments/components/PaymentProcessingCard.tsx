import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';
import { PaymentProcessingData, PaymentTransactionData } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaymentProcessingCardProps {
  transactionData: PaymentTransactionData;
  onComplete: () => void;
  durationMs?: number;
}

export const PaymentProcessingCard: React.FC<PaymentProcessingCardProps> = ({
  transactionData,
  onComplete,
  durationMs = 3000,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>(
    PaymentProcessingData.loadingSteps[0].text
  );

  useEffect(() => {
    // 1. Entrance Scale Animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 2. Pulse Glow Ring Animation Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Rotating Outer Ring Loop
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 4. Progress Animation (0% to 100%)
    const listenerId = progressAnim.addListener(({ value }) => {
      const currentPct = Math.min(Math.round(value * 100), 100);
      setProgressPercent(currentPct);

      // Update loading step message based on threshold
      const matchedStep = [...PaymentProcessingData.loadingSteps]
        .reverse()
        .find((step) => currentPct >= step.threshold);
      if (matchedStep) {
        setCurrentStepText(matchedStep.text);
      }
    });

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    });

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      {/* Animated Lock & Shield Visual Icon */}
      <View style={styles.iconCircleWrapper}>
        <Animated.View
          style={[
            styles.pulseBackgroundCircle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.outerSpinRing,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View style={styles.ringDot} />
        </Animated.View>

        <View style={styles.innerIconCircle}>
          <Ionicons name="lock-closed" size={36} color={Colors.primary} />
        </View>
      </View>

      {/* Main Title & Doctor Info */}
      <View style={styles.textGroup}>
        <Text style={styles.mainTitle}>{PaymentProcessingData.mainMessage}</Text>
        <Text style={styles.subDetail}>
          Securing appointment with{' '}
          <Text style={styles.doctorHighlight}>{transactionData.doctor.name}</Text>
        </Text>
      </View>

      {/* Dynamic Progress Bar Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.stepText}>{currentStepText}</Text>
          <Text style={styles.percentText}>{progressPercent}%</Text>
        </View>

        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressBarWidth }]} />
        </View>
      </View>

      {/* Payment Summary Snapshot Card */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount to Pay</Text>
          <Text style={styles.summaryValue}>{transactionData.feeStr}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method</Text>
          <Text style={styles.summaryValue}>{transactionData.paymentMethodName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date & Time</Text>
          <Text style={styles.summaryValue}>
            {transactionData.fullDate} • {transactionData.timeSlot}
          </Text>
        </View>
      </View>

      {/* Security Note Footer */}
      <View style={styles.securityRow}>
        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
        <Text style={styles.securityText}>{PaymentProcessingData.securityNote}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    gap: Spacing.lg,
  },
  iconCircleWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  pulseBackgroundCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DBEAFE',
    opacity: 0.6,
  },
  outerSpinRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: Colors.primary,
    borderRightColor: '#60A5FA',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ringDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: -4,
  },
  innerIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  textGroup: {
    alignItems: 'center',
    gap: 6,
  },
  mainTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
    textAlign: 'center',
  },
  subDetail: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  doctorHighlight: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  progressSection: {
    width: '100%',
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
    flex: 1,
    marginRight: 8,
  },
  percentText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  progressBarTrack: {
    height: 8,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: Spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
});
