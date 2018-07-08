<% if (addExamples) { _%>
import { db } from './utils/db'
import { processUpload } from './utils/upload'
<%_ } %>

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
export default ({ req, connection }) => {
  return {
<% if (addExamples) { _%>
    db,
    processUpload,
<%_ } else { %>
    // Put objects here
<%_ } %>
  }
}
