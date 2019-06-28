const path = require('path')

module.exports = api => {
  const CONFIG = 'org.akryum.vue-apollo.configs.apollo'

  // Config file
  api.describeConfig({
    id: CONFIG,
    name: 'Apollo Server',
    description: 'Integrated GraphQL server',
    link: 'https://github.com/Akryum/vue-cli-plugin-apollo#configuration',
    files: {
      vue: {
        js: ['vue.config.js'],
      },
      graphql: {
        yaml: ['.graphqlconfig.yml'],
      },
    },
    onRead: ({ data, cwd }) => {
      return {
        prompts: [
          {
            name: 'enableMocks',
            message: 'Mocking',
            description: 'Enable auto-mocking for quick prototyping',
            link: 'https://github.com/Akryum/vue-cli-plugin-apollo#mocks',
            type: 'confirm',
            file: 'vue',
            default: false,
            value: getConfigData(data).enableMocks,
          },
          {
            name: 'serverFolder',
            message: 'Server folder',
            description: 'Folder containing the server source files',
            type: 'input',
            file: 'vue',
            default: './apollo-server',
            value: getConfigData(data).serverFolder,
          },
          {
            name: 'cors',
            message: 'CORS',
            description: 'Allow access to other origins',
            type: 'input',
            file: 'vue',
            default: '*',
            value: stringOnly(getConfigData(data).cors),
          },
          {
            name: 'timeout',
            message: 'Response timeout',
            description: 'Time before a Query request is timed out (in ms)',
            type: 'input',
            file: 'vue',
            default: '120000',
            transformer: value => value.toString(),
            filter: value => parseInt(value),
            value: getConfigData(data).timeout,
          },
          {
            name: 'enableEngine',
            group: 'Apollo Engine',
            message: 'Apollo Engine',
            description: 'Enable Apollo Engine, a cloud monitoring service',
            link: 'https://github.com/Akryum/vue-cli-plugin-apollo#apollo-engine',
            type: 'confirm',
            file: 'vue',
            default: false,
            value: getConfigData(data).enableEngine,
          },
          {
            name: 'integratedEngine',
            group: 'Apollo Engine',
            message: 'Integrated Engine layer',
            description: 'Uncheck this if you want to use an external Engine container/layer',
            link: 'https://www.apollographql.com/docs/apollo-server/v2/migration-engine.html#With-a-Running-Engine-Proxy',
            type: 'confirm',
            file: 'vue',
            when: answers => answers.enableEngine,
            default: true,
            value: getConfigData(data).integratedEngine,
          },
        ],
      }
    },
    onWrite: async ({ api, prompts, cwd }) => {
      const result = {}
      for (const prompt of prompts.filter(p => p.raw.file === 'vue')) {
        result[`pluginOptions.apollo.${prompt.id}`] = await api.getAnswer(prompt.id)
      }
      api.setData('vue', result)

      // Update app manifest

      const serverFolder = result['pluginOptions.apollo.serverFolder'] || prompts.find(p => p.id === 'serverFolder').raw.default
      api.setData('graphql', {
        'projects.app.schemaPath': path.join(serverFolder, 'schema.graphql'),
      })
    },
  })
}

function getConfigData (data) {
  return (data.vue && data.vue.pluginOptions && data.vue.pluginOptions.apollo) || {}
}

function stringOnly (value) {
  return typeof value === 'string' ? value : undefined
}
