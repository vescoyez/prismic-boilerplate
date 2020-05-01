import gulp from 'gulp'
import autoprefixer from 'autoprefixer'
import bounce from './_bounce'
import cssnano from 'cssnano'
import plumber from 'gulp-plumber'
import postcss from 'gulp-postcss'
import rename from 'gulp-rename'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import tailwindcss from 'tailwindcss'

const styles = () => {
  return gulp.src([
      './src/scss/*.scss',
      '!./src/scss/_*.scss'
    ])
    .pipe(plumber({ errorHandler: bounce }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(postcss([
      tailwindcss(),
      autoprefixer({cascade: false})
    ]))
    .pipe(gulp.dest('./dist/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
}

export default styles