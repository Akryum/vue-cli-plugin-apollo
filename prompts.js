module.exports = [
  {
    type: 'confirm',
    name: 'addServer',
    message: 'Add a GraphQL API Server?',
    default: false,
  },
  {
    type: 'confirm',
    name: 'addApolloEngine',
    message: 'Add Apollo Engine support to the server?',
    default: true,
    when: answers => answers.addServer,
  },
  {
    type: 'input',
    name: 'apolloEngineKey',
    message: 'API Key (create one at https://engine.apollographql.com):',
    validate: input => !!input,
    when: answers => answers.addApolloEngine,
  },
]
