import add from './add'
import create from './create'
import del from './delete'
import { global, local } from './set'
import show from './show'
import shuffle from './shuffle'

export default {
  add,
  create,
  delete: del,
  global,
  local,
  show,
  shuffle,
} as { [name: string]: CommandHandler }
