/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#080D18',
          primary: '#0B1120',
          secondary: '#0F172A',
        },
        surface: {
          DEFAULT: '#111827',
          raised: '#151E30',
          overlay: '#182235',
        },
        border: {
          subtle: '#1E2D42',
          DEFAULT: '#243047',
          strong: '#2A3650',
        },
        risk: {
          low: '#22C55E',
          medium: '#F59E0B',
          high: '#F97316',
          critical: '#EF4444',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
          disabled: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs: ['11px', '16px'],
        sm: ['12px', '18px'],
        base: ['13px', '20px'],
        md: ['14px', '22px'],
        lg: ['16px', '24px'],
        xl: ['18px', '28px'],
        '2xl': ['20px', '32px'],
        '3xl': ['24px', '36px'],
      },
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.4)',
        DEFAULT: '0 1px 4px rgba(0,0,0,0.5)',
        md: '0 2px 8px rgba(0,0,0,0.5)',
        lg: '0 4px 16px rgba(0,0,0,0.6)',
        panel: 'inset 0 0 0 1px #243047',
      },
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        fast: '100ms',
        normal: '200ms',
      },
    },
  },
  plugins: [],
}
