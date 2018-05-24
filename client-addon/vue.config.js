const { clientAddonConfig } = require('@vue/cli-ui')

module.exports = {
  ...clientAddonConfig({
    id: 'vue-apollo',
    port: 8043,
  }),
  outputDir: '../client-addon-dist',
}
