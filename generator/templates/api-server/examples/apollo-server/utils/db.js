import Lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import mkdirp from 'mkdirp'
import { resolve } from 'path'

mkdirp(resolve(__dirname, '../../live'))

export const db = new Lowdb(new FileSync(resolve(__dirname, '../../live/db.json')))

// Seed an empty DB
db.defaults({
  messages: [],
  uploads: [],
}).write()
