module.exports = api => {
  const { registerWidget } = api.namespace('org.akryum.vue-apollo.widgets.')

  registerWidget({
    id: 'engine-key-metrics',
    title: 'Engine Key Metrics',
    description: 'Get Engine analytics at a glance',
    longDescription: `Displays key metrics of the Apollo Engine metrics. You can choose between different types of metrics.`,
    link: 'https://www.apollographql.com/engine',
    component: 'org.akryum.vue-apollo.components.widgets.engine-key-metrics',
    minWidth: 3,
    minHeight: 2,
    maxWidth: 3,
    maxHeight: 2,
    needsUserConfig: true,
    onConfigOpen: async ({ context }) => {
      const { execute } = require('../utils/engine-api')
      const { loadEnv } = require('../utils/load-env')
      const ALL_SERVICES = require('../operations/engine/all-services')

      const env = loadEnv([
        api.resolve('.env'),
        api.resolve('.env.local'),
      ])
      const key = env.VUE_APP_APOLLO_ENGINE_KEY

      let allServices = []

      try {
        const { data } = await execute({
          query: ALL_SERVICES,
          key,
        })
        allServices = data.allServices
      } catch (e) {
        console.log(e)
      }

      return {
        prompts: [
          {
            name: 'service',
            type: 'list',
            message: 'Select a service',
            choices: allServices.map(service => ({
              name: service.name,
              value: service.id,
            })),
            validate: input => !!input,
          },
          {
            name: 'type',
            type: 'list',
            message: 'Metrics type',
            choices: [
              { name: 'Request rate', value: 'requestRate' },
              { name: 'p95 Service time', value: 'p95Time' },
              { name: 'Error percentage', value: 'errorPercentage' },
            ],
            validate: input => !!input,
          },
        ],
      }
    },
  })
}
