const MiniCssExtractPlugin = require('mini-css-extract-plugin')

exports.rules = [
  {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: { importLoaders: 1 },
      },
      {
        loader: 'postcss-loader',
        options: {
          config: {
            path: 'config/',
          },
        },
      },
    ],
  },
]

exports.plugins = [
  new MiniCssExtractPlugin()
]
