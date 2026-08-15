import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Patient, PatientStatsSummary } from './types';
import {
  subscribeToPatients,
  fetchPatientsFromApi,
  seedDemoPatients,
  createPatientRecord,
  updatePatientRecord,
  deletePatientRecord,
} from '@/services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Manual refresh trigger
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPatientsFromApi();
      setPatients(data);
    } catch (err: any) {
      console.error('Refresh patients error:', err);
      setError(err.message || 'Failed to refresh patients data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial API fetch + Subscribe to real-time updates from Firestore
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // 1. Immediate fetch from Backend Microservice API
    fetchPatientsFromApi()
      .then((apiData) => {
        if (apiData && apiData.length > 0) {
          setPatients(apiData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Initial API fetch failed, relying on real-time listener:', err);
      });

    // 2. Real-time subscription to Firestore
    const unsubscribe = subscribeToPatients(
      (data) => {
        setPatients((prev) => {
          if (!data || data.length === 0) return prev.length > 0 ? prev : data;
          return data;
        });
        setIsLoading(false);
        setIsRealtimeActive(true);
        setError(null);
      },
      (err) => {
        console.error('Real-time sync error:', err);
        setIsRealtimeActive(false);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);


  // Trigger seed demo data if collection is empty
  const triggerSeed = useCallback(async () => {
    setIsSeeding(true);
    setError(null);
    try {
      const success = await seedDemoPatients();
      if (!success) {
        setError('Failed to seed sample patient data.');
      }
    } catch (err: any) {
      setError(err.message || 'Error seeding patient records.');
    } finally {
      setIsSeeding(false);
    }
  }, []);

  // CRUD Helpers
  const addPatient = useCallback(async (newPatientData: Partial<Patient>) => {
    setIsLoading(true);
    try {
      await createPatientRecord(newPatientData);
    } catch (err: any) {
      setError(err.message || 'Failed to create patient record.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id: string, updateData: Partial<Patient>) => {
    try {
      await updatePatientRecord(id, updateData);
    } catch (err: any) {
      setError(err.message || 'Failed to update patient record.');
    }
  }, []);

  const deletePatient = useCallback(async (id: string) => {
    try {
      await deletePatientRecord(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete patient record.');
    }
  }, []);

  // Compute live statistics summary derived from real Firestore data
  const stats: PatientStatsSummary = useMemo(() => {
    const totalPatients = patients.length;
    const activePatients = patients.filter(
      (p) => p.status === 'Active Treatment' || p.status === 'active'
    ).length;

    let upcomingAppointments = 0;
    let completedAppointments = 0;
    let pendingPayments = 0;
    let monthlyRevenue = 0;

    patients.forEach((p) => {
      // Upcoming appointments count
      if (Array.isArray(p.upcomingAppointments)) {
        upcomingAppointments += p.upcomingAppointments.length;
      }
      // Completed appointments count
      if (Array.isArray(p.pastAppointments)) {
        completedAppointments += p.pastAppointments.filter(
          (apt) => apt.status === 'completed'
        ).length;
      }

      // Payment counts
      if (Array.isArray(p.payments)) {
        p.payments.forEach((pay) => {
          if (pay.status === 'pending' || pay.status === 'overdue') {
            pendingPayments += Number(pay.amount) || 0;
          } else if (pay.status === 'paid') {
            monthlyRevenue += Number(pay.amount) || 0;
          }
        });
      }
    });

    return {
      totalPatients,
      activePatients,
      upcomingAppointments,
      completedAppointments,
      pendingPayments,
      monthlyRevenue,
    };
  }, [patients]);

  return {
    patients,
    stats,
    isLoading,
    error,
    isRealtimeActive,
    isSeeding,
    refresh,
    triggerSeed,
    addPatient,
    updatePatient,
    deletePatient,
  };
}
