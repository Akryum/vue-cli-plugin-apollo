# vue-cli-apollo

vue-cli 3.x plugin to add Apollo and GraphQL

> Start building a Vue app with Apollo and GraphQL in 2 minutes

Features:

- vue-apollo auto-integration
- included graphql api (using graphql-yoga)
- example component with:
  - watched query
  - mutation
  - realtime subscription

## Usage

Make sure you have vue-cli 3.x.x:

```
vue --version
```

If you don't have a project create with vue-cli 3.x yet:

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
vue invoke vue-cli-plugin-apollo
```

*An example `ApolloExample.vue` component will be added into your sources.*

Start your app:

```
npm run serve
```

Open a new terminal and start the GraphQL API:

```
npm run graphql-api
```

Read the [vue-apollo doc](https://github.com/Akryum/vue-apollo).

## Injected Commands

- **`vue-cli-service graphql-api`**

  Run the GraphQL API server located in `./graphql-api`.
