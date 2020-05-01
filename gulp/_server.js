import gulp from 'gulp'
import Browser from 'browser-sync'

const browser = Browser.create()
const config = {
  server: './dist',
  open: false,
  port: 3000
}

const server = () => {
  browser.init(config)
  gulp.watch('./dist/**/*').on('change', () => browser.reload())
}

export default server