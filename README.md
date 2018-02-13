# vue-cli-apollo

**Start building a Vue app with Apollo and GraphQL in 2 minutes**

This is a vue-cli 3.x plugin to add Apollo and GraphQL in your Vue project.

**Features:**

- Automatically integrate [vue-apollo](https://github.com/Akryum/vue-apollo) into your Vue app
- Included optional Graphql API Server:
  - Easy-to-get-started [graphql-yoga](https://github.com/graphcool/graphql-yoga/)
  - Websocket subscriptions support
  - Optional automatic mocking
  - Optional [Apollo Engine](https://www.apollographql.com/engine) support
- Included example component with:
  - Watched query
  - Mutation
  - Realtime subscription using Websocket

## Getting started

Make sure you have vue-cli 3.x.x:

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
# OR: yarn add -D vue-cli-plugin-apollo
```

Invoke the plugin:

```
vue invoke apollo
```

*An example `ApolloExample.vue` component will be added into your sources.*

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

### Mocks

You can enable automatic mocking on the GraphQL API Server. It can be [customized](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks) in the `./graphql-api/mocks.js` file generated in your project.

### Apollo Engine

[Apollo Engine](https://www.apollographql.com/engine) is a commercial product from Apollo. It enables lots of additional features like monitoring, error rerporting, caching and query persisting.

Create a key at https://engine.apollographql.com (it's free!).

## Injected Commands

- **`vue-cli-service graphql-api`**

  Run the GraphQL API server located in `./graphql-api`.

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
