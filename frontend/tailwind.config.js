/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5fe',
          100: '#d1ebfd',
          200: '#a4d7fb',
          300: '#76c2f9',
          400: '#48aef7',
          500: '#0A94F5',
          600: '#0882db',
          700: '#0670c1',
          800: '#045ea7',
          900: '#034c8d',
          DEFAULT: '#0A94F5',
        },
        patina: {
          primary: 'rgb(var(--patina-primary) / <alpha-value>)',
          secondary: 'rgb(var(--patina-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--patina-tertiary) / <alpha-value>)',
          neutral: 'rgb(var(--patina-neutral) / <alpha-value>)',
          surface: 'rgb(var(--patina-surface) / <alpha-value>)',
          'on-surface': 'rgb(var(--patina-on-surface) / <alpha-value>)',
          error: 'rgb(var(--patina-error) / <alpha-value>)',
          muted: 'rgb(var(--patina-muted) / <alpha-value>)',
          border: 'rgb(var(--patina-border) / <alpha-value>)',
          elevated: 'rgb(var(--patina-elevated) / <alpha-value>)',
        },
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        sans: ['"General Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'patina-sm': '12px',
        'patina-md': '22px',
        'patina-lg': '30px',
      },
    },
  },
  plugins: [],
}
