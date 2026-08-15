import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

export interface TherapistAvatarProps {
  name?: string;
  avatarUrl?: string;
  imageName?: string;
  size?: number;
  avatarBg?: string;
  style?: StyleProp<ViewStyle>;
}

// Background color options for Initials Avatars
const AVATAR_PALETTE = [
  { bg: '#E0E7FF', text: '#3730A3' }, // Indigo
  { bg: '#F3E8FF', text: '#6B21A8' }, // Purple
  { bg: '#DCFCE7', text: '#15803D' }, // Green
  { bg: '#FEF3C7', text: '#92400E' }, // Amber
  { bg: '#E0F2FE', text: '#0369A1' }, // Sky
  { bg: '#FEE2E2', text: '#B91C1C' }, // Rose
  { bg: '#FCE7F3', text: '#BE185D' }, // Pink
  { bg: '#CCFBF1', text: '#0F766E' }, // Teal
];

/**
 * Extract doctor initials from doctor name (e.g., "Dr. Ananya Iyer" -> "AI")
 */
export const getInitials = (name?: string): string => {
  if (!name || typeof name !== 'string') return 'DR';

  // Remove prefixes like "Dr.", "Dr ", "Prof.", "Mr.", "Mrs.", "Ms."
  const cleanName = name
    .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, '')
    .trim();

  if (!cleanName) return 'DR';

  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Get a deterministic palette based on doctor's name string
 */
export const getAvatarColors = (name?: string, customBg?: string) => {
  if (customBg) {
    return { bg: customBg, text: '#003D9B' };
  }
  const str = name || 'Doctor';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
};

/**
 * Local image mapping fallback for static doctors
 */
const getLocalImageSource = (imageName?: string): ImageSourcePropType | null => {
  switch (imageName) {
    case 'doctor_ananya':
      return require('../assets/images/doctor_ananya.png');
    case 'care_team_doctor':
      return require('../assets/images/care_team_doctor.png');
    case 'doctor_arjun':
      return require('../assets/images/doctor_arjun.png');
    default:
      return null;
  }
};

export const TherapistAvatar: React.FC<TherapistAvatarProps> = ({
  name,
  avatarUrl,
  imageName,
  size = 60,
  avatarBg,
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  const localSource = getLocalImageSource(imageName);
  const remoteSource = avatarUrl && avatarUrl.startsWith('http') ? { uri: avatarUrl } : null;

  const activeSource = !imageError ? (remoteSource || localSource) : null;
  const colors = getAvatarColors(name, avatarBg);
  const initials = getInitials(name);

  const borderRadius = size / 2;
  const fontSize = Math.max(12, Math.round(size * 0.38));

  if (activeSource) {
    return (
      <View style={[{ width: size, height: size, borderRadius, overflow: 'hidden' }, style]}>
        <Image
          source={activeSource}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.initialsContainer,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: colors.bg,
        },
        style,
      ]}
    >
      <Text style={[styles.initialsText, { fontSize, color: colors.text }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  initialsText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default TherapistAvatar;
