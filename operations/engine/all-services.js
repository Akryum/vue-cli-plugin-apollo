const gql = require('graphql-tag')

module.exports = gql`
{
  allServices {
    id
    name
    createdAt
  }
}
`
