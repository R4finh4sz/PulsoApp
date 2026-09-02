const colors = {
  primary: {
    100: '#0081A7',
  },
  secondary: {
    100: '#E76F51',
  },
  neutral: {
    black: '#000000',
    100: '#2D2D2D',
    80: '#454545',
    60: '#737373',
    40: '#A2A2A2',
    20: '#D1D0D0',
    white: '#FFFFFF',
    background: '#F5F5F5',
    placeholder: '#E5E5E5',
  },
  alert: {
    success: {
      primary: '#2DAC3E',
      secondary: '#ABDEB1',
    },
    error: {
      primary: '#DE3737',
      secondary: '#FFD2D2',
    },
  },
} as const;

export default colors;
