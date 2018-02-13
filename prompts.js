module.exports = [
  {
    type: 'confirm',
    name: 'addServer',
    message: 'Add a GraphQL API Server?',
    default: false,
  },
  {
    type: 'confirm',
    name: 'addMocking',
    message: '(Server) Enable automatic mocking?',
    default: true,
    when: answers => answers.addServer,
  },
  {
    type: 'confirm',
    name: 'addApolloEngine',
    message: '(Server) Add Apollo Engine?',
    default: false,
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
