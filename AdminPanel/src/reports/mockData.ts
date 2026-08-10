import type {
  PinnedReport,
  RecentReport,
  QuickTemplate,
  ScheduledRun,
  RecentExportItem,
  DataArchiveItem,
} from './types';


export const mockPinnedReports: PinnedReport[] = [
  {
    id: 'pin-1',
    title: 'Initial Assessment - Sanya Malhotra',
    category: 'Clinical',
    status: 'Verified',
    updatedAt: 'Oct 14, 2023 • Dr. Sarah Jenkins',
    author: 'Dr. Sarah Jenkins',
    iconType: 'user',
  },
  {
    id: 'pin-2',
    title: 'Monthly Progress - Arjun Reddy',
    category: 'Progress',
    status: 'Draft',
    updatedAt: 'Oct 13, 2023 • Mark Thompson',
    author: 'Mark Thompson',
    iconType: 'chart',
  },
];

export const mockRecentReports: RecentReport[] = [
  {
    id: 'rec-1',
    title: 'Post-Op Clearance - Marcus Kane',
    category: 'Assessment',
    date: 'Oct 12, 2023',
    status: 'Verified',
    author: {
      name: 'Dr. Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    },
    iconType: 'assessment',
  },
  {
    id: 'rec-2',
    title: 'Neurological Baseline - Emma Wilson',
    category: 'Clinical',
    date: 'Oct 10, 2023',
    status: 'Needs Review',
    author: {
      name: 'Mark Thompson',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    },
    iconType: 'vitals',
  },
  {
    id: 'rec-3',
    title: 'Patient Outcome Tracking - Oct 2023',
    category: 'Patient Care',
    date: 'Oct 08, 2023',
    status: 'Verified',
    author: {
      name: 'Dr. Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813566-7885a3964478?auto=format&fit=crop&q=80&w=150',
    },
    iconType: 'document',
  },
];

export const mockQuickTemplates: QuickTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Daily Session Note',
    description: 'Standard SOAP note template',
    iconType: 'notes',
  },
  {
    id: 'tpl-2',
    title: 'Clinical Discharge Summary',
    description: 'Final assessment & recommendations',
    iconType: 'summary',
  },
  {
    id: 'tpl-3',
    title: 'Functional Goal Tracking',
    description: 'Measure patient progress metrics',
    iconType: 'tracking',
  },
];

export const mockScheduledRuns: ScheduledRun[] = [
  {
    id: 'sch-1',
    month: 'OCT',
    day: '15',
    title: 'Weekly Compliance Audit',
    description: 'Automatically sends to Board',
    runsAt: 'RUNS AT 08:00 AM',
  },
  {
    id: 'sch-2',
    month: 'OCT',
    day: '18',
    title: 'Bi-Weekly Finance Sync',
    description: 'Internal reconciliation export',
    runsAt: 'RUNS AT 11:30 PM',
  },
];

export const mockRecentExports: RecentExportItem[] = [
  {
    id: 'exp-1',
    fileName: 'Patient_List_V2.pdf',
    fileSize: '2.4 MB',
    timeAgo: '5 mins ago',
    fileType: 'pdf',
  },
  {
    id: 'exp-2',
    fileName: 'Financial_Summary.xlsx',
    fileSize: '1.1 MB',
    timeAgo: '2 hrs ago',
    fileType: 'excel',
  },
  {
    id: 'exp-3',
    fileName: 'Recovery_Stats.pdf',
    fileSize: '4.8 MB',
    timeAgo: 'Yesterday',
    fileType: 'pdf',
  },
];

export const mockDataArchiveItems: DataArchiveItem[] = [
  {
    id: 'arch-1',
    fileName: 'Q3_Revenue_Final.csv',
    format: 'CSV',
    size: '2.4 MB',
    status: 'Completed',
    dateCreated: 'Oct 12, 2023',
  },
  {
    id: 'arch-2',
    fileName: 'Patient_Outcome_Tracking_Oct.pdf',
    format: 'PDF',
    size: '5.1 MB',
    status: 'Expiring Soon',
    dateCreated: 'Oct 11, 2023',
  },
  {
    id: 'arch-3',
    fileName: 'Clinic_Efficiency_Report_2023.xlsx',
    format: 'EXCEL',
    size: '1.8 MB',
    status: 'Processing',
    dateCreated: 'Oct 14, 2023',
  },
  {
    id: 'arch-4',
    fileName: 'Staff_Allocation_Summary_v2.csv',
    format: 'CSV',
    size: '842 KB',
    status: 'Completed',
    dateCreated: 'Oct 09, 2023',
  },
  {
    id: 'arch-5',
    fileName: 'Therapist_Performance_Metrics_Q3.pdf',
    format: 'PDF',
    size: '3.2 MB',
    status: 'Completed',
    dateCreated: 'Oct 05, 2023',
  },
  {
    id: 'arch-6',
    fileName: 'Annual_Patient_Demographics_2023.csv',
    format: 'CSV',
    size: '1.2 MB',
    status: 'Completed',
    dateCreated: 'Sep 28, 2023',
  },
];


