import { languages } from '../config/app.config'
import dotenv from 'dotenv'
import glob from 'glob'
import path from 'path'
import Prismic from 'prismic-javascript'

dotenv.config()

const links = {}

const getDocuments = (lang, pageNumber = 1) => {
  return Prismic.getApi(process.env.PRISMIC_API, {accessToken: process.env.PRISMIC_API_KEY}).then((api) => {
    return api.query('', { lang: lang, orderings : '[document.first_publication_date desc]', pageSize : 100, page: pageNumber })
  })
}

const getContent = (lang, callback) => {
  return getDocuments(lang).then((response) => {
    const results = response.results
    return Promise.all(Array.from(Array(response.total_pages - 1), (_, i) => getDocuments(lang, i + 2))).then((responses) => {
      return results.concat(...responses.map(response => response.results))
    }, (error) => {
      console.error("Something went wrong: ", error)
    })
  }).then((results) => {
    storePageLinks(lang)
    storeIndexLinks(lang)
    storeShowLinks(lang, results)
    return callback(results)
  }, (error) => {
    console.error("Something went wrong: ", error)
  })
}

const storePageLinks = (lang) => {
  const files = glob.sync('./src/views/**/*.pug', { ignore: ['./**/_**/*', './**/_*'] })
  for ( const file of files ) {
    const filePath = path.parse(file.split('views').pop())
    const dir = filePath.name === 'index' ? filePath.dir : path.join(filePath.dir, filePath.name)
    const uid = dir.split(path.sep).pop() || 'home'

    if ( !links[lang] ) links[lang] = {}
    links[lang][uid] = dir
  }
}

const storeIndexLinks = (lang) => {
  const files = glob.sync('./src/views/**/_index.pug')
  for ( const file of files ) {
    const filePath = path.parse(file.split('views').pop())
    const dir = filePath.dir
    const uid = dir.split(path.sep).pop() + 's'

    if ( !links[lang] ) links[lang] = {}
    links[lang][uid] = dir
  }
}

const storeShowLinks = (lang, app) => {
  const files = glob.sync('./src/views/**/_show.pug')
  for ( const file of files ) {
    const filePath = path.parse(file.split('views').pop())
    const type = filePath.dir.split(path.sep).pop()
    const pages = app.filter(page => page.type === type)

    for (const page of pages) {
      if ( !links[lang] ) links[lang] = {}
      links[lang][page.uid] = path.join(filePath.dir, page.uid)
    }
  }
}
	
const linkResolver = (page) => {
  for (const uid in links[page.lang]) {
    const lang = languages.find(lang => lang.source === page.lang)
    const linkPath = path.join('/', lang.slug, links[page.lang][uid])
    if (page.uid === uid) return linkPath
  }
  return '/'
}

export { getContent, linkResolver }
