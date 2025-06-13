const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1280px",
    },
    fontFamily: {
      sans: [
        "Jost",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        '"Noto Sans"',
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
    },
    extend: {
      colors: {
        green: "#9BDEAC",
        lightgreen: "#F2FDFB",
        red: "#F05454",
        yellow: "#F5B461",
        blue: "#66BFBF",
        gray: {
          ...defaultTheme.colors.gray,
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#282828',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
      },
    },
  },
  variants: {
    extend: {
      transform: ["group-hover"],
      scale: ["group-hover"],
      transitionDuration: ["group-hover"],
      letterSpacing: ["group-hover"],
      width: ["group-hover"],
      borderColor: ["group-hover"],
    },
    // divideColor: ['group-hover'],
  },
  plugins: [
    // Thêm plugin để hỗ trợ pseudo-elements
    plugin(function({ addComponents, theme }) {
      const afterStyles = {
        '.after-border-rose': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '0',
            bottom: '0',
            height: '2px',
            width: '3rem',
            backgroundColor: theme('colors.rose.500'),
          }
        }
      }
      addComponents(afterStyles)
    })
  ],
  safelist: [
    'after-border-rose'
  ],
};
