const config = require('../app.config')
const { filters, locals } = require('../pug.config')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const pluralize = require('pluralize')

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
      const isDocs = viewPath.dir.startsWith('docs')

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
          const currentPage = i + 1
          const suffix = currentPage === 1 ? '' : `${currentPage}`
          
          templates.push({
            lang: lang,
            dir: path.join(viewPath.dir, suffix),
            template: view,
            locals: {
              app,
              page,
              items: items.slice((i * itemsPerPage), (i * itemsPerPage + itemsPerPage)),
              pagination: {
                current: currentPage,
                previous: currentPage == 2 ? path.join('/', lang.slug, viewPath.dir) : currentPage > 2 ? path.join('/', lang.slug, viewPath.dir, `${currentPage - 1}`) : null,
                next: (currentPage + 1) <= pageNumber ? path.join('/', lang.slug, viewPath.dir, `${currentPage + 1}`) : null,
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
            locals: {
              app,
              page,
            },
          })
        }
      } else if ( !isDocs || (isDocs && lang == config.languages[0]) ) {
        viewPath.dir = viewPath.name === 'index' ? viewPath.dir : path.join(viewPath.dir, viewPath.name)
        const folder = viewPath.dir.split('/').pop()
        const type = folder || 'home'
        const page = app.find(page => page.type === type) || { lang: lang.source, uid: folder }
        const pageLang = {
          ...lang,
          slug: isDocs ? '' : lang.slug
        }

        page.url = path.join('/', pageLang.slug, viewPath.dir)
        storeLink(pageLang, page)

        templates.push({
          lang: pageLang,
          dir: viewPath.dir,
          template: view,
          locals: {
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
        ...locals,
        ...template.locals,
        getPage: uid => template.locals.app.find(page => page.uid === uid),
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
          filters,
        },
      },
    ],
  },
]

exports.plugins = (content) => [
  ...createPages(content),
]
