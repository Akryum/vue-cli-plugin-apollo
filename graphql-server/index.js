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

function load (file) {
  const module = require(file)
  if (module.default) {
    return module.default
  }
  return module
}

module.exports = (options, cb = null) => {
  // Config
  const {
    port,
    graphqlPath,
    graphqlSubscriptionsPath,
    graphqlPlaygroundPath,
    engineKey,
    graphqlCors,
  } = options

  // Customize those files
  const typeDefs = load(options.paths.typeDefs)
  const resolvers = load(options.paths.resolvers)
  const context = load(options.paths.context)
  const schemaDirectives = load(options.paths.directives)
  let pubsub
  try {
    pubsub = load(options.paths.pubsub)
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && !options.quiet) {
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
    schemaDirectives,
  })

  // Automatic mocking
  if (options.mock) {
    const { addMockFunctionsToSchema } = require('graphql-tools')
    // Customize this file
    const mocks = load(options.paths.mocks)
    addMockFunctionsToSchema({
      schema,
      mocks,
      preserveResolvers: true,
    })

    if (!options.quiet) {
      if (process.env.NODE_ENV === 'production') {
        console.warn(`Automatic mocking is enabled, consider disabling it with the 'graphqlMock' option.`)
      } else {
        console.log(`✔️  Automatic mocking is enabled`)
      }
    }
  }

  const app = express()

  // Cross-Origin
  app.use(cors({
    origin: graphqlCors,
  }))

  // Customize server
  try {
    const serverModule = load(options.paths.server)
    serverModule(app)
  } catch (e) {
    // No file found
  }

  // Uploads
  app.post(graphqlPath, apolloUploadExpress())

  // Queries

  let apolloOptions
  try {
    apolloOptions = load(options.paths.apollo)
  } catch (e) {}

  app.use(graphqlPath,
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

      let moreOptions = {}
      if (apolloOptions) {
        moreOptions = await apolloOptions(req)
      }

      return {
        schema,
        tracing: true,
        cacheControl: true,
        context: contextData,
        ...moreOptions,
      }
    })
  )

  // Playground
  const playgroundOptions = {
    endpoint: graphqlPath,
    subscriptionEndpoint: graphqlSubscriptionsPath,
  }
  app.get(graphqlPlaygroundPath, expressPlayground(playgroundOptions))

  // HTTP server
  const server = createServer(app)
  server.setTimeout(options.timeout)

  // Subscriptions
  // eslint-disable-next-line no-new
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
    onConnect: async (connectionParams) => {
      let contextData = {}
      try {
        contextData = await autoCall(context, null, connectionParams)
        contextData = Object.assign({}, contextData, { pubsub })
      } catch (e) {
        console.error(e)
        throw e
      }

      return contextData
    },
  }, {
    server,
    path: graphqlSubscriptionsPath,
  })

  const doneCallback = () => {
    if (!options.quiet) {
      console.log(`✔️  GraphQL Server is running on ${chalk.cyan(`http://localhost:${port}/`)}`)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✔️  Type ${chalk.cyan('rs')} to restart the server`)
      }
    }

    cb && cb()
  }

  // Apollo Engine
  let apolloEngineEnabled = false
  if (options.apolloEngine) {
    if (engineKey) {
      const { ApolloEngine } = require('apollo-engine')

      let userOptions = {}

      try {
        userOptions = load(options.paths.engine)
      } catch (e) {}

      const engine = new ApolloEngine({
        apiKey: engineKey,
        logging: {
          level: 'WARN',
        },
        stores: [
          {
            'name': 'publicResponseCache',
            'inMemory': {
              'cacheSize': 10485760,
            },
          },
          {
            'name': 'privateResponseCache',
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
        sessionAuth: {
          header: 'Authorization',
        },
        queryCache: {
          publicFullQueryStore: 'publicResponseCache',
          privateFullQueryStore: 'privateResponseCache',
        },
        persistedQueries: {
          store: 'persistedQueries',
        },
        frontends: [
          {
            overrideGraphqlResponseHeaders: {
              'Access-Control-Allow-Origin': graphqlCors,
            },
          },
        ],
        // dumpTraffic: process.env.NODE_ENV !== 'production',
        ...userOptions,
      })

      engine.listen({
        port,
        httpServer: server,
        graphqlPaths: [graphqlPath, graphqlSubscriptionsPath],
      }, doneCallback)

      apolloEngineEnabled = true
      if (!options.quiet) {
        console.log(`✔️  Apollo Engine is enabled (open dashboard on https://engine.apollographql.com/)`)
      }
    } else if (!options.quiet) {
      console.log(chalk.yellow('Apollo Engine key not found.') + `To enable Engine, set the ${chalk.cyan('VUE_APP_APOLLO_ENGINE_KEY')} env variable.`)
      console.log('Create a key at https://engine.apollographql.com/')
      console.log('You may see `Error: Must provide document` errors (query persisting tries).')
    }
  }

  if (!apolloEngineEnabled) {
    server.listen(port, doneCallback)
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
