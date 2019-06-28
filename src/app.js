require('dotenv').config()
var express = require('express');
var apollo = require('apollo-server-express')
var ApolloServer = apollo.ApolloServer
var AuthenticationError = apollo.AuthenticationError
var cors = require('cors')
var jwt = require('jsonwebtoken')
var http = require('http')

var schema = require('./schema/index')
var resolvers = require('./resolvers/index')
var models = require('./models/index')

const app = express();
const httpServer = http.createServer(app);


const getMe = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};

app.use(cors());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
      };
    }

    if (req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.SECRET,
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });
server.installSubscriptionHandlers(httpServer);

models.sequelize.sync().then(async () => {
  const eraseDatabaseOnSync = true;

  models.sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
      createUsersWithMessages(new Date());
    }

    httpServer.listen({ port: 8100 }, () => {
      console.log('Apollo Server on http://localhost:8100/graphql');
    });
  });

  const createUsersWithMessages = async date => {
    await models.models.User.create(
      {
        username: 'rwieruch',
        email: 'hello@robin.com',
        password: 'rwieruch',
        role: 'ADMIN',
        messages: [
          {
            text: 'Published the Road to learn React',
            createdAt: date.setSeconds(date.getSeconds() + 1),
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
        email: 'hello@david.com',
        password: 'ddavids',
        messages: [
          {
            text: 'Happy to release ...',
            createdAt: date.setSeconds(date.getSeconds() + 1),
          },
          {
            text: 'Published a complete ...',
            createdAt: date.setSeconds(date.getSeconds() + 1),
          },
        ],
      },
      {
        include: [models.models.Message],
      },
    );
  };
});