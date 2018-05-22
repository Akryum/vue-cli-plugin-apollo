# vue-cli-plugin-apollo

[![npm](https://img.shields.io/npm/v/vue-cli-plugin-apollo.svg) ![npm](https://img.shields.io/npm/dm/vue-cli-plugin-apollo.svg)](https://www.npmjs.com/package/vue-cli-plugin-apollo)
[![vue-cli3](https://img.shields.io/badge/vue--cli-3.x-brightgreen.svg)](https://github.com/vuejs/vue-cli)
[![apollo-2](https://img.shields.io/badge/apollo-2.x-blue.svg)](https://www.apollographql.com/)

**:rocket: Start building a Vue app with Apollo and GraphQL in 2 minutes!**

This is a vue-cli 3.x plugin to add Apollo and GraphQL in your Vue project.

**:star: Features:**

- Automatically integrate [vue-apollo](https://github.com/Akryum/vue-apollo) into your Vue app
- Embed Apollo client config (upgradable)
- Included optional Graphql API Server (upgradable):
  - Dead simple GraphQL API sources generated into your project
  - Upgradable service running [apollo-server](https://www.apollographql.com/docs/apollo-server/)
  - Websocket subscriptions support
  - Optional automatic mocking
  - Optional [Apollo Engine](https://www.apollographql.com/engine) support
- Included optional example component with:
  - Watched query
  - Mutation
  - Realtime subscription using Websockets
- GraphQL validation using ESLint

## Getting started

:warning: Make sure you have vue-cli 3.x.x:

```
vue --version
```

If you don't have a project created with vue-cli 3.x yet:

```
vue create my-new-app
```

Navigate to the newly created project folder and add the cli plugin:

```
cd my-new-app
vue add apollo
```

*:information_source: An example `ApolloExample.vue` component alongside some GraphQL query files will be added into your sources if you chose to include the examples.*

Start your app:

```
npm run serve
```

**Updating `vue-cli-plugin-apollo` will also update both Apollo Client and its configuration for you! :+1:**

Read the [vue-apollo doc](https://github.com/Akryum/vue-apollo).

### GraphQL API Server

If you enabled the GraphQL API Server, open a new terminal and start it:

```
npm run graphql-api
```

You can edit the files generated in the `./src/graphql-api` folder:

- `schema.graphql` contains the Schema written with the [schema definition language](https://github.com/facebook/graphql/blob/master/spec/Section%203%20--%20Type%20System.md).
- `resolvers.js` declares the [Apollo resolvers](https://www.apollographql.com/docs/graphql-tools/resolvers.html).
- `context.js` allows injecting a context object into all the resolvers (third argument).
- `mocks.js` defines the custom resolvers used for mocking ([more info](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks)).

The server will be automatically restarted when a change is detected.

To run the server only once, use this command:

```
npm run run-graphql-api
```

**Updating `vue-cli-plugin-apollo` will also update the GraphQL Server service :+1:**

### Mocks

You can enable automatic mocking on the GraphQL API Server. It can be [customized](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks) in the `./src/graphql-api/mocks.js` file generated in your project.

### Apollo Engine

[Apollo Engine](https://www.apollographql.com/engine) is a commercial product from Apollo. It enables lots of additional features like monitoring, error reporting, caching and query persisting.

Create a key at https://engine.apollographql.com (it's free!).

## Injected Commands

- **`vue-cli-service graphql-api`**

  Run the GraphQL API server with info from `./src/graphql-api` and watch the files to restart itself automatically.

- **`vue-cli-service run-graphql-api`**

  Run the GraphQL API server with info from `./src/graphql-api` once.

## Configuration

The GraphQL API Server can be configured via the `pluginOptions` in `vue.config.js`:

``` js
module.exports = {
  // Other options...
  pluginOptions: {
    // Enable automatic mocking
    graphqlMock: true,
    // Enable Apollo Engine
    apolloEngine: true,

    /* Other options (with default values) */

    // Requests timeout (ms)
    graphqlTimeout: 120000,
  },
}
```

### Apollo Server

You can set custom Apollo server options in a `src/graphql-api/apollo.js` file:

```js
module.exports = req => {
  return {
    // Custom apollo server options here
    cacheControl: {
      defaultMaxAge: 1000,
    },
  }
}
```

### Apollo Engine

You can set custom Apollo Engine options in a `src/graphql-api/engine.js` file:

```js
module.exports = {
  // Custom apollo engine options here
  stores: [
    { /* ... */ },
  ],
}
```

## Env variables

- **`VUE_APP_GRAPHQL_HTTP`**

  The url to the graphql HTTP endpoint, default: `http://localhost:4000`

- **`VUE_APP_GRAPHQL_WS`**

  The url to the graphql Websockets endpoint for subscriptions, default: `ws://localhost:4000`

### With the GraphQL server enabled

- **`VUE_APP_GRAPHQL_PORT`**

  Port of the GraphQL API Server, default: `4000`

- **`VUE_APP_APOLLO_ENGINE_KEY`**

  API key for [Apollo Engine](https://engine.apollographql.com)

- **`VUE_APP_GRAPHQL_PLAYGROUND_PATH`**

  Url path to the graphql server playground, default: `'/'`

- **`VUE_APP_GRAPHQL_CORS`**

  Cors rules, default: `'*'`

## Injected webpack-chain Rules

- `config.rule('gql')`

## Running the GraphQL server in production

```
NODE_ENV=production yarn run run-graphql-api
```

If your project is meant to be used as a package installed from npm, you will need to move `vue-cli-plugin-apollo` from the `devDependencies` field to `dependencies` in the `package.json` file.

## Manual code changes

In case the plugin isn't able to modify the file containing the root Vue instance:

Import the provider:

```js
import { createProvider } from './vue-apollo'
```

Then in the root instance, set the `provide` option:

```js
new Vue({
  el: '#app',
  // Add this line
  provide: createProvider().provide(),
})
```
