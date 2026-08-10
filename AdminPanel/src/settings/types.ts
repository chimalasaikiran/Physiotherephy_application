export interface ClinicProfile {
  name: string;
  primaryContact: string;
  address: string;
  phone?: string;
  website?: string;
}

export interface BusinessHours {
  monFri: string;
  saturday: string;
  sunday: string;
}

export interface SubscriptionInfo {
  plan: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  usagePercent: number;
  renewalDate: string;
}

export interface ActivityLogItem {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: string;
  type: 'branding' | 'user' | 'security' | 'system';
}

export interface PendingInvite {
  id: string;
  name: string;
  role: string;
  initials: string;
  expiresIn: string;
}
