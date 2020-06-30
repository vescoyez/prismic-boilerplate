const CopyWebpackPlugin = require('copy-webpack-plugin')

exports.plugins = [
  new CopyWebpackPlugin({
    patterns: [
      { from: 'src/public' },
    ],
  }),
]
