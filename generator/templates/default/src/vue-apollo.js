import Vue from 'vue'
import VueApollo from 'vue-apollo'
import createApolloClient from './apollo'

// Install the vue plugin
Vue.use(VueApollo)

// Create apollo client
export const apolloClient = createApolloClient({ ssr: false })

// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})
