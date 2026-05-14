import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          light: '#15243C',
          dark: '#060E1A',
        },
        gold: {
          DEFAULT: '#C9973A',
          light: '#E8D5A3',
          pale: '#F8E9C2',
          dark: '#A07828',
        },
        slate: {
          text: '#CBD5E8',
          muted: '#5A6B85',
          subtle: '#3A4D65',
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", 'serif'],
        sans: ["'DM Sans'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
