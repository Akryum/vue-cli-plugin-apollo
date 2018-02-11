// Config
const PORT = process.env.GRAPHQL_PORT || 4000
const ENGINE_KEY = process.env.APOLLO_ENGINE_KEY || null

// Customize those files
const typeDefs = require('./type-defs')
const resolvers = require('./resolvers')

// GraphQL API Server
const { GraphQLServer, PubSub } = require('graphql-yoga')

// Realtime subscriptions
const pubsub = new PubSub()

// Graphcool Yoga
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } })

// Apollo Engine
if (ENGINE_KEY) {
  const { Engine } = require('apollo-engine')

  const engine = new Engine({
    engineConfig: {
      apiKey: ENGINE_KEY,
      logging: {
        level: process.env.NODE_ENV === 'production' ? 'WARN' : 'INFO',
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
    endpoint: '/graphql',
    // dumpTraffic: process.env.NODE_ENV !== 'production',
  })
  engine.start()

  server.express.use(engine.expressMiddleware())
} else {
  console.log('Apollo Engine key not found. To enable Engine, set the `APOLLO_ENGINE_KEY` env variable.')
  console.log('Create a key on https://engine.apollographql.com')
  console.log('You may see `Error: Must provide document` errors (query persisting tries).')
}

server.start({
  port: PORT,
  endpoint: '/graphql',
  subscriptions: '/graphql',
  playground: '/',
}).then(() => {
  const url = `http://localhost:${PORT}/`
  console.log(`Server is running on ${url}`)
})
