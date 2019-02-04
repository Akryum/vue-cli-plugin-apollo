# Running the GraphQL server in production

## Production app

```
cross-env NODE_ENV=production yarn run apollo:run --mode production
```

If you deploy on now.sh, add the following script to your `package.json`:

```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=production yarn run apollo:run --mode production" 
  }
}
```

## Library published on npm

If your project is meant to be used as a package installed from npm, you will need to move `vue-cli-plugin-apollo` from the `devDependencies` field to `dependencies` in your `package.json` file. Then you can run the server:

```js
const server = require('vue-cli-plugin-apollo/graphql-server')

const opts = {
  host: 'localhost',
  port: 4000,
  graphqlPath: '/graphql',
  subscriptionsPath: '/graphql',
  enableMocks: false,
  enableEngine: false,
  cors: '*',
  timeout: 1000000,
  quiet: true,
  paths: {
    typeDefs: require.resolve('some-folder/apollo-server/type-defs.js'),
    resolvers: require.resolve('some-folder/apollo-server/resolvers.js'),
    context: require.resolve('some-folder/apollo-server/context.js'),
    pubsub: require.resolve('some-folder/apollo-server/pubsub.js'),
    server: require.resolve('some-folder/apollo-server/server.js'),
    directives: require.resolve('some-folder/apollo-server/directives.js')
    dataSources: require.resolve('some-folder/apollo-server/data-sources.js')
  }
}

server(opts, () => {
  console.log('Server is running!')
})
```
