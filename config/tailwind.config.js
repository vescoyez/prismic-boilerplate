module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/views/**/*.pug',
      './src/scripts/**/*.js',
    ],
  },
  separator: '_',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#12263F',
      white: '#fff',
      gray: {
        100: '#E3EBF6',
        200: '#EDF2F9',
        300: '#E4EBF6',
        400: '#D2DDEC',
        500: '#B1C2D9',
        600: '#95AAC9',
        700: '#6E84A3',
        800: '#3B516C',
        900: '#283E59',
      },
      red: {
        500: '#E63757',
      },
      yellow: {
        500: '#F5D83E',
      },
      green: {
        500: '#00D97E',
      },
      blue: {
        500: '#2C7BE5',
      },
    },
  },
}
