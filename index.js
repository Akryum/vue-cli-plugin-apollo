const path = require('path')
const {
  hasYarn,
  IpcMessenger,
} = require('@vue/cli-shared-utils')
const chalk = require('chalk')
const { defaultValue, nullable } = require('./utils')

const DEFAULT_SERVER_FOLDER = './apollo-server'
const COMMAND_OPTIONS = {
  '--mock': 'enables mocks',
  '--enable-engine': 'enables Apollo Engine',
  '--delay': 'delays run by a small duration',
  '-h, --host': 'specify server host',
  '-p, --port': 'specify server port',
  '--run [command]': 'run another command in parallel',
}

let ipc, ipcTimer

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

    if (api.hasPlugin('eslint') && config.module.rules.has('eslint')) {
      const id = generateCacheIdentifier(api.resolve('.'))

      config.module
        .rule('eslint')
        .test(/\.(vue|(j|t)sx?|gql|graphql)$/)
        .use('eslint-loader')
        .tap(options => {
          options.extensions.push('.gql', '.graphql')
          return {
            ...options,
            cacheIdentifier: options.cacheIdentifier + id,
          }
        })
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

    // Add string template tag transform to Bublé
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.transpileOptions = options.transpileOptions || {}
        options.transpileOptions.transforms = options.transpileOptions.transforms || {}
        options.transpileOptions.transforms.dangerousTaggedTemplateString = true
        return options
      })
  })

  api.registerCommand('apollo:watch', {
    description: 'Run the Apollo server and watch the sources to restart automatically',
    usage: 'vue-cli-service apollo:watch [options]',
    options: COMMAND_OPTIONS,
    details: 'For more info, see https://github.com/Akryum/vue-cli-plugin-apollo',
  }, args => {
    runParallelCommand(args)

    // Plugin options
    const apolloOptions = nullable(nullable(options.pluginOptions).apollo)
    const baseFolder = defaultValue(apolloOptions.serverFolder, DEFAULT_SERVER_FOLDER)

    const nodemon = require('nodemon')

    // Pass the args along
    let flatArgs = []
    for (const key in COMMAND_OPTIONS) {
      const shortKey = key.substr(2)
      if (args.hasOwnProperty(shortKey)) {
        flatArgs.push(key)
        const value = args[shortKey]
        if (value !== true) {
          flatArgs.push(value)
        }
      }
    }

    return new Promise((resolve, reject) => {
      nodemon({
        exec: `${cmd} run apollo:run --delay ${flatArgs.join(' ')}`,
        watch: [
          api.resolve(baseFolder),
        ],
        ignore: [
          api.resolve(path.join(baseFolder, 'live')),
        ],
        ext: 'js mjs json graphql gql ts',
      })

      sendIpcMessage({
        error: false,
      })

      nodemon.on('restart', () => {
        console.log(chalk.bold(chalk.green(`⏳  GraphQL API is restarting...`)))

        sendIpcMessage({
          error: false,
        })
      })

      nodemon.on('crash', () => {
        console.log(chalk.bold(chalk.red(`💥  GraphQL API crashed!`)))
        console.log(chalk.red(`   Waiting for changes...`))

        sendIpcMessage({
          urls: null,
          error: true,
        })
      })

      nodemon.on('stdout', (...args) => {
        console.log(chalk.grey(...args))
      })

      nodemon.on('stderr', (...args) => {
        console.log(chalk.grey(...args))
      })

      nodemon.on('quit', () => {
        resolve()
        process.exit()
      })
    })
  })

  api.registerCommand('apollo:run', {
    description: 'Run the Apollo server',
    usage: 'vue-cli-service apollo:run [options]',
    options: COMMAND_OPTIONS,
    details: 'For more info, see https://github.com/Akryum/vue-cli-plugin-apollo',
  }, args => {
    runParallelCommand(args)

    const run = () => {
      let server = require('./graphql-server')
      server = server.default || server

      // Env
      const host = args.host || process.env.VUE_APP_GRAPHQL_HOST || 'localhost'
      process.env.VUE_APP_GRAPHQL_HOST = host
      const port = args.port || process.env.VUE_APP_GRAPHQL_PORT || 4000
      process.env.VUE_APP_GRAPHQL_PORT = port
      const graphqlPath = process.env.VUE_APP_GRAPHQL_PATH || '/graphql'
      const subscriptionsPath = process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
      const engineKey = process.env.VUE_APP_APOLLO_ENGINE_KEY || null

      // Plugin options
      const apolloOptions = nullable(nullable(options.pluginOptions).apollo)
      const baseFolder = defaultValue(apolloOptions.serverFolder, DEFAULT_SERVER_FOLDER)

      const opts = {
        host,
        port,
        graphqlPath,
        subscriptionsPath,
        engineKey,
        typescript: api.hasPlugin('typescript') || defaultValue(apolloOptions.typescript, false),
        enableMocks: defaultValue(args.mock, apolloOptions.enableMocks),
        enableEngine: defaultValue(args['enable-engine'], apolloOptions.enableEngine),
        cors: defaultValue(apolloOptions.cors, '*'),
        timeout: defaultValue(apolloOptions.timeout, 120000),
        integratedEngine: defaultValue(apolloOptions.integratedEngine, true),
        serverOptions: apolloOptions.serverOptions,
        paths: {
          typeDefs: api.resolve(`${baseFolder}/type-defs`),
          resolvers: api.resolve(`${baseFolder}/resolvers`),
          context: api.resolve(`${baseFolder}/context`),
          mocks: api.resolve(`${baseFolder}/mocks`),
          pubsub: api.resolve(`${baseFolder}/pubsub`),
          server: api.resolve(`${baseFolder}/server`),
          apollo: api.resolve(`${baseFolder}/apollo`),
          engine: api.resolve(`${baseFolder}/engine`),
          directives: api.resolve(`${baseFolder}/directives`),
          dataSources: api.resolve(`${baseFolder}/data-sources`),
        },
      }

      server(opts, () => {
        sendIpcMessage({
          urls: {
            playground: `http://localhost:${port}${graphqlPath}`,
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

function sendIpcMessage (message) {
  if (!ipc && IpcMessenger) {
    ipc = new IpcMessenger()
    ipc.connect()
  }
  if (ipc) {
    ipc.send({
      'org.akryum.vue-apollo': message,
    })
    clearTimeout(ipcTimer)
    ipcTimer = setTimeout(() => {
      ipc.disconnect()
      ipc = null
    }, 3000)
  }
}

function runParallelCommand ({ run }) {
  if (run) {
    const execa = require('execa')
    const [file, ...commandArgs] = run.split(' ')
    execa(file, commandArgs, {
      cleanup: true,
      stdio: ['inherit', 'inherit', 'inherit'],
    })
  }
}

module.exports.defaultModes = {
  'apollo:watch': 'development',
}
