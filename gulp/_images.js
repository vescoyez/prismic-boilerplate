import { dest } from '../config/app.config'
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
      '**/*': [
        {
          width: 200,
          rename: {
            prefix: '_size/200/'
          }
        },
        {
          width: 500,
          rename: {
            prefix: '_size/500/'
          }
        },
        {
          width: 800,
          rename: {
            prefix: '_size/800/'
          }
        },
        {
          width: 1200,
          rename: {
            prefix: '_size/1200/'
          }
        },
        {
          width: 1600,
          rename: {
            prefix: '_size/1600/'
          }
        },
      ]
    }, {
      errorOnEnlargement: false,
      errorOnUnusedConfig: false
    }))
    .pipe(gulp.dest(`${dest}/images`))
}

export default images