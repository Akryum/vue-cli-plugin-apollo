const {
  log,
  hasYarn,
  IpcMessenger,
} = require('@vue/cli-shared-utils')
const chalk = require('chalk')

module.exports = (api, options) => {
  const cmd = hasYarn() ? 'yarn' : 'npm'
  const useThreads = process.env.NODE_ENV === 'production' && options.parallel
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')

  api.chainWebpack(config => {
    const rule = config.module
      .rule('gql')
      .test(/\.(gql|graphql)$/)
      .include
      .add(api.resolve('src'))
      .add(api.resolve('tests'))
      .end()
      .use('cache-loader')
      .loader('cache-loader')
      .options({ cacheDirectory })
      .end()

    if (useThreads) {
      rule
        .use('thread-loader')
        .loader('thread-loader')
    }

    rule
      .use('gql-loader')
      .loader('graphql-tag/loader')
      .end()

    if (api.hasPlugin('eslint')) {
      const id = generateCacheIdentifier(api.resolve('.'))

      config.module
        .rule('eslint')
        .test(/\.(vue|(j|t)sx?|gql|graphql)$/)
        .use('eslint-loader')
        .tap(options => ({
          ...options,
          cacheIdentifier: options.cacheIdentifier + id,
        }))
    }
  })

  api.registerCommand('graphql-api', args => {
    const nodemon = require('nodemon')

    return new Promise((resolve, reject) => {
      nodemon({
        exec: `${cmd} run run-graphql-api`,
        watch: [
          api.resolve('./src/graphql-api/'),
        ],
        ignore: [
          api.resolve('./src/graphql-api/live/'),
        ],
        ext: 'js mjs json graphql gql',
      })

      nodemon.on('restart', () => {
        log(chalk.bold(chalk.green(`⏳  GraphQL API is restarting...`)))
      })

      nodemon.on('crash', () => {
        log(chalk.bold(chalk.red(`💥  GraphQL API crashed!`)))
        log(chalk.red(`   Waiting for changes...`))
      })

      nodemon.on('stdout', (...args) => {
        console.log(chalk.grey(...args))
      })

      nodemon.on('sdterr', (...args) => {
        console.log(chalk.grey(...args))
      })

      nodemon.on('quit', () => {
        resolve()
        process.exit()
      })
    })
  })

  api.registerCommand('run-graphql-api', args => {
    let server = require('./graphql-server')
    server = server.default || server

    const port = process.env.VUE_APP_GRAPHQL_PORT || 4000
    const graphqlPath = process.env.VUE_APP_GRAPHQL_PATH || '/graphql'
    const graphqlSubscriptionsPath = process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
    const graphqlPlaygroundPath = process.env.VUE_APP_GRAPHQL_PLAYGROUND_PATH || '/'
    const engineKey = process.env.VUE_APP_APOLLO_ENGINE_KEY || null
    const graphqlCors = process.env.VUE_APP_GRAPHQL_CORS || '*'

    const opts = {
      port,
      graphqlPath,
      graphqlSubscriptionsPath,
      graphqlPlaygroundPath,
      engineKey,
      graphqlCors,
      mock: options.pluginOptions.graphqlMock || args.mock,
      apolloEngine: options.pluginOptions.apolloEngine || args['apollo-engine'],
      timeout: options.pluginOptions.graphqlTimeout || 120000,
      paths: {
        typeDefs: api.resolve('./src/graphql-api/type-defs.js'),
        resolvers: api.resolve('./src/graphql-api/resolvers.js'),
        context: api.resolve('./src/graphql-api/context.js'),
        mocks: api.resolve('./src/graphql-api/mocks.js'),
        pubsub: api.resolve('./src/graphql-api/pubsub.js'),
        server: api.resolve('./src/graphql-api/server.js'),
        apollo: api.resolve('./src/graphql-api/apollo.js'),
        engine: api.resolve('./src/graphql-api/engine.js'),
        directives: api.resolve('./src/graphql-api/directives.js'),
      },
    }

    server(opts, () => {
      if (IpcMessenger) {
        const ipc = new IpcMessenger()
        ipc.connect()
        ipc.send({
          vueApollo: {
            urls: {
              playground: `http://localhost:${port}${graphqlPlaygroundPath}`,
            },
          },
        })
        ipc.disconnect()
      }
    })
  })
}

module.exports.defaultModes = {
  'run-graphql-api': 'development',
}

function generateCacheIdentifier (context) {
  const fs = require('fs')
  const path = require('path')

  const graphqlConfigFile = path.join(context, '.graphqlconfig')
  if (fs.existsSync(graphqlConfigFile)) {
    try {
      const graphqlConfig = JSON.parse(fs.readFileSync(graphqlConfigFile, { encoding: 'utf8' }))
      const schemaFile = path.join(context, graphqlConfig.schemaPath)
      return fs.statSync(schemaFile).mtimeMs
    } catch (e) {
      console.error('Invalid .graphqlconfig file')
    }
  }
}
