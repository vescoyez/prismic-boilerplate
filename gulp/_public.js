import { dest } from '../config/app.config'
import gulp from 'gulp'

const publicFiles = () => {
  return gulp.src('./src/public/**/*')
    .pipe(gulp.dest(dest))
}

export default publicFiles