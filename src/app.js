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
  context: async () => ({
    models,
    me: await models.models.User.findByLogin('rwieruch'),
  }),
});

server.applyMiddleware({ app, path: '/graphql' });

models.sequelize.sync().then(async () => {
  const eraseDatabaseOnSync = true;

  models.sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
      createUsersWithMessages();
    }

    app.listen({ port: 8000 }, () => {
      console.log('Apollo Server on http://localhost:8000/graphql');
    });
  });

  const createUsersWithMessages = async () => {
    await models.models.User.create(
      {
        username: 'rwieruch',
        messages: [
          {
            text: 'Published the Road to learn React',
          },
        ],
      },
      {
        include: [models.models.Message],
      },
    );
  
    await models.models.User.create(
      {
        username: 'ddavids',
        messages: [
          {
            text: 'Happy to release ...',
          },
          {
            text: 'Published a complete ...',
          },
        ],
      },
      {
        include: [models.models.Message],
      },
    );
  };
});