var userResolvers = require('./user');
var messageResolvers = require('./message');
var GraphQLDateTime = require('graphql-iso-date');

const customScalarResolver = {
    Date: GraphQLDateTime,
  };

module.exports = [userResolvers, messageResolvers, customScalarResolver];