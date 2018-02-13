const { db } = require('./utils/db')
const { processUpload } = require('./utils/upload')

// Context passed to all resolvers (third argument)
module.exports = req => {
  return {
    db,
    processUpload,
  }
}
