# Express middleware

If you need to add express middlewares into the GraphQL server, you can create a `./apollo-server/server.js` file:

```js
import path from 'path'
import express from 'express'

const distPath = path.resolve(__dirname, '../../dist')

export default app => {
  app.use(express.static(distPath))
}
```
