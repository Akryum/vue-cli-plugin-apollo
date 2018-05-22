module.exports = [
  {
    type: 'confirm',
    name: 'addExamples',
    message: 'Add example code',
    default: false,
  },
  {
    type: 'confirm',
    name: 'addServer',
    message: 'Add a GraphQL API Server?',
    group: 'GraphQL Server',
    default: false,
  },
  {
    type: 'confirm',
    name: 'addMocking',
    message: 'Enable automatic mocking?',
    group: 'GraphQL Server',
    default: false,
    when: answers => answers.addServer,
  },
  {
    type: 'confirm',
    name: 'addApolloEngine',
    message: 'Add Apollo Engine?',
    group: 'GraphQL Server',
    default: false,
    when: answers => answers.addServer,
  },
  {
    type: 'input',
    name: 'apolloEngineKey',
    message: 'API Key (create one at https://engine.apollographql.com):',
    group: 'GraphQL Server',
    validate: input => !!input,
    when: answers => answers.addApolloEngine,
  },
]
