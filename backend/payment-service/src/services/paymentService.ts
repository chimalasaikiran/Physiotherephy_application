import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

export interface PaymentTransactionInput {
  id?: string;
  bookingId: string;
  userId?: string;
  patientName: string;
  therapistId?: string;
  therapistName?: string;
  amount: number;
  currency?: string;
  paymentMode?: string;
  paymentMethodName?: string;
  invoiceNumber?: string;
  status?: string;
}

export class PaymentService {
  static async processPayment(input: PaymentTransactionInput): Promise<any> {
    const txnId = input.id || `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const invoiceNum = input.invoiceNumber || `INV-${txnId.slice(-6)}`;
    const userId = input.userId || 'user_demo_123';

    const numAmount = Number(input.amount) || 800;
    const nowIso = new Date().toISOString();

    const paymentRecord = {
      id: txnId,
      paymentId: txnId,
      bookingId: input.bookingId,
      appointmentId: input.bookingId,
      userId,
      patientId: userId,
      patientName: input.patientName || 'Patient',
      therapistId: input.therapistId || '',
      therapistName: input.therapistName || '',
      doctor: input.therapistName || '',
      doctorId: input.therapistId || '',
      amount: numAmount,
      numericAmount: numAmount,
      currency: input.currency || 'INR',
      feeStr: `₹${numAmount}`,
      paymentMode: input.paymentMode || 'online',
      paymentMethodName: input.paymentMethodName || 'UPI',
      paymentMethod: input.paymentMethodName || 'UPI',
      invoiceNumber: invoiceNum,
      invoiceNo: invoiceNum,
      status: input.status || 'Paid',
      paymentStatus: input.status || 'Paid',
      paidAt: nowIso,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection('payments').doc(txnId).set(paymentRecord, { merge: true });

    // Mirror to subcollection users/{userId}/payments/{txnId}
    if (userId) {
      try {
        await db.collection('users').doc(userId).collection('payments').doc(txnId).set(paymentRecord, { merge: true });
      } catch (subErr) {
        console.warn('Backend subcollection payment mirror warning:', subErr);
      }
    }

    // Also write transaction log
    await db.collection('transactions').add({
      transactionId: txnId,
      type: 'Payment',
      patientId: userId,
      patientName: input.patientName || 'Patient',
      therapistId: input.therapistId || '',
      therapistName: input.therapistName || '',
      amount: numAmount,
      currency: input.currency || 'INR',
      method: input.paymentMethodName || 'UPI',
      status: 'Completed',
      timestamp: nowIso,
      createdAt: FieldValue.serverTimestamp(),
    });

    // If matching invoice exists in 'invoices' collection, update its status
    if (invoiceNum) {
      try {
        const invQuery = await db.collection('invoices').where('invoiceNumber', '==', invoiceNum).get();
        invQuery.forEach((docSnap: any) => {
          docSnap.ref.update({
            status: 'Paid',
            paymentMethod: input.paymentMethodName || 'UPI',
            paidDate: nowIso,
            updatedAt: FieldValue.serverTimestamp(),
          });
        });
      } catch (invErr) {
        console.warn('Could not update matching invoice in backend:', invErr);
      }
    }

    return {
      transactionId: txnId,
      invoiceNumber: invoiceNum,
      status: 'Paid',
      amount: input.amount,
      message: 'Payment processed successfully.',
    };
  }

  static async getUserPayments(userId: string): Promise<any[]> {
    try {
      const snapshot = await db
        .collection('payments')
        .where('userId', '==', userId)
        .get();

      const items: any[] = [];
      snapshot.forEach((doc: any) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (e) {
      console.error('Error fetching user payments:', e);
      return [];
    }
  }

  static async getAllPayments(): Promise<any[]> {
    try {
      const snapshot = await db.collection('payments').get();
      return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching all payments:', e);
      return [];
    }
  }

  static async getInvoiceDetails(invoiceId: string): Promise<any | null> {
    try {
      const docSnap = await db.collection('invoices').doc(invoiceId).get();
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      const querySnap = await db.collection('invoices').where('invoiceNumber', '==', invoiceId).get();
      if (!querySnap.empty) {
        const first = querySnap.docs[0]!;
        return { id: first.id, ...first.data() };
      }
    } catch (e) {
      console.error('Error fetching invoice details:', e);
    }
    return null;
  }

  static async getAllInvoices(patientId?: string): Promise<any[]> {
    try {
      let q = db.collection('invoices');
      if (patientId) {
        const snap = await q.where('patientId', '==', patientId).get();
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
      const snap = await q.get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching invoices:', e);
      return [];
    }
  }

  static async createInvoice(data: any): Promise<any> {
    const docRef = await db.collection('invoices').add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  }

  static async updateInvoice(id: string, data: any): Promise<void> {
    await db.collection('invoices').doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  static async deleteInvoice(id: string): Promise<void> {
    await db.collection('invoices').doc(id).delete();
  }

  static async getAllTransactions(): Promise<any[]> {
    try {
      const snap = await db.collection('transactions').get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching transactions:', e);
      return [];
    }
  }

  static async getAllPackages(): Promise<any[]> {
    try {
      const snap = await db.collection('packages').get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching packages:', e);
      return [];
    }
  }

  static async createPackage(data: any): Promise<any> {
    const docRef = await db.collection('packages').add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  }

  static async getAllRefunds(): Promise<any[]> {
    try {
      const snap = await db.collection('refunds').get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching refunds:', e);
      return [];
    }
  }

  static async processRefund(input: {
    paymentId?: string;
    bookingId?: string;
    appointmentId?: string;
    refundAmount: number;
    refundReason?: string;
    processedBy?: string;
    paymentProvider?: string;
  } | string, amountParam?: number): Promise<any> {
    // Handle both object input and backward-compatible (bookingId, amount) signature
    let paymentId: string | undefined;
    let bookingId: string | undefined;
    let appointmentId: string | undefined;
    let refundAmount: number;
    let refundReason: string | undefined;
    let processedBy: string | undefined;
    let paymentProvider: string | undefined;

    if (typeof input === 'string') {
      bookingId = input;
      appointmentId = input;
      refundAmount = Number(amountParam || 0);
    } else {
      paymentId = input.paymentId;
      bookingId = input.bookingId;
      appointmentId = input.appointmentId || input.bookingId;
      refundAmount = Number(input.refundAmount || 0);
      refundReason = input.refundReason;
      processedBy = input.processedBy;
      paymentProvider = input.paymentProvider;
    }

    if (!refundAmount || refundAmount <= 0) {
      throw new Error('Refund amount must be greater than zero.');
    }

    // 1. Locate payment document in Firestore
    let paymentDocRef: any = null;
    let paymentData: any = null;

    if (paymentId) {
      const docSnap = await db.collection('payments').doc(paymentId).get();
      if (docSnap.exists) {
        paymentDocRef = docSnap.ref;
        paymentData = docSnap.data();
      }
    }

    if (!paymentData && (appointmentId || bookingId)) {
      const searchId = appointmentId || bookingId;
      const qSnap = await db
        .collection('payments')
        .where('appointmentId', '==', searchId)
        .get();
      if (!qSnap.empty) {
        paymentDocRef = qSnap.docs[0]!.ref;
        paymentData = qSnap.docs[0]!.data();
      } else {
        const qSnap2 = await db
          .collection('payments')
          .where('bookingId', '==', searchId)
          .get();
        if (!qSnap2.empty) {
          paymentDocRef = qSnap2.docs[0]!.ref;
          paymentData = qSnap2.docs[0]!.data();
        }
      }
    }

    if (!paymentData) {
      throw new Error('Original payment record not found for the given appointment/payment ID.');
    }

    const resolvedPaymentId = paymentData.paymentId || paymentData.id || paymentId || `PAY-${Date.now()}`;
    const resolvedAppointmentId = paymentData.appointmentId || paymentData.bookingId || appointmentId || bookingId || '';
    const patientId = paymentData.patientId || paymentData.userId || '';
    const patientName = paymentData.patientName || paymentData.userName || 'Patient';

    const originalAmount = Number(paymentData.amount || paymentData.numericAmount || 0);
    const existingRefundedAmount = Number(paymentData.refundedAmount || 0);
    const remainingRefundableAmount = originalAmount - existingRefundedAmount;

    if (remainingRefundableAmount <= 0) {
      throw new Error('This payment has already been fully refunded.');
    }

    if (refundAmount > remainingRefundableAmount) {
      throw new Error(
        `Refund amount (₹${refundAmount}) exceeds maximum refundable amount (₹${remainingRefundableAmount}).`
      );
    }

    // 2. Financial calculation
    const newRefundedAmount = existingRefundedAmount + refundAmount;
    const newRemainingRefundable = Math.max(0, originalAmount - newRefundedAmount);
    const newPaymentStatus = newRemainingRefundable === 0 ? 'Refunded' : 'Partially Refunded';
    const newStatus = newPaymentStatus === 'Refunded' ? 'REFUNDED' : 'PARTIALLY REFUNDED';

    // 3. Payment Provider processing simulation
    const providerRefundId = `rfnd_rzp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();
    const refundId = `RFD-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    // 4. Save Refund Record in Firestore
    const refundRecord = {
      id: refundId,
      refundId,
      paymentId: resolvedPaymentId,
      appointmentId: resolvedAppointmentId,
      bookingId: resolvedAppointmentId,
      patientId,
      patientName,
      originalAmount,
      refundAmount,
      remainingRefundableAmount: newRemainingRefundable,
      refundReason: refundReason || 'Appointment Cancelled',
      refundStatus: 'Completed',
      status: 'Approved',
      paymentProvider: paymentProvider || paymentData.paymentMethod || 'UPI',
      providerRefundId,
      processedBy: processedBy || 'Admin',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await db.collection('refunds').doc(refundId).set(refundRecord);

    // 5. Update Payment Document
    const paymentUpdates = {
      refundedAmount: newRefundedAmount,
      remainingRefundableAmount: newRemainingRefundable,
      paymentStatus: newPaymentStatus,
      status: newStatus,
      refundStatus: 'Approved',
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (paymentDocRef) {
      await paymentDocRef.update(paymentUpdates);
    } else {
      await db.collection('payments').doc(resolvedPaymentId).set(paymentUpdates, { merge: true });
    }

    // Mirror to subcollection users/{userId}/payments/{paymentId}
    if (patientId) {
      try {
        await db
          .collection('users')
          .doc(patientId)
          .collection('payments')
          .doc(resolvedPaymentId)
          .set(paymentUpdates, { merge: true });
      } catch (subErr) {
        console.warn('Backend subcollection payment refund mirror warning:', subErr);
      }
    }

    // 6. Write Refund Transaction Log
    await db.collection('transactions').add({
      transactionId: `TXN-RFD-${refundId}`,
      type: 'Refund',
      patientId,
      patientName,
      therapistId: paymentData.therapistId || paymentData.doctorId || '',
      therapistName: paymentData.therapistName || paymentData.doctor || '',
      appointmentId: resolvedAppointmentId,
      paymentId: resolvedPaymentId,
      refundId,
      amount: refundAmount,
      currency: paymentData.currency || 'INR',
      method: paymentData.paymentMethod || 'UPI',
      status: 'Completed',
      description: `Refund processed (₹${refundAmount}): ${refundReason || 'Cancellation'}`,
      timestamp: nowIso,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 7. Update Appointment Payment Status
    if (resolvedAppointmentId) {
      try {
        await db.collection('appointments').doc(resolvedAppointmentId).set(
          {
            paymentStatus: newPaymentStatus,
            refundedAmount: newRefundedAmount,
            remainingRefundableAmount: newRemainingRefundable,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (apptErr) {
        console.warn('Backend appointment payment status update warning:', apptErr);
      }
    }

    return {
      refundId,
      paymentId: resolvedPaymentId,
      appointmentId: resolvedAppointmentId,
      patientId,
      originalAmount,
      refundAmount,
      remainingRefundableAmount: newRemainingRefundable,
      paymentStatus: newPaymentStatus,
      refundStatus: 'Completed',
      providerRefundId,
      message: `Refund of ₹${refundAmount.toLocaleString('en-IN')} successfully processed via ${paymentProvider || 'Payment Provider'}.`,
    };
  }

  static async getAllPayouts(): Promise<any[]> {
    try {
      const snap = await db.collection('payouts').get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching payouts:', e);
      return [];
    }
  }

  static async createPayout(data: any): Promise<any> {
    const docRef = await db.collection('payouts').add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  }
}

