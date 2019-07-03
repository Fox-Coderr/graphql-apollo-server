const OP = require('sequelize').Op;

const batchUsers = async (keys, models) => {
    const users = await models.models.User.findAll({
      where: {
        id: {
          [OP.in]: keys,
        },
      },
    });
    return keys.map(key => users.find(user => user.id === key));
  };

module.exports = {batchUsers}