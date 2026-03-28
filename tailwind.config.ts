import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // CLAUDE.md defined colors (preserve existing)
      colors: {
        'primary-dark': '#1B2A4A',
        'primary-accent': '#0EA5E9',
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        // Bloomberg Terminal professional colors
        bloomberg: {
          black: '#0A0A0B',
          darkGrey: '#1A1A1B',
          mediumGrey: '#2A2A2B',
          lightGrey: '#3A3A3B',
          orange: '#FF6B1A',
          green: '#00C896',
          amber: '#FFB800',
          red: '#FF4757',
          blue: '#0EA5E9',
          purple: '#8B5CF6'
        }
      },
      backgroundColor: {
        // CLAUDE.md defined backgrounds (preserve existing)
        'primary': '#F8FAFC',
        'card': '#FFFFFF',
        // Bloomberg Terminal backgrounds
        'terminal': {
          primary: '#0A0A0B',
          secondary: '#1A1A1B',
          light: '#F8F9FA',
          white: '#FFFFFF'
        }
      },
      textColor: {
        // CLAUDE.md defined text colors (preserve existing)
        'primary': '#1E293B',
        'secondary': '#64748B',
        // Bloomberg Terminal text colors
        'terminal': {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          tertiary: '#808080',
          inverse: '#1E293B',
          inverseSecondary: '#64748B'
        }
      },
      // Bloomberg Terminal typography
      fontFamily: {
        'bloomberg-interface': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'bloomberg-financial': ['"SF Mono"', '"Monaco"', '"Inconsolata"', '"Roboto Mono"', 'monospace'],
        'bloomberg-brand': ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      fontSize: {
        'bloomberg-xs': ['11px', { lineHeight: '1.2' }],
        'bloomberg-sm': ['12px', { lineHeight: '1.2' }],
        'bloomberg-md': ['14px', { lineHeight: '1.5' }],
        'bloomberg-lg': ['16px', { lineHeight: '1.5' }],
        'bloomberg-xl': ['18px', { lineHeight: '1.5' }]
      },
      spacing: {
        // Terminal-specific spacing for data-dense layouts
        'terminal-xs': '2px',
        'terminal-sm': '4px',
        'terminal-md': '8px',
        'terminal-lg': '12px',
        'terminal-xl': '16px'
      },
      borderWidth: {
        // Terminal-style thin borders
        'terminal': '0.5px'
      },
      boxShadow: {
        // Bloomberg Terminal glow effects
        'terminal': '0 0 20px rgba(255, 107, 26, 0.1)',
        'terminal-glow': '0 0 10px rgba(255, 107, 26, 0.2)'
      },
      animation: {
        // Market data animations
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      screens: {
        // Bloomberg Terminal breakpoints for trading desk displays
        '3xl': '1920px',
        '4xl': '2560px'
      }
    },
  },
  plugins: [],
}
export default config