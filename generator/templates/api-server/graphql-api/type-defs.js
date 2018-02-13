module.exports = `
scalar Upload

type File {
  id: ID!
  path: String!
  filename: String!
  mimetype: String!
  encoding: String!
}

type Counter {
  count: Int!
  countStr: String
}

type Message {
  id: ID!
  text: String!
}

input MessageInput {
  text: String!
}

type Query {
  hello(name: String): String!
  messages: [Message]
  uploads: [File]
}

type Mutation {
  messageAdd (input: MessageInput!): Message!
  singleUpload (file: Upload!): File!
  multipleUpload (files: [Upload!]!): [File!]!
}

type Subscription {
  counter: Counter!
  messageAdded: Message!
}
`
