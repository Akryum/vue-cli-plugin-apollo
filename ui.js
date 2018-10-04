const path = require('path')
const { openBrowser } = require('@vue/cli-shared-utils')

const ifDef = (value, cb) => typeof value !== 'undefined' && cb(value)

module.exports = api => {
  const { getSharedData, setSharedData, addSuggestion, removeSuggestion } = api.namespace('org.akryum.vue-apollo.')

  function resetData () {
    if (!getSharedData('running')) {
      setSharedData('running', false)
      setSharedData('urls', null)
      setSharedData('error', false)
    }
  }

  api.onProjectOpen(() => {
    resetData()
  })

  function onGraphqlServerMessage ({ data }) {
    let message = data['org.akryum.vue-apollo']
    if (message) {
      ifDef(message.urls, value => setSharedData('urls', value))
      ifDef(message.error, value => setSharedData('error', value))
    }
  }

  const common = {
    link: 'https://github.com/Akryum/vue-cli-plugin-apollo#injected-commands',
    views: [
      {
        id: 'org.akryum.vue-apollo.views.playground',
        label: 'Playground',
        icon: 'gamepad',
        component: 'org.akryum.vue-apollo.components.playground',
      },
    ],
    defaultView: 'org.akryum.vue-apollo.views.playground',
    onRun: () => {
      api.ipcOn(onGraphqlServerMessage)
      setSharedData('running', true)
    },
    onExit: () => {
      api.ipcOff(onGraphqlServerMessage)
      resetData()
    },
  }

  const DEV_TASK = /vue-cli-service apollo:watch/
  const RUN_TASK = /vue-cli-service apollo:run/

  api.describeTask({
    match: DEV_TASK,
    description: 'Run and watch the GraphQL server',
    ...common,
  })

  api.describeTask({
    match: RUN_TASK,
    description: 'Run the GraphQL server',
    ...common,
  })

  api.addClientAddon({
    id: 'org.akryum.vue-apollo.client-addon',
    path: path.resolve(__dirname, './client-addon-dist'),
  })

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

  const OPEN_ENGINE = 'suggestions.open-engine'

  api.onViewOpen(({ view }) => {
    if (view.id !== 'vue-project-tasks') {
      removeTaskSuggestions()
    }
  })

  api.onTaskOpen(({ task }) => {
    if (task.match === DEV_TASK || task.match === RUN_TASK) {
      addSuggestion({
        id: OPEN_ENGINE,
        type: 'action',
        label: 'Open Apollo Engine',
        // actionLink: 'https://engine.apollographql.com/',
        handler () {
          openBrowser('https://engine.apollographql.com/')
          return {
            keep: true,
          }
        },
      })
    } else {
      removeTaskSuggestions()
    }
  })

  function removeTaskSuggestions () {
    [OPEN_ENGINE].forEach(id => removeSuggestion(id))
  }
}

function getConfigData (data) {
  return (data.vue && data.vue.pluginOptions && data.vue.pluginOptions.apollo) || {}
}

function stringOnly (value) {
  return typeof value === 'string' ? value : undefined
}
