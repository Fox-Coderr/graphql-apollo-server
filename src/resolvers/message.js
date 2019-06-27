var combineResolvers = require('graphql-resolvers').combineResolvers;
var isAuthenticated, isMessageOwner = require('./authorization');

module.exports = {
    Query: {
      messages: async (parent, args, { models }) => {
        return await models.models.Message.findAll();
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