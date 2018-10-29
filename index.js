const chalk = require('chalk')

const COMMAND_OPTIONS = {
  '-h, --host': 'specify server host',
  '-p, --port': 'specify server port',
  '--run [command]': 'run another command in parallel',
  '--mock': 'enables mocks',
  '--engine': 'enables Apollo Engine',
  '--delay': 'delays run by a small duration',
  '--generate-schema': 'auto-generate JSON and GraphQL schema files',
}

const DEFAULT_GENERATE_OUTPUT = './node_modules/.temp/graphql/schema'

module.exports = (api, options) => {
  const useThreads = process.env.NODE_ENV === 'production' && options.parallel
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')
  const { generateCacheIdentifier } = require('./utils')

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

    if (api.hasPlugin('eslint') && config.module.rules.has('eslint')) {
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

    config.resolve
      .extensions
      .prepend('.mjs')

    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .include
      .add(/node_modules/)
      .end()
      .type('javascript/auto')
  })

  api.registerCommand('apollo:watch', {
    description: 'Run the Apollo server and watch the sources to restart automatically',
    usage: 'vue-cli-service apollo:watch [options]',
    options: COMMAND_OPTIONS,
    details: 'For more info, see https://github.com/Akryum/vue-cli-plugin-apollo',
  }, args => {
    const {
      runParallelCommand,
      getFlatArgs,
      runWatch,
      sendIpcMessage,
    } = require('./utils')

    runParallelCommand(args)

    if (args['generate-schema']) {
      const execa = require('execa')
      execa('vue-cli-service apollo:generate-schema', ['--watch'], {
        cleanup: true,
        stdio: ['inherit', 'inherit', 'inherit'],
      })
    }

    // Pass the args along
    const flatArgs = getFlatArgs(args, ['_', 'run', 'delay', 'generate-schema'])

    return runWatch(api, options, {
      script: 'apollo:run',
      args: ['--delay', ...flatArgs],
      onStart: () => {
        sendIpcMessage({
          error: false,
        })
      },
      onCrash: () => {
        console.log(chalk.bold(chalk.red(`💥  GraphQL API crashed!`)))
        sendIpcMessage({
          urls: null,
          error: true,
        })
      },
      onRestart: () => {
        console.log(chalk.bold(chalk.green(`⏳  GraphQL API is restarting...`)))
        sendIpcMessage({
          error: false,
        })
      },
    })
  })

  api.registerCommand('apollo:run', {
    description: 'Run the Apollo server',
    usage: 'vue-cli-service apollo:run [options]',
    options: COMMAND_OPTIONS,
    details: 'For more info, see https://github.com/Akryum/vue-cli-plugin-apollo',
  }, args => {
    const {
      runParallelCommand,
      sendIpcMessage,
      getServerOptions,
    } = require('./utils')

    runParallelCommand(args)

    if (args['generate-schema']) {
      const execa = require('execa')
      execa('vue-cli-service apollo:generate-schema', {
        cleanup: true,
        stdio: ['inherit', 'inherit', 'inherit'],
      })
    }

    const run = () => {
      let server = require('./graphql-server')
      server = server.default || server

      const opts = getServerOptions(api, options, args)

      server(opts, () => {
        sendIpcMessage({
          urls: {
            playground: `http://localhost:${opts.port}${opts.graphqlPath}`,
          },
        })
      })
    }

    if (args.delay) {
      setTimeout(run, 300)
    } else {
      run()
    }
  })

  api.registerCommand('apollo:generate-schema', {
    '--watch': 'Watch server files and re-generate schema JSON',
    '--output [path]': 'Path to the output files',
  }, async args => {
    if (args.watch) {
      const {
        getFlatArgs,
        runWatch,
      } = require('./utils')

      const flatArgs = getFlatArgs(args, ['watch'])
      return runWatch(api, options, {
        script: 'apollo:generate-schema',
        args: flatArgs,
      })
    } else {
      const {
        getServerOptions,
      } = require('./utils')

      const opts = getServerOptions(api, options, args)

      const output = args.output || DEFAULT_GENERATE_OUTPUT
      const jsonOutput = `${output}.json`
      const graphqlOutput = `${output}.graphql`

      const generateSchema = require('./utils/generate-schema')
      await generateSchema({
        paths: opts.paths,
        jsonOutput,
        graphqlOutput,
        typescript: opts.typescript,
      })
    }
  })

  api.registerCommand('apollo:publish-schema', {
    '--endpoint [endpoint]': 'URL of running server or path to JSON schema file',
    '--key [key]': 'Engine service key',
  }, async args => {
    const endpoint = args.endpoint || `${DEFAULT_GENERATE_OUTPUT}.json`
    const key = args.key || process.env.VUE_APP_APOLLO_ENGINE_KEY

    const publishSchema = require('./utils/publish-schema')
    await publishSchema({
      endpoint,
      key,
    })
  })
}

module.exports.defaultModes = {
  'apollo:watch': 'development',
}
