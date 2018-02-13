const chalk = require('chalk')
const { GraphQLServer, PubSub } = require('graphql-yoga')
const cors = require('cors')
const { autoCall } = require('./utils')

module.exports = options => {
  // Config
  const PORT = process.env.VUE_APP_GRAPHQL_PORT || 4000
  const GRAPHQL_PATH = process.env.VUE_APP_GRAPHQL_PATH || '/graphql'
  const GRAPHQL_SUBSCRIPTIONS_PATH = process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
  const GRAPHQL_PLAYGROUND_PATH = process.env.VUE_APP_GRAPHQL_PLAYGROUND_PATH || '/'
  const ENGINE_KEY = process.env.VUE_APP_APOLLO_ENGINE_KEY || null

  // Customize those files
  const typeDefs = require(options.paths.typeDefs)
  const resolvers = require(options.paths.resolvers)
  const context = require(options.paths.context)

  // GraphQL API Server

  // Realtime subscriptions
  const pubsub = new PubSub()

  // Graphcool Yoga
  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: req => Object.assign({}, autoCall(context, req), { pubsub }),
  })

  // Cross-Origin
  server.express.use(cors())

  // Apollo Engine
  if (options.apolloEngine) {
    if (ENGINE_KEY) {
      const { Engine } = require('apollo-engine')

      const engine = new Engine({
        engineConfig: {
          apiKey: ENGINE_KEY,
          logging: {
            level: 'WARN',
          },
          'stores': [
            {
              'name': 'publicResponseCache',
              'inMemory': {
                'cacheSize': 10485760,
              },
            },
            {
              'name': 'persistedQueries',
              'inMemory': {
                'cacheSize': 5000000,
              },
            },
          ],
          'queryCache': {
            'publicFullQueryStore': 'publicResponseCache',
          },
          'persistedQueries': {
            'store': 'persistedQueries',
          },
        },
        graphqlPort: PORT,
        endpoint: GRAPHQL_PATH,
        // dumpTraffic: process.env.NODE_ENV !== 'production',
      })
      engine.start()

      server.express.use(engine.expressMiddleware())

      console.log(`✔️  Apollo Engine is enabled`)
    } else {
      console.log(chalk.yellow('Apollo Engine key not found.') + `To enable Engine, set the ${chalk.cyan('VUE_APP_APOLLO_ENGINE_KEY')} env variable.`)
      console.log('Create a key at https://engine.apollographql.com')
      console.log('You may see `Error: Must provide document` errors (query persisting tries).')
    }
  }

  if (options.mock) {
    // Automatic mocking
    const { addMockFunctionsToSchema } = require('graphql-tools')
    // Customize this file
    const mocks = require(options.paths.mocks)
    addMockFunctionsToSchema({
      schema: server.executableSchema,
      mocks,
      preserveResolvers: true,
    })

    console.log(`✔️  Automatic mocking is enabled`)
  }

  server.start({
    cors: false,
    port: PORT,
    endpoint: GRAPHQL_PATH,
    subscriptions: GRAPHQL_SUBSCRIPTIONS_PATH,
    playground: GRAPHQL_PLAYGROUND_PATH,
  }).then(() => {
    const url = `http://localhost:${PORT}/`
    console.log(`✔️  GraphQL Server is running on ${chalk.cyan(url)}`)
  })
}
