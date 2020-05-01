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

const content = () => getPrismic((results) => app.push(...results))

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
        asHtml: text => PrismicDOM.RichText.asHtml(text, linkResolver)
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
      const uid = folder === 'views' ? 'home' : folder
      const page = app.find(page => page.uid === uid)
      return { page: page ? page.data : {} }
    }
  )
}

const templates = () => {
  return glob('./src/views/_templates/*.pug', (er, files) => {
    const streams = []
    for ( const file of files ) {
      const type = path.parse(file).name
      const pages = app.filter(page => page.type === type)

      for (const page of pages) {
        const stream = pipeline(
          file,
          () => path.join(type, page.uid),
          () => ({ page: page.data })
        )
        streams.push(stream)
      }
    }
    return mergeStream(streams)
  })
}

const views = gulp.parallel(pages, templates)

export { content, views }