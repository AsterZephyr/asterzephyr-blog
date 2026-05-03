/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Raleway', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      colors: {
        surface: '#ffffff',
        'surface-alt': '#faf8f5',
        heading: '#1a1a1a',
        body: '#3d3d3d',
        accent: '#b45309',
        'accent-light': '#d97706',
        'accent-glow': '#fbbf24',
        'accent-bg': '#fffbeb',
        muted: '#8a8a8a',
        border: '#e8e4de',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
