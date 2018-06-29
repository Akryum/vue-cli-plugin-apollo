const path = require('path')

const ifDef = (value, cb) => typeof value !== 'undefined' && cb(value)

module.exports = api => {
  const { setSharedData, addSuggestion, removeSuggestion } = api.namespace('org.akryum.vue-apollo.')

  function resetData () {
    setSharedData('running', false)
    setSharedData('urls', null)
    setSharedData('error', false)
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
        actionLink: 'https://engine.apollographql.com/',
      })
    } else {
      removeTaskSuggestions()
    }
  })

  function removeTaskSuggestions () {
    [OPEN_ENGINE].forEach(id => removeSuggestion(id))
  }
}
