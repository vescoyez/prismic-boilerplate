const config = require('../app.config')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const pluralize = require('pluralize')
const pug = require('../pug.config')

const links = {}

const storeLink = (lang, page) => {
  if ( !links[lang.slug] ) links[lang.slug] = {}
  links[lang.slug][page.uid] = page.url
}

const createPages = (content) => {
  const views = glob.sync('src/views/**/*.pug', { ignore: ['**/_**/*'] })
  const templates = []

  for ( const lang of config.languages ) {
    const app = content[lang.slug]

    for ( const view of views ) {
      const viewPath = path.parse(view.replace('src/views/', ''))

      if ( viewPath.name === '_index' ) {
        const folder = viewPath.dir.split('/').pop()
        const type = folder
        const page = app.find(page => page.type === type) || { lang: lang.source, uid: folder }
        const itemsType = pluralize.singular(type)
        const items = app.filter(page => page.type === itemsType)
        const itemsPerPage = config.pagination.itemsPerPage
        const pageNumber = Math.ceil(items.length / itemsPerPage)

        page.url = path.join('/', lang.slug, viewPath.dir)
        storeLink(lang, page)
        
        Array.from(Array(pageNumber), (_, i) => {
          const suffix = i === 0 ? '' : `${i + 1}`
          
          templates.push({
            lang: lang,
            dir: path.join(viewPath.dir, suffix),
            template: view,
            globals: {
              app,
              page,
              items: items.slice((i * itemsPerPage), (i * itemsPerPage + itemsPerPage)),
              pagination: {
                next: (i + 2) <= pageNumber ? path.join('/', lang.slug, viewPath.dir, `${i + 2}`) : null,
                previous: i == 1 ? path.join('/', lang.slug, viewPath.dir) : i > 1 ? path.join('/', lang.slug, viewPath.dir, `${i}`) : null
              }
            },
          })
        })
      } else if ( viewPath.name === '_show' ) {
        const folder = viewPath.dir.split('/').pop()
        const type = pluralize.singular(folder)
        const pages = app.filter(page => page.type === type)

        for ( const page of pages ) {
          page.url = path.join('/', lang.slug, viewPath.dir, page.uid)
          storeLink(lang, page)

          templates.push({
            lang: lang,
            dir: path.join(viewPath.dir, page.uid),
            template: view,
            globals: {
              app,
              page,
            },
          })
        }
      } else {
        viewPath.dir = viewPath.name === 'index' ? viewPath.dir : path.join(viewPath.dir, viewPath.name)
        const folder = viewPath.dir.split('/').pop()
        const type = folder || 'home'
        const page = app.find(page => page.type === type) || { lang: lang.source, uid: folder }

        page.url = path.join('/', lang.slug, viewPath.dir)
        storeLink(lang, page)

        templates.push({
          lang: lang,
          dir: viewPath.dir,
          template: view,
          globals: {
            app,
            page,
          },
        })
      }
    }
  }

  return templates.map(template => {
    return new HtmlWebpackPlugin({
      filename: path.join(template.lang.slug, template.dir, 'index.html'),
      template: template.template,
      templateParameters: {
        ...pug.globals,
        ...template.globals,
        getPage: uid => template.globals.app.find(page => page.uid === uid),
        lang: template.lang,
      },
      favicon: config.favicon,
    })
  })
}

exports.linkResolver = (page) => {
  const lang = config.languages.find(lang => lang.source === page.lang)
  return links[lang.slug][page.uid] || path.join('/', lang.slug)
}

exports.rules = [
  {
    test: /\.pug$/,
    use: [
      {
        loader: 'pug-loader',
        options: {
          root: path.resolve(__dirname, '../../src/views'),
        },
      },
    ],
  },
]

exports.plugins = (content) => [
  ...createPages(content),
]
