import dotenv from 'dotenv'
import glob from 'glob'
import path from 'path'
import Prismic from 'prismic-javascript'

dotenv.config()

const links = {}

const getPrismic = (callback) => {
  return Prismic.getApi(process.env.PRISMIC_API, {accessToken: process.env.PRISMIC_API_KEY}).then((api) => {
    return api.query('', { orderings : '[document.first_publication_date desc]', pageSize : 100 })
  }).then((response) => {
    storePageLinks()
    storeIndexLinks()
    storeShowLinks(response.results)
    return callback(response.results)
  }, (error) => {
    console.error("Something went wrong: ", error)
  })
}

const storePageLinks = () => {
  const files = glob.sync('./src/views/**/*.pug', { ignore: ['./**/_**/*', './**/_*'] })
  for ( const file of files ) {
    const filePath = path.parse(file.split('views').pop())
    const dir = filePath.name === 'index' ? filePath.dir : path.join(filePath.dir, filePath.name)
    const uid = dir.split(path.sep).pop() || 'home'

    links[uid] = dir
  }
}

const storeIndexLinks = () => {
  const files = glob.sync('./src/views/**/_index.pug')
  for ( const file of files ) {
    const filePath = path.parse(file.split('views').pop())
    const dir = filePath.dir
    const uid = dir.split(path.sep).pop() + 's'

    links[uid] = dir
  }
}

const storeShowLinks = (app) => {
  const files = glob.sync('./src/views/**/_show.pug')
  for ( const file of files ) {
    const filePath = path.parse(file.split('views').pop())
    const type = filePath.dir.split(path.sep).pop()
    const pages = app.filter(page => page.type === type)

    for (const page of pages) {
      links[page.uid] = path.join(filePath.dir, page.uid)
    }
  }
}
	
const linkResolver = (page) => {
  for (const uid in links) {
    const path = links[uid]
    if (page.uid === uid) return path
  }
  return '/'
}

export { getPrismic, linkResolver }