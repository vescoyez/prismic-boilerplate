module.exports = {
  plugins: [
    require('tailwindcss')('./config/tailwind.config.js'),
    require('autoprefixer'),
    require('postcss-nesting'),
  ]
}
