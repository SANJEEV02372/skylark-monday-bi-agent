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
        saas: {
          bg: '#09090B',
          card: '#121215',
          cardHover: '#18181C',
          border: '#27272A',
          borderHover: '#3F3F46',
          muted: '#71717A',
          text: '#FAFAFA',
          subtext: '#A1A1AA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'saas-card': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'saas-glow': '0 0 30px -5px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
