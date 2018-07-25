import { ApolloClient } from 'apollo-client'
import { split, from } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { createUploadLink } from 'apollo-upload-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import MessageTypes from 'subscriptions-transport-ws/dist/message-types'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { createPersistedQueryLink } from 'apollo-link-persisted-queries'
import { setContext } from 'apollo-link-context'
import { withClientState } from 'apollo-link-state'

// Create the apollo client
export function createApolloClient ({
  httpEndpoint,
  httpLinkOptions = {},
  wsEndpoint = null,
  uploadEndpoint = null,
  tokenName = 'apollo-token',
  persisting = false,
  ssr = false,
  websocketsOnly = false,
  link = null,
  cache = null,
  apollo = {},
  clientState = null,
  getAuth = defaultGetAuth,
}) {
  let wsClient, authLink, stateLink
  const disableHttp = websocketsOnly && !ssr && wsEndpoint

  // Apollo cache
  if (!cache) {
    cache = new InMemoryCache()
  }

  if (!disableHttp) {
    const httpLink = new HttpLink({
      // You should use an absolute URL here
      uri: httpEndpoint,
      ...httpLinkOptions,
    })

    if (!link) {
      link = httpLink
    } else {
      link = httpLink.concat(link)
    }

    // HTTP Auth header injection
    authLink = setContext((_, { headers }) => {
      const authorization = getAuth(tokenName)
      const authorizationHeader = authorization ? { authorization } : {}
      return {
        headers: {
          ...headers,
          ...authorizationHeader,
        },
      }
    })

    // Concat all the http link parts
    link = authLink.concat(link)
  }

  // On the server, we don't want WebSockets and Upload links
  if (!ssr) {
    // If on the client, recover the injected state
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-underscore-dangle
      const state = window.__APOLLO_STATE__
      if (state) {
        // If you have multiple clients, use `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }

    if (!disableHttp) {
      if (persisting) {
        link = createPersistedQueryLink().concat(link)
      }

      // File upload
      const uploadLink = authLink.concat(createUploadLink({
        uri: uploadEndpoint || httpEndpoint,
      }))

      // using the ability to split links, you can send data to each link
      // depending on what kind of operation is being sent
      link = split(
        operation => operation.getContext().upload,
        uploadLink,
        link
      )
    }

    // Web socket
    if (wsEndpoint) {
      wsClient = new SubscriptionClient(wsEndpoint, {
        reconnect: true,
        connectionParams: () => {
          const authorization = getAuth(tokenName)
          return authorization ? { authorization } : {}
        },
      })

      // Create the subscription websocket link
      const wsLink = new WebSocketLink(wsClient)

      if (disableHttp) {
        link = wsLink
      } else {
        link = split(
          // split based on operation type
          ({ query }) => {
            const { kind, operation } = getMainDefinition(query)
            return kind === 'OperationDefinition' &&
              operation === 'subscription'
          },
          wsLink,
          link
        )
      }
    }
  }

  if (clientState) {
    stateLink = withClientState({
      cache,
      ...clientState,
    })
    link = from([stateLink, link])
  }

  const apolloClient = new ApolloClient({
    link,
    cache,
    // Additional options
    ...(ssr ? {
      // Set this on the server to optimize queries when SSR
      ssrMode: true,
    } : {
      // This will temporary disable query force-fetching
      ssrForceFetchDelay: 100,
      // Apollo devtools
      connectToDevTools: process.env.NODE_ENV !== 'production',
    }),
    ...apollo,
  })

  // Re-write the client state defaults on cache reset
  if (stateLink) {
    apolloClient.onResetStore(stateLink.writeDefaults)
  }

  return {
    apolloClient,
    wsClient,
    stateLink,
  }
}

export function restartWebsockets (wsClient) {
  // Copy current operations
  const operations = Object.assign({}, wsClient.operations)

  // Close connection
  wsClient.close(true)

  // Open a new one
  wsClient.connect()

  // Push all current operations to the new connection
  Object.keys(operations).forEach(id => {
    wsClient.sendMessage(
      id,
      MessageTypes.GQL_START,
      operations[id].options
    )
  })
}

function defaultGetAuth (tokenName) {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem(tokenName)
  // return the headers to the context so httpLink can read them
  return token ? `Bearer ${token}` : ''
}
