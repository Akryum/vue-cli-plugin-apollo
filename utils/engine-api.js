const { createHttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const { toPromise, execute } = require('apollo-link')
const { print } = require('graphql')

const ENGINE_ENDPOINT = process.env.APOLLO_ENGINE_API_ENDPOINT || 'https://engine-graphql.apollographql.com/api/graphql/'

let engineLink = createHttpLink({
  uri: ENGINE_ENDPOINT,
  fetch,
})

exports.execute = async ({ query, variables, key }) => {
  const response = await toPromise(
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
  if (process.env.VUE_APP_CLI_UI_DEBUG) {
    console.log(`${ENGINE_ENDPOINT}\n`, print(query), `\nKey: ${key}`, `\nVariables:\n`, variables, `\nResponse:\n`, response)
  }
  if (response.errors) {
    const error = new Error(`Errors were returned from API`)
    error.response = response
    console.log(response.errors)
    throw error
  }
  return response
}
