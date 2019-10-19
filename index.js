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

const SCHEMA_OPTIONS = {
  '--endpoint [endpoint]': 'URL of running server or path to JSON schema file',
  '--key [key]': 'Engine service key',
  '--tag [tag]': 'Schema Tag',
}

const DEFAULT_GENERATE_OUTPUT = './node_modules/.temp/graphql/schema'

function nullable (value) {
  return value == null ? {} : value
}

module.exports = (api, options) => {
  const apolloOptions = nullable(nullable(options.pluginOptions).apollo)
  const useThreads = process.env.NODE_ENV === 'production' && options.parallel
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')
  const { generateCacheIdentifier } = require('./utils')

  api.chainWebpack(config => {
    const rule = config.module
      .rule('gql')
      .test(/\.(gql|graphql)$/)
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
      if (apolloOptions.lintGQL) {
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
      } else if (apolloOptions.lintGQL !== false) {
        console.log('To enable GQL files in ESLint, set the `pluginOptions.apollo.lintGQL` project option to `true` in `vue.config.js`. Put `false` to hide this message.')
        console.log('You also need to install `eslint-plugin-graphql` and enable it in your ESLint configuration.')
      }
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

  api.registerCommand('apollo:dev', {
    description: 'Run the Apollo server and watch the sources to restart automatically',
    usage: 'vue-cli-service apollo:dev [options]',
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
      execa('vue-cli-service apollo:schema:generate', ['--watch'], {
        stdio: ['inherit', 'inherit', 'inherit'],
        cleanup: true,
        shell: true,
      })
    }

    // Pass the args along
    const flatArgs = getFlatArgs(args, ['_', 'run', 'delay', 'generate-schema'])

    return runWatch(api, options, {
      script: 'apollo:start',
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

  api.registerCommand('apollo:start', {
    description: 'Run the Apollo server',
    usage: 'vue-cli-service apollo:start [options]',
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
      execa('vue-cli-service apollo:schema:generate', {
        stdio: ['inherit', 'inherit', 'inherit'],
        cleanup: true,
        shell: true,
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

  api.registerCommand('apollo:schema:generate', {
    description: 'Generates full schema JSON and GraphQL files',
    usage: 'vue-cli-service apollo:schema:generate [options]',
    options: {
      '--watch': 'Watch server files and re-generate schema JSON',
      '--output [path]': 'Path to the output files',
    },
    details: 'For more info, see https://github.com/Akryum/vue-cli-plugin-apollo',
  }, async args => {
    if (args.watch) {
      const {
        getFlatArgs,
        runWatch,
      } = require('./utils')

      const flatArgs = getFlatArgs(args, ['watch'])
      return runWatch(api, options, {
        script: 'apollo:schema:generate',
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

  api.registerCommand('apollo:client:check', {
    description: 'Compare schema from Apollo Engine',
    usage: 'vue-cli-service apollo:client:check [options]',
    options: SCHEMA_OPTIONS,
    details: 'For more info, see https://github.com/Akryum/vue-cli-plugin-apollo',
  }, async args => {
    throw new Error(`Not implemented yet`)

    /* eslint-disable no-unreachable */

    const endpoint = args.endpoint || `${DEFAULT_GENERATE_OUTPUT}.json`
    const key = args.key || process.env.VUE_APP_APOLLO_ENGINE_KEY
    const tag = args.tag || process.env.VUE_APP_APOLLO_ENGINE_TAG
    const engineEndpoint = process.env.APOLLO_ENGINE_API_ENDPOINT

    await autoGenerateSchema(endpoint)

    const checkSchema = require('./utils/check-schema')
    await checkSchema({
      endpoint,
      key,
      tag,
      engineEndpoint,
    })
  })

  api.registerCommand('apollo:schema:publish', {
    description: 'Publish schema to Apollo Engine',
    usage: 'vue-cli-service apollo:schema:publish [options]',
    options: SCHEMA_OPTIONS,
    details: 'For more info, see https://github.com/Akryum/vue-cli-plugin-apollo',
  }, async args => {
    const endpoint = args.endpoint || `${DEFAULT_GENERATE_OUTPUT}.json`
    const key = args.key || process.env.VUE_APP_APOLLO_ENGINE_KEY
    const tag = args.tag || process.env.VUE_APP_APOLLO_ENGINE_TAG
    const engineEndpoint = process.env.APOLLO_ENGINE_API_ENDPOINT

    await autoGenerateSchema(endpoint)

    const publishSchema = require('./utils/publish-schema')
    await publishSchema({
      endpoint,
      key,
      tag,
      engineEndpoint,
    })
  })

  async function autoGenerateSchema (endpoint) {
    // Auto-generate if json file doesn't exist
    if (endpoint.match(/\.json$/i)) {
      const fs = require('fs')
      const file = api.resolve(endpoint)
      if (!fs.existsSync(file)) {
        const path = require('path')
        const output = path.join(path.dirname(file), path.basename(file, path.extname(file)))
        const execa = require('execa')
        await execa('vue-cli-service apollo:schema:generate', [
          '--output',
          output,
        ], {
          stdio: ['inherit', 'inherit', 'inherit'],
          cleanup: true,
          shell: true,
        })
        const { info } = require('@vue/cli-shared-utils')
        info(`The JSON schema was automatically generated in '${file}'.`, 'apollo')
      }
    }
  }
}

module.exports.defaultModes = {
  'apollo:dev': 'development',
}
