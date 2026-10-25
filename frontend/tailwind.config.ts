import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import { tailwindTheme } from './src/theme/tokens'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: tailwindTheme.colors,
    extend: {
      fontFamily: tailwindTheme.fontFamily,
      borderRadius: tailwindTheme.borderRadius,
      boxShadow: tailwindTheme.boxShadow,
      borderColor: tailwindTheme.borderColor,
      ringColor: tailwindTheme.ringColor,
      ringOffsetColor: tailwindTheme.ringOffsetColor,
      spacing: tailwindTheme.spacing,
      screens: { wide: '1440px' },
    },
  },
  plugins: [animate],
} satisfies Config
