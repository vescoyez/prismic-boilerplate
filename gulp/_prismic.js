import dotenv from 'dotenv'
import glob from 'glob'
import path from 'path'
import Prismic from 'prismic-javascript'

dotenv.config()

const links = {}

const getPrismic = (callback) => {
  return Prismic.getApi(process.env.PRISMIC_API, {accessToken: process.env.PRISMIC_API_KEY}).then((api) => {
    return api.query('')
  }).then((response) => {
    storePageLinks()
    storeTemplateLinks(response.results)
    return callback(response.results)
  }, (error) => {
    console.error("Something went wrong: ", error)
  })
}

const storePageLinks = () => {
  glob('./src/views/**/*.pug', { ignore: ['./**/_**/*', './**/_*'] }, (er, files) => {
    for ( const file of files ) {
      const filePath = path.parse(file.split('views').pop())
      const dir = filePath.name === 'index' ? filePath.dir : path.join(filePath.dir, filePath.name)
      const uid = dir.split(path.sep).pop() || 'home'
  
      links[uid] = dir
    }
  })
}

const storeTemplateLinks = (app) => {
  glob('./src/views/_templates/*.pug', (er, files) => {
    for ( const file of files ) {
      const type = path.parse(file).name
      const pages = app.filter(page => page.type === type)

      for (const page of pages) {
        links[page.uid] = path.join(path.sep, type, page.uid)
      }
    }
  })
}
	
const linkResolver = (page) => {
  for (const uid in links) {
    const path = links[uid]
    if (page.uid === uid) return path
  }
  return '/'
}

export { getPrismic, linkResolver }