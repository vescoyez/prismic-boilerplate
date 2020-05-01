import cache from 'gulp-cache'

const clearCache = () => {
  return cache.clearAll()
}

export default clearCache