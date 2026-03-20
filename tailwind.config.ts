import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#1B2A4A',
        'primary-accent': '#0EA5E9',
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
      },
      backgroundColor: {
        'primary': '#F8FAFC',
        'card': '#FFFFFF',
      },
      textColor: {
        'primary': '#1E293B',
        'secondary': '#64748B',
      }
    },
  },
  plugins: [],
}
export default config