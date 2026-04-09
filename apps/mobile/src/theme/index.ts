export const colors = {
  // Primary
  primary: '#E8832A',        // Temple Amber
  secondary: '#1A6B7A',      // Ocean Teal

  // Surfaces
  surface: '#F7F0E3',        // Coconut Cream (main bg)
  surfaceWhite: '#FDFAF5',   // Warm White (cards)
  backgroundDark: '#1C1A2E', // Night (dark mode)
  border: '#E5E5E0',          // Subtle border

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#5A5A7A',
  textTertiary: '#9A9AB0',

  // World Colors
  taste: '#E67E22',
  wild: '#27AE60',
  move: '#2980B9',
  roots: '#8E44AD',
  restore: '#F39C12',

  // Gamification
  coinGold: '#F1C40F',
  success: '#27AE60',
  warning: '#E67E22',
  error: '#E74C3C',
} as const;

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
