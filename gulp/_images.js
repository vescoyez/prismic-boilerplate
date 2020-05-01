import gulp from 'gulp'
import cache from 'gulp-cache'
import imagemin from 'gulp-imagemin'

const images = () => {
  return gulp.src('./src/images/**/*')
    .pipe(cache(imagemin([
      imagemin.svgo()
    ])))
    .pipe(gulp.dest('./dist/images'))
}

export default images