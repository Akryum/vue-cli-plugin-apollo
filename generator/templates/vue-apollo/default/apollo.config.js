const path = require('path')

// Load .env files
// const loadEnv = require('@vue/cli-service/lib/util/loadEnv')
// loadEnv(path.resolve(__dirname, '.env'))
// loadEnv(path.resolve(__dirname, '.env.local'))

module.exports = {
  client: {
    service: 'demo',
    includes: ['src/**/*.{js,jsx,ts,tsx,vue,gql}']
  },
  service: {
    name: 'demo',
    localSchemaFile: path.resolve(__dirname, './node_modules/.temp/graphql/schema.json')
  }
  // engine: {
  //   apiKey: process.env.VUE_APP_APOLLO_ENGINE_KEY
  // }
}
