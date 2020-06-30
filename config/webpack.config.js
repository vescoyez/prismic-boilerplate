const icons = require('./webpack/icons')
const images = require('./webpack/images')
const path = require('path')
const prismic = require('./webpack/prismic')
const public = require('./webpack/public')
const scripts = require('./webpack/scripts')
const styles = require('./webpack/styles')
const views = require('./webpack/views')

module.exports = () => {
  return prismic.getContent(content => ({
    mode: process.env.NODE_ENV || 'development',
    module: {
      rules: [
        ...icons.rules,
        ...images.rules,
        ...scripts.rules,
        ...styles.rules,
        ...views.rules,
      ],
    },
    plugins: [
      ...public.plugins,
      ...styles.plugins,
      ...views.plugins(content),
    ],
    resolve: {
      alias: {
        images: path.resolve(__dirname, '../src/images/'),
        icons: path.resolve(__dirname, '../src/icons/'),
      },
    },
  }))
}
