import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

async function seedTestPatient() {
  const userId = 'test_patient_aarav_001';
  const now = new Date().toISOString();

  console.log(`🚀 Creating central test patient record: users/${userId}...`);

  // 1. Central User Record in users/{userId}
  const userRef = db.collection('users').doc(userId);
  await userRef.set(
    {
      id: userId,
      userId: userId,
      patientId: '#OM-8842',
      name: 'Aarav Sharma',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      age: 34,
      gender: 'Male',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      condition: 'ACL Reconstruction Rehab',
      primaryConcern: 'ACL Reconstruction Rehab',
      status: 'Active Treatment',
      therapistName: 'Dr. Ananya Sharma',
      therapistInitials: 'AS',
      therapistAvatarBg: 'bg-teal-50 text-teal-700',
      therapistSpecialization: 'Sports Physiotherapist',
      nextAppointmentDate: '18 Aug 2026',
      nextAppointmentTime: '11:30 AM',
      recoveryScore: 82,
      joinedDate: 'Aug 2026',
      address: 'Indiranagar, Bengaluru, Karnataka',
      bloodGroup: 'O+',
      painLevel: 'Mild',
      programsAssignedCount: 1,
      sessionsCompleted: 6,
      sessionsTotal: 12,
      medicalHistory: {
        primaryDiagnosis: 'Post-Op Right Knee ACL Reconstruction',
        severity: 'Moderate',
        allergies: ['Penicillin'],
        surgeries: ['Right Knee Arthroscopic ACL Reconstruction (June 2026)'],
        chronicConditions: ['None'],
        vitals: {
          height: '178 cm',
          weight: '74 kg',
          bmi: '23.4',
          bloodPressure: '120/80',
          heartRate: '72 bpm',
        },
      },
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  console.log('✅ Central User Record created successfully.');

  // 2. Program Assignment
  const progId = 'test_prog_8842';
  const progPayload = {
    id: progId,
    userId: userId,
    patientId: userId,
    programId: 'prog_knee_acl',
    programTitle: 'Knee ACL Rehabilitation Program',
    patientName: 'Aarav Sharma',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    patientCondition: 'ACL Reconstruction Rehab',
    status: 'active',
    assignmentStatus: 'On Track',
    currentWeek: 4,
    totalWeeks: 8,
    progressPercent: 50,
    adherence: 95,
    completedSessions: 6,
    totalSessions: 12,
    completedExercises: ['ex_1', 'ex_2', 'ex_3', 'ex_4', 'ex_5', 'ex_6'],
    startDate: '01 Aug 2026',
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('programAssignments').doc(progId).set(progPayload, { merge: true });
  await db.collection('users').doc(userId).collection('programAssignments').doc(progId).set(progPayload, { merge: true });
  console.log('✅ Program Assignment created and linked via userId.');

  // 3. Payment Record & Invoice
  const payId = 'test_pay_8842';
  const payPayload = {
    id: payId,
    paymentId: payId,
    userId: userId,
    patientId: userId,
    patientName: 'Aarav Sharma',
    therapistId: 'therapist_ananya',
    therapistName: 'Dr. Ananya Sharma',
    doctor: 'Dr. Ananya Sharma',
    appointmentId: 'test_appt_8842',
    amount: 1200,
    numericAmount: 1200,
    currency: 'INR',
    paymentMethod: 'UPI',
    paymentMethodName: 'UPI (GPay)',
    paymentStatus: 'Paid',
    status: 'PAID',
    transactionId: 'TXN-AARAV-8842',
    invoiceNumber: 'INV-202608-8842',
    title: 'ACL Rehab Consultation & Physical Evaluation',
    paymentMode: 'online',
    paidAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('payments').doc(payId).set(payPayload, { merge: true });
  await db.collection('users').doc(userId).collection('payments').doc(payId).set(payPayload, { merge: true });
  console.log('✅ Payment record created and linked via userId.');

  // 4. Appointment Record
  const apptId = 'test_appt_8842';
  const apptPayload = {
    id: apptId,
    userId: userId,
    patientId: userId,
    patientName: 'Aarav Sharma',
    userName: 'Aarav Sharma',
    doctorId: 'therapist_ananya',
    therapistId: 'therapist_ananya',
    doctorName: 'Dr. Ananya Sharma',
    therapistName: 'Dr. Ananya Sharma',
    doctorSpecialty: 'Sports Physiotherapist',
    therapistSubtitle: 'Sports Physiotherapist',
    type: 'Clinic Visit',
    visitType: 'Clinic Visit',
    fullDate: '2026-08-18',
    dateLabel: '18 Aug 2026',
    date: '18 Aug 2026',
    timeSlot: '11:30 AM',
    time: '11:30 AM',
    sessionFee: 1200,
    amount: 1200,
    paymentStatus: 'Paid',
    status: 'Confirmed',
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('appointments').doc(apptId).set(apptPayload, { merge: true });
  await db.collection('users').doc(userId).collection('appointments').doc(apptId).set(apptPayload, { merge: true });
  console.log('✅ Appointment record created and linked via userId.');

  // 5. Clinical Report
  const repId = 'test_rep_8842';
  const repPayload = {
    id: repId,
    userId: userId,
    patientId: userId,
    patientName: 'Aarav Sharma',
    name: 'Post-Op Knee MRI & Kinematic Assessment.pdf',
    title: 'Post-Op Knee MRI & Kinematic Assessment.pdf',
    category: 'Imaging',
    date: '10 Aug 2026',
    size: '2.4 MB',
    status: 'VERIFIED',
    typeIcon: 'teal',
    summaryText: 'MRI shows excellent graft integration with minimal post-surgical joint effusion.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('reports').doc(repId).set(repPayload, { merge: true });
  await db.collection('users').doc(userId).collection('reports').doc(repId).set(repPayload, { merge: true });
  console.log('✅ Clinical report created and linked via userId.');

  console.log('🎉 Test patient seed completed successfully!');
  process.exit(0);
}

seedTestPatient().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
