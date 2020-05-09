import { dest } from '../config/app.config'
import gulp from 'gulp'
import autoprefixer from 'autoprefixer'
import bounce from './_bounce'
import cache from 'gulp-cache'
import cssnano from 'cssnano'
import plumber from 'gulp-plumber'
import postcss from 'gulp-postcss'
import rename from 'gulp-rename'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import tailwindcss from 'tailwindcss'

const styles = () => {
  return gulp.src([
      './src/scss/**/*.scss',
      '!./**/_*.scss'
    ])
    .pipe(plumber({ errorHandler: bounce }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(cache(postcss([
      tailwindcss('./config/tailwind.config.js'),
      autoprefixer({cascade: false})
    ])))
    .pipe(gulp.dest(`${dest}/css`))
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${dest}/css`))
}

export default styles