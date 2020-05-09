import { dest } from '../config/app.config'
import del from 'del'

const clean = () => {
  return del(`${dest}/**`)
}

export default clean
