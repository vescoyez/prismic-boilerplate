module.exports = {
  favicon: './src/public/favicon.svg',
  img: {
    loading: 'lazy',
    srcset: [1500, 1200, 800, 500, 200],
  },
  languages: [
    {
      source: 'en-us',
      slug: 'en',
      label: 'English',
      tag: 'en',
    },
    {
      source: 'fr-fr',
      slug: 'fr',
      label: 'Français',
      tag: 'fr',
    }
  ],
  pagination: {
    itemsPerPage: 6
  },
}
