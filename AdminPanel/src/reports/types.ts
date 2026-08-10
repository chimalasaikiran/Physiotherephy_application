export interface PinnedReport {
  id: string;
  title: string;
  category: string; // e.g., "Clinical", "Progress", "Financial"
  status: 'Ready' | 'Verified' | 'Draft' | 'Generating' | 'Scheduled';
  updatedAt: string; // e.g., "Oct 14, 2023 • Dr. Sarah Jenkins"
  author: string;
  iconType: 'document' | 'chart' | 'user';
}

export interface RecentReport {
  id: string;
  title: string;
  category: string; // e.g., "Assessment", "Clinical", "Patient Care"
  date: string; // e.g., "Oct 12, 2023"
  status?: 'Verified' | 'Needs Review' | 'Draft' | 'Pending';
  author: {
    name: string;
    avatarUrl: string;
  };
  iconType: 'document' | 'compliance' | 'vitals' | 'assessment';
}

export interface QuickTemplate {
  id: string;
  title: string;
  description: string;
  iconType: 'vitals' | 'scheduling' | 'insurance' | 'notes' | 'summary' | 'tracking';
}

export interface ScheduledRun {
  id: string;
  month: string; // "OCT"
  day: string; // "15"
  title: string;
  description: string;
  runsAt: string; // "RUNS AT 08:00 AM"
}

export interface RecentExportItem {
  id: string;
  fileName: string;
  fileSize: string; // "2.4 MB"
  timeAgo: string; // "5 mins ago"
  fileType: 'pdf' | 'excel' | 'csv';
}

export interface ReportMetric {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'neutral' | 'negative';
  subtext?: string;
  icon: string;
  progress?: number; // 0-100 for storage used
}

export interface DataArchiveItem {
  id: string;
  fileName: string;
  format: 'CSV' | 'PDF' | 'EXCEL' | 'ZIP';
  size: string;
  status: 'Completed' | 'Expiring Soon' | 'Processing' | 'Failed';
  dateCreated: string;
  downloadUrl?: string;
}


