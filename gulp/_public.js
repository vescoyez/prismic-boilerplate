import gulp from 'gulp'

const publicFiles = () => {
  return gulp.src('./src/public/**/*')
    .pipe(gulp.dest('./dist'))
}

export default publicFiles