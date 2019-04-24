# Client state

You can use [local state](https://www.apollographql.com/docs/react/essentials/local-state.html) for client-only local data with the related options of `createApolloClient`:

```js
import gql from 'graphql-tag'
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'

const options = {
  // ...

  typeDefs: gql`
  type Query {
    connected: Boolean!
  }
  `,
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
  onCacheInit: cache => {
    const data = {
      connected: false,
    }
    cache.writeData({ data })
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
