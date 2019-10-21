module.exports = async (options) => {
  const path = require('path')
  const fs = require('fs-extra')
  const { logWithSpinner, stopSpinner, done } = require('@vue/cli-shared-utils')
  const { graphql, introspectionQuery, printSchema } = require('graphql')
  const { makeExecutableSchema } = require('graphql-tools')
  const { load } = require('./load')

  if (options.typescript) require('ts-node/register/transpile-only')

  // JS Schema
  const typeDefs = load(options.paths.typeDefs)
  const resolvers = load(options.paths.resolvers)
  const schemaDirectives = load(options.paths.directives)
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
    allowUndefinedInResolve: true,
  })

  // JSON schema
  logWithSpinner(`📄`, 'Generating JSON file...')
  await fs.ensureDir(path.dirname(options.jsonOutput))
  const result = await graphql(schema, introspectionQuery)
  fs.writeFileSync(
    options.jsonOutput,
    JSON.stringify(result, null, 2)
  )
  stopSpinner()
  done(`Generated ${options.jsonOutput}`)

  // GraphQL schema
  logWithSpinner(`📄`, 'Generating GraphQL file...')
  await fs.ensureDir(path.dirname(options.graphqlOutput))
  fs.writeFileSync(
    options.graphqlOutput,
    printSchema(schema)
  )
  stopSpinner()
  done(`Generated ${options.graphqlOutput}`)
}
