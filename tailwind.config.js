const colors = {
  primary: { 100: '#0081A7' },
  secondary: { 100: '#E76F51' },
  neutral: {
    black: '#000000',
    100: '#2D2D2D',
    80: '#454545',
    60: '#737373',
    40: '#A2A2A2',
    20: '#D1D0D0',
    background: '#F5F5F5',
    placeholder: '#E5E5E5',
  },
  alert: {
    success: { primary: '#2DAC3E', secondary: '#ABDEB1' },
    error: { primary: '#DE3737', secondary: '#FFD2D2' },
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

const fontFamily = {
  poppins: ['Poppins_400Regular'],
  poppins_light: ['Poppins_300Light'],
  poppins_medium: ['Poppins_500Medium'],
  poppins_semibold: ['Poppins_600SemiBold'],
  poppins_bold: ['Poppins_700Bold'],
  poppins_extrabold: ['Poppins_800ExtraBold'],
  poppins_black: ['Poppins_900Black'],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./components/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: { colors, fontFamily } },
  plugins: [],
};
