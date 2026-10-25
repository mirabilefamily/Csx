// Goorin design tokens. Single source for Tailwind config, charts and the styleguide.
export const palette = {
  background: '#FAF8F5',
  surface: { DEFAULT: '#FFFFFF', muted: '#F4F0EA', sunken: '#F7F4EF' },
  ink: { DEFAULT: '#1F1D1A', muted: '#5F574E', subtle: '#736A60' },
  border: { DEFAULT: '#E6E0D7', strong: '#D3CABD' },
  ring: '#8C6A35',
  tobacco: { 50: '#F6F1EC', 100: '#EBE0D5', 200: '#D7C2AF', 300: '#BB9D84', 500: '#86664F', 600: '#6B4F3A', 700: '#58412F', 800: '#433124', 900: '#2E2219' },
  brass: { 50: '#F9F4EA', 100: '#F1E6CF', 200: '#E3CDA2', 300: '#D2B47E', 400: '#C4A574', 500: '#B08D57', 600: '#8C6A35', 700: '#6E5426' },
  green: { 50: '#EFF5EE', 100: '#DCEAD9', 400: '#7FA383', 500: '#5E8A63', 600: '#3F6B47', 700: '#2F5A37' },
  amber: { 50: '#FEF5E4', 100: '#FCE7BF', 300: '#F5C266', 400: '#F0A830', 500: '#D98F12', 700: '#8A5A00', 900: '#3B2600' },
  red: { 50: '#FBEFEC', 100: '#F6DAD3', 400: '#C9735F', 500: '#B5654A', 600: '#A23B2C', 700: '#86301F' },
  slate: { 50: '#EFF1F3', 100: '#E2E7EA', 300: '#AEB8BF', 500: '#6F7E89', 600: '#4E5B66', 700: '#3E4A54' },
} as const

export const fonts = {
  display: ["var(--font-title, 'Inter Variable')", 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
  sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
}

export const radius = { none: '0', sm: '6px', md: '8px', DEFAULT: '10px', lg: '10px', xl: '14px', '2xl': '18px', full: '9999px' }

export const SPACING_UNIT = 8

export const shadows = {
  card: '0 1px 2px rgba(31, 29, 26, 0.04)',
  popover: '0 12px 32px -8px rgba(31, 29, 26, 0.18), 0 2px 6px rgba(31, 29, 26, 0.06)',
  none: 'none',
}

export const chartColors = {
  email: palette.tobacco[600],
  chat: palette.brass[500],
  claude: palette.brass[500],
  grokbot: palette.slate[500],
  human: palette.tobacco[600],
  escalation: palette.red[500],
  tags: palette.tobacco[500],
  trend: palette.tobacco[600],
  grid: palette.border.DEFAULT,
  axis: palette.ink.muted,
  scores: [palette.red[600], palette.red[400], palette.brass[400], palette.green[400], palette.green[600]],
}

export const tailwindTheme = {
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    white: '#FFFFFF',
    black: '#000000',
    ...palette,
  },
  fontFamily: fonts,
  borderRadius: radius,
  boxShadow: shadows,
  borderColor: { DEFAULT: palette.border.DEFAULT },
  ringColor: { DEFAULT: palette.ring },
  ringOffsetColor: { DEFAULT: palette.background },
  spacing: { unit: `${SPACING_UNIT}px` },
}
