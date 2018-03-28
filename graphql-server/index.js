const chalk = require('chalk')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const { default: expressPlayground } = require('graphql-playground-middleware-express')
const { createServer } = require('http')
const { execute, subscribe, print } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { apolloUploadExpress, GraphQLUpload } = require('apollo-upload-server')
const { PubSub } = require('graphql-subscriptions')

const { autoCall } = require('./utils')

module.exports = options => {
  // Config
  const PORT = process.env.VUE_APP_GRAPHQL_PORT || 4000
  const GRAPHQL_PATH = process.env.VUE_APP_GRAPHQL_PATH || '/graphql'
  const GRAPHQL_SUBSCRIPTIONS_PATH = process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
  const GRAPHQL_PLAYGROUND_PATH = process.env.VUE_APP_GRAPHQL_PLAYGROUND_PATH || '/'
  const ENGINE_KEY = process.env.VUE_APP_APOLLO_ENGINE_KEY || null
  const GRAPHQL_CORS = process.env.VUE_APP_GRAPHQL_CORS || '*'

  // Customize those files
  const typeDefs = require(options.paths.typeDefs)
  const resolvers = require(options.paths.resolvers)
  const context = require(options.paths.context)
  let pubsub
  try {
    pubsub = require(options.paths.pubsub)
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(chalk.yellow('Using default PubSub implementation for subscriptions.'))
      console.log(chalk.grey(`You should provide a different implementation in production (for example with Redis) by exporting it in 'src/graphql-api/pubsub.js'.`))
    }
  }

  // GraphQL API Server

  // Realtime subscriptions
  if (!pubsub) pubsub = new PubSub()

  const typeDefsString = buildTypeDefsString(typeDefs)

  const uploadMixin = typeDefsString.includes('scalar Upload')
    ? { Upload: GraphQLUpload }
    : {}

  // Executable schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
      ...resolvers,
      ...uploadMixin,
    },
  })

  // Automatic mocking
  if (options.mock) {
    const { addMockFunctionsToSchema } = require('graphql-tools')
    // Customize this file
    const mocks = require(options.paths.mocks)
    addMockFunctionsToSchema({
      schema,
      mocks,
      preserveResolvers: true,
    })

    if (process.env.NODE_ENV === 'production') {
      console.warn(`Automatic mocking is enabled, consider disabling it with the 'graphqlMock' option.`)
    } else {
      console.log(`✔️  Automatic mocking is enabled`)
    }
  }

  const app = express()

  // Cross-Origin
  app.use(cors({
    origin: GRAPHQL_CORS,
  }))

  // Timeout
  app.use(function (req, res, next) {
    res.setTimeout(options.timeout, () => {
      console.log(chalk.yellow('Request has timed out.'))
      res.send(408)
    })
    next()
  })

  // Uploads
  app.post(GRAPHQL_PATH, apolloUploadExpress())

  // Queries
  app.use(GRAPHQL_PATH,
    bodyParser.json(),
    graphqlExpress(async req => {
      let contextData
      try {
        contextData = await autoCall(context, req)
        contextData = Object.assign({}, contextData, { pubsub })
      } catch (e) {
        console.error(e)
        throw e
      }

      return {
        schema,
        tracing: true,
        cacheControl: true,
        context: contextData,
      }
    })
  )

  // Playground
  const playgroundOptions = {
    endpoint: GRAPHQL_PATH,
    subscriptionEndpoint: GRAPHQL_SUBSCRIPTIONS_PATH,
  }
  app.get(GRAPHQL_PLAYGROUND_PATH, expressPlayground(playgroundOptions))

  // Subscriptions
  const server = createServer(app)
  // eslint-disable-next-line no-new
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
    onOperation: async (message, connection, webSocket) => {
      let contextData
      try {
        contextData = await autoCall(context, null, connection)
        contextData = Object.assign({}, contextData, { pubsub })
      } catch (e) {
        console.error(e)
        throw e
      }

      return {
        ...connection,
        context: contextData,
      }
    },
  }, {
    server,
    path: GRAPHQL_SUBSCRIPTIONS_PATH,
  })

  const doneCallback = () => {
    console.log(`✔️  GraphQL Server is running on ${chalk.cyan(`http://localhost:${PORT}/`)}`)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✔️  Type ${chalk.cyan('rs')} to restart the server`)
    }
  }

  // Apollo Engine
  let apolloEnabled = false
  if (options.apolloEngine) {
    if (ENGINE_KEY) {
      const { ApolloEngine } = require('apollo-engine')

      const engine = new ApolloEngine({
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
        // dumpTraffic: process.env.NODE_ENV !== 'production',
      })

      engine.listen({
        port: PORT,
        httpServer: server,
        graphqlPaths: [GRAPHQL_PATH, GRAPHQL_SUBSCRIPTIONS_PATH],
      }, doneCallback)

      apolloEnabled = true
      console.log(`✔️  Apollo Engine is enabled (open dashboard on https://engine.apollographql.com/)`)
    } else {
      console.log(chalk.yellow('Apollo Engine key not found.') + `To enable Engine, set the ${chalk.cyan('VUE_APP_APOLLO_ENGINE_KEY')} env variable.`)
      console.log('Create a key at https://engine.apollographql.com/')
      console.log('You may see `Error: Must provide document` errors (query persisting tries).')
    }
  }

  if (!apolloEnabled) {
    server.listen(PORT, doneCallback)
  }
}

function buildTypeDefsString (typeDefs) {
  return mergeTypeDefs(typeDefs)
}

function mergeTypeDefs (typeDefs) {
  if (typeof typeDefs === 'string') {
    return typeDefs
  }

  if (typeof typeDefs === 'function') {
    typeDefs = typeDefs()
  }

  if (isDocumentNode(typeDefs)) {
    return print(typeDefs)
  }

  return typeDefs.reduce((acc, t) => acc + '\n' + mergeTypeDefs(t), '')
}

function isDocumentNode (node) {
  return node.kind === 'Document'
}
