import type { Config } from 'tailwindcss'

/**
 * Design system KR Multimarcas.
 * Paleta oficial: ouro #FFD131, âmbar #F5A623, preto #0B0B0D.
 * Regra de contraste: fundo ouro SEMPRE com texto preto (nunca branco).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FFD131',
          50: '#FFFBEB',
          100: '#FFF4C7',
          200: '#FFE989',
          300: '#FFD131',
          400: '#F5C21A',
          500: '#F5A623',
          600: '#D98A0B',
        },
        amber: {
          brand: '#F5A623',
        },
        ink: {
          DEFAULT: '#0B0B0D',
          soft: '#151519',
          text: '#3A3A42',
          muted: '#8A8A95',
        },
        line: '#ECECEF',
        canvas: '#FAFAF8',
        success: '#12B76A',
        warning: '#F79009',
        danger: '#F04438',
        info: '#2E90FA',
      },
      fontFamily: {
        display: ['var(--font-sora)', 'Sora', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(11, 11, 13, 0.06)',
        card: '0 8px 28px rgba(11, 11, 13, 0.08)',
        gold: '0 8px 24px rgba(255, 209, 49, 0.35)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD131 0%, #F5A623 100%)',
        'ink-gradient': 'linear-gradient(160deg, #151519 0%, #0B0B0D 60%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .35s ease-out both',
        'slide-in': 'slide-in .25s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
