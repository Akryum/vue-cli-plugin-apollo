# Authorization Header

By default, `createApolloClient` will retrieve the `Authorization` header value from `localStorage`. You can override this behavior with the `getAuth` option:

```js
const options = {
  // ...

  getAuth: (tokenName) => getUserToken(),
}

const { apolloClient } = createApolloClient(options)
```

If you use cookies, you can return `undefined`.

Example `apolloserver/context.js` that validates the token and set `userId` on resolvers context:

```js
import users from './connectors/users'

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
export default ({ req, connection }) => {
  // If the websocket context was already resolved
  if (connection && connection.context) return connection.context

  let token
  // HTTP
  if (req) token = req.get('Authorization')
  // Websocket
  if (connection) token = connection.authorization

  // User validation
  let userId
  if (token && users.validateToken(token)) {
    userId = token.userId
  }

  return {
    token,
    userId,
  }
}
```