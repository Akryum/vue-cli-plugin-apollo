const { createHttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const { toPromise, execute } = require('apollo-link')

const ENGINE_ENDPOINT = process.env.APOLLO_ENGINE_API_ENDPOINT || 'https://engine-graphql.apollographql.com/api/graphql/'

let engineLink = createHttpLink({
  uri: ENGINE_ENDPOINT,
  fetch,
})

exports.execute = ({ query, variables, key }) => {
  return toPromise(
    execute(engineLink, {
      query,
      variables,
      context: {
        headers: {
          'X-Api-Key': key,
          uri: ENGINE_ENDPOINT,
        },
      },
    })
  )
}
