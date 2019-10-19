const path = require('path')
const chalk = require('chalk')

const DEFAULT_SERVER_FOLDER = './apollo-server'

let ipc, ipcTimer

function defaultValue (provided, value) {
  return provided == null ? value : provided
}

function nullable (value) {
  return value == null ? {} : value
}

function autoCall (fn, ...context) {
  if (typeof fn === 'function') {
    return fn(...context)
  }
  return fn
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
  const { IpcMessenger } = require('@vue/cli-shared-utils')
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

function getFlatArgs (args, ignore) {
  let flatArgs = []
  for (const key in args) {
    if (ignore.includes(key)) continue
    const value = args[key]
    if (value) {
      flatArgs.push(`--${key}`)
      if (value !== true) {
        flatArgs.push(JSON.stringify(value))
      }
    }
  }
  for (const arg of args._) {
    flatArgs.push(JSON.stringify(arg))
  }
  return flatArgs
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

function runWatch (api, options, {
  script,
  args,
  ext = 'js mjs json graphql gql ts',
  onStart = undefined,
  onRestart = undefined,
  onCrash = undefined,
}) {
  const { hasYarn } = require('@vue/cli-shared-utils')
  const nodemon = require('nodemon')

  const cmd = hasYarn() ? 'yarn' : 'npm'
  const { baseFolder } = getBasicServerOptions(api, options, args)

  return new Promise((resolve, reject) => {
    nodemon({
      exec: `${cmd} run ${script} ${cmd === 'npm' ? '-- ' : ''}${args.join(' ')}`,
      watch: [
        api.resolve(baseFolder),
      ],
      ignore: [
        api.resolve(path.join(baseFolder, 'live')),
      ],
      ext,
    })

    onStart && onStart()

    nodemon.on('restart', () => {
      onRestart && onRestart()
    })

    nodemon.on('crash', () => {
      onCrash && onCrash()
      console.log(chalk.red(`   Waiting for changes...`))
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
}

function getBasicServerOptions (api, options, args) {
  const apolloOptions = nullable(nullable(options.pluginOptions).apollo)
  const baseFolder = defaultValue(apolloOptions.serverFolder, DEFAULT_SERVER_FOLDER)
  return {
    apolloOptions,
    baseFolder,
  }
}

function getServerOptions (api, options, args) {
  // Env
  const host = args.host || process.env.VUE_APP_GRAPHQL_HOST || 'localhost'
  process.env.VUE_APP_GRAPHQL_HOST = host
  const port = args.port || process.env.VUE_APP_GRAPHQL_PORT || 4000
  process.env.VUE_APP_GRAPHQL_PORT = port
  const graphqlPath = process.env.VUE_APP_GRAPHQL_PATH || '/graphql'
  const subscriptionsPath = process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
  const engineKey = process.env.VUE_APP_APOLLO_ENGINE_KEY || null
  const schemaTag = process.env.VUE_APP_APOLLO_ENGINE_TAG

  // Plugin options
  const { apolloOptions, baseFolder } = getBasicServerOptions(api, options, args)

  let engineOptions = Object.assign({}, apolloOptions.engineOptions)
  if (!engineOptions.endpointUrl && process.env.APOLLO_ENGINE_TRACING_ENDPOINT) {
    engineOptions.endpointUrl = process.env.APOLLO_ENGINE_TRACING_ENDPOINT
  }

  return {
    host,
    port,
    graphqlPath,
    subscriptionsPath,
    engineKey,
    typescript: api.hasPlugin('typescript') || defaultValue(apolloOptions.typescript, false),
    enableMocks: defaultValue(args.mock, apolloOptions.enableMocks),
    enableEngine: defaultValue(args.engine, apolloOptions.enableEngine),
    cors: defaultValue(apolloOptions.cors, '*'),
    timeout: defaultValue(apolloOptions.timeout, 120000),
    integratedEngine: defaultValue(apolloOptions.integratedEngine, true),
    schemaTag,
    engineOptions,
    serverOptions: apolloOptions.apolloServer,
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
    apolloOptions,
    baseFolder,
  }
}

module.exports = {
  defaultValue,
  nullable,
  autoCall,
  generateCacheIdentifier,
  sendIpcMessage,
  getFlatArgs,
  runParallelCommand,
  runWatch,
  getServerOptions,
}
