/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2874F0',
          secondary: '#111827',
          accent: '#FB641B',
          'accent-hover': '#F0570F',
          surface: '#FFFFFF',
          background: '#F1F3F6',
          'text-primary': '#212121',
          'text-secondary': '#64748B',
          border: '#E0E0E0',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        primary: {
          DEFAULT: "#0F172A",
          50: "#f8fafc",
          100: "#f1f5f9",
          600: "#475569",
          900: "#0f172a",
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        neutral: {
          surface: "#ffffff",
          border: "#e2e8f0",
          text: {
            main: "#0F172A",
            sub: "#475569",
          }
        },
        background: {
          light: "#F8FAFC",
          dark: "#0F172A",
        },
        accent: {
          success: "#10B981",
          recording: "#ef4444",
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Inter Tight"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'hero-mobile': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'section': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'section-mobile': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      spacing: {
        'section-desktop': '120px',
        'section-tablet': '80px',
        'section-mobile': '64px',
        'container': '1440px',
      },
      maxWidth: {
        'container': '1440px',
      },
      borderRadius: {
        'card': '24px',
        'card-sm': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.08)',
        'nav': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'nav-scroll': '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glass-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'glow': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-accent': '0 0 30px rgba(16, 185, 129, 0.15)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
        'hero-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F0FDF4 100%)',
        'accent-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('lightswind/plugin'),],
}