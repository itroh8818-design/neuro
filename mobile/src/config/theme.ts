/**
 * NER NeuroSmriti Design Theme
 * Optimized for elderly users with dementia
 * High contrast, large touch targets, warm culturally-familiar colors
 */

export const colors = {
  // Primary palette — warm, NER-inspired
  primary: '#2E7D32',        // Forest green (NER tea gardens)
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',

  // Accent — warm gold (Bihu/ Hornbill festival)
  accent: '#FF8F00',
  accentLight: '#FFB300',
  accentDark: '#E65100',

  // Backgrounds
  background: '#FFF8E1',     // Warm cream
  backgroundDark: '#1A1A2E', // Dark mode
  surface: '#FFFFFF',
  surfaceDark: '#16213E',

  // Text — high contrast
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textLight: '#FFFFFF',
  textOnAccent: '#1A1A1A',

  // Semantic
  success: '#2E7D32',
  warning: '#F57F17',
  error: '#C62828',
  info: '#1565C0',

  // Game-specific
  correct: '#2E7D32',
  incorrect: '#C62828',
  cardBack: '#5C6BC0',
  cardFlip: '#FFFFFF',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
};

export const fonts = {
  // Elderly-friendly minimum 20px
  xs: 18,
  sm: 20,
  md: 24,
  lg: 30,
  xl: 36,
  xxl: 44,
  hero: 56,

  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Minimum touch target size for elderly users (60px)
export const touchTarget = {
  minimum: 60,
  recommended: 72,
  large: 88,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors,
  fonts,
  spacing,
  borderRadius,
  touchTarget,
  shadows,
};

export type Theme = typeof theme;
export default theme;
