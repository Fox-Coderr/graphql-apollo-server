var PubSub = require('apollo-server').PubSub;
var MESSAGE_EVENTS = require('./message');

const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
};

const pubsub = new PubSub()

module.exports = {pubsub, EVENTS}
