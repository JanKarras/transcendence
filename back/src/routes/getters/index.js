const gettersController = require('../../controller/getters');

module.exports = async function (fastify, opts) {
  fastify.get('/hello', gettersController.getHello);
  fastify.get('/user', gettersController.getUser);
  fastify.get('/stats', gettersController.getStats);
};
