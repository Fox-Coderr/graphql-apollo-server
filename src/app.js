require('dotenv').config()
var express = require('express');
var apollo = require('apollo-server-express')
var cors = require('cors')

var schema = require('./schema/index')
var resolvers = require('./resolvers/index')
var models = require('./models/index')

const app = express();

app.use(cors());

const server = new apollo.ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    models,
    me: models.users[1],
  },
});

server.applyMiddleware({ app, path: '/graphql' });

sequelize.sync().then(async () => {
  app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
  });
});