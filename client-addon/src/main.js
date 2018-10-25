import GraphqlPlayground from './components/GraphqlPlayground.vue'
import ApolloEngineWidget from './components/widgets/ApolloEngine.vue'

import ApolloView from './components/ApolloView.vue'

ClientAddonApi.component('org.akryum.vue-apollo.components.playground', GraphqlPlayground)
ClientAddonApi.component('org.akryum.vue-apollo.components.widgets.apollo-engine', ApolloEngineWidget)

ClientAddonApi.addRoutes('org.akryum.vue-apollo', [
  {
    path: '',
    name: 'org.akryum.vue-apollo.routes.apollo',
    component: ApolloView,
  },
])
