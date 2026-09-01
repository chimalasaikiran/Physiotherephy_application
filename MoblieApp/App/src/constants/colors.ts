export const Colors = {
  // Brand Colors
  primary: '#0F52BA',
  primaryDark: '#0A3B87',
  primaryLight: '#2563EB',
  accentTeal: '#0D9488',
  accentCyan: '#06B6D4',
  accentEmerald: '#10B981',

  // Neutral / Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textDisabled: '#CBD5E1',
  darkBlue: '#0B192C',
  white: '#FFFFFF',
  black: '#000000',

  // Background Colors
  background: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  backgroundGradientBottom: '#F0FDFA',
  overlayDark: 'rgba(15, 23, 42, 0.45)',
  overlayGradientStart: 'rgba(15, 23, 42, 0.65)',
  overlayGradientEnd: 'rgba(0, 0, 0, 0)',

  // Input & Border Colors
  inputBackground: '#FFFFFF',
  otpInputBackground: 'rgba(255, 255, 255, 0.7)',
  inputBorder: '#E2E8F0',
  inputBorderFocused: '#0F52BA',
  otpInputBorderDefault: '#CBD5E1',
  otpInputBorderActive: '#0F52BA',
  divider: '#E2E8F0',
  placeholderText: '#94A3B8',
  modalOverlay: 'rgba(15, 23, 42, 0.5)',
  cardBackground: '#FFFFFF',

  // Card & Profile Colors
  cardBorder: '#E2E8F0',
  cardBackgroundLight: '#F8FAFC',
  selectedCardBackground: '#EFF6FF',
  selectedCardBorder: '#0F52BA',
  avatarBackground: '#DBEAFE',
  genderSelectedBg: '#0F52BA',
  genderUnselectedBg: '#F1F5F9',
  genderUnselectedText: '#475569',
  badgeBg: '#F1F5F9',
  badgeIconBg: '#EFF6FF',
  shadow: 'rgba(15, 82, 186, 0.12)',
  shadowTeal: 'rgba(13, 148, 136, 0.15)',
  shadowBlue: 'rgba(15, 82, 186, 0.18)',
  homeIndicator: 'rgba(15, 23, 42, 0.1)',
  enablePillBg: '#EFF6FF',
  enablePillText: '#0F52BA',
  enabledPillBg: '#DCFCE7',
  enabledPillText: '#15803D',

  // Explore & Dashboard Colors
  starRating: '#F59E0B',
  searchBackground: '#F1F5F9',
  searchBorder: '#E2E8F0',
  chipActiveBg: '#0F52BA',
  chipActiveText: '#FFFFFF',
  chipInactiveBg: '#F1F5F9',
  chipInactiveText: '#475569',
  bottomNavBackground: '#FFFFFF',
  bottomNavBorder: '#E2E8F0',
  bottomNavActive: '#0F52BA',
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


