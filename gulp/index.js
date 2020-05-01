import gulp from 'gulp'
import clean from './_clean'
import clearCache from './_clear-cache'
import images from './_images'
import publicFiles from './_public'
import server from './_server'
import styles from './_styles'
import { content, views } from './_views'
import webpack from './_webpack'

const watch = () => {
  gulp.watch('./src/images/**/*', images)
  gulp.watch('./src/public/**/*', publicFiles)
  gulp.watch(['./tailwind.config.js', './src/scss/**/*.scss'], styles)
  gulp.watch(['./src/views/**/*', './src/icons/**/*'], views)
  gulp.watch('./src/js/**/*.js', webpack)
}

const build = gulp.series(
  gulp.parallel(clean, clearCache, content),
  gulp.parallel(images, publicFiles, styles, views, webpack)
)

const dev = gulp.series(
  build,
  gulp.parallel(watch, server)
)

export { build, dev }