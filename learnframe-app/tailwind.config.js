/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [
    function({ addUtilities, addBase }) {
      const newUtilities = {
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.no-tap-highlight': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.mobile-scroll': {
          'overscroll-behavior': 'contain',
          '-webkit-overflow-scrolling': 'touch',
        }
      }
      
      const mobileBase = {
        'html': {
          '-webkit-text-size-adjust': '100%',
          'touch-action': 'manipulation',
        },
        '*': {
          '-webkit-tap-highlight-color': 'transparent',
        }
      }
      
      addUtilities(newUtilities)
      addBase(mobileBase)
    }
  ],
}
