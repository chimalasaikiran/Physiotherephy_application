export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14.9,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 42,

  // Layout Ratios
  heroHeightRatio: 0.58, // ~58-60% top section height
  contentHeightRatio: 0.42,

  // Component specific spacing
  buttonHeight: 56,
  buttonRadius: 24,
  logoBadgeSize: 24,
  logoBadgeRadius: 6,
  iconSize: 14,
  homeIndicatorWidth: 128,
  homeIndicatorHeight: 4,

  // Wheel Picker Configuration
  wheelItemHeight: 44,
  wheelVisibleItems: 3,

  // Measurement Dynamic Ranges
  heightRange: {
    min: 100,
    max: 250,
    defaultVal: 175,
  },
  weightRange: {
    min: 30,
    max: 200,
    defaultVal: 68,
  },
} as const;

export type SpacingType = typeof Spacing;
