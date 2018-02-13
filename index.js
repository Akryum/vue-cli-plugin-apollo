const {
  log,
  hasYarn,
} = require('@vue/cli-shared-utils')
const chalk = require('chalk')

module.exports = (api, options) => {
  const cmd = hasYarn() ? 'yarn' : 'npm'
  const useThreads = process.env.NODE_ENV === 'production' && options.parallel
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')

  api.chainWebpack(webpackConfig => {
    const rule = webpackConfig.module
      .rule('gql')
      .test(/\.(gql|graphql)$/)
      .include
      .add(api.resolve('src'))
      .add(api.resolve('test'))
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
  })

  api.registerCommand('graphql-api', args => {
    const nodemon = require('nodemon')

    return new Promise((resolve, reject) => {
      nodemon({
        exec: `${cmd} run run-graphql-api`,
        watch: [
          api.resolve('./graphql-api/'),
        ],
        ignore: [
          api.resolve('./graphql-api/live/'),
        ],
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
    const server = require('./graphql-server')

    const opts = {
      mock: options.pluginOptions.graphqlMock || args.mock,
      apolloEngine: options.pluginOptions.apolloEngine || args['apollo-engine'],
      paths: {
        typeDefs: api.resolve('./graphql-api/type-defs.js'),
        resolvers: api.resolve('./graphql-api/resolvers.js'),
        context: api.resolve('./graphql-api/context.js'),
        mocks: api.resolve('./graphql-api/mocks.js'),
      },
    }

    server(opts)
  })
}
