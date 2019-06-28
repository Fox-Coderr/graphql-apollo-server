var combineResolvers = require('graphql-resolvers').combineResolvers;
var isAuthenticated, isMessageOwner = require('./authorization');
var Sequelize = require('sequelize');

module.exports = {
    Query: {
      messages: async (parent, { cursor, limit = 100 }, { models }) => {
        const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: cursor,
              },
            },
          }
        : {};
        
        return await models.models.Message.findAll({
          order: [['createdAt', 'DESC']],
          limit,
          where: cursor
          ? {
            createdAt: {
              [Sequelize.Op.lt]: cursor,
            },
          }
          : cursorOptions,
        });
      },
      message: async (parent, { id }, { models }) => {
        return await models.models.Message.findByPk(id);
      },
    },
  
    Mutation: {
      createMessage: combineResolvers(
        isAuthenticated,
        async (parent, { text }, { models, me }) => {
          return await models.Message.create({
            text,
            userId: me.id,
          });
        },
      ),
  
      deleteMessage: combineResolvers(
        isAuthenticated,
        isMessageOwner,
        async (parent, { id }, { models }) => {
          return await models.Message.destroy({ where: { id } });
        },
      ),
    },
  
    Message: {
      user: async (message, args, { models }) => {
        return await models.models.User.findByPk(message.userId);
      },
    },
  }