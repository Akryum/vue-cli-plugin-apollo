const { db } = require('./db')
const shortid = require('shortid')
const { processUpload } = require('./upload')

module.exports = {
  Counter: {
    countStr: counter => `Current count: ${counter.count}`,
  },
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    messages: () => db.get('messages').value(),
    uploads: () => db.get('uploads').value(),
  },
  Mutation: {
    messageAdd: (root, { input }, { pubsub }) => {
      const message = {
        id: shortid.generate(),
        text: input.text,
      }

      db
        .get('messages')
        .push(message)
        .last()
        .write()

      pubsub.publish('messages', { messageAdded: message })

      return message
    },
    singleUpload: (root, { file }) => processUpload(file),
    multipleUpload: (root, { files }) => Promise.all(files.map(processUpload)),
  },
  Subscription: {
    counter: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).substring(2, 15) // random channel name
        let count = 0
        setInterval(() => pubsub.publish(channel, { counter: { count: count++ } }), 2000)
        return pubsub.asyncIterator(channel)
      },
    },
    messageAdded: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('messages'),
    },
  },
}
