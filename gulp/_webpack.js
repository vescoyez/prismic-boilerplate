import { dest } from '../config/app.config'
import gulp from 'gulp'
import bounce from './_bounce'
import plumber from 'gulp-plumber'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'

const config = {
  output: {
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        loader: 'eslint-loader'
      },
      {
        loader: 'babel-loader'
      }
    ]
  },
  mode: 'production',
  devtool: 'source-map',
}

const scripts = () => {
  return gulp.src('./src/js/*.js')
    .pipe(plumber({ errorHandler: bounce }))
    .pipe(webpackStream(config), webpack)
    .pipe(gulp.dest(`${dest}/js`))
}

export default scripts
