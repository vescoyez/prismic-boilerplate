import { dest } from '../config/app.config'
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
  gulp.watch(`${dest}/**/*`).on('change', () => browser.reload())
}

export default server