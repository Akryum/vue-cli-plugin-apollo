const {
  log,
  hasYarn,
} = require('@vue/cli-shared-utils')
const chalk = require('chalk')

module.exports = (api, options, rootOptions) => {
  const pkg = {
    dependencies: {
      'apollo-cache-inmemory': '^1.0.0',
      'apollo-client': '^2.0.1',
      'apollo-link': '^1.0.0',
      'apollo-link-context': '^1.0.5',
      'apollo-link-http': '^1.0.0',
      'apollo-upload-client': '^7.0.0-alpha.4',
      'apollo-link-persisted-queries': '^0.1.0',
      'apollo-link-ws': '^1.0.0',
      'apollo-utilities': '^1.0.1',
      'graphql': '^0.13.0',
      'subscriptions-transport-ws': '^0.9.5',
      'vue-apollo': '^3.0.0-alpha.1',
    },
    devDependencies: {
      'graphql-tag': '^2.5.0',
    },
  }

  if (options.addServer) {
    Object.assign(pkg.dependencies, {
      'lowdb': '^1.0.0',
      'mkdirp': '^0.5.1',
      'shortid': '^2.2.8',
    })

    Object.assign(pkg, {
      scripts: {
        'graphql-api': 'vue-cli-service graphql-api',
        'run-graphql-api': 'vue-cli-service run-graphql-api',
      },
    })
  }

  api.extendPackage(pkg)

  api.render('./templates/default', {
    ...options,
  })

  if (options.addServer) {
    api.render('./templates/api-server', {
      ...options,
    })
  }

  api.onCreateComplete(() => {
    const fs = require('fs')

    // Modify main.js
    {
      const tsPath = api.resolve('./src/main.ts')
      const jsPath = api.resolve('./src/main.js')

      const mainPath = fs.existsSync(tsPath) ? tsPath : jsPath
      let content = fs.readFileSync(mainPath, { encoding: 'utf8' })

      const lines = content.split(/\r?\n/g).reverse()

      // Inject import
      const lastImportIndex = lines.findIndex(line => line.match(/^import/))
      lines[lastImportIndex] += `\nimport { apolloProvider } from './vue-apollo'`

      // Modify app
      const appIndex = lines.findIndex(line => line.match(/new Vue/))
      lines[appIndex] += `\n  provide: apolloProvider.provide(),`

      content = lines.reverse().join('\n')
      fs.writeFileSync(mainPath, content, { encoding: 'utf8' })
    }

    if (options.addServer) {
      // Modify vue config
      const code = `\n    graphqlMock: ${options.addMocking},` +
        `\n    apolloEngine: ${options.addApolloEngine},`

      const envPath = api.resolve('./vue.config.js')
      let content

      let generateNew = false

      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, { encoding: 'utf8' })

        const lines = content.split(/\r?\n/g).reverse()

        const pluginOptionsIndex = lines.findIndex(line => line.match(/pluginOptions(\s*):/))
        if (pluginOptionsIndex !== -1) {
          lines[pluginOptionsIndex] += code
        } else {
          const lastLineIndex = lines.findIndex(line => line.trim().match(/^};?$/))
          if (lastLineIndex !== -1) {
            let line = lines[lastLineIndex + 1]
            if (!line.trim().match(/,$/)) {
              line += ','
            }
            line += `\n  pluginOptions: {` +
              code + `\n` +
              `  },`
            lines[lastLineIndex + 1] = line
          } else {
            generateNew = true
          }
        }

        if (!generateNew) content = lines.reverse().join('\n')
      } else {
        generateNew = true
      }

      if (generateNew) {
        content = `module.exports = {\n` +
          `  pluginOptions: {` +
          code + `\n` +
          `  },\n` +
          `}`
      }

      fs.writeFileSync(envPath, content, { encoding: 'utf8' })
    }

    if (options.addApolloEngine) {
      // Modify .env.local file
      const envPath = api.resolve('./.env.local')
      let content = ''

      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, { encoding: 'utf8' })
      }

      content += `VUE_APP_APOLLO_ENGINE_KEY=${options.apolloEngineKey}\n`
      fs.writeFileSync(envPath, content, { encoding: 'utf8' })
    }

    if (options.addServer) {
      setTimeout(() => {
        log(`   Start the GraphQL API Server with ${chalk.cyan(`${hasYarn() ? 'yarn' : 'npm'} run graphql-api`)}`)
        if (options.addMocking) {
          log(`   Customize the mocks in ${chalk.cyan('graphql-api/mocks.js')}`)
        }
        if (options.addApolloEngine) {
          log(`   The Apollo Engine API key has been added to ${chalk.cyan('.local.env')}`)
        }
        log('')
      }, 50)
    }
  })
}
