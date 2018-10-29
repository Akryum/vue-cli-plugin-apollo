const ifDef = (value, cb) => typeof value !== 'undefined' && cb(value)

module.exports = api => {
  const {
    getSharedData,
    setSharedData,
    addSuggestion,
    removeSuggestion,
    storageGet,
    storageSet,
  } = api.namespace('org.akryum.vue-apollo.')

  function resetData (force = false) {
    if (force || !getSharedData('running')) {
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

  const commonOptions = ({
    prompts = [],
    views = [],
    onBeforeRun = undefined,
    onRun = undefined,
    onExit = undefined,
  } = {}) => ({
    link: 'https://github.com/Akryum/vue-cli-plugin-apollo#injected-commands',
    views: [
      {
        id: 'org.akryum.vue-apollo.views.playground',
        label: 'Playground',
        icon: 'gamepad',
        component: 'org.akryum.vue-apollo.components.playground',
      },
      ...views,
    ],
    defaultView: 'org.akryum.vue-apollo.views.playground',
    prompts: [
      {
        name: 'host',
        type: 'input',
        default: '',
        message: 'Server host',
      },
      {
        name: 'port',
        type: 'input',
        default: '',
        message: 'Server port',
      },
      {
        name: 'mock',
        type: 'confirm',
        default: false,
        message: 'Force enable auto-mocks',
        description: 'Auto-mocks will return fake data for missing resolvers',
      },
      {
        name: 'engine',
        type: 'confirm',
        default: false,
        message: 'Force enable Apollo Engine',
      },
      {
        name: 'generate-schema',
        type: 'confirm',
        default: false,
        message: 'Auto-generate schma JSON and GraphQL files',
      },
      ...prompts,
    ],
    onBeforeRun: async ({ answers, args }) => {
      // Args
      if (answers.host) args.push('--host', answers.host)
      if (answers.port) args.push('--port', answers.port)
      if (answers.mock) args.push('--mock')
      if (answers.engine) args.push('--engine')
      if (answers['generate-schema']) args.push('--generate-schema')

      onBeforeRun && await onBeforeRun({ answers, args })
    },
    onRun: () => {
      api.ipcOn(onGraphqlServerMessage)
      setSharedData('running', true)

      onRun && onRun()
    },
    onExit: () => {
      api.ipcOff(onGraphqlServerMessage)
      resetData(true)

      onExit && onExit()
    },
  })

  const DEV_TASK = /vue-cli-service apollo:dev/
  const DEV_CLIENT_TASK = /vue-cli-service apollo:dev.*vue-cli-service serve/
  const START_TASK = /vue-cli-service apollo:start/
  const GENERATE_SCHEMA_TASK = /vue-cli-service apollo:schema:generate/
  const PUBLISH_SCHEMA_TASK = /vue-cli-service apollo:schema:publish/

  const devOptions = commonOptions({
    onBeforeRun: async ({ answers, args }) => {
      console.log(args)
    },
  })

  api.describeTask({
    match: DEV_TASK,
    description: 'Run and watch the GraphQL server',
    ...devOptions,
  })

  api.describeTask({
    match: DEV_CLIENT_TASK,
    description: 'Run and watch the GraphQL server (with client webpack dev server)',
    ...devOptions,
  })

  api.describeTask({
    match: START_TASK,
    description: 'Run the GraphQL server',
    ...commonOptions(),
  })

  api.describeTask({
    match: GENERATE_SCHEMA_TASK,
    description: 'Generates full schema JSON and GraphQL files',
    link: 'https://github.com/Akryum/vue-cli-plugin-apollo#injected-commands',
    prompts: [
      {
        name: 'watch',
        type: 'confirm',
        default: false,
        message: 'Watch mode',
        description: 'Generates automatically when server files change',
      },
    ],
    onBeforeRun: async ({ answers, args }) => {
      // Args
      if (answers.watch) args.push('--watch')
    },
  })

  api.describeTask({
    match: PUBLISH_SCHEMA_TASK,
    description: 'Publish schema to Apollo Engine',
    link: 'https://github.com/Akryum/vue-cli-plugin-apollo#injected-commands',
    prompts: [
      {
        name: 'endpoint',
        type: 'input',
        default: '',
        message: 'Endpoint',
        description: 'URL to running GraphQL server or path to JSON schema file',
      },
      {
        name: 'key',
        type: 'input',
        default: '',
        message: 'Engine service key',
        description: 'The unique API key associated with the Engine service of your project',
        link: 'https://engine.apollographql.com',
      },
    ],
    onBeforeRun: async ({ answers, args }) => {
      // Args
      if (answers.endpoint) args.push('--endpoint', args.endpoint)
      if (answers.key) args.push('--key', args.key)
    },
  })

  const WELCOME = 'suggestions.welcome'
  const WELCOME_DISABLED = 'suggestions.welcome.disabled'
  const OPEN_ENGINE = 'suggestions.open-engine'
  const VIEW_TIP = 'suggestions.view-tip'

  if (!storageGet(WELCOME_DISABLED)) {
    addSuggestion({
      id: WELCOME,
      type: 'action',
      label: 'Vue Apollo installed!',
      message: `Apollo GraphQL is now integrated into your project.<br>
      <ul>
      <li>You can configure the Apollo Server by going to 'Configurations'.</li>
      <li>Run the Apollo Server in the 'Tasks' page.</li>
      <li>The 'Apollo GraphQL' page has even more info and tools for you!</li>
      <li>An Apollo Engine analytics widget is also available in the Dashboard.</li>
      </ul>`,
      image: '/_plugin/vue-cli-plugin-apollo/vue-apollo-graphql.png',
      link: 'https://github.com/Akryum/vue-cli-plugin-apollo',
      handler () {
        storageSet(WELCOME_DISABLED, true)
      },
    })
  }

  api.onViewOpen(({ view }) => {
    if (view.id === 'org.akryum.vue-apollo.apollo') {
      addApolloEngineSuggestion()
    } else if (view.id !== 'vue-project-tasks') {
      removeTaskSuggestions()
    }
  })

  api.onTaskOpen(({ task }) => {
    if (task.match === DEV_TASK || task.match === START_TASK) {
      addViewTipSuggestion()
      addApolloEngineSuggestion()
    } else {
      removeTaskSuggestions()
    }
  })

  function addViewTipSuggestion () {
    addSuggestion({
      id: VIEW_TIP,
      type: 'action',
      label: 'Apollo GraphQL page',
      message: 'Check out the Apollo GraphQL page for more tools and info!',
      image: '/_plugin/vue-cli-plugin-apollo/view-tip.png',
      handler () {
        api.requestRoute({
          name: 'org.akryum.vue-apollo.routes.apollo',
        })
      },
    })
  }

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
    [OPEN_ENGINE, VIEW_TIP].forEach(id => removeSuggestion(id))
  }
}
