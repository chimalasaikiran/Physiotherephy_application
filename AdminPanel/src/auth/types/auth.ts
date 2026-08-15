export type AdminRole = 'superadmin' | 'admin' | 'clinical' | 'billing' | 'frontdesk' | 'auditor';

export type AdminModule =
  | 'dashboard'
  | 'users'
  | 'therapists'
  | 'appointments'
  | 'services'
  | 'payments'
  | 'reports'
  | 'schedules'
  | 'settings'
  | 'programs'
  | 'exercises'
  | 'analytics';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage';

export interface AdminProfile {
  uid: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  mustChangePassword: boolean;
  department?: string;
  phone?: string;
  createdAt?: string | number | any;
  lastLoginAt?: string | number | any;
}

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface AuthConfig {
  brandName: string;
  platformSubtitle: string;
  title: string;
  subtitle: string;
  systemStatusText: string;
  heroImageAlt: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberMeLabel: string;
  submitButtonText: string;
  dividerText: string;
  googleSignInText: string;
  footerLinks: FooterLink[];
}

/**
 * Role-Based Access Control (RBAC) Permission Matrix
 * Admin / Superadmin roles possess full access to all modules and operations.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Record<string, PermissionAction[]>> = {
  superadmin: { '*': ['manage'] },
  admin: { '*': ['manage'] },
  clinical: {
    dashboard: ['read'],
    therapists: ['read', 'update'],
    users: ['read', 'update'],
    appointments: ['read', 'create', 'update'],
    schedules: ['read', 'create', 'update'],
    programs: ['read', 'create', 'update', 'delete'],
    exercises: ['read', 'create', 'update'],
    reports: ['read'],
  },
  billing: {
    dashboard: ['read'],
    payments: ['read', 'create', 'update', 'delete'],
    reports: ['read'],
    users: ['read'],
    services: ['read'],
  },
  frontdesk: {
    dashboard: ['read'],
    appointments: ['read', 'create', 'update'],
    schedules: ['read', 'create', 'update'],
    users: ['read', 'create'],
    therapists: ['read'],
  },
  auditor: {
    dashboard: ['read'],
    reports: ['read'],
    analytics: ['read'],
    payments: ['read'],
    users: ['read'],
    therapists: ['read'],
  },
};
