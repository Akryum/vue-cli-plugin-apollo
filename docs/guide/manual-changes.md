# Manual code changes

In case the plugin isn't able to modify the file containing the root Vue instance:

Import the provider:

```js
import { createProvider } from './vue-apollo'
```

Then in the root instance, set the `apolloProvider` option:

```js
new Vue({
  el: '#app',
  // Add this line
  apolloProvider: createProvider(),
})
```
