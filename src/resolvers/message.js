var combineResolvers = require('graphql-resolvers').combineResolvers;
var isAuthenticated = require('./authorization').isAuthenticated;
var isMessageOwner = require('./authorization').isMessageOwner;
var Sequelize = require('sequelize');
var pubsub = require('../subscription/index').pubsub;
var EVENTS = require('../subscription/index').EVENTS;

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

module.exports = {
    Query: {
      messages: async (parent, { cursor, limit = 100 }, { models }) => {
        const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash(cursor),
              },
            },
          }
        : {};

        const messages = await models.models.Message.findAll({
          order: [['createdAt', 'DESC']],
          limit: limit + 1,
          where: cursor
          ? {
            createdAt: {
              [Sequelize.Op.lt]: cursor,
            },
          }
          : cursorOptions,
        });
        const hasNextPage = messages.length > limit;
        const edges = hasNextPage ? messages.slice(0, -1) : messages;

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: toCursorHash(
              edges[edges.length - 1].createdAt.toString(),
            ),
          },
        };
      },
      message: async (parent, { id }, { models }) => {
        return await models.models.Message.findByPk(id);
      },
    },
  
    Mutation: {
      createMessage: combineResolvers(
        isAuthenticated,
        async (parent, { text }, { models, me }) => {
          const message = await models.models.Message.create({
            text,
            userId: me.id,
          });

          pubsub.publish(EVENTS.MESSAGE.CREATED, {
            messageCreated: { message },
          });
  
          return message;
        },
      ),
  
      deleteMessage: combineResolvers(
        isAuthenticated,
        isMessageOwner,
        async (parent, { id }, { models }) => {
          return await models.models.Message.destroy({ where: { id } });
        },
      ),
    },
  
    Message: {
      user: async (message, args, { models }) => {
        return await models.models.User.findByPk(message.userId);
      },
    },
    
    Subscription: {
      messageCreated: {
        subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
      },
    },
  }