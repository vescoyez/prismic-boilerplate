import { dest, img } from '../config/app.config'
import gulp from 'gulp'
import cache from 'gulp-cache'
import changed from 'gulp-changed'
import imagemin from 'gulp-imagemin'
import responsive from 'gulp-responsive'

const images = () => {
  return gulp.src('./src/images/**/*')
    .pipe(changed(`${dest}/images`))
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(`${dest}/images`))
    .pipe(responsive({
      '**/*': img.srcset.map(size => ({
        width: size,
        rename: {
          prefix: `_size/${size}/`
        }
      }))
    }, {
      errorOnEnlargement: false
    }))
    .pipe(gulp.dest(`${dest}/images`))
}

export default images