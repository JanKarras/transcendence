const settersController = require('../../controller/setters');

module.exports = async function (fastify, opts) {
  fastify.post('/createUser', settersController.createUser);
};
