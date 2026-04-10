import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './mock/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1D9E75',
          50: '#e8f7f2',
          100: '#c3ebdc',
          200: '#9adec5',
          300: '#6fd1ad',
          400: '#45c596',
          500: '#1D9E75',
          600: '#187f5e',
          700: '#126047',
          800: '#0c4130',
          900: '#062219',
        },
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
