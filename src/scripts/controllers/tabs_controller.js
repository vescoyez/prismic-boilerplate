import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['content', 'tab']

  selectTab(position) {
    this.tabTargets.map((tab, index) => position === index ? tab.classList.add(this.activeClass) : tab.classList.remove(this.activeClass))
    this.contentTargets.map((content, index) => position === index ? content.classList.remove('hidden') : content.classList.add('hidden'))
  }

  initialize() {
    this.activeClass = this.element.dataset.tabActiveClass
    this.selectTab(0)
  }

  select(e) {
    e.preventDefault()
    const position = this.tabTargets.indexOf(e.target)
    this.selectTab(position)
  }
}
