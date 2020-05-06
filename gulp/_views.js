import gulp from 'gulp'
import bounce from './_bounce'
import cache from 'gulp-cache'
import chalk from 'chalk'
import changed from 'gulp-changed'
import data from 'gulp-data'
import fs from 'fs'
import glob from 'glob'
import mergeStream from 'merge-stream'
import path from 'path'
import plumber from 'gulp-plumber'
import PrismicDOM from 'prismic-dom'
import pug from 'gulp-pug'
import rename from 'gulp-rename'
import { getPrismic, linkResolver } from './_prismic'

const app = []

const content = () => getPrismic((results) => app.push(...results.map(page => ({
  uid: page.uid,
  type: page.type,
  createdAt: page.first_publication_date,
  updatedAt: page.last_publication_date,
  url: linkResolver({uid: page.uid}),
  ...page.data
}))))

const pipeline = (src, getDirname, getData) => {
  return gulp.src(src)
    .pipe(plumber({ errorHandler: bounce }))
    .pipe(changed('./dist'))
    .pipe(rename((filePath) => {
      filePath.dirname = filePath.basename === 'index' ? filePath.dirname : getDirname(filePath)
      filePath.basename = 'index'
    }))
    .pipe(cache(data((file) => ({
      app: app,
      ...getData(file)
    }))))
    .pipe(pug({
      basedir: './src/views',
      locals: {
        icon: name => fs.readFileSync(`./src/icons/${name}.svg`),
        asHtml: text => PrismicDOM.RichText.asHtml(text, linkResolver),
        url: uid => linkResolver({uid: uid})
      }
    }))
    .on('error', (error) => {
      console.error(chalk.red(error.message))
    })
    .pipe(gulp.dest('./dist'))
}

const pages = () => {
  return pipeline(
    ['./src/views/**/*.pug', '!./**/_**/*', '!./**/_*'],
    (filePath) => path.join(filePath.dirname, filePath.basename),
    (file) => {
      const folder = path.dirname(file.path).split(path.sep).pop()
      const type = folder === 'views' ? 'home' : folder
      const page = app.find(page => page.type === type)
      return { page: page || {} }
    }
  )
}

const indexPages = () => {
  return glob('./src/views/**/_index.pug', (er, files) => {
    const streams = []
    for ( const file of files ) {
      const dir = path.dirname(file).split('views').pop()
      const itemType = dir.split(path.sep).pop()
      const type = itemType + 's'
      const page = app.find(page => page.type === type)
      const items = app.filter(page => page.type === itemType)
      const itemPerPage = 6
      const pageNumber = Math.ceil(items.length / itemPerPage)

      Array.from(Array(pageNumber), (_, i) => {
        const stream = pipeline(
          file,
          () => i === 0 ? dir : path.join(dir, (i + 1).toString()),
          () => ({
            page: page || {},
            items: items.slice(i, i + itemPerPage),
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
}

const showPages = () => {
  return glob('./src/views/**/_show.pug', (er, files) => {
    const streams = []
    for ( const file of files ) {
      const dir = path.dirname(file).split('views').pop()
      const type = dir.split(path.sep).pop()
      const pages = app.filter(page => page.type === type)

      for (const page of pages) {
        const stream = pipeline(
          file,
          () => path.join(dir, page.uid),
          () => ({ page: page })
        )
        streams.push(stream)
      }
    }
    return mergeStream(streams)
  })
}

const views = gulp.parallel(pages, indexPages, showPages)

export { content, views }