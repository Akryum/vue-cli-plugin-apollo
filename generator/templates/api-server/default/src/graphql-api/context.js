<% if (addExamples) { _%>
const { db } = require('./utils/db')
const { processUpload } = require('./utils/upload')
<%_ } %>

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
module.exports = (req, connection) => {
  return {
<% if (addExamples) { _%>
    db,
    processUpload,
<%_ } else { %>
    // Put objects here
<%_ } %>
  }
}
