import { dest, languages, pagination } from '../config/app.config'
import gulp from 'gulp'
import bounce from './_bounce'
import chalk from 'chalk'
import changed from 'gulp-changed'
import data from 'gulp-data'
import glob from 'glob'
import mergeStream from 'merge-stream'
import path from 'path'
import plumber from 'gulp-plumber'
import { getContent, linkResolver } from './_prismic'
import pugConfig from '../config/pug.config'
import pug from 'gulp-pug'
import rename from 'gulp-rename'

const app = []

const content = () => {
  return Promise.all(languages.map(lang => {
    return getContent(lang.source, pages => app[lang.slug] = pages.map(page => ({
      uid: page.uid,
      type: page.type,
      createdAt: page.first_publication_date,
      updatedAt: page.last_publication_date,
      tags: page.tags,
      lang: page.lang,
      url: linkResolver(page),
      ...page.data
    })))
  }))
}

const pipeline = (src, lang, pageDirname, pageData) => {
  return gulp.src(src)
    .pipe(plumber({ errorHandler: bounce }))
    .pipe(changed(dest))
    .pipe(rename((filePath) => {
      filePath.dirname = filePath.basename === 'index' ? path.join(lang.slug, filePath.dirname) : pageDirname(filePath)
      filePath.basename = 'index'
    }))
    .pipe(data((file) => ({
      app: app[lang.slug],
      getPage: uid => app[lang.slug].find(page => page.uid === uid),
      ...pageData(file)
    })))
    .pipe(pug(pugConfig))
    .on('error', (error) => {
      console.error(chalk.red(error.message))
    })
    .pipe(gulp.dest(dest))
}

const pages = () => {
  return mergeStream(languages.map(lang => {
    return pipeline(
      ['./src/views/**/*.pug', '!./**/_**/*', '!./**/_*'],
      lang,
      (filePath) => {
        return path.join(lang.slug, filePath.dirname, filePath.basename)
      },
      (file) => {
        const folder = path.dirname(file.path).split(path.sep).pop()
        const type = folder === lang.slug ? 'home' : folder
        const page = app[lang.slug].find(page => page.type === type)
        return { page: page || {} }
      }
    )
  }))
}

const indexPages = () => {
  return Promise.all(languages.map(lang => {
    return glob('./src/views/**/_index.pug', (er, files) => {
      const streams = []
      for ( const file of files ) {
        const dir = path.dirname(file).split('views').pop()
        const itemType = dir.split(path.sep).pop()
        const type = itemType + 's'
        const page = app[lang.slug].find(page => page.type === type)
        const items = app[lang.slug].filter(page => page.type === itemType)
        const pageNumber = Math.ceil(items.length / pagination.itemPerPage)

        Array.from(Array(pageNumber), (_, i) => {
          const stream = pipeline(
            file,
            lang,
            () => i === 0 ? path.join(lang.slug, dir) : path.join(lang.slug, dir, (i + 1).toString()),
            () => ({
              page: page || {},
              items: items.slice(i * pagination.itemPerPage, i * pagination.itemPerPage + pagination.itemPerPage),
              pagination: {
                next: (i + 2) <= pageNumber ? path.join(dir, (i + 2).toString()) : null,
                previous: i == 1 ? dir : i > 1 ? path.join(dir, i.toString()) : null
              }
            })
          )
          streams.push(stream)
        })
      }
      return mergeStream(streams)
    })
  }))
}

const showPages = () => {
  return Promise.all(languages.map(lang => {
    return glob('./src/views/**/_show.pug', (er, files) => {
      const streams = []
      for ( const file of files ) {
        const dir = path.dirname(file).split('views').pop()
        const type = dir.split(path.sep).pop()
        const pages = app[lang.slug].filter(page => page.type === type)

        for (const page of pages) {
          const stream = pipeline(
            file,
            lang,
            () => path.join(lang.slug, dir, page.uid),
            () => ({ page: page })
          )
          streams.push(stream)
        }
      }
      return mergeStream(streams)
    })
  }))
}

const views = gulp.parallel(pages, indexPages, showPages)

export { content, views }
