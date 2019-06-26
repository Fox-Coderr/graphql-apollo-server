var models = require('../models/index')

module.exports = {
    Query: {
      users: async (parent, args, { models }) => {
        return await models.models.User.findAll();
      },
      user: async (parent, { id }, { models }) => {
        return await models.models.User.findByPk(id);
      },
      me: async (parent, args, { models, me }) => {
        if (!me) {
          return null;
        }
        return await models.models.User.findByPk(me.id);
      },
    },
    
    User: {
      messages: async (user, args, { models }) => {
        return await models.models.Message.findAll({
          where: {
            userId: user.id,
          },
        });
      },
    },
}