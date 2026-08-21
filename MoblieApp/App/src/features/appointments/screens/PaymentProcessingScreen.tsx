import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { DefaultBookingFallback, PaymentTransactionData } from '@/constants';
import { PaymentProcessingCard } from '@/features/appointments';
import { createAppointmentViaBackend } from '@/api/appointmentApi';
import { mobileRealtimeSync } from '@/api/syncApi';
import { auth } from '@/config/firebase';


export const PaymentProcessingScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId?: string;
    doctorId?: string;
    doctorName?: string;
    doctorSpecialty?: string;
    clinicName?: string;
    clinicAddress?: string;
    serviceTitle?: string;
    placeTitle?: string;
    placeAddress?: string;
    dateStr?: string;
    fullDate?: string;
    timeSlot?: string;
    feeStr?: string;
    numericFee?: string;
    paymentMode?: 'online' | 'clinic';
    paymentMethodId?: string;
    paymentMethodName?: string;
  }>();

  // Prevent android back button during payment processing to prevent duplicate payment
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // Disable back action completely
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Dynamically resolve transaction details from route params or fallback data
  const transactionData = useMemo<PaymentTransactionData>(() => {
    if (params.doctorName) {
      return {
        bookingId: params.bookingId || `OPT-${Math.floor(100000 + Math.random() * 900000)}`,
        doctor: {
          ...DefaultBookingFallback.doctor,
          id: params.doctorId || DefaultBookingFallback.doctor.id,
          name: params.doctorName,
          specialty: params.doctorSpecialty || DefaultBookingFallback.doctor.specialty,
          clinicName: params.clinicName || DefaultBookingFallback.doctor.clinicName,
          clinicAddress: params.clinicAddress || DefaultBookingFallback.doctor.clinicAddress,
        },
        serviceTitle: params.serviceTitle || DefaultBookingFallback.serviceTitle,
        placeTitle: params.placeTitle || DefaultBookingFallback.placeTitle,
        placeAddress: params.placeAddress || DefaultBookingFallback.placeAddress,
        placeId: 'clinic',
        dateStr: params.dateStr || DefaultBookingFallback.dateStr,
        fullDate: params.fullDate || DefaultBookingFallback.fullDate,
        timeSlot: params.timeSlot || DefaultBookingFallback.timeSlot,
        feeStr: params.feeStr || DefaultBookingFallback.feeStr,
        numericFee: params.numericFee ? Number(params.numericFee) : DefaultBookingFallback.numericFee,
        paymentMode: params.paymentMode || 'online',
        paymentMethodId: params.paymentMethodId || 'upi',
        paymentMethodName: params.paymentMethodName || 'UPI (GPay / PhonePe / Paytm)',
        transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    }
    return DefaultBookingFallback;
  }, [params]);

  const handleProcessingComplete = async () => {
    const currentUid = auth.currentUser?.uid || 'user_demo_123';
    const currentUserName = auth.currentUser?.displayName || 'Patient';
    const isOnline = transactionData.paymentMode === 'online';
    const paymentStatus = isOnline ? 'Paid' : 'Pending';

    try {
      const createdId = await createAppointmentViaBackend({
        id: transactionData.bookingId,
        doctorId: transactionData.doctor.id,
        doctorName: transactionData.doctor.name,
        doctorSpecialty: transactionData.doctor.specialty,
        clinicName: transactionData.doctor.clinicName,
        clinicAddress: transactionData.doctor.clinicAddress,
        serviceTitle: transactionData.serviceTitle,
        placeId: transactionData.placeId,
        placeTitle: transactionData.placeTitle,
        fullDate: transactionData.fullDate,
        timeSlot: transactionData.timeSlot,
        feeStr: transactionData.feeStr,
        numericFee: transactionData.numericFee,
        paymentMode: transactionData.paymentMode as any,
        paymentMethodName: transactionData.paymentMethodName,
        userId: currentUid,
        userName: currentUserName,
      });

      await mobileRealtimeSync.processPayment({
        id: transactionData.transactionId,
        bookingId: createdId || transactionData.bookingId,
        userId: currentUid,
        patientName: currentUserName,
        doctorId: transactionData.doctor.id,
        therapistId: transactionData.doctor.id,
        doctor: transactionData.doctor.name,
        title: transactionData.serviceTitle,
        amount: transactionData.numericFee || 800,
        invoiceNumber: `INV-${transactionData.transactionId.slice(-6)}`,
        status: paymentStatus,
        paymentMethod: transactionData.paymentMethodName,
      });

      // Navigate automatically to Appointment Confirmed Screen
      router.replace({
        pathname: '/appointment-confirmed' as any,
        params: {
          bookingId: createdId || transactionData.bookingId,
          doctorId: transactionData.doctor.id,
          doctorName: transactionData.doctor.name,
          doctorSpecialty: transactionData.doctor.specialty,
          clinicName: transactionData.doctor.clinicName,
          clinicAddress: transactionData.doctor.clinicAddress,
          serviceTitle: transactionData.serviceTitle,
          placeTitle: transactionData.placeTitle,
          placeAddress: transactionData.placeAddress,
          fullDate: transactionData.fullDate,
          timeSlot: transactionData.timeSlot,
          feeStr: transactionData.feeStr,
          paymentMode: transactionData.paymentMode,
          paymentMethodName: transactionData.paymentMethodName,
          transactionId: transactionData.transactionId,
        },
      });
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      if (error?.message === 'SLOT_ALREADY_BOOKED') {
        Alert.alert(
          'Slot Unavailable',
          'This time slot has already been booked by another user. Please select another slot.',
          [
            {
              text: 'Select Another Slot',
              onPress: () =>
                router.replace({
                  pathname: '/select-date-time' as any,
                  params: {
                    doctorId: transactionData.doctor.id,
                    doctorName: transactionData.doctor.name,
                    doctorSpecialty: transactionData.doctor.specialty,
                    doctorClinic: transactionData.doctor.clinicName,
                    serviceTitle: transactionData.serviceTitle,
                  },
                }),
            },
          ]
        );
      } else {
        // Fallback navigation if offline or error
        router.replace({
          pathname: '/appointment-confirmed' as any,
          params: {
            bookingId: transactionData.bookingId,
            doctorId: transactionData.doctor.id,
            doctorName: transactionData.doctor.name,
            doctorSpecialty: transactionData.doctor.specialty,
            clinicName: transactionData.doctor.clinicName,
            clinicAddress: transactionData.doctor.clinicAddress,
            serviceTitle: transactionData.serviceTitle,
            placeTitle: transactionData.placeTitle,
            placeAddress: transactionData.placeAddress,
            fullDate: transactionData.fullDate,
            timeSlot: transactionData.timeSlot,
            feeStr: transactionData.feeStr,
            paymentMode: transactionData.paymentMode,
            paymentMethodName: transactionData.paymentMethodName,
            transactionId: transactionData.transactionId,
          },
        });
      }
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent />

      {/* Full screen container blocking all touches during loading */}
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
        pointerEvents="none"
      >
        <PaymentProcessingCard
          transactionData={transactionData}
          onComplete={handleProcessingComplete}
          durationMs={2800}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
});

export default PaymentProcessingScreen;
