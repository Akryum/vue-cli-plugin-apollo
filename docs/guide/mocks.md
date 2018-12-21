# Mocks

You can enable automatic mocking on the GraphQL API Server. It can be [customized](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks) in the `./apollo-server/mocks.js` file generated in your project.

Enable it in `vue.config.js`:

``` js
module.exports = {
  // Other options...
  pluginOptions: {
    // Apollo-related options
    apollo: {
      // Enable automatic mocking
      enableMocks: true,
    },
  },
}
```
