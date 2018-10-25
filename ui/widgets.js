module.exports = api => {
  const { registerWidget } = api.namespace('org.akryum.vue-apollo.widgets.')

  registerWidget({
    id: 'apollo-engine',
    title: 'Apollo Engine',
    description: 'Get Engine analytics at a glance',
    longDescription: `Select different key metrics or graphs to be displayed on your dashboard, with data directly from your Apollo Engine service.`,
    link: 'https://www.apollographql.com/engine',
    component: 'org.akryum.vue-apollo.components.widgets.apollo-engine',
    minWidth: 2,
    minHeight: 2,
    maxWidth: 6,
    maxHeight: 6,
    needsUserConfig: true,
    onConfigOpen: async ({ context }) => {
      return {
        prompts: [
          {
            name: 'apiKey',
            type: 'input',
            message: 'Apollo Engine API key',
            validate: input => !!input,
          },
        ],
      }
    },
  })
}
