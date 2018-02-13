# vue-cli-plugin-apollo

**:rocket: Start building a Vue app with Apollo and GraphQL in 2 minutes!**

This is a vue-cli 3.x plugin to add Apollo and GraphQL in your Vue project.

**:star: Features:**

- Automatically integrate [vue-apollo](https://github.com/Akryum/vue-apollo) into your Vue app
- Included optional Graphql API Server:
  - Dead simple GraphQL API sources generated into your project
  - Upgradable service runing [graphql-yoga](https://github.com/graphcool/graphql-yoga/)
  - Websocket subscriptions support
  - Optional automatic mocking
  - Optional [Apollo Engine](https://www.apollographql.com/engine) support
- Included example component with:
  - Watched query
  - Mutation
  - Realtime subscription using Websocket

## Getting started

:warning: Make sure you have vue-cli 3.x.x:

```
vue --version
```

If you don't have a project created with vue-cli 3.x yet:

```
vue create my-new-app
```

Install the plugin into your project:

```
cd my-new-app
npm i -D vue-cli-plugin-apollo
# OR:
yarn add -D vue-cli-plugin-apollo
```

Invoke the plugin:

```
vue invoke apollo
```

*:information_source: An example `ApolloExample.vue` component alongside some GraphQL query files will be added into your sources.*

Start your app:

```
npm run serve
```

Read the [vue-apollo doc](https://github.com/Akryum/vue-apollo).

### GraphQL API Server

If you enabled the GraphQL API Server, open a new terminal and start it:

```
npm run graphql-api
```

You can edit the files generated in the `./graphql-api` folder:

- `type-defs.js` contains the Schema written with the [schema definition language](https://github.com/facebook/graphql/blob/master/spec/Section%203%20--%20Type%20System.md).
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

You can enable automatic mocking on the GraphQL API Server. It can be [customized](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks) in the `./graphql-api/mocks.js` file generated in your project.

### Apollo Engine

[Apollo Engine](https://www.apollographql.com/engine) is a commercial product from Apollo. It enables lots of additional features like monitoring, error rerporting, caching and query persisting.

Create a key at https://engine.apollographql.com (it's free!).

## Injected Commands

- **`vue-cli-service graphql-api`**

  Run the GraphQL API server with info from `./graphql-api` and watch the files to restart itself automatically.

- **`vue-cli-service run-graphql-api`**

  Run the GraphQL API server with info from `./graphql-api` once.


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
  },
}
```

## Env variables

- **`VUE_APP_GRAPHQL_ENDPOINT`**

  The url to the graphql host, default: `http://localhost:4000`

- **`VUE_APP_GRAPHQL_PATH`**

  Url path to the graphql server query handler, default: `'/graphql'`

- **`VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH`**

  Url path to the graphql server subscription handler (websockets), default: `'/graphql'`

### With the GraphQL server enabled

- **`VUE_APP_GRAPHQL_PORT`**

  Port of the GraphQL API Server, default: `4000`

- **`VUE_APP_APOLLO_ENGINE_KEY`**

  API key for [Apollo Engine](https://engine.apollographql.com)

- **`VUE_APP_GRAPHQL_PLAYGROUND_PATH`**

  Url path to the graphql server playground, default: `'/'`
