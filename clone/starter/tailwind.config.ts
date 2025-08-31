import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.1)',
        md: '0 2px 6px rgba(0,0,0,0.15)',
        lg: '0 4px 12px rgba(0,0,0,0.2)',
        xl: '0 8px 24px rgba(0,0,0,0.25)',
      },
      spacing: {
        '1.5': '6px',
        '3.5': '14px',
      },
    },
  },
  plugins: [],
};

export default config;


