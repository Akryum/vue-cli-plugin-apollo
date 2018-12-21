# Directives

A GraphQL directive is an annotation to either a GraphQL schema or a GraphQL document (for queries). It allows to modify the behavior of the API in a declaractive way.

The usage syntax is with the 'at' character: `@myDirective`.

[More documentation](https://www.apollographql.com/docs/graphql-tools/schema-directives.html)

You can add custom GraphQL directives in the `./apollo-server/directives.js` file.

```js
export default {
  // Now you can use '@private' in the schema
  private: PrivateDirective
}
```

Here is an example directive:

```js
const { SchemaDirectiveVisitor } = require('graphql-tools')
const { defaultFieldResolver } = require('graphql')

module.exports = class PrivateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field
    field.resolve = (root, args, context, info) => {
      if (!context.userId) throw new Error('Unauthorized')
      return resolve(root, args, context, info)
    }
  }
}
```

On the GraphQL server schema, use the directive like this:

```grahpql
type Query {
  messages: [Message] @private
}
```
