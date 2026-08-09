import React, { useState, useMemo } from 'react';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleMetrics } from './components/ScheduleMetrics';
import { ScheduleFilters } from './components/ScheduleFilters';
import { AppointmentsTable, type AppointmentItem } from './components/AppointmentsTable';
import { TodaysTimeline } from './components/TodaysTimeline';
import { PendingConfirmations } from './components/PendingConfirmations';
import { QuickActions } from './components/QuickActions';

interface SchedulePageProps {
  onOpenNewAppointment?: () => void;
  onOpenSessionDetails?: (appointment?: AppointmentItem) => void;
  onOpenReschedule?: () => void;
}

const MOCK_APPOINTMENTS: AppointmentItem[] = [

  {
    id: 'apt-1',
    patientName: 'Arjun Reddy',
    patientSubtitle: 'Post-Op Recovery',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    therapistName: 'Dr. PriyaSharma',
    therapistSubtitle: 'Physiotherapist',
    therapistAvatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78c00?auto=format&fit=crop&q=80&w=150',
    type: 'Clinic Visit',
    date: 'Oct 24, 2023',
    time: '10:30 AM',
    status: 'Confirmed',
  },
  {
    id: 'apt-2',
    patientName: 'Sanya Malhotra',
    patientSubtitle: 'Anxiety Therapy',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    therapistName: 'Dr. Rohan Gupta',
    therapistSubtitle: 'Psychologist',
    therapistAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    type: 'Online',
    date: 'Oct 24, 2023',
    time: '12:00 PM',
    status: 'Scheduled',
  },
  {
    id: 'apt-3',
    patientName: 'Kabir Singh',
    patientSubtitle: 'Sports injury',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    therapistName: 'Dr. Ananya Roy',
    therapistSubtitle: 'Sports Med',
    therapistAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    type: 'Home Visit',
    date: 'Oct 23, 2023',
    time: '04:45 PM',
    status: 'Completed',
  },
  {
    id: 'apt-4',
    patientName: 'Ishaan Kapoor',
    patientSubtitle: 'Knee Rehab',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    therapistName: 'Dr. PriyaSharma',
    therapistSubtitle: 'Physiotherapist',
    therapistAvatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78c00?auto=format&fit=crop&q=80&w=150',
    type: 'Clinic Visit',
    date: 'Oct 24, 2023',
    time: '02:30 PM',
    status: 'Confirmed',
  },
  {
    id: 'apt-5',
    patientName: 'Ananya Verma',
    patientSubtitle: 'Post-Op Knee',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    therapistName: 'Dr. Ananya Roy',
    therapistSubtitle: 'Sports Med',
    therapistAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    type: 'Clinic Visit',
    date: 'Oct 25, 2023',
    time: '11:15 AM',
    status: 'Scheduled',
  },
];

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

  // Filtering appointments based on search & filter dropdowns
  const filteredAppointments = useMemo(() => {
    return MOCK_APPOINTMENTS.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientSubtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.therapistName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTherapist =
        selectedTherapist === 'All' || item.therapistName === selectedTherapist;

      const matchesType = selectedType === 'All' || item.type === selectedType;

      return matchesSearch && matchesTherapist && matchesType;
    });
  }, [searchTerm, selectedTherapist, selectedType]);

  const handleExportSchedule = () => {
    alert('Exporting schedule data as CSV / Excel sheet...');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Schedule Top Header */}
      <ScheduleHeader
        onExportSchedule={handleExportSchedule}
        onCreateAppointment={onOpenNewAppointment}
      />

      {/* Metric Cards Row */}
      <ScheduleMetrics />

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
            totalPages={1}
            totalResults={36}
            onPageChange={setCurrentPage}
            viewMode={viewMode}
            onSelectSession={(item) => onOpenSessionDetails?.(item)}
          />
        </div>

        {/* Right Sidebar Column (1 Span on Desktop) */}
        <div className="space-y-6">
          {/* Today's Timeline */}
          <TodaysTimeline />

          {/* Pending Confirmations */}
          <PendingConfirmations />

          {/* Quick Actions Grid */}
          <QuickActions
            onSendReminder={() => alert('Sending appointment reminders to pending patients...')}
            onReschedule={() => onOpenReschedule ? onOpenReschedule() : alert('Opening reschedule manager...')}
            onPrintLedger={() => alert('Printing schedule ledger...')}
            onBulkNotes={() => alert('Opening bulk clinical notes...')}
          />
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
