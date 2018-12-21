# Client state

You can use [apollo-link-state](https://github.com/apollographql/apollo-link-state) for client-only local data with the `clientState` option of `createApolloClient`:

```js
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'

const options = {
  // ...

  clientState: {
    defaults: {
      connected: false,
    },
    resolvers: {
      Mutation: {
        connectedSet: (root, { value }, { cache }) => {
          const data = {
            connected: value,
          }
          cache.writeData({ data })
        },
      },
    },
  },
}

const { apolloClient } = createApolloClient(options)
```

Then you need to use the `@client` directive:

```graphql
query isConnected {
  connected @client
}
```

```graphql
mutation setConnected ($value: Boolean!) {
  connectedSet (value: $value) @client
}
```
