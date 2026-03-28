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
      // Bloomberg Terminal typography - strict two-font system
      fontFamily: {
        // Sans-serif for ALL labels, headings, body copy, descriptions, navigation
        'sans': ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'bloomberg-interface': ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'bloomberg-brand': ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // Monospace for ALL data, prices, metrics, numerical values, command bar
        'mono': ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        'bloomberg-financial': ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace']
      },
      fontSize: {
        // Bloomberg Terminal tight, controlled font sizes
        'bloomberg-xs': ['10px', { lineHeight: '1.2', letterSpacing: '0.8px' }], // Section labels (uppercase)
        'bloomberg-sm': ['11px', { lineHeight: '1.3' }], // Smallest text (timestamps, hints)
        'bloomberg-md': ['12px', { lineHeight: '1.4' }], // Navigation, body text, descriptions, card titles
        'bloomberg-lg': ['16px', { lineHeight: '1.3' }], // Metric values (monospace)
        'bloomberg-xl': ['18px', { lineHeight: '1.3' }], // Page headings (max), large metrics
        // NO sizes above 18px - Bloomberg terminals don't have hero sections
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