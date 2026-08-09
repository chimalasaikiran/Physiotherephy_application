export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]; // India (+91)

/**
 * Attempts to detect default country based on user's device system timezone.
 * Falls back to DEFAULT_COUNTRY (India) if detection is unavailable.
 */
export function getDefaultCountry(): Country {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.startsWith('Asia/Colombo')) {
        return COUNTRIES.find((c) => c.code === 'IN') || DEFAULT_COUNTRY;
      }
      if (timeZone.startsWith('America/')) {
        return COUNTRIES.find((c) => c.code === 'US') || DEFAULT_COUNTRY;
      }
      if (timeZone.startsWith('Europe/London')) {
        return COUNTRIES.find((c) => c.code === 'GB') || DEFAULT_COUNTRY;
      }
      if (timeZone.startsWith('Australia/')) {
        return COUNTRIES.find((c) => c.code === 'AU') || DEFAULT_COUNTRY;
      }
      if (timeZone.startsWith('Asia/Singapore')) {
        return COUNTRIES.find((c) => c.code === 'SG') || DEFAULT_COUNTRY;
      }
      if (timeZone.startsWith('Asia/Dubai')) {
        return COUNTRIES.find((c) => c.code === 'AE') || DEFAULT_COUNTRY;
      }
      if (timeZone.startsWith('Asia/Tokyo')) {
        return COUNTRIES.find((c) => c.code === 'JP') || DEFAULT_COUNTRY;
      }
    }
  } catch (error) {
    // Silent fallback
  }
  return DEFAULT_COUNTRY;
}
