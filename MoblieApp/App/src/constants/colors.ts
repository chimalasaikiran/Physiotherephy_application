export const Colors = {
  // Brand Colors
  primary: '#003D9B',
  primaryDark: '#002B70',
  primaryLight: '#2563EB',

  // Neutral / Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textDisabled: '#737685',
  darkBlue: '#051A3E',
  white: '#FFFFFF',
  black: '#000000',

  // Background Colors
  background: '#FFFFFF',
  backgroundGradientBottom: '#F0FDFA',
  overlayDark: 'rgba(0, 0, 0, 0.4)',
  overlayGradientStart: 'rgba(0, 0, 0, 0.55)',
  overlayGradientEnd: 'rgba(0, 0, 0, 0)',

  // Input & Border Colors
  inputBackground: '#F8FAFC',
  otpInputBackground: 'rgba(255, 255, 255, 0.5)',
  inputBorder: 'rgba(0, 0, 0, 0.08)',
  inputBorderFocused: '#003D9B',
  otpInputBorderDefault: '#C3C6D6',
  otpInputBorderActive: '#2563EB',
  divider: 'rgba(195, 198, 214, 0.4)',
  placeholderText: 'rgba(115, 118, 133, 0.6)',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  cardBackground: '#F8FAFC',

  // Card & Profile Colors
  cardBorder: '#EEF2F6',
  cardBackgroundLight: '#F8FAFC',
  selectedCardBackground: '#EEF2FF',
  selectedCardBorder: '#003D9B',
  avatarBackground: '#E0E7FF',
  genderSelectedBg: '#003D9B',
  genderUnselectedBg: '#F1F5F9',
  genderUnselectedText: '#475569',
  badgeBg: '#F1F5F9',
  badgeIconBg: '#EFF6FF',
  shadow: 'rgba(0, 61, 155, 0.25)',
  shadowTeal: 'rgba(20, 184, 166, 0.2)',
  shadowBlue: 'rgba(37, 99, 235, 0.35)',
  homeIndicator: 'rgba(0, 0, 0, 0.1)',
  enablePillBg: '#EFF6FF',
  enablePillText: '#2563EB',
  enabledPillBg: '#DCFCE7',
  enabledPillText: '#166534',

  // Explore & Dashboard Colors
  starRating: '#F59E0B',
  searchBackground: '#F1F5F9',
  searchBorder: '#E2E8F0',
  chipActiveBg: '#003D9B',
  chipActiveText: '#FFFFFF',
  chipInactiveBg: '#F1F5F9',
  chipInactiveText: '#475569',
  bottomNavBackground: '#FFFFFF',
  bottomNavBorder: '#E2E8F0',
  bottomNavActive: '#003D9B',
  bottomNavInactive: '#94A3B8',
  statsCardBg: '#F0F9FF',
  statsCardBorder: '#BAE6FD',
  statsAccent: '#0284C7',
  skeletonBase: '#E2E8F0',
  skeletonHighlight: '#F1F5F9',
  notificationBadge: '#EF4444',
  successGreen: '#10B981',
} as const;

export type ColorsType = typeof Colors;

