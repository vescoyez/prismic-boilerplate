const config = require('../app.config')
const dotenv = require('dotenv')
const Prismic = require('prismic-javascript')

dotenv.config()

const getDocuments = (lang, pageNumber = 1) => {
  return Prismic.getApi(process.env.PRISMIC_API, {accessToken: process.env.PRISMIC_API_KEY}).then((api) => {
    return api.query('', { lang: lang, orderings : '[document.first_publication_date desc]', pageSize : 100, page: pageNumber })
  })
}

const formatContent = (pages) => {
  return pages.map(page => ({
    uid: page.uid,
    type: page.type,
    createdAt: page.first_publication_date,
    updatedAt: page.last_publication_date,
    tags: page.tags,
    lang: page.lang,
    ...page.data
  }))
}

exports.getContent = (callback) => {
  return Promise.all(config.languages.map(lang => {
    return getDocuments(lang.source).then((response) => {
      const results = response.results
      return Promise.all(Array.from(Array(response.total_pages - 1), (_, i) => getDocuments(lang.source, i + 2))).then((responses) => {
        return results.concat(...responses.map(response => response.results))
      })
    }).then((results) => {
      return { [lang.slug]: formatContent(results) }
    })
  })).then((results) => {
    return callback(Object.assign(...results))
  }, (error) => { console.error("Something went wrong: ", error) })
}


