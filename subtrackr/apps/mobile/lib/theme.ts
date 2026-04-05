export const colors = {
  dark: {
    dominant: '#0F172A',
    secondary: '#1E293B',
    accent: '#22C55E',
    destructive: '#EF4444',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    surfaceElevated: '#334155',
  },
  light: {
    dominant: '#F8FAFC',
    secondary: '#FFFFFF',
    accent: '#16A34A',
    destructive: '#DC2626',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    surfaceElevated: '#E2E8F0',
  },
}

export const typography = {
  display: { fontSize: 32, fontWeight: '600' as const, lineHeight: 38.4 },
  heading: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  label: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18.2 },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
}
