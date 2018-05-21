const {
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
      'graphql-type-json': '^0.2.1',
      'subscriptions-transport-ws': '^0.9.5',
      'vue-apollo': '^3.0.0-alpha.1',
    },
    devDependencies: {
      'graphql-tag': '^2.5.0',
      'eslint-plugin-graphql': '^1.5.0',
    },
  }

  if (options.addServer) {
    Object.assign(pkg, {
      scripts: {
        'graphql-api': 'vue-cli-service graphql-api',
        'run-graphql-api': 'vue-cli-service run-graphql-api',
      },
    })
  }

  api.extendPackage(pkg)

  // Vue config
  if (options.addServer) {
    // Modify vue config
    api.extendPackage({
      vue: {
        pluginOptions: {
          graphqlMock: options.addMocking,
          apolloEngine: options.addApolloEngine,
        },
      },
    })
  }

  api.render('./templates/default', {
    ...options,
  })

  if (options.addExamples) {
    api.render('./templates/examples', {
      ...options,
    })
  }

  if (options.addServer) {
    api.render('./templates/api-server', {
      ...options,
    })

    if (options.addExamples) {
      api.extendPackage({
        dependencies: {
          'lowdb': '^1.0.0',
          'mkdirp': '^0.5.1',
          'shortid': '^2.2.8',
        },
      })

      api.render('./templates/api-server-examples', {
        ...options,
      })
    }
  }

  api.onCreateComplete(() => {
    const fs = require('fs')

    // Modify main.js
    try {
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
    } catch (e) {
      api.exitLog(`Your main file couldn't be modified. You will have to edit the code yourself: https://github.com/Akryum/vue-cli-plugin-apollo#manual-code-changes`, 'warn')
    }

    if (options.addServer) {
      // Git ignore
      {
        const gitignorePath = api.resolve('./.gitignore')
        let content

        if (fs.existsSync(gitignorePath)) {
          content = fs.readFileSync(gitignorePath, { encoding: 'utf8' })
        } else {
          content = ''
        }

        if (content.indexOf('/live/') === -1) {
          content += '\n/live/\n'

          fs.writeFileSync(gitignorePath, content, { encoding: 'utf8' })
        }
      }
    }

    if (options.addApolloEngine) {
      // Modify .env.local file
      const envPath = api.resolve('./.env.local')
      let content = ''

      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, { encoding: 'utf8' })
      }

      if (content.indexOf('VUE_APP_APOLLO_ENGINE_KEY=') === -1) {
        content += `VUE_APP_APOLLO_ENGINE_KEY=${options.apolloEngineKey}\n`
      } else {
        content = content.replace(/VUE_APP_APOLLO_ENGINE_KEY=(.*)\n/, `VUE_APP_APOLLO_ENGINE_KEY=${options.apolloEngineKey}`)
      }
      fs.writeFileSync(envPath, content, { encoding: 'utf8' })
    }

    // Linting
    try {
      const lint = require('@vue/cli-plugin-eslint/lint')
      lint({ silent: true }, api)
    } catch (e) {
      // No ESLint vue-cli plugin
    }

    if (options.addServer) {
      api.exitLog(`Start the GraphQL API Server with ${chalk.cyan(`${hasYarn() ? 'yarn' : 'npm'} run graphql-api`)}`, 'info')
      if (options.addMocking) {
        api.exitLog(`Customize the mocks in ${chalk.cyan('src/graphql-api/mocks.js')}`, 'info')
      }
      if (options.addApolloEngine) {
        api.exitLog(`The Apollo Engine API key has been added to ${chalk.cyan('.local.env')}`, 'info')
      }
    }
  })
}
