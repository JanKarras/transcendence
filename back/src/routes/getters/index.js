const gettersController = require('../../controller/getters');
const authMiddleware = require('../../middleware/auth');

module.exports = async function (fastify, opts) {
  fastify.get('/is_logged_in', {preHandler: authMiddleware}, gettersController.is_logged_in);
};
