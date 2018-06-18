const path = require('path')

const ifDef = (value, cb) => typeof value !== 'undefined' && cb(value)

module.exports = api => {
  const { setSharedData } = api.namespace('vue-apollo-')

  function resetData () {
    setSharedData('running', false)
    setSharedData('urls', null)
    setSharedData('error', false)
  }

  api.onProjectOpen(() => {
    resetData()
  })

  function onGraphqlServerMessage ({ data }) {
    if (data.vueApollo) {
      ifDef(data.vueApollo.urls, value => setSharedData('urls', value))
      ifDef(data.vueApollo.error, value => setSharedData('error', value))
    }
  }

  const common = {
    link: 'https://github.com/Akryum/vue-cli-plugin-apollo#injected-commands',
    views: [
      {
        id: 'run-graphlq-api.playground',
        label: 'Playground',
        icon: 'gamepad',
        component: 'vue-apollo-playground',
      },
    ],
    defaultView: 'run-graphlq-api.playground',
    onRun: () => {
      api.ipcOn(onGraphqlServerMessage)
      setSharedData('running', true)
    },
    onExit: () => {
      api.ipcOff(onGraphqlServerMessage)
      resetData()
    },
  }

  const DEV_TASK = /vue-cli-service graphql-api/
  const RUN_TASK = /vue-cli-service run-graphql-api/

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
    id: 'vue-apollo',
    path: path.resolve(__dirname, './client-addon-dist'),
  })

  const OPEN_ENGINE = 'vue-apollo-open-engine'

  api.onViewOpen(({ view }) => {
    if (view.id !== 'vue-project-tasks') {
      removeTaskSuggestions()
    }
  })

  api.onTaskOpen(({ task }) => {
    if (task.match === DEV_TASK || task.match === RUN_TASK) {
      api.addSuggestion({
        id: OPEN_ENGINE,
        type: 'action',
        label: 'Open Apollo Engine',
        actionLink: 'https://engine.apollographql.com/',
      })
    } else {
      removeTaskSuggestions()
    }
  })

  function removeTaskSuggestions () {
    [OPEN_ENGINE].forEach(id => api.removeSuggestion(id))
  }
}
