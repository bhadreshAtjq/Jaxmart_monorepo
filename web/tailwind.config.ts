import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-raleway)', 'Raleway', 'system-ui', 'sans-serif'],
        body: ['var(--font-source)', 'Source Sans 3', 'system-ui', 'sans-serif'],
        sans: ['var(--font-source)', 'Source Sans 3', 'system-ui', 'sans-serif'],
      },
      colors: {
        jax: {
          dark: '#061E29',
          blue: '#1D546D',
          teal: '#5F9598',
          light: '#F3F4F4',
        },
        brand: {
          50:  '#EDF5F8',
          100: '#D4E8EF',
          200: '#A8D0DE',
          300: '#7DB8CD',
          400: '#5F9598',
          500: '#1D546D',
          600: '#174761',
          700: '#123A4F',
          800: '#0C2D3E',
          900: '#061E29',
        },
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(6,30,41,0.06), 0 1px 2px 0 rgba(6,30,41,0.04)',
        'card-hover': '0 4px 12px 0 rgba(6,30,41,0.08), 0 2px 4px 0 rgba(6,30,41,0.04)',
        btn: '0 1px 2px 0 rgba(6,30,41,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
