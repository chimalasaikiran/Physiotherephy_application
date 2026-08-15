import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleMetrics } from './components/ScheduleMetrics';
import { ScheduleFilters } from './components/ScheduleFilters';
import { AppointmentsTable, type AppointmentItem } from './components/AppointmentsTable';
import { TodaysTimeline } from './components/TodaysTimeline';
import { PendingConfirmations } from './components/PendingConfirmations';
import { QuickActions } from './components/QuickActions';
import { subscribeToSchedules, updateScheduleStatusRecord } from '@/services/scheduleService';

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
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
  const [selectedTherapist, setSelectedTherapist] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
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

  // Filtering appointments based on search & filter dropdowns
  const filteredAppointments = useMemo(() => {
    return appointmentsList.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientSubtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.therapistName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTherapist =
        selectedTherapist === 'All' || item.therapistName.toLowerCase().includes(selectedTherapist.toLowerCase());

      const matchesType = selectedType === 'All' || item.type === selectedType;

      return matchesSearch && matchesTherapist && matchesType;
    });
  }, [appointmentsList, searchTerm, selectedTherapist, selectedType]);

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
    } catch (e) {
      console.error('Failed to update status in Firestore:', e);
    }
  };

  const handleExportSchedule = () => {
    if (filteredAppointments.length === 0) {
      alert('No schedules to export.');
      return;
    }
    const headers = 'ID,Patient,Therapist,Type,Date,Time,Status\n';
    const rows = filteredAppointments
      .map((a) => `"${a.id}","${a.patientName}","${a.therapistName}","${a.type}","${a.date}","${a.time}","${a.status}"`)
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

