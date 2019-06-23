var apollo = require('apollo-server-express');
var userSchema = require('./user');
var messageSchema = require('./message');

const linkSchema = apollo.gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

module.exports = [
  linkSchema, 
  userSchema, 
  messageSchema
]
