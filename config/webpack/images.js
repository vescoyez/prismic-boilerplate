const config = require('../app.config')

exports.rules = [
  {
    test: /\.(gif|svg)$/i,
    exclude: /src\/icons/,
    use: [
      {
        loader: 'file-loader',
        options: {
          outputPath: 'images',
          publicPath: '/images',
        },
      },
      {
        loader: 'img-loader',
      },
    ],
  },
  {
    test: /\.(jpe?g|png)$/i,
    include: /src\/images/,
    use: [
      {
        loader: 'responsive-loader',
        options: {
          adapter: require('responsive-loader/sharp'),
          outputPath: 'images',
          publicPath: '/images',
          sizes: config.img.srcset,
        },
      },
    ],
  },
]
