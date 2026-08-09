export const Typography = {
  fontFamily: {
    regular: 'System', // Falls back seamlessly if custom Inter font is loaded later
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 15,
    lg: 18,
    xl: 24,
    title: 30,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24.38,
    lg: 28,
    title: 37.5,
    secondaryLink: 22.5,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  letterSpacing: {
    tight: -0.375, // -0.025em * 15px
    tighter: -0.75, // -0.025em * 30px
    normal: 0,
  },
} as const;

export type TypographyType = typeof Typography;
