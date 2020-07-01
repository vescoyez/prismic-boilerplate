import { Controller } from 'stimulus'
import axios from 'axios'

export default class extends Controller {
  static targets = ['items', 'pagination', 'next']

  scroll() {
    if ( bottomReached() && this.hasNextTarget ) {
      loadNextItems(this)
    }
  }
}

const bottomReached = () => {
  const scrollHeight = document.documentElement.scrollHeight
  const scrollBottom = document.documentElement.scrollTop + window.innerHeight
  return scrollHeight === scrollBottom
}

const loadNextItems = (controller) => {
  controller.paginationTarget.classList.add(controller.paginationTarget.dataset.loadingStyle)

  axios.get(controller.nextTarget.href)
    .then((response) => {
      const doc = document.createElement('html')
      doc.innerHTML = response.data
      controller.itemsTarget.append(...doc.querySelector('[data-target~="infinite-scroll.items"]').childNodes)
      controller.paginationTarget.innerHTML = doc.querySelector('[data-target~="infinite-scroll.pagination"]').innerHTML
    })
    .catch((error) => {
      console.log(error)
    })
    .then(() => {
      if ( !controller.hasNextTarget ) {
        controller.paginationTarget.remove()
      } else {
        controller.paginationTarget.classList.remove(controller.paginationTarget.dataset.loadingStyle)
      }
    })
}
