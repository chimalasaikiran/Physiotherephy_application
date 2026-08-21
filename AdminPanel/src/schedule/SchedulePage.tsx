import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleMetrics } from './components/ScheduleMetrics';
import { ScheduleFilters } from './components/ScheduleFilters';
import { AppointmentsTable, type AppointmentItem } from './components/AppointmentsTable';
import { TodaysTimeline } from './components/TodaysTimeline';
import { PendingConfirmations } from './components/PendingConfirmations';
import { QuickActions } from './components/QuickActions';
import { subscribeToSchedules, updateScheduleStatusRecord, markCashAsPaidRecord, deleteScheduleRecord } from '@/services/scheduleService';
import { isDateInTimelineFilter, parseAppointmentDateTime } from '@/utils/dateUtils';

interface SchedulePageProps {
  onOpenNewAppointment?: () => void;
  onOpenSessionDetails?: (appointment?: AppointmentItem) => void;
  onOpenReschedule?: (appointment?: AppointmentItem) => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  onOpenNewAppointment,
  onOpenSessionDetails,
  onOpenReschedule,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  const [selectedTherapist, setSelectedTherapist] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsList, setAppointmentsList] = useState<AppointmentItem[]>([]);
  const [rawDocsList, setRawDocsList] = useState<any[]>([]);

  // Subscribe to real-time Firestore schedules
  useEffect(() => {
    const unsub = subscribeToSchedules((appts, rawDocs) => {
      setAppointmentsList(appts);
      setRawDocsList(rawDocs);
    });
    return () => unsub();
  }, []);

  // Filtering appointments based on search, timeline & all filter dropdowns
  const filteredAppointments = useMemo(() => {
    return appointmentsList.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientSubtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.therapistName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTherapist =
        selectedTherapist === 'All' || item.therapistName.toLowerCase().includes(selectedTherapist.toLowerCase());

      const matchesType =
        selectedType === 'All' ||
        item.type.toLowerCase().includes(selectedType.toLowerCase()) ||
        (selectedType === 'Home Visit' && item.type === 'Home Visit') ||
        (selectedType === 'Clinic Visit' && item.type === 'Clinic Visit') ||
        (selectedType === 'Online' && item.type === 'Online');

      const matchesStatus =
        selectedStatus === 'All' ||
        item.status === selectedStatus ||
        (selectedStatus === 'Confirmed' && (item.status === 'Confirmed' || item.status === 'Scheduled'));

      const matchesPaymentMethod =
        selectedPaymentMethod === 'All' ||
        (selectedPaymentMethod === 'Cash' && item.paymentMethod === 'CASH') ||
        (selectedPaymentMethod === 'Online' && item.paymentMethod === 'ONLINE');

      const matchesPaymentStatus =
        selectedPaymentStatus === 'All' ||
        (item.paymentStatus || '').toString().toLowerCase() === selectedPaymentStatus.toLowerCase();

      let matchesTimeline = true;
      if (selectedTimeframe !== 'All') {
        const raw = rawDocsList.find((r) => r.id === item.id);
        const apptDate = parseAppointmentDateTime(raw?.fullDate || raw?.date || item.date, raw?.timeSlot || item.time);
        if (apptDate) {
          matchesTimeline = isDateInTimelineFilter(apptDate, selectedTimeframe);
        }
      }

      return (
        matchesSearch &&
        matchesTherapist &&
        matchesType &&
        matchesStatus &&
        matchesPaymentMethod &&
        matchesPaymentStatus &&
        matchesTimeline
      );
    });
  }, [
    appointmentsList,
    rawDocsList,
    searchTerm,
    selectedTherapist,
    selectedType,
    selectedStatus,
    selectedPaymentMethod,
    selectedPaymentStatus,
    selectedTimeframe,
  ]);

  const handleStatusChange = async (item: AppointmentItem, newStatus: AppointmentItem['status']) => {
    try {
      const raw = rawDocsList.find((r) => r.id === item.id);
      await updateScheduleStatusRecord(
        item.id,
        newStatus,
        raw?.therapistId || raw?.doctorId,
        raw?.fullDate,
        raw?.timeSlot || raw?.time
      );
    } catch (e: any) {
      console.error('Failed to update status in Firestore:', e);
      alert(e.message || 'Status transition invalid or failed.');
    }
  };

  const handleMarkCashPaid = async (item: AppointmentItem) => {
    try {
      await markCashAsPaidRecord(item.id, 'Clinic Admin');
    } catch (e: any) {
      console.error('Failed to mark cash payment as paid:', e);
      alert(e.message || 'Failed to mark cash payment as paid.');
    }
  };

  const handleDeleteAppointment = async (item: AppointmentItem) => {
    try {
      const raw = rawDocsList.find((r) => r.id === item.id);
      await deleteScheduleRecord(
        item.id,
        raw?.therapistId || raw?.doctorId,
        raw?.fullDate,
        raw?.timeSlot || raw?.time
      );
    } catch (e: any) {
      console.error('Failed to delete appointment from Firestore:', e);
      alert(e.message || 'Failed to delete appointment record.');
    }
  };

  const handleExportSchedule = () => {
    if (filteredAppointments.length === 0) {
      alert('No schedules to export.');
      return;
    }
    const headers = 'ID,Patient,Therapist,Type,Date,Time,Amount,PaymentMethod,PaymentStatus,Status\n';
    const rows = filteredAppointments
      .map(
        (a) =>
          `"${a.id}","${a.patientName}","${a.therapistName}","${a.type}","${a.date}","${a.time}","₹${a.amount || 1500}","${a.paymentMethod || 'CASH'}","${a.paymentStatus || 'PENDING'}","${a.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schedule_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Schedule Top Header */}
      <ScheduleHeader
        onExportSchedule={handleExportSchedule}
        onCreateAppointment={onOpenNewAppointment}
      />

      {/* Metric Cards Row */}
      <ScheduleMetrics appointments={appointmentsList} />

      {/* Main Section Grid: Left Main Area + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Column (2 Spans on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters Bar */}
          <ScheduleFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            selectedTherapist={selectedTherapist}
            onTherapistChange={setSelectedTherapist}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChangeFilter={setSelectedStatus}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={setSelectedPaymentMethod}
            selectedPaymentStatus={selectedPaymentStatus}
            onPaymentStatusChange={setSelectedPaymentStatus}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Appointments Table */}
          <AppointmentsTable
            appointments={filteredAppointments}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAppointments.length / 10) || 1}
            totalResults={filteredAppointments.length}
            onPageChange={setCurrentPage}
            viewMode={viewMode}
            onSelectSession={(item) => onOpenSessionDetails?.(item)}
            onStatusChange={handleStatusChange}
            onMarkCashPaid={handleMarkCashPaid}
            onDeleteAppointment={handleDeleteAppointment}
          />
        </div>

        {/* Right Sidebar Column (1 Span on Desktop) */}
        <div className="space-y-6">
          {/* Today's Timeline */}
          <TodaysTimeline
            appointments={appointmentsList}
            onSelectSession={(item) => onOpenSessionDetails?.(item)}
          />

          {/* Pending Confirmations */}
          <PendingConfirmations
            appointments={appointmentsList}
            onConfirm={(item) => handleStatusChange(item, 'Confirmed')}
          />

          {/* Quick Actions Grid */}
          <QuickActions
            onSendReminder={() => alert('Sending appointment reminders to pending patients...')}
            onReschedule={() => onOpenReschedule ? onOpenReschedule(filteredAppointments[0]) : alert('Opening reschedule manager...')}
            onPrintLedger={() => handleExportSchedule()}
            onBulkNotes={() => alert('Opening bulk clinical notes...')}
          />
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
