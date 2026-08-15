import type {
  PinnedReport,
  RecentReport,
  QuickTemplate,
  ScheduledRun,
  RecentExportItem,
  DataArchiveItem,
} from './types';


export const mockPinnedReports: PinnedReport[] = [];

export const mockRecentReports: RecentReport[] = [];

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

export const mockScheduledRuns: ScheduledRun[] = [];

export const mockRecentExports: RecentExportItem[] = [];

export const mockDataArchiveItems: DataArchiveItem[] = [];


