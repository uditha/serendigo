const baseColors = {
  primary: '#E8832A',     // Temple Amber
  secondary: '#1A6B7A',   // Ocean Teal

  taste: '#B85C1A',       // Cinnamon
  wild: '#2D6E4E',        // Jungle
  move: '#1A5F8A',        // Indian Ocean
  roots: '#614A9E',       // Kandyan
  restore: '#5E8C6E',     // Ayurveda sage

  coinGold: '#C9920A',    // Antique gold
  error: '#C0392B',
} as const;

export const lightColors = {
  ...baseColors,
  surface: '#F7F0E3',
  surfaceWhite: '#FDFAF5',
  surfaceElevated: '#FFFFFF',
  border: '#E5DDD0',
  textPrimary: '#1A1A2E',
  textSecondary: '#5A5A7A',
  textTertiary: '#9A9AB0',
  success: '#2D6E4E',
  warning: '#B85C1A',
} as const;

export const darkColors = {
  ...baseColors,
  secondary: '#2A9AAD',   // Lighter teal for dark bg visibility
  surface: '#13111E',
  surfaceWhite: '#1E1B2E',
  surfaceElevated: '#252238',
  border: '#2A2740',
  textPrimary: '#F0EDE8',
  textSecondary: '#9896B5',
  textTertiary: '#5E5C78',
  coinGold: '#D4A012',    // Slightly brighter on dark
  success: '#3A8A63',
  warning: '#C9692A',
} as const;

// Static fallback — used for non-reactive contexts (e.g. module-level constants)
export const colors = lightColors;

export type AppColors = typeof lightColors;

export const fonts = {
  dmSerif: 'DMSerifDisplay_400Regular',
  spaceRegular: 'SpaceGrotesk_400Regular',
  spaceMedium: 'SpaceGrotesk_500Medium',
  spaceSemiBold: 'SpaceGrotesk_600SemiBold',
  spaceBold: 'SpaceGrotesk_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.dmSerif, fontSize: 40 },
  h1: { fontFamily: fonts.dmSerif, fontSize: 28 },
  h2: { fontFamily: fonts.spaceSemiBold, fontSize: 22 },
  h3: { fontFamily: fonts.spaceSemiBold, fontSize: 18 },
  body: { fontFamily: fonts.spaceRegular, fontSize: 16 },
  caption: { fontFamily: fonts.spaceRegular, fontSize: 13 },
  label: { fontFamily: fonts.spaceMedium, fontSize: 11, textTransform: 'uppercase' as const },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
