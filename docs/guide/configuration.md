# Configuration

## createApolloClient options

```js
createApolloClient({
  // URL to the HTTP API
  httpEndpoint,
  // Url to the Websocket API
  wsEndpoint = null,
  // Token used in localstorage
  tokenName = 'apollo-token',
  // Enable this if you use Query persisting with Apollo Engine
  persisting = false,
  // Is currently Server-Side Rendering or not
  ssr = false,
  // Only use Websocket for all requests (including queries and mutations)
  websocketsOnly = false,
  // Custom starting link.
  // If you want to replace the default HttpLink, set `defaultHttpLink` to false
  link = null,
  // If true, add the default HttpLink.
  // Disable it if you want to replace it with a terminating link using `link` option.
  defaultHttpLink = true,
  // Options for the default HttpLink
  httpLinkOptions = {},
  // Custom Apollo cache implementation (default is apollo-cache-inmemory)
  cache = null,
  // Options for the default cache
  inMemoryCacheOptions = null,
  // Additional Apollo client options
  apollo = {},
  // apollo-link-state options
  clientState = null,
  // Function returning Authorization header token
  getAuth = defaultGetAuth,
})
```

## Plugin options

The GraphQL API Server can be configured via the `pluginOptions` in `vue.config.js`:

``` js
module.exports = {
  // Other options...
  pluginOptions: {
    // Apollo-related options
    apollo: {
      // Enable automatic mocking
      enableMocks: true,
      // Enable Apollo Engine
      enableEngine: true,

      /* Other options (with default values) */

      // Base folder for the server source files
      serverFolder: './apollo-server',
      // Cross-Origin options
      cors: '*',
      // Requests timeout (ms)
      timeout: 120000,
      // Integrated apollo engine
      integratedEngine: true,
      // For enable typescript server files
      // if you don't have @vue/cli-plugin-typescript
      typescript: true,
      // Apollo server options (will be merged with the included default options)
      serverOptions: {
        // ...
      },
    },
  },
}
```

See [Apollo Server options](https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html#constructor-options-lt-ApolloServer-gt).
