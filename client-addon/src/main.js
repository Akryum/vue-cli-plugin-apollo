import GraphqlPlayground from './components/GraphqlPlayground.vue'
import EngineKeyMetrics from './components/widgets/EngineKeyMetrics.vue'

import ApolloView from './components/ApolloView.vue'

ClientAddonApi.component('org.akryum.vue-apollo.components.playground', GraphqlPlayground)
ClientAddonApi.component('org.akryum.vue-apollo.components.widgets.engine-key-metrics', EngineKeyMetrics)

ClientAddonApi.addRoutes('org.akryum.vue-apollo', [
  {
    path: '',
    name: 'org.akryum.vue-apollo.routes.apollo',
    component: ApolloView,
  },
])
