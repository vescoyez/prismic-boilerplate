module.exports = {
  dest: './dist',
  img: {
    srcset: [200, 500, 800, 1200, 1500]
  },
  languages: [
    {
      source: 'en-us',
      slug: 'en',
      label: 'English'
    },
    {
      source: 'fr-fr',
      slug: 'fr',
      label: 'Français'
    }
  ],
  pagination: {
    itemPerPage: 24
  }
}