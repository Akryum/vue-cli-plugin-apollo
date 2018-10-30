module.exports = api => {
  const { registerWidget, onAction } = api.namespace('org.akryum.vue-apollo.widgets.')

  function queryEngine ({ query, variables }) {
    const { execute } = require('../utils/engine-api')
    const { loadEnv } = require('../utils/load-env')
    const env = loadEnv([
      api.resolve('.env'),
      api.resolve('.env.local'),
    ])
    const key = env.VUE_APP_APOLLO_ENGINE_KEY
    return execute({
      query,
      variables,
      key,
    })
  }

  // Key metrics
  {
    registerWidget({
      id: 'engine-key-metrics',
      title: 'Engine Key Metrics',
      description: 'Get Engine analytics at a glance',
      longDescription: `Displays key metrics of the Apollo Engine metrics. You can choose between different types of metrics.`,
      link: 'https://www.apollographql.com/engine',
      component: 'org.akryum.vue-apollo.components.widgets.engine-key-metrics',
      minWidth: 2,
      minHeight: 1,
      maxWidth: 3,
      maxHeight: 2,
      defaultWidth: 3,
      defaultHeight: 2,
      needsUserConfig: true,
      onConfigOpen: async ({ context }) => {
        const ALL_SERVICES = require('../operations/engine/all-services')

        let allServices = []

        try {
          const { data } = await queryEngine({
            query: ALL_SERVICES,
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
              message: 'Select your Engine service',
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
              default: 'requestRate',
              validate: input => !!input,
            },
            {
              name: 'timeRange',
              type: 'list',
              message: 'Time range',
              choices: [
                { name: 'Last hour', value: 3600 },
                { name: 'Last day', value: 86400 },
                { name: 'Last week', value: 86400 * 7 },
                { name: 'Last month', value: 86400 * 30 },
              ],
              default: 3600,
              validate: input => !!input,
            },
          ],
        }
      },
    })

    const operations = {
      requestRate: require('../operations/engine/key-metrics/request-rate'),
      p95Time: require('../operations/engine/key-metrics/p95-time'),
      errorPercentage: require('../operations/engine/key-metrics/error-percentage'),
    }

    const resolutions = {
      3600: 'R1M',
      86400: 'R15M',
      [86400 * 7]: 'R6H',
      [86400 * 30]: 'R1D',
    }

    onAction('actions.query-engine', async params => {
      const query = operations[params.type]
      const { data, errors } = await queryEngine({
        query,
        variables: {
          serviceId: params.service,
          timeFrom: `-${params.timeRange}`,
          timeTo: '-0',
          resolution: resolutions[params.timeRange],
          ...params.otherVariables || {},
        },
      })
      if (errors) {
        throw new Error(`${errors.map(e => e.message).join(', ')}`)
      }
      return data
    })
  }
}
