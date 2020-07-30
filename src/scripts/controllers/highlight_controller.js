import { Controller } from 'stimulus'
import beautify from 'js-beautify'
import Prism from 'prismjs'
import 'prismjs/components/prism-pug'

export default class extends Controller {
  static targets = ['html', 'pug']

  connect() {
    for ( const html of this.htmlTargets ) {
      const prettyHtml = beautify.html(html.innerHTML)
      const highlightedHtml = Prism.highlight(prettyHtml, Prism.languages.html, 'html')
      html.innerHTML = highlightedHtml
    }
    for ( const pug of this.pugTargets ) {
      const highlightedPug = Prism.highlight(pug.innerHTML, Prism.languages.pug, 'pug')
      pug.innerHTML = highlightedPug
    }
  }
}
