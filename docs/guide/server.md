# Server Usage

If you enabled the GraphQL API Server, start it alongside the client:

```
npm run apollo
```

You can edit the files generated in the `./apollo-server` folder:

- `schema.graphql` contains the Schema written with the [schema definition language](https://github.com/facebook/graphql/blob/master/spec/Section%203%20--%20Type%20System.md).
- `resolvers.js` declares the [Apollo resolvers](https://www.apollographql.com/docs/graphql-tools/resolvers.html).
- `context.js` allows injecting a context object into all the resolvers (third argument).
- `mocks.js` defines the custom resolvers used for mocking ([more info](https://www.apollographql.com/docs/graphql-tools/mocking.html#Customizing-mocks)).
- `directives.js` defines the custom schema directives ([more info](https://www.apollographql.com/docs/graphql-tools/schema-directives.html))).

The server will be automatically restarted when a change is detected.

To run the server only once, use this command:

```
npm run run-graphql-api
```

**Updating `vue-cli-plugin-apollo` will also update the GraphQL Server service :+1:**
