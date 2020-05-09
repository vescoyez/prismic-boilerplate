import fs from 'fs'
import path from 'path'
import { linkResolver } from '../gulp/_prismic'
import PrismicDOM from 'prismic-dom'
import { theme } from './tailwind.config'

module.exports = {
  basedir: './src/views',
  locals: {
    iconList: fs.readdirSync('./src/icons').map(dir => path.parse(dir).name),
    icon: name => fs.readFileSync(`./src/icons/${name}.svg`),
    asHtml: text => PrismicDOM.RichText.asHtml(text, linkResolver),
    url: uid => linkResolver({uid: uid}),
    resize: (image, width) => {
      if ( image.url ) {
        const url = new URL(image.url)
        url.searchParams.set('w', image.dimensions.width < width ? image.dimensions.width : width)
        url.searchParams.delete('h')
        return url.href
      } else {
        const imagePath = path.parse(image)
        return path.join('/images', imagePath.dir, '_size', width.toString(), imagePath.base)
      }
    },
    getSizes: (sizes) => {
      const screenSizes = theme.screens
      const result = sizes.default ? [sizes.default] : []
      delete sizes.default
      for ( const breakpoint in sizes ) {
        const size = sizes[breakpoint]
        const screenSize = screenSizes[breakpoint]
        result.push(`(min-width: ${screenSize}) ${size}`)
      }
      return result.reverse().join(',')
    }
  }
}