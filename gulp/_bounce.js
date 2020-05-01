import beeper from 'beeper'

const bounce = function() {
  beeper()
  this.emit('end')
}

export default bounce