const path = require('path')

module.exports = api => {
  if (process.env.VUE_CLI_PLUGIN_DEV) {
    api.addClientAddon({
      id: 'org.akryum.vue-apollo.client-addon',
      url: 'http://localhost:8043/index.js',
    })
  } else {
    api.addClientAddon({
      id: 'org.akryum.vue-apollo.client-addon',
      path: path.resolve(__dirname, '../client-addon-dist'),
    })
  }

  require('./configs')(api)
  require('./tasks')(api)
  require('./widgets')(api)
  // require('./views')(api)
}
