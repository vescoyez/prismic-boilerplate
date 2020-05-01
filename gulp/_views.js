import gulp from 'gulp'
import bounce from './_bounce'
import cache from 'gulp-cache'
import chalk from 'chalk'
import changed from 'gulp-changed'
import data from 'gulp-data'
import flatmap from 'gulp-flatmap'
import fs from 'fs'
import path from 'path'
import plumber from 'gulp-plumber'
import PrismicDOM from 'prismic-dom'
import pug from 'gulp-pug'
import rename from 'gulp-rename'
import { getPrismic, linkResolver } from './_prismic'

const app = []

const getContent = () => getPrismic((results) => app.push(...results))

const pipeline = (stream, dirname, getData) => {
  return stream
    .pipe(plumber({ errorHandler: bounce }))
    .pipe(changed('./dist'))
    .pipe(rename((filePath) => {
      filePath.dirname = filePath.basename === 'index' ? filePath.dirname : dirname(filePath)
      filePath.basename = 'index'
    }))
    .pipe(cache(data((file) => ({
      app: app,
      asHtml: (text) => PrismicDOM.RichText.asHtml(text, linkResolver),
      ...getData(file)
    }))))
    .pipe(pug({
      basedir: './src/views',
      locals: {
        icon: name => fs.readFileSync(`./src/icons/${name}.svg`)
      }
    }))
    .on('error', (error) => {
      console.error(chalk.red(error.message))
    })
    .pipe(gulp.dest('./dist'))
}

const pages = () => {
  return pipeline(
    gulp.src(['./src/views/**/*.pug', '!./src/views/_**/*']),
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
  return gulp.src('./src/views/_templates/*.pug')
    .pipe(flatmap((stream, file) => {
      const type = path.parse(file.path).name
      const pages = app.filter(page => page.type === type)

      for (const page of pages) {
        pipeline(
          stream,
          () => path.join(type, page.uid),
          () => ({ page: page.data })
        )
      }
      return stream
    }))
}

const views = gulp.series(
  getContent,
  gulp.parallel(pages, templates),
)


export default views