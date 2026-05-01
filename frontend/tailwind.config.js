// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   darkMode: "class", 
//   theme: {
//     extend: {
//       colors: {
//         indigo: {
//           50: '#eef2ff',
//           100: '#e0e7ff',
//           200: '#c7d2fe',
//           300: '#a5b4fc',
//           400: '#818cf8',
//           500: '#6366f1',
//           600: '#4f46e5',
//           700: '#4338ca',
//           800: '#3730a3',
//           900: '#312e81',
//         },
//         slate: {
//           850: '#1e293b',
//           900: '#0f172a',
//         }
//       },
//       fontFamily: {
//         sans: ["Inter", "sans-serif"]
//       },
//       boxShadow: {
//         'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
//         'glass-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
//         'glow': '0 0 15px rgba(99, 102, 241, 0.3)',
//       },
//       backgroundImage: {
//         'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
//         'glass-gradient-dark': 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.4))',
//       },
//       animation: {
//         swing: 'swing 1s infinite',
//       },
//       keyframes: {
//         swing: {
//           '0%, 100%': { transform: 'rotate(0deg)' },
//           '20%': { transform: 'rotate(15deg)' },
//           '40%': { transform: 'rotate(-10deg)' },
//           '60%': { transform: 'rotate(5deg)' },
//           '80%': { transform: 'rotate(-5deg)' },
//         }
//       }
//     },
//   },
//   plugins: [],
// }


// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   darkMode: "class", 
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           DEFAULT: "#137fec",
//           50: "#eff6ff",
//           100: "#dbeafe",
//           600: "#2563eb",
//         },
//         // NEW NEUTRAL PALETTE FOR INVENTORY
//         neutral: {
//           surface: "#ffffff",
//           border: "#e2e8f0",
//           text: {
//             main: "#1e293b",
//             sub: "#64748b",
//           }
//         },
//         // Existing colors...
//         background: {
//           light: "#f6f7f8",
//           dark: "#101922",
//         },
//         slate: { 850: '#1e293b', 900: '#0f172a' },
//         indigo: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5' },
//       },
//       fontFamily: {
//         sans: ["Inter", "sans-serif"],
//         display: ["Manrope", "sans-serif"],
//         mono: ["JetBrains Mono", "monospace"],
//       },
//       // ... existing animations/keyframes ...
//     },
//   },
//   plugins: [],
// }


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      // 1. Color Palette Merged
      colors: {
        // Main Brand Color (Blue - used in Inventory/Orders)
        primary: {
          DEFAULT: "#137fec",
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#2563eb",
        },
        // Secondary Brand Color (Indigo - used in Sidebar/Dashboard)
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
        // Semantic Neutral Colors (For Inventory/Tables)
        neutral: {
          surface: "#ffffff",
          border: "#e2e8f0",
          text: {
            main: "#1e293b",
            sub: "#64748b",
          }
        },
        // App Backgrounds
        background: {
          light: "#f6f7f8",
          dark: "#101922",
        },
        // Dark Mode Overrides
        slate: {
          850: '#1e293b',
          900: '#0f172a',
        },
        // Studio Specific Colors (Added for safety based on previous context)
        studio: {
          bg: "#0a0a0a",
          panel: "#141414",
        },
        accent: {
          success: "#00d26a",
          recording: "#ef4444",
        },
      },

      // 2. Typography Merged
      fontFamily: {
        sans: ["Inter", "sans-serif"],       // Default UI font
        display: ["Manrope", "sans-serif"],  // Headings & Dashboard
        mono: ["JetBrains Mono", "monospace"], // Data & Studio
      },

      // 3. Shadows & Effects (From Dashboard)
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glass-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.3)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.4))',
      },

      // 4. Animations Merged (Dashboard Swing + Studio Scan)
      animation: {
        'swing': 'swing 1s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        swing: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(15deg)' },
          '40%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(5deg)' },
          '80%': { transform: 'rotate(-5deg)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}