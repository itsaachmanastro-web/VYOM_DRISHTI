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
        scientific: {
          canvas: '#F8FAFC',
          surface: '#FFFFFF',
          subtle: '#F1F5F9',
          border: '#E2E8F0',
          darkBorder: '#334155',
          navy: '#0B132B',
          slate: '#1E293B',
          primary: '#2563EB',
          accent: '#0284C7',
          teal: '#0D9488',
          success: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
        },
        space: {
          950: '#080D1A',
          900: '#0F172A',
          850: '#15203B',
          800: '#1E293B',
          750: '#26344E',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        cyan: {
          glow: '#00E5FF',
          mission: '#00B4D8',
          dark: '#0077B6',
        },
        telemetry: {
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          blue: '#38BDF8',
          purple: '#818CF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Consolas', 'monospace'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'scientific': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'scientific-md': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'scientific-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 20px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
