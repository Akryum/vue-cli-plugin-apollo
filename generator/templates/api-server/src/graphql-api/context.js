const { db } = require('./utils/db')
const { processUpload } = require('./utils/upload')

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
module.exports = (req, connection) => {
  return {
    db,
    processUpload,
  }
}
