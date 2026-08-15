import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MetricCards } from './components/MetricCards';
import { AppointmentsTrendChart } from './components/AppointmentsTrendChart';
import { PatientGrowthChart } from './components/PatientGrowthChart';
import { RecentAppointmentsTable } from './components/RecentAppointmentsTable';
import { TodaysSchedule } from './components/TodaysSchedule';
import { RecentPatientsWidget } from './components/RecentPatientsWidget';
import { QuickActionsWidget } from './components/QuickActionsWidget';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { RealtimeGuideModal } from '@/components/RealtimeGuideModal';
import { PatientsView, AddPatientPage, PatientProfilePage, type Patient } from '@/patients';
import { TherapistsView, AddTherapistPage, TherapistProfilePage, type Therapist } from '@/therapists';
import { SchedulePage, CreateAppointmentPage, AppointmentDetailsPage, RescheduleAppointmentPage, SessionSummaryPage } from '@/schedule';
import { ProgramsPage, CreateRecoveryProgramPage, ProgramDetailsPage, type Program } from '@/programs';
import { ExerciseLibraryPage, CreateExercisePage, ExerciseDetailPage, type Exercise } from '@/exercises';
import { ReportsPage } from '@/reports';
import { AnalyticsPage } from '@/analytics';
import { PaymentsPage, CreateInvoicePage, CreateTreatmentPackagePage } from '@/payments';
import { SettingsPage } from '@/settings';
import { useDashboardData } from './useDashboardData';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const dashboardData = useDashboardData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isRealtimeGuideOpen, setIsRealtimeGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 flex antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <TopHeader
          onMenuToggle={() => setIsSidebarOpen(true)}
          onOpenNewAppointment={() => setActiveTab('create-appointment')}
          onOpenRealtimeGuide={() => setIsRealtimeGuideOpen(true)}
          onNavigateToSettings={() => setActiveTab('settings')}
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === 'schedule' ? (
            <SchedulePage
              onOpenNewAppointment={() => setActiveTab('create-appointment')}
              onOpenSessionDetails={(appt) => {
                if (appt) setSelectedAppointment(appt);
                setActiveTab('appointment-details');
              }}
              onOpenReschedule={(appt) => {
                if (appt) setSelectedAppointment(appt);
                setActiveTab('reschedule-appointment');
              }}
            />
          ) : activeTab === 'session-summary' || activeTab === 'session-details' ? (
            <SessionSummaryPage
              onBack={() => setActiveTab('schedule')}
              onNavigateToPatient={() => setActiveTab('patient-profile')}
              onNavigateToTherapist={() => setActiveTab('therapist-profile')}
              onNavigateToSchedule={() => setActiveTab('schedule')}
            />
          ) : activeTab === 'appointment-details' ? (
            <AppointmentDetailsPage
              appointment={selectedAppointment}
              onBack={() => setActiveTab('schedule')}
              onNavigateToPatient={() => setActiveTab('patient-profile')}
              onNavigateToTherapist={() => setActiveTab('therapist-profile')}
              onNavigateToReschedule={() => setActiveTab('reschedule-appointment')}
            />
          ) : activeTab === 'reschedule-appointment' ? (
            <RescheduleAppointmentPage
              appointment={selectedAppointment}
              onBack={() => setActiveTab('schedule')}
              onSuccess={() => setActiveTab('schedule')}
            />
          ) : activeTab === 'create-appointment' ? (
            <CreateAppointmentPage
              initialStep={1}
              onBack={() => setActiveTab('schedule')}
              onSuccess={() => setActiveTab('schedule')}
            />
          ) : activeTab === 'therapists' ? (
            <TherapistsView
              onNavigateToAddTherapist={() => setActiveTab('add-therapist')}
              onSelectTherapist={(therapist) => {
                setSelectedTherapist(therapist);
                setActiveTab('therapist-profile');
              }}
            />
          ) : activeTab === 'therapist-profile' ? (
            <TherapistProfilePage
              therapist={selectedTherapist}
              onBack={() => setActiveTab('therapists')}
            />
          ) : activeTab === 'add-therapist' ? (
            <AddTherapistPage onBack={() => setActiveTab('therapists')} />
          ) : activeTab === 'patients' ? (
            <PatientsView
              onNavigateToAddPatient={() => setActiveTab('add-patient')}
              onSelectPatient={(patient) => {
                setSelectedPatient(patient);
                setActiveTab('patient-profile');
              }}
            />
          ) : activeTab === 'add-patient' ? (
            <AddPatientPage onBack={() => setActiveTab('patients')} />
          ) : activeTab === 'patient-profile' ? (
            selectedPatient ? (
              <PatientProfilePage
                patient={selectedPatient}
                onBack={() => setActiveTab('patients')}
              />
            ) : (
              <PatientsView
                onNavigateToAddPatient={() => setActiveTab('add-patient')}
                onSelectPatient={(patient) => {
                  setSelectedPatient(patient);
                  setActiveTab('patient-profile');
                }}
              />
            )
          ) : activeTab === 'programs' ? (

            <ProgramsPage
              onNavigateToCreateProgram={() => setActiveTab('create-program')}
              onNavigateToProgramDetails={(prog) => {
                if (prog) setSelectedProgram(prog);
                setActiveTab('program-details');
              }}
            />
          ) : activeTab === 'program-details' ? (
            <ProgramDetailsPage
              program={selectedProgram}
              onBack={() => setActiveTab('programs')}
            />
          ) : activeTab === 'create-program' ? (
            <CreateRecoveryProgramPage
              onBack={() => setActiveTab('programs')}
              onCreateProgram={() => setActiveTab('programs')}
            />
          ) : activeTab === 'exercise-detail' ? (
            <ExerciseDetailPage
              exercise={selectedExercise}
              onBack={() => setActiveTab('exercise-library')}
              onSelectExercise={(ex) => setSelectedExercise(ex)}
            />
          ) : activeTab === 'create-exercise' ? (
            <CreateExercisePage
              onBack={() => setActiveTab('exercise-library')}
              onSuccess={() => setActiveTab('exercise-library')}
            />
          ) : activeTab === 'exercise-library' || activeTab === 'exercises' ? (
            <ExerciseLibraryPage
              onNavigateToCreateExercise={() => setActiveTab('create-exercise')}
              onNavigateToExerciseDetails={(ex) => {
                if (ex) setSelectedExercise(ex);
                setActiveTab('exercise-detail');
              }}
            />
          ) : activeTab === 'patient-reports' || activeTab === 'patient_reports' ? (
            <ReportsPage initialSubTab="Patient Reports" />
          ) : activeTab === 'exports' || activeTab === 'reports-exports' ? (
            <ReportsPage initialSubTab="Exports" />
          ) : activeTab === 'reports' ? (
            <ReportsPage />
          ) : activeTab === 'analytics' || activeTab.startsWith('analytics') ? (
            <AnalyticsPage
              initialSubTab={
                activeTab.includes('therapist')
                  ? 'Therapists'
                  : activeTab.includes('patient')
                  ? 'Patients'
                  : activeTab.includes('program')
                  ? 'Recovery Programs'
                  : activeTab.includes('revenue')
                  ? 'Revenue'
                  : 'Overview'
              }
              onNavigateToTherapists={() => setActiveTab('therapists')}
              onNavigateToPatients={() => setActiveTab('patients')}
              dashboardData={dashboardData}
            />
          ) : activeTab === 'create-treatment-package' || activeTab === 'create-package' ? (
            <CreateTreatmentPackagePage
              onBack={() => setActiveTab('payments')}
              onSuccess={() => setActiveTab('payments')}
            />
          ) : activeTab === 'create-invoice' ? (
            <CreateInvoicePage
              onBack={() => setActiveTab('payments')}
              onSuccess={() => setActiveTab('payments')}
              onNavigateToPatientProfile={() => {
                setActiveTab('patient-profile');
              }}
            />
          ) : activeTab === 'payments' || activeTab === 'billing' ? (
            <PaymentsPage
              onNavigateToCreateInvoice={() => setActiveTab('create-invoice')}
              onNavigateToCreatePackage={() => setActiveTab('create-treatment-package')}
              onNavigateToPatientProfile={() => {
                setActiveTab('patient-profile');
              }}
            />
          ) : activeTab === 'settings' || activeTab === 'security' || activeTab === 'notifications' || activeTab === 'integrations' || activeTab.startsWith('setting') || activeTab.startsWith('security') || activeTab.startsWith('notification') || activeTab.startsWith('integration') ? (
            <SettingsPage
              initialSubTab={
                activeTab.includes('security')
                  ? 'Security'
                  : activeTab.includes('notification')
                  ? 'Notifications'
                  : activeTab.includes('integration')
                  ? 'Integrations'
                  : 'Security'
              }
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'dashboard' ? (


            <div className="space-y-6 sm:space-y-8">
              {/* Main Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Dashboard
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    Monitor clinic operations and patient recovery in real-time.
                  </p>
                </div>
              </div>

              {/* Metric Stat Cards */}
              <MetricCards
                summaryMetrics={dashboardData.summaryMetrics}
                isLoading={dashboardData.isLoading}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />

              {/* Core Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                {/* Left & Middle Column (2 Spans on Desktop) */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                  {/* Two Charts Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppointmentsTrendChart getAppointmentsTrend={dashboardData.getAppointmentsTrend} />
                    <PatientGrowthChart getRevenueTrend={dashboardData.getRevenueTrend} />
                  </div>

                  {/* Recent Appointments Table */}
                  <RecentAppointmentsTable
                    recentAppointments={dashboardData.recentAppointments}
                    isLoading={dashboardData.isLoading}
                    onSelectSession={(session) => {
                      if (session) setSelectedAppointment(session);
                      setActiveTab('appointment-details');
                    }}
                    onViewAll={() => setActiveTab('schedule')}
                  />
                </div>

                {/* Right Column (1 Span on Desktop) */}
                <div className="space-y-6 sm:space-y-8">
                  {/* Today's Schedule Widget */}
                  <TodaysSchedule
                    todaysSchedule={dashboardData.todaysSchedule}
                    isLoading={dashboardData.isLoading}
                    onSelectAppointment={(item) => {
                      if (item) setSelectedAppointment(item);
                      setActiveTab('appointment-details');
                    }}
                    onNavigateToSchedule={() => setActiveTab('schedule')}
                  />

                  {/* Recent Patients Widget */}
                  <RecentPatientsWidget
                    onNavigateToPatients={() => setActiveTab('patients')}
                    onSelectPatient={(pt) => {
                      setSelectedPatient(pt);
                      setActiveTab('patient-profile');
                    }}
                  />

                  {/* Quick Actions Widget */}
                  <QuickActionsWidget
                    onAddPatient={() => setActiveTab('add-patient')}
                    onBookAppointment={() => setActiveTab('create-appointment')}
                    onAssignTherapist={() => setActiveTab('add-therapist')}
                    onCreateProgram={() => setActiveTab('create-program')}
                  />
                </div>
              </div>
            </div>

          ) : (
            /* Sub-tab view placeholder */
            <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xs text-center max-w-2xl mx-auto my-12 space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                {activeTab.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Detailed views and data management for {activeTab} will appear here. Return to the main dashboard anytime.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
      />

      {/* Real-Time Workflow Guide Modal */}
      <RealtimeGuideModal
        isOpen={isRealtimeGuideOpen}
        onClose={() => setIsRealtimeGuideOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
