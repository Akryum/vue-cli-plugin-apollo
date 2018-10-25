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

  const OPEN_ENGINE = 'suggestions.open-engine'

  api.onViewOpen(({ view }) => {
    if (view.id === 'org.akryum.vue-apollo.apollo') {
      addApolloEngineSuggestion()
    } else if (view.id !== 'vue-project-tasks') {
      removeTaskSuggestions()
    }
  })

  api.onTaskOpen(({ task }) => {
    if (task.match === DEV_TASK || task.match === RUN_TASK) {
      addApolloEngineSuggestion()
    } else {
      removeTaskSuggestions()
    }
  })

  function addApolloEngineSuggestion () {
    addSuggestion({
      id: OPEN_ENGINE,
      type: 'action',
      label: 'Open Apollo Engine',
      message: `Apollo Engine is a cloud service that provides deep insights into your GraphQL layer, with performance and error analytics.`,
      image: '/_plugin/vue-cli-plugin-apollo/apollo-engine.png',
      link: 'https://www.apollographql.com/engine',
      actionLink: 'https://engine.apollographql.com/',
      // handler () {
      //   openBrowser('https://engine.apollographql.com/')
      //   return {
      //     keep: true,
      //   }
      // },
    })
  }

  function removeTaskSuggestions () {
    [OPEN_ENGINE].forEach(id => removeSuggestion(id))
  }
}
