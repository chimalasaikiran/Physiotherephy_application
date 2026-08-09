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
  forgotPasswordText: string;
  forgotPasswordHref: string;
  submitButtonText: string;
  dividerText: string;
  googleSignInText: string;
  footerLinks: FooterLink[];
}
