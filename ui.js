const path = require('path')

module.exports = api => {
  const { setSharedData, removeSharedData } = api.namespace('vue-apollo-')

  api.onProjectOpen(() => {
    setSharedData('urls', null)
  })

  function onGraphqlServerMessage ({ data }) {
    if (data.vueApollo) {
      setSharedData('urls', data.vueApollo.urls)
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
    },
    onExit: () => {
      api.ipcOff(onGraphqlServerMessage)
      removeSharedData('urls')
    },
  }

  api.describeTask({
    match: /vue-cli-service graphql-api/,
    description: 'Run and watch the GraphQL server',
    ...common,
  })

  api.describeTask({
    match: /vue-cli-service run-graphql-api/,
    description: 'Run the GraphQL server',
    ...common,
  })

  api.addClientAddon({
    id: 'vue-apollo',
    path: path.resolve(__dirname, './client-addon-dist'),
  })
}
