# vue-cli-apollo

vue-cli 3.x plugin to add Apollo and GraphQL

> Start building a Vue app with Apollo and GraphQL in 2 minutes

Features:

- vue-apollo auto-integration
- included optional graphql api server
  - subscriptions support
  - optional Apollo Engine support
- example component with:
  - watched query
  - mutation
  - realtime subscription

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

If you enabled the GraphQL API Server, open a new terminal and start it:

```
npm run graphql-api
```

Read the [vue-apollo doc](https://github.com/Akryum/vue-apollo).

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
