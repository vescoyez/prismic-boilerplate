const config = require('./app.config')
const fs = require('fs')
const path = require('path')
const PrismicDOM = require('prismic-dom')
const tailwind = require('./tailwind.config')
const views = require('./webpack/views')

module.exports = {
  globals: {
    iconList: fs.readdirSync('./src/icons').map(dir => path.parse(dir).name),
    asHtml: text => PrismicDOM.RichText.asHtml(text, views.linkResolver),
    getSrcset: (image) => image.srcSet || config.img.srcset.filter(width => image.dimensions.width >= width).map(width => {
      const url = new URL(image.url)
      url.searchParams.set('w', width)
      url.searchParams.delete('h')
      return `${url.href} ${width}w`
    }).join(','),
    getSizes: (sizes) => {
      const screenSizes = tailwind.theme.screens
      const result = sizes.default ? [sizes.default] : []
      delete sizes.default
      for ( const breakpoint in sizes ) {
        const size = sizes[breakpoint]
        const screenSize = screenSizes[breakpoint]
        result.push(`(min-width: ${screenSize}) ${size}`)
      }
      return result.reverse().join(',')
    },
    imgLoading: config.img.loading,
  }
}
