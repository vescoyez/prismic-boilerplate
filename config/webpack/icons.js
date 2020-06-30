exports.rules = [
  {
    test: /\.svg$/i,
    include: /src\/icons/,
    use: [
      {
        loader: 'svg-inline-loader',
        options: {
          removeTags: true,
          removingTags: [
            'style',
          ],
          removingTagAttrs: [
            'class',
            'style',
            'version',
            'xmlns:xlink',
            'xml:space',
            'xmlns:serif',
          ],
        },
      },
    ],
  },
]
