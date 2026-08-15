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

  static async processRefund(bookingId: string, refundAmount: number): Promise<any> {
    const refundId = `RFD-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const refundRecord = {
      id: refundId,
      bookingId,
      amount: refundAmount,
      status: 'Processing',
      createdAt: FieldValue.serverTimestamp(),
    };

    await db.collection('refunds').doc(refundId).set(refundRecord);

    return {
      refundId,
      bookingId,
      refundAmount,
      status: 'Processing',
      message: 'Refund initiated successfully. Will be credited within 3-5 business days.',
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

