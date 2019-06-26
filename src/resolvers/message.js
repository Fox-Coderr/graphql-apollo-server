var uuidv4 = require('uuid/v4')

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
      createMessage: async (parent, { text }, { me, models }) => {
        try {
          return await models.models.Message.create({
            text,
            userId: me.id,
          });
        }catch (error) {
          throw new Error(error);
        }
      },
  
      deleteMessage: async (parent, { id }, { models }) => {
        return await models.models.Message.destroy({ where: { id } });
      },
    },
  
    Message: {
      user: async (message, args, { models }) => {
        return await models.models.User.findByPk(message.userId);
      },
    },
  }