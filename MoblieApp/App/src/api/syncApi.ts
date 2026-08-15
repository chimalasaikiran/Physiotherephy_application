import { processPaymentViaBackend } from './paymentApi';
import { db, auth } from '@/config/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, increment, serverTimestamp, getDocs, query, where, addDoc } from 'firebase/firestore';

export class MobileRealtimeSync {
  async processPayment(transaction: {
    id?: string;
    bookingId?: string;
    userId?: string;
    patientName?: string;
    doctorId?: string;
    therapistId?: string;
    doctor?: string;
    title?: string;
    amount: number;
    invoiceNumber?: string;
    status: string;
    paymentMethod?: string;
  }) {
    const currentUid = transaction.userId || auth.currentUser?.uid || 'user_demo_123';
    const formattedStatus =
      transaction.status === 'Pending' || transaction.status === 'PENDING'
        ? 'PENDING'
        : 'PAID';
    const normalizedStatus = formattedStatus === 'PAID' ? 'Paid' : 'Pending';

    // 1. Send to backend payment service
    const result = await processPaymentViaBackend({
      id: transaction.id,
      bookingId: transaction.bookingId || 'booking_123',
      userId: currentUid,
      patientName: transaction.patientName || 'Patient',
      therapistId: transaction.therapistId || transaction.doctorId,
      amount: transaction.amount,
      invoiceNumber: transaction.invoiceNumber,
      status: normalizedStatus,
      paymentMethodName: transaction.paymentMethod,
    });

    // 2. Also persist to Firestore 'payments' collection for real-time updates
    try {
      if (db) {
        const paymentId = transaction.id || `pay_${Date.now()}`;
        const payRef = doc(db, 'payments', paymentId);
        const invNum = transaction.invoiceNumber || `#INV-${paymentId.slice(-4).toUpperCase()}`;
        const therapistId = transaction.therapistId || transaction.doctorId || '';
        const therapistName = transaction.doctor || 'Specialist Clinician';

        await setDoc(
          payRef,
          {
            id: paymentId,
            paymentId,
            bookingId: transaction.bookingId || '',
            appointmentId: transaction.bookingId || '',
            userId: currentUid,
            patientId: currentUid,
            doctorId: therapistId,
            therapistId,
            patientName: transaction.patientName || 'Patient',
            therapistName,
            doctor: therapistName,
            invoiceNo: invNum,
            invoiceNumber: invNum,
            title: transaction.title || 'Physiotherapy Session',
            amount: transaction.amount,
            numericAmount: transaction.amount,
            status: formattedStatus,
            paymentStatus: normalizedStatus,
            paymentMethod: transaction.paymentMethod || 'UPI / Online',
            paidAt: new Date().toISOString(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        // 3. Write immutable log entry to 'transactions' collection
        await addDoc(collection(db, 'transactions'), {
          transactionId: `TXN-${paymentId.slice(-8).toUpperCase()}`,
          type: 'Payment',
          patientId: currentUid,
          patientName: transaction.patientName || 'Patient',
          therapistId,
          therapistName,
          amount: transaction.amount,
          currency: 'INR',
          method: transaction.paymentMethod || 'UPI / Online',
          status: normalizedStatus === 'Paid' ? 'Completed' : 'Pending',
          timestamp: new Date().toISOString(),
          createdAt: serverTimestamp(),
        }).catch((tErr) => console.warn('Could not write transaction log:', tErr));

        // 4. Update Therapist statistics in Firestore
        if (formattedStatus === 'PAID') {
          let targetTherapistId = therapistId;
          if (!targetTherapistId && transaction.doctor) {
            const tSnap = await getDocs(query(collection(db, 'therapists'), where('name', '==', transaction.doctor)));
            if (!tSnap.empty) {
              targetTherapistId = tSnap.docs[0].id;
            }
          }

          if (targetTherapistId) {
            const therapistRef = doc(db, 'therapists', targetTherapistId);
            await updateDoc(therapistRef, {
              patientsCount: increment(1),
              completedSessionsCount: increment(1),
              totalRevenue: increment(transaction.amount || 800),
              activeAppointmentsCount: increment(1),
              updatedAt: new Date().toISOString(),
            }).catch((err) => console.warn('Could not update therapist metrics:', err));
          }
        }
      }
    } catch (fsErr) {
      console.warn('Firestore payment save warning:', fsErr);
    }

    return result;
  }

  subscribeUserInvoices<T>(
    userId: string | undefined,
    callback: (data: T) => void,
    onError?: (err: any) => void
  ): () => void {
    if (!db) {
      if (onError) onError(new Error('Firestore DB not initialized'));
      return () => {};
    }

    const activeUid = auth.currentUser?.uid;
    const targetUid = userId || activeUid;
    if (!targetUid) return () => {};

    try {
      const colRef = collection(db, 'invoices');
      const q = query(colRef, where('patientId', '==', targetUid));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(items as unknown as T);
        },
        (error) => {
          console.warn('Firestore user invoices snapshot error:', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe user invoices:', err);
      if (onError) onError(err);
      return () => {};
    }
  }

  subscribeUserPayments<T>(
    userId: string | undefined,
    callback: (data: T) => void,
    onError?: (err: any) => void
  ): () => void {
    return this.subscribeUserCollection<T>('payments', userId, callback, onError);
  }

  subscribe<T>(key: string, callback: (data: T) => void, onError?: (err: any) => void): () => void {
    if (!db) {
      if (onError) onError(new Error('Firestore DB not initialized'));
      return () => {};
    }

    try {
      const colRef = collection(db, key);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const items: any[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(items as unknown as T);
        },
        (error) => {
          console.warn(`Firestore real-time subscription error for [${key}]:`, error);
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn(`Failed to subscribe to [${key}]:`, err);
      if (onError) onError(err);
      return () => {};
    }
  }

  subscribeUserCollection<T>(
    key: string,
    userId: string | undefined,
    callback: (data: T) => void,
    onError?: (err: any) => void
  ): () => void {
    const activeUid = auth.currentUser?.uid;
    const targetUid = userId || activeUid || 'user_demo_123';
    return this.subscribe<any[]>(
      key,
      (allItems) => {
        const filtered = allItems.filter((item) => {
          if (!item.userId && !item.patientId) return true;
          if (item.userId === targetUid || item.patientId === targetUid) return true;
          if (activeUid && (item.userId === activeUid || item.patientId === activeUid)) return true;
          return false;
        });
        callback(filtered as unknown as T);
      },
      onError
    );
  }
}

export const mobileRealtimeSync = new MobileRealtimeSync();

