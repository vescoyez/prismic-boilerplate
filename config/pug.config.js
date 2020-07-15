const config = require('./app.config')
const fs = require('fs')
const html2pug = require('html2pug')
const path = require('path')
const PrismicDOM = require('prismic-dom')
const tailwind = require('./tailwind.config')
const views = require('./webpack/views')

const replaceDocParams = (block, docComp, docParams, docAttr, docBlock) => {
  if ( docComp ) block = block.replace(/docComp/g, JSON.stringify(docComp))
  if ( docParams ) block = block.replace(/, \.\.\.docParams/g, docParams.length ? ' ,' + docParams.map(param => JSON.stringify(param)).join(', ') : '')
  if ( docAttr ) block = block.replace(/attributes: attributes/g, `attributes: ${JSON.stringify(docAttr)}`)
  block = block.replace(/block: function\(\){\nblock && block\(\);\n},/g, docBlock ? `block: ${docBlock.toString()},` : '')
  return block
}

const formatBlock = (block) => {
  block = block.replace(/\r?\n|\r/g, '')
  block = block.replace(/pug_html = pug_html \+ "(.*?)";/g, '{"html": "$1"},')
  block = block.replace(/pug_mixins\["(.*?)"\](\.call)?\(/g, '{"mixin": {"name": "$1", "properties": [')
  block = block.replace(/\);/g, ']}},')
  block = block.replace(/attributes: /g, '"attributes": ')
  block = block.replace(/block: /g, '"block": ')
  block = block.replace(/function\(\){/g, '[')
  block = block.replace(/,}/g, ']')
  block = block.replace(/'(.*?)'/g, '"$1"')
  return JSON.parse(block)
}

const convertBlock = (block) => {
  return block.reduce((html, element) => {
    if ( element.html ) return html + (element.html[0] === '<' ? '' : ' ') + element.html
    if ( element.mixin ) return html + convertMixin(element.mixin)
  }, '')
}

const convertMixin = (mixin) => {
  mixin.attributes = []
  mixin.params = []
  for ( const property of mixin.properties ) {
    if ( property.attributes || property.block ) {
      for ( const [key, value] of Object.entries(property.attributes) ) {
        mixin.attributes.push(`${key}=${JSON.stringify(value)}`)
      }
      if ( property.block ) mixin.block = convertBlock(property.block)
    } else {
      mixin.params.push(JSON.stringify(property))
    }
  }
  const params = mixin.params.length ? `(${mixin.params.join(', ')})` : ''
  const attributes = mixin.attributes.length ? `(${mixin.attributes.join(' ')})` : ''
  const block = mixin.block ? mixin.block : ''
  return `<temporary-tag>+${mixin.name}${params}${attributes}${block}</temporary-tag>`
}

module.exports = {
  locals: {
    asHtml: (text) => PrismicDOM.RichText.asHtml(text, views.linkResolver),
    capitalize: (string) => string.charAt(0).toUpperCase() + string.slice(1),
    getIconList: () => fs.readdirSync('./src/icons').map(dir => path.parse(dir).name),
    getPugCode: (block, docComp, docParams, docAttr, docBlock) => {
      block = block.toString()
      block = replaceDocParams(block, docComp, docParams, docAttr, docBlock)
      const formattedBlock = formatBlock(block)
      const html = convertBlock(formattedBlock)
      const pugCode = html2pug(html, { fragment: true })
      return pugCode.replace(/temporary-tag(\n *\|)? /g, '')
    },
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
